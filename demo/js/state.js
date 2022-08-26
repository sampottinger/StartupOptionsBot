class SimulationResult {

    constructor(months, profit, events) {
        const self = this;
        self._months = months;
        self._profit = profit;
        self._events = events;
    }

    getMonths() {
        const self = this;
        return self._months;
    }

    getProfit() {
        const self = this;
        return self._profit;
    }
    
    getEvents() {
        const self = this;
        return self._events;
    }

}


class SimulationState {

    constructor() {
        const self = this;

        self._events = [];
        self._currentMonth = 0;
        self._variables = new Map();
        
        self._totalGrant = 0;
        self._noOptionsAvailable = true;
        self._startVestingMonths = 0;
        self._immediatelyVest = 0;
        self._monthlyVest = 0;
        self._numOptionsPurchased = 0;
        self._fairMarketValue = 0;
        self._strikePrice = 0;
        self._totalSpread = 0;
        self._purchaseHistory = [];

        self._numTotalShares = 0;
        self._exitShare = 0;

        self._profit = 0;
        self._finalized = false;
        self._setUp = false;
    }

    finishSetup() {
        const self = this;

        if (self._setUp) {
            throw "Already set up.";
        }
        self._setUp = true;

        // Misc required vars
        self._assureValuePresent("ipoBuy");
        self._assureValuePresent("sellBuy");
        self._assureValuePresent("quitBuy");
        self._assureValuePresent("optionTax");
        self._assureValuePresent("regularIncomeTax");
        self._assureValuePresent("longTermTax");
        self._assureValuePresent("waitToSell");
        self._assureValuePresent("rangeStd");
        self._assureValuePresent("useLogNorm");

        // Grant info
        self._assureValuePresent("strikePrice");
        self._strikePrice = self.getValue("strikePrice");

        self._assureValuePresent("totalGrant");
        self._totalGrant = self.getValue("totalGrant");

        self._assureValuePresent("startVestingMonths");
        self._startVestingMonths = self.getValue("startVestingMonths");

        self._assureValuePresent("immediatelyVest");
        self._immediatelyVest = self.getValue("immediatelyVest");

        self._assureValuePresent("monthlyVest");
        self._monthlyVest = self.getValue("monthlyVest");

        self._noOptionsAvailable = false;

        // Company
        self._assureValuePresent("startFMV");
        self._fairMarketValue = self.getValue("startFMV");

        self._assureValuePresent("startTotalShares");
        self._numTotalShares = self.getValue("startTotalShares");

        // Apply offset for start month
        self._assureValuePresent("startMonthLow");
        const startMonthLow = self.getValue("startMonthLow");

        self._assureValuePresent("startMonthHigh");
        const startMonthHigh = self.getValue("startMonthHigh");

        const delay = getNormVal(startMonthLow, startMonthHigh, true, self.getValue("rangeStd"));
        self.delay(delay);
    }

    addEvent(description) {
        const self = this;
        self._events.push({
            "event": description,
            "months": self._currentMonth
        });
    }

    getEvents() {
        const self = this;
        return self._events;
    }

    setValue(variable, newValue) {
        const self = this;
        self._variables.set(variable, newValue);
    }

    getValue(variable) {
        const self = this;
        return self._variables.get(variable);
    }

    setExitValue(newValue) {
        const self = this;
        newValue = self._ensurePositive(newValue);
        const percentPerShare = 1 / self._numTotalShares;
        self.setExitShare(percentPerShare * newValue);
    }

    setExitShare(newValue) {
        const self = this;
        newValue = self._ensurePositive(newValue);
        self._exitShare = newValue;
        self.setFairMarketValue(newValue);
    }

    setFairMarketValue(newValue) {
        const self = this;
        newValue = self._ensurePositive(newValue);
        self._fairMarketValue = newValue;
    }

    diluteOptions(dilution) {
        const self = this;
        dilution = self._ensurePositive(dilution);
        self._numTotalShares = self._numTotalShares * (1 + dilution);
    }

    delay(months) {
        const self = this;
        months = self._ensurePositive(months);
        self._currentMonth += months;
    }

    getOptionsAvailable() {
        const self = this;
        
        const isBeforeCliff = self._currentMonth < self._startVestingMonths;

        if (isBeforeCliff || self._noOptionsAvailable) {
            return 0;
        }

        const monthsSinceCliff = self._currentMonth - self._startVestingMonths;
        const totalVested = self._immediatelyVest + self._monthlyVest * monthsSinceCliff;

        const reachedCap = totalVested > self._totalGrant;
        const totalVestedCap = reachedCap ? self._totalGrant : totalVested;

        return totalVestedCap - self._numOptionsPurchased;
    }

    buyOptions(numOptionsRequested) {
        const self = this;

        numOptionsRequested = self._ensurePositive(numOptionsRequested);
        const optionsAvailable = self.getOptionsAvailable();
        
        const numOptionsRequestedInt = Math.round(numOptionsRequested);
        const requestedAvailable = numOptionsRequestedInt < optionsAvailable;
        const numOptions = requestedAvailable ? numOptionsRequestedInt : optionsAvailable;
        
        const spreadPerOption = self._fairMarketValue - self._strikePrice;
        const marginalSpread = numOptions * spreadPerOption;
        const marginalSpreadSafe = marginalSpread < 0 ? 0 : marginalSpread;
        
        self._totalSpread += marginalSpreadSafe;
        self._numOptionsPurchased += numOptions;
        
        const spreadStr = Math.round(spreadPerOption * 100) / 100;
        self.addEvent("Bought " + numOptions + " with spread " + spreadStr + " each.");

        if (numOptions > 0) {
            self._purchaseHistory.push({
                "months": self._currentMonth,
                "count": numOptions,
                "basis": self._fairMarketValue
            });
        }
    }

    clearRemainingOptions() {
        const self = this;
        self._noOptionsAvailable = true;
    }

    finalize() {
        const self = this;

        if (self._finalized) {
            throw "Already finalized.";
        }
        self._finalized = true;

        // Check if noop
        if (self._purchaseHistory.length == 0) {
            self._profit = 0;
            return;
        }

        // FMV spread taxes
        const spreadTax = self._totalSpread * self.getValue("optionTax") / 100;

        // Determine if we need to wait (add event)
        const waitToSell = self.getValue("waitToSell") > 0.5;
        if (waitToSell) {
            const lastPurchase = self._purchaseHistory[self._purchaseHistory.length - 1];
            const lastPurchaseMonths = lastPurchase["months"];
            const monthsSincePurchase = self._currentMonth - lastPurchaseMonths;
            const monthsToDelay = 12 - monthsSincePurchase;
            self.delay(monthsToDelay);
            self.addEvent("Wait to sell for long term gains tax.");
        }

        // Determine proceeds by type
        const optionsRegularIncome = self._purchaseHistory.filter(
            (x) => self._currentMonth - x["months"] < 12
        );

        const optionsLongTerm = self._purchaseHistory.filter(
            (x) => self._currentMonth - x["months"] >= 12
        );

        const proceedsRegular = self._getProceedsPreTax(optionsRegularIncome);
        const proceedsLongTerm = self._getProceedsPreTax(optionsLongTerm);
        
        // Determine total sale
        const totalOptions = self._purchaseHistory.map(
            (x) => x["count"]
        ).reduce((a, b) => a + b, 0);
        const totalSale = totalOptions * self._exitShare;

        // Sum up taxes
        const taxesRegular = proceedsRegular * self.getValue("regularIncomeTax") / 100;
        const taxesLongTerm = proceedsLongTerm * self.getValue("longTermTax") / 100;
        const totalTaxes = taxesRegular + taxesLongTerm + spreadTax;

        // Determine total spent on strike price
        const strikePaid = self._numOptionsPurchased * self.getValue("strikePrice");
        
        // Record
        const message = [
            "Sold " + Math.round(totalOptions),
            " at " + Math.round(totalSale * 100) / 100,
            " with taxes of " + Math.round((taxesRegular + taxesLongTerm) * 100) / 100,
            " after tax on spread of " + Math.round(spreadTax * 100) / 100,
            " for shares costing " + Math.round(strikePaid * 100) / 100
        ].join("");
        self.addEvent(message);

        // Determine profit
        self._profit = totalSale - totalTaxes - strikePaid;
    }

    getProfit() {
        const self = this;

        if (!self._finalized) {
            throw "State not finalized.";
        }

        return self._profit;
    }

    getDuration() {
        const self = this;

        if (!self._finalized) {
            throw "State not finalized.";
        }

        return self._currentMonth;
    }

    getResult() {
        const self = this;

        const profit = self.getProfit();
        const months = self.getDuration();

        return new SimulationResult(months, profit, self._events);
    }

    _getProceedsPreTax(options) {
        const self = this;

        if (options.length == 0) {
            return 0;
        }

        const totalProfit = options.map((x) => {
            const perShareProfit = self._exitShare - x["basis"];
            return x["count"] * perShareProfit;
        }).reduce((a, b) => a + b);
        
        return totalProfit < 0 ? 0 : totalProfit;
    }

    _assureValuePresent(name) {
        const self = this;

        if (!self._variables.has(name)) {
            throw "Variable not provided " + name + ".";
        }
    }

    _ensurePositive(target) {
        const self = this;
        return target < 0 ? 0 : target;
    }

}
