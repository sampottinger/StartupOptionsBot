/**
 * Record which tracks and describes what happened in a simulation.
 *
 * Record serving as the global memory or global state which tracks and describes what happened in
 * a simulation.
 *
 * @license MIT
 */
 
// TODO: Use of term "state" here is confusing with MCMC state terminology. Rename to
// SimulationMemory.


/**
 * Record describing the outcome of a single simulation.
 */
class SimulationResult {

    /**
     * Create a new immutable record of a simulation outcome.
     *
     * @param months - The number of months that the simulation ran until.
     * @param profit - The overall profit or loss for the simulation.
     * @param events - Log of events encountered in the simulation.
     */
    constructor(months, profit, events) {
        const self = this;
        self._months = months;
        self._profit = profit;
        self._events = events;
    }

    /**
     * Get the duration of the simulation.
     *
     * @returns The number of months for which the simulation ran.
     */
    getMonths() {
        const self = this;
        return self._months;
    }

    /**
     * Get the financial outcome of the simulation.
     *
     * @returns The profit or loss from the simulation.
     */
    getProfit() {
        const self = this;
        return self._profit;
    }
    
    /**
     * Get the events that happened in the simluation.
     *
     * @returns Array of objects containing an event property (string) and months (float).
     */
    getEvents() {
        const self = this;
        return self._events;
    }

}


/**
 * Global simulation memory keeping track of events that happened in a simulation.
 */
class SimulationState {

    /**
     * Create an empty simulation global state.
     */
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

    /**
     * Check that all required variables are present and finish the initalization of global state.
     */
    finishSetup() {
        const self = this;

        if (self._setUp) {
            throw "Already set up.";
        }
        self._setUp = true;
        self._quit = false;

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
    
    /**
     * Indicate that the employee left the company.
     */
    quit() {
        const self = this;
        if (self._quit) {
            return;
        }
        
        self._quit = true;
        self.clearRemainingOptions();
        self.addEvent("Left job.");
    }

    /**
     * Add a month-stamped record of an event to the simulation event log.
     *
     * @param description - Description of the event log.
     */
    addEvent(description) {
        const self = this;
        self._events.push({
            "event": description,
            "months": self._currentMonth
        });
    }

    /**
     * Get the log of month-stamped events that happened in the simulation.
     *
     * @returns Array of objects containing an event property (string) and months (float).
     */
    getEvents() {
        const self = this;
        return self._events;
    }

    /**
     * Update the value of a global state variable in the simulation.
     *
     * @param variable - The variable name to be set.
     * @param newValue - The variable value.
     */
    setValue(variable, newValue) {
        const self = this;
        self._variables.set(variable, newValue);
    }

    /**
     * Get the value of a global state variable in the simulation.
     *
     * @param variable - The name of the variable.
     * @returns The value of the variable.
     */
    getValue(variable) {
        const self = this;
        return self._variables.get(variable);
    }

    /**
     * Set the exit overall value of the company.
     *
     * @param newValue - Overall company value to be converted to 
     */
    setExitValue(newValue) {
        const self = this;
        newValue = self._ensurePositive(newValue);
        const percentPerShare = 1 / self._numTotalShares;
        self.setExitShare(percentPerShare * newValue);
    }

    /**
     * Set the exit per share value.
     *
     * @param newValue - The per share price for an exit.
     */
    setExitShare(newValue) {
        const self = this;
        newValue = self._ensurePositive(newValue);
        self._exitShare = newValue;
        self.setFairMarketValue(newValue);
    }

    /**
     * Set the FMV used for potential spread taxes.
     *
     * @param newValue - The new FMV.
     */
    setFairMarketValue(newValue) {
        const self = this;
        newValue = self._ensurePositive(newValue);
        self._fairMarketValue = newValue;
    }

    /**
     * Report that options were diluted.
     *
     * @param dilution - The amount of dilution where 0.1 is interpreted as a 10% diultion.
     */
    diluteOptions(dilution) {
        const self = this;
        dilution = self._ensurePositive(dilution);
        self._numTotalShares = self._numTotalShares * (1 + dilution);
    }

    /**
     * Report that there is a delay before the next event in the simulation.
     *
     * @param months - The duration of the delay.
     */
    delay(months) {
        const self = this;
        months = self._ensurePositive(months);
        self._currentMonth += months;
    }

    /**
     * Get the number of options currently available for exercise.
     *
     * @returns Number of vested options not yet exercised.
     */
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

    /**
     * Indicate the employee bought options.
     *
     * @param numOptionsRequested - The number of options the employee wants to exercise. If the
     *      employee attempts to exercise more options than are available, all options available
     *      are exericsed.
     */
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
        
        const spreadStr = formatNumber(Math.round(spreadPerOption * 100) / 100);

        if (numOptions > 0) {
            const numOptionsStr = formatNumber(numOptions);
            self.addEvent("Bought " + numOptionsStr + " with spread " + spreadStr + " each.");
            
            self._purchaseHistory.push({
                "months": self._currentMonth,
                "count": numOptions,
                "basis": self._fairMarketValue
            });
        }
    }

    /**
     * Indicate that no options are or will be available.
     * 
     * Indicate that no additional options should vest and that remaining vested options are no
     * longer available for exercise.
     */
    clearRemainingOptions() {
        const self = this;
        self._noOptionsAvailable = true;
    }

    /**
     * Calculate the outcome of the simulation.
     */
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
            if (monthsToDelay > 0) {
                self.addEvent("Wait to sell for long term gains tax.");
                self.delay(monthsToDelay);
            }
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
        const totalStr = formatNumber(formatNumber(Math.round(totalOptions)));
        const saleStr = formatNumber(formatNumber(Math.round(totalSale * 100) / 100));
        const taxesStr = formatNumber(Math.round((taxesRegular + taxesLongTerm) * 100) / 100);
        const spreadStr = formatNumber(Math.round(spreadTax * 100) / 100);
        const strikePaidStr = formatNumber(Math.round(strikePaid * 100) / 100);
        const message = [
            "Sold " + totalStr,
            " at " + saleStr,
            " with taxes of " + taxesStr,
            " after tax on spread of " + spreadStr,
            " for shares costing " + strikePaidStr
        ].join("");
        self.addEvent(message);

        // Determine profit
        self._profit = totalSale - totalTaxes - strikePaid;
    }

    /**
     * Get the outcome profit of this finished simulation.
     *
     * @returns Floating point profit or loss.
     */
    getProfit() {
        const self = this;

        if (!self._finalized) {
            throw "State not finalized.";
        }

        return self._profit;
    }

    /**
     * Get the duration of this finalized simulation.
     *
     * @returns Number of months for which this simulation ran.
     */
    getDuration() {
        const self = this;

        if (!self._finalized) {
            throw "State not finalized.";
        }

        return self._currentMonth;
    }

    /**
     * Get a SimulationResult indicating the outcome of this simulation.
     *
     * @returns New result object.
     */
    getResult() {
        const self = this;

        const profit = self.getProfit();
        const months = self.getDuration();

        return new SimulationResult(months, profit, self._events);
    }

    /**
     * Determine how much money was made on a stock at its sale prior to taxes.
     *
     * @param options - Array of objects describing the stocks to be sold.
     * @returns Amount of profit after paying tax on spread but before paying tax on sale. If a
     *      loss, will report zero.
     */
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

    /**
     * Assure that a variable is present in the global simulation state.
     *
     * @param name - The name of the variable to ensure.
     */
    _assureValuePresent(name) {
        const self = this;

        if (!self._variables.has(name)) {
            throw "Variable not provided " + name + ".";
        }
    }

    /**
     * Check if a value is positive.
     *
     * @param target - The value to check.
     * @returns True if positive and false otherwise.
     */
    _ensurePositive(target) {
        const self = this;
        return target < 0 ? 0 : target;
    }

}
