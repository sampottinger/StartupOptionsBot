class CompileVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    visitNumber(ctx) {
        const self = this;

        const targetStr = ctx.getChild(0).getText();
        const isFloat = targetStr.includes(".");
        return isFloat ? parseFloat(targetStr) : parseInt(targetStr);
    }

    visitPercent(ctx) {
        const self = this;

        return ctx.target.accept(self) / 100;
    }

    visitFail(ctx) {
        const self = this;

        return (state) => {
            state.addEvent("Company failed.");
            state.setExitValue(0);
            return state;
        };
    }

    visitIpo(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "IPO", "ipoBuy");
    }

    visitSell(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "sold", "sellBuy");
    }

    visitRaise(ctx) {
        const self = this;

        const fmvLow = ctx.vlow.accept(self);
        const fmvHigh = ctx.vhigh.accept(self);
        const diluteLow = ctx.dilutelow.accept(self);
        const diluteHigh = ctx.dilutehigh.accept(self);
        const delayLow = ctx.delaylow.accept(self);
        const delayHigh = ctx.delayhigh.accept(self);

        const nextBranches = ctx.next.accept(self);

        return (state) => {
            const rangeStd = state.getValue("rangeStd");
            const fmv = getNormVal(fmvLow, fmvHigh, true, rangeStd);
            const dilution = getNormVal(diluteLow, diluteHigh, true, rangeStd);
            const delay = getNormVal(delayLow, delayHigh, true, rangeStd);

            state.addEvent("Raised. FMV at " + fmv + " with dilution " + dilution);
            state.setFairMarketValue(fmv);
            state.diluteOptions(dilution);
            state.delay(delay);

            return nextBranches(state);
        };
    }

    visitQuit(ctx) {
        const self = this;

        return (state) => {
            const percentOptionsBuy = state.getValue("quitBuy");
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = percentOptionsBuy * optionsAvailable;

            state.addEvent("Bought " + numOptions + " options.");
            state.buyOptions(numOptions);
            state.clearRemainingOptions();

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

    visitProbval(ctx) {
        const self = this;

        const child = ctx.getChild(0);

        if(child.getText().includes("else")) {
            return {"isElse": true};
        } else {
            return {"isElse": false, "proba": child.accept(self)};
        }
    }

    visitProbability(ctx) {
        const self = this;

        const retObj = ctx.value.accept(self);
        retObj["isCompany"] = ctx.target.getText().includes("c.");
        return retObj;
    }

    visitBranch(ctx) {
        const self = this;

        const retObj = ctx.chance.accept(self);
        retObj["target"] = ctx.target.accept(self);
        return retObj;
    }

    visitBranches(ctx) {
        const self = this;

        const allBranches = [];
        const numChildren = ctx.getChildCount();
        for (let i = 1; i < numChildren; i += 2) {
            let curChild = ctx.getChild(i);
            let parsedBranch = curChild.accept(self);
            allBranches.push(parsedBranch);
        }

        const checkSumProbabilities = (target) => {
            const totalProba = target.map((x) => x["proba"]).reduce((a, b) => a + b, 0);
            if (totalProba > 1) {
                throw "Probabilities add up to over 1.";
            }
        };

        const chooseElse = (options) => {
            if (options.length == 0) {
                return {"target": [(x) => x]};
            }
            const index = Math.floor(Math.random() * options.length);
            return options[index];
        };

        const chooseBranch = (branches, elseBranches) => {
            const chosenProba = d3.randomUniform(0, 1)();

            const accumulations = [];
            let acc = 0;
            branches.forEach((x) => {
                acc += x["proba"];
                accumulations.push(acc);
            });

            let i = 0;
            const numAccumulations = accumulations.length;
            while (i < numAccumulations && accumulations[i] < chosenProba) {
                i++;
            }

            const isElse = i == numAccumulations;
            return isElse ? chooseElse(elseBranches) : branches[i];
        };

        const companyBranches = allBranches.filter((x) => x["isCompany"] && !x["isElse"]);
        const companyElses = allBranches.filter((x) => x["isCompany"] && x["isElse"]);
        const employeeBranches = allBranches.filter((x) => !x["isCompany"] && !x["isElse"]);
        const employeeElses = allBranches.filter((x) => !x["isCompany"] && x["isElse"]);

        checkSumProbabilities(companyBranches);
        checkSumProbabilities(employeeBranches);

        return (state) => {
            const employeeAction = chooseBranch(employeeBranches, employeeElses);
            const companyAction = chooseBranch(companyBranches, companyElses);

            const applyAll = (target, state) => {
                let newState = state;
                target.forEach((x) => {
                    newState = x(newState);
                });
                return newState;
            };

            state = applyAll(employeeAction["target"], state);
            state = applyAll(companyAction["target"], state);

            return state;
        };
    }

    visitName(ctx) {
        const self = this;

        return ctx.getChild(0).getText();
    }

    visitAssignment(ctx) {
        const self = this;

        const target = ctx.target.accept(self);
        const value = ctx.value.accept(self);

        return (state) => {
            state.setValue(target, value);
            return state;
        };
    }

    visitAssignments(ctx) {
        const self = this;

        const assignmentFutures = [];
        const numAssignments = ctx.getChildCount() - 2;
        for (let i = 0; i < numAssignments; i++) {
            let child = ctx.getChild(i + 1);
            assignmentFutures.push(child.accept(self));
        }

        return (state) => {
            for (let i = 0; i < numAssignments; i++) {
                state = assignmentFutures[i](state);
            }

            return state;
        };
    }

    visitProgram(ctx) {
        const self = this;

        const headerFuture = ctx.header.accept(self);
        const bodyFuture = ctx.body.accept(self);

        return (state) => {
            state = headerFuture(state);
            state.finishSetup();
            state = bodyFuture(state);
            state.finalize();
            return state;
        };
    }

    _createSellEvent(ctx, label, buyVariable) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.high.accept(self);
        const isValue = ctx.unit.getText().includes("total");

        return (state) => {
            const rangeStd = state.getValue("rangeStd");
            const generatedValue = getNormVal(low, high, true, rangeStd);
            const percentOptionsBuy = state.getValue(buyVariable) / 100;
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = optionsAvailable * percentOptionsBuy;

            state.addEvent("Company " + label + "! New value: " + generatedValue);

            if (isValue) {
                state.setExitValue(generatedValue);
            } else {
                state.setExitShare(generatedValue);
            }

            state.addEvent("Bought " + numOptions + " options.")
            state.buyOptions(numOptions);

            return state;
        };
    }

}
