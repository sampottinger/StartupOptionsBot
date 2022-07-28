class SimulationState {

    constructor() {
        const self = this;

        self._events = [];
        self._currentMonth = 0;
        self._variables = new Map();
        
        self._numOptionsAvailable = 0;
        self._numOptionsPurchased = 0;
        self._fairMarketValue = 0;
        self._strikePrice = 0;
        self._totalSpread = 0;
        self._purchaseHistory = [];

        self._numTotalShares = 0;
        self._exitShare = 0;

        self._profit = 0;
        self._finalized = false;
    }

    finishSetup() {
        const self = this;
        // ipoPercentBuy
        // sellPercentBuy
        // quitPercentBuy
        // optionTax
        // regularIncomeTax
        // longTermTax
        // waitToSell
        // strikePrice
        // numOptionsAvailable
        // startFMV
        // startTotalShares
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
        const percentPerShare = 1 / self._numTotalShares;
        self.setExitShare(percentPerShare * newValue);
    }

    setExitShare(newValue) {
        const self = this;
        self._exitShare = newValue;
        self.setFairMarketValue(newValue);
    }

    setFairMarketValue(newValue) {
        const self = this;
        self._fairMarketValue = newValue;
    }

    diluteOptions(dilution) {
        const self = this;
        self._numTotalShares = self._numTotalShares * (1 + dilution);
    }

    delay(months) {
        const self = this;
        self._currentMonth += months;
    }

    getOptionsAvailable() {
        const self = this;
        return self._numOptionsAvailable;
    }

    buyOptions(numOptionsRequested) {
        const self = this;
        
        const numOptionsRequestedInt = round(numOptionsRequested);
        const requestedAvailable = numOptionsRequestedInt > self._numOptionsAvailable;
        const numOptions = requestedAvailable ? numOptionsRequestedInt : self._numOptionsAvailable;
        
        const spreadPerOption = self._fairMarketValue - self._strikePrice;
        const marginalSpread = numOptions * spreadPerOption;

        self._totalSpread += marginalSpread;
        self._numOptionsPurchased += numOptions;
        self._numOptionsAvailable -= numOptions;

        self._purchaseHistory.push({
            "months": self._currentMonth,
            "count": numOptions,
            "basis": numOptions * self._fairMarketValue
        });
    }

    clearRemainingOptions() {
        const self = this;
        self._numOptionsAvailable = 0;
    }

    finalize() {
        const self = this;

        self._finalized = true;

        // Check if noop
        if (self._purchaseHistory.length == 0) {
            self._profit = 0;
            return;
        }

        // FMV spread taxes
        const spreadTax = self._totalSpread * self.getValue("optionTax");

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
        const totalProceeds = proceedsRegular + proceedsLongTerm;

        // Sum up taxes
        const taxesRegular = proceedsRegular * self.getValue("regularIncomeTax");
        const taxesLongTerm = proceedsLongTerm * self.getValue("longTermTax");
        const totalTaxes = taxesRegular + taxesLongTerm + spreadTax;

        // Determine total spent on strike price
        const strikePaid = self._numOptionsPurchased * self.getValue("strikePrice");

        // Determine profit
        return totalProceeds - totalTaxes - strikePaid;
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

    _getProceedsPreTax(options) {
        const self = this;

        return options.map((x) => {
            const proceedsPerShare = self._exitShare - x["basis"];
            return x["count"] * proceedsPerShare;
        }).reduce((a, b) => a + b);
    }

}
