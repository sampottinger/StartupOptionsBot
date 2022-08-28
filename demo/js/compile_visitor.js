/**
 * Visitor which compiles code to a JS function.
 *
 * @license MIT
 */


/**
 * ANTLR visitor which compiles simulation code to a JS function which executes a simulation on a
 * state object.
 */
class CompileVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    /**
     * Parse a number from a string to a JS floating point number.
     *
     * @param ctx - ANTLR context.
     * @returns Parsed number with commas ignored.
     */
    visitNumber(ctx) {
        const self = this;
        
        const targetStr = ctx.getText().replaceAll(",", "");
        const isFloat = targetStr.includes(".");
        return isFloat ? parseFloat(targetStr) : parseInt(targetStr);
    }

    /**
     * Interpret a percent as a JS floating point number.
     *
     * @param ctx - ANTLR context.
     * @returns Percent as a number between 0 - 1.
     */
    visitPercent(ctx) {
        const self = this;
        return ctx.target.accept(self) / 100;
    }

    /**
     * Geneate a function which indicates the company failed.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will report a company fail.
     */
    visitFail(ctx) {
        const self = this;

        return (state) => {
            state.addEvent("Company failed.");
            state.setExitValue(0);
            return state;
        };
    }

    /**
     * Geneate a function which indicates the company had an IPO.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will report a company IPO.
     */
    visitIpo(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "IPO", "ipoBuy");
    }

    /**
     * Geneate a function which indicates the company was sold.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will report a company sale.
     */
    visitSell(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "sold", "sellBuy");
    }

    /**
     * Geneate a function which indicates the company had a fund raise.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will report a fund raise and execute the
     *      branches included.
     */
    visitRaise(ctx) {
        const self = this;

        const fmvLow = ctx.vlow.accept(self);
        const fmvHigh = ctx.vhigh.accept(self);
        const diluteLow = ctx.dilutelow.accept(self) / 100; // Quirk regarding percent sign.
        const diluteHigh = ctx.dilutehigh.accept(self);
        const delayLow = ctx.delaylow.accept(self);
        const delayHigh = ctx.delayhigh.accept(self);

        const nextBranches = ctx.next.accept(self);

        return (state) => {
            const rangeStd = state.getValue("rangeStd");
            const fmv = getNormVal(fmvLow, fmvHigh, true, rangeStd);
            const dilution = getNormVal(diluteLow, diluteHigh, true, rangeStd);
            const delay = getNormVal(delayLow, delayHigh, true, rangeStd);

            const fmvStr = Math.round(fmv * 100) / 100;
            const dilutionStr = Math.round(dilution * 100) / 100;
            state.addEvent("Raised. FMV at " + fmvStr + " with dilution " + dilutionStr);
            state.setFairMarketValue(fmv);
            state.diluteOptions(dilution);
            state.delay(delay);

            return nextBranches(state);
        };
    }

    /**
     * Geneate a function which indicates the employee quit.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will report the employee quit.
     */
    visitQuit(ctx) {
        const self = this;

        return (state) => {
            const percentOptionsBuy = state.getValue("quitBuy");
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = percentOptionsBuy * optionsAvailable;
            
            state.buyOptions(numOptions);
            state.quit();        

            return state;
        };
    }

    /**
     * Geneate a function which indicates the employee exercised options.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state, will report an exercise.
     */
    visitBuy(ctx) {
        const self = this;

        const percentAmount = ctx.amount.accept(self);

        return (state) => {
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = percentAmount * optionsAvailable;
            
            state.buyOptions(numOptions);

            return state;
        };
    }

    /**
     * Generate a structured representation of a probability value.
     *
     * @param ctx - ANTLR context.
     * @returns Object with an isElse property. If isElse is false, a proba property will be
     *      incldued which has a floating point value.
     */
    visitProbval(ctx) {
        const self = this;

        const child = ctx.getChild(0);

        if(child.getText().includes("else")) {
            return {"isElse": true};
        } else {
            return {"isElse": false, "proba": child.accept(self)};
        }
    }

    /**
     * Generate a structured representation of a probability.
     *
     * @param ctx - ANTLR context.
     * @returns Object with an isElse property. If isElse is false, a proba property will be
     *      incldued which has a floating point value. It will also include a isCompany property
     *      that is a boolean indicating if the actor is company or employee.
     */
    visitProbability(ctx) {
        const self = this;

        const retObj = ctx.value.accept(self);
        retObj["isCompany"] = ctx.target.getText().includes("c");
        return retObj;
    }

    /**
     * Visit a single branch out of a set of possible branches the simulation can take.
     *
     * @param ctx - ANTLR context.
     * @returns Object which has probability and actor information whose target property contains
     *      the action for this branch.
     */
    visitBranch(ctx) {
        const self = this;

        const retObj = ctx.chance.accept(self);
        retObj["target"] = ctx.target.accept(self);
        return retObj;
    }

    /**
     * Visit a set of branches.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, taking a state object, will randomly choose and execute the action
     *      of a branch within this set.
     */
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
            if (totalProba > 1.01) {
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
            if (chosenProba < 0.00000001) {
                return chooseElse(elseBranches);
            }

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

    /**
     * Visit the variable name as part of a variable assignment.
     *
     * @param ctx - ANTLR context.
     * @returns String variable name.
     */
    visitName(ctx) {
        const self = this;

        return ctx.getChild(0).getText();
    }

    /**
     * Visit a single variable assignment.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will register the value of the given
     *      variable in that state object.
     */
    visitAssignment(ctx) {
        const self = this;

        const target = ctx.target.accept(self);
        const value = ctx.value.accept(self);

        return (state) => {
            state.setValue(target, value);
            return state;
        };
    }

    /**
     * Visit a set of variables.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, given a state object, will register the value of the given
     *      variables in that state object.
     */
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

    /**
     * Visit a whole program.
     *
     * @param ctx - ANTLR context.
     * @returns Function which, taking a state object, will execute a simulation in that state.
     */
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

    /**
     * Visit an exit event (IPO, sell).
     *
     * @param ctx - ANTLR context.
     * @param label - The human readable name of the event (IPO, sell).
     * @param buyVariable - The variable describing the exercise behavior for the employee for this
     *      event.
     * @returns Function taking a state object and executing an exit event in that state.
     */
    _createSellEvent(ctx, label, buyVariable) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.high.accept(self);
        const isValue = ctx.unit.getText().includes("total");

        return (state) => {
            const rangeStd = state.getValue("rangeStd");
            const useLogNorm = state.getValue("useLogNorm") > 0.5;
            const generatedValue = getNormVal(low, high, true, rangeStd, useLogNorm);
            const percentOptionsBuy = state.getValue(buyVariable) / 100;
            const optionsAvailable = state.getOptionsAvailable();
            const numOptions = optionsAvailable * percentOptionsBuy;

            const valStr = formatNumber(Math.round(generatedValue * 100) / 100);
            state.addEvent("Company " + label + "! New value: " + valStr);

            if (isValue) {
                state.setExitValue(generatedValue);
            } else {
                state.setExitShare(generatedValue);
            }
            
            state.buyOptions(numOptions);

            return state;
        };
    }

}
