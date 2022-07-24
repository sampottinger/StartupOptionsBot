class CompileVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    visitNumber(ctx) {
        const self = this;

        const targetStr = ctx.getChild(0).getText();
        const isFloat = targetStr.includes(".");
        return isFloat ? parseFloat(targetStr) : parseInt(targetStr);
    }

    visitFail(ctx) {
        const self = this;

        return (state) => {
            state.addEvent("Company failed.");
            state.setCompanyValue(0);
            return state;
        };
    }

    visitIpo(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "IPO", "ipoAmount");
    }

    visitSell(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "sold", "sellAmount");
    }

    visitRaise(ctx) {
        const self = this;

        const valuationLow = ctx.vlow.accept(self);
        const valuationHigh = ctx.vhigh.accept(self);
        const diluteLow = ctx.dilutelow.accept(self);
        const diluteHigh = ctx.dilutehigh.accept(self);

        const nextBranches = ctx.next.accept(self);

        return (state) => {
            const valuation = self._getNormVal(valuationLow, valuationHigh);
            const dilution = self._getNormVal(diluteLow, diluteHigh);

            state.addEvent("Raised. Valued at " + valuation + " with dilution " + dilution);
            state.setCompanyValue(valuation);
            state.diluteOptions(dilution);

            return nextBranches(state);
        };
    }

    visitQuit(ctx) {
        const self = this;

        return (state) => {
            const percentOptionsBuy = state.getValue("quitPercentBuy");
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = percentOptionsBuy * optionsAvailable;

            state.addEvent("Bought " + numOptions + " options.");
            state.buyOptions(numOptions);

            return state;
        };
    }

    visitBuy(ctx) {
        const self = this;

        const percentAmount = ctx.amount.accept(self);

        return (state) => {
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = percentAmount * optionsAvailable;
            
            state.addEvent("Bought " + numOptions + " options.");
            state.buyOptions(numOptions);
            
            return state;
        };
    }

    _createSellEvent(ctx, label, buyVariable) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.low.accept(self);

        return (state) => {
            const generatedValue = self._getNormVal(low, high);
            const percentOptionsBuy = state.getValue(buyVariable);
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = optionsAvailable * percentOptionsBuy;

            state.addEvent("Company " + label + "! New value: " + generatedValue);
            state.setCompanyValue(generatedValue);

            state.addEvent("Bought " + numOptions + " options.")
            state.buyOptions(numOptions);

            return state;
        };
    }

    _getNormVal(low, high) {
        const self = this;

        if (high < low) {
            const newHigh = low;
            const newLow = high;
            low = newLow;
            high = newHigh;
        }

        const mean = (high + low) / 2;
        const std = high - mean;
        return d3.randomNormal(mean, std);
    }

}