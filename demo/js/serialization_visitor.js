/**
 * Logic to convert code to a structured primitive and plain old JS object serialization.
 *
 * @license MIT
 */


/**
 * ANTLR visitor which generates a serialized form of a program.
 */
class SerializationVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    /**
     * Serialize a number.
     *
     * @param ctx - The ANTLR context.
     * @returns Parsed number.
     */
    visitNumber(ctx) {
        const self = this;

        const targetStr = ctx.getText();
        const isFloat = targetStr.includes(".");
        return isFloat ? parseFloat(targetStr) : parseInt(targetStr);
    }

    /**
     * Serialize a fail action.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the action.
     */
    visitFail(ctx) {
        const self = this;

        return {"action": "fail"};
    }
    
    /**
     * Serialize an IPO action.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the action.
     */
    visitIpo(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "ipo");
    }

    /**
     * Serialize a sell action.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the action.
     */
    visitSell(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "sell");
    }

    /**
     * Serialize a raise action.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the action.
     */
    visitRaise(ctx) {
        const self = this;

        const fmvLow = ctx.vlow.accept(self);
        const fmvHigh = ctx.vhigh.accept(self);
        const diluteLow = ctx.dilutelow.accept(self);
        const diluteHigh = ctx.dilutehigh.accept(self);
        const delayLow = ctx.delaylow.accept(self);
        const delayHigh = ctx.delayhigh.accept(self);

        const nextBranches = ctx.next.accept(self);

        return {
            "action": "raise",
            "fmvLow": fmvLow,
            "fmvHigh": fmvHigh,
            "diluteLow": diluteLow,
            "diluteHigh": diluteHigh,
            "delayLow": delayLow,
            "delayHigh": delayHigh,
            "nextBranches": nextBranches
        };
    }

    /**
     * Serialize a quit action.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the action.
     */
    visitQuit(ctx) {
        const self = this;

        return {"action": "quit"};
    }

    /**
     * Serialize a buy action.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the action.
     */
    visitBuy(ctx) {
        const self = this;

        const percentAmount = ctx.amount.accept(self);

        return {"action": "buy", "percentAmount": percentAmount};
    }

    /**
     * Serialize a percentage.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain number.
     */
    visitPercent(ctx) {
        const self = this;
        return ctx.target.accept(self);
    }

    /**
     * Serialize a probability value.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the probability value.
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
     * Serialize a probability (probability value and actor).
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the probability.
     */
    visitProbability(ctx) {
        const self = this;

        const retObj = ctx.value.accept(self);
        retObj["isCompany"] = ctx.target.getText().includes("c.");
        return retObj;
    }

    /**
     * Serialize a branch (probability and action).
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the branch.
     */
    visitBranch(ctx) {
        const self = this;

        const retObj = ctx.chance.accept(self);
        retObj["target"] = ctx.target.accept(self)[0];
        return retObj;
    }

    /**
     * Serialize a set of branches (possible probabilities and actions).
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the branches set.
     */
    visitBranches(ctx) {
        const self = this;

        let next = [];

        const allBranches = [];
        const numChildren = ctx.getChildCount();
        for (let i = 1; i < numChildren; i += 2) {
            let curChild = ctx.getChild(i);
            
            let parsedBranch = curChild.accept(self);
            let branchTarget = parsedBranch["target"];
            if (branchTarget["action"] === "raise") {
                let newNext = branchTarget["nextBranches"];
                next = next.concat(newNext);
                branchTarget["nextBranches"] = "accepted";
            }
            
            allBranches.push(parsedBranch);
        }

        const current = [{"current": allBranches}];
        return current.concat(next);
    }

    /**
     * Serialize the name of a variable in a variable assignment.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain string.
     */
    visitName(ctx) {
        const self = this;

        return ctx.getChild(0).getText();
    }

    /**
     * Serialize a variable assignment.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the assignment.
     */
    visitAssignment(ctx) {
        const self = this;

        const target = ctx.target.accept(self);
        const value = ctx.value.accept(self);

        return {"key": target, "value": value};
    }

    /**
     * Serialize a set of variable assignments.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the assignments.
     */
    visitAssignments(ctx) {
        const self = this;

        const assignments = {};
        const numAssignments = ctx.getChildCount() - 2;
        for (let i = 0; i < numAssignments; i++) {
            let child = ctx.getChild(i + 1);
            let newAssignment = child.accept(self);
            assignments[newAssignment["key"]] = newAssignment["value"];
        }

        return assignments;
    }

    /**
     * Serialize an entire program.
     *
     * @param ctx - The ANTLR context.
     * @returns Plain JS object describing the entire program.
     */
    visitProgram(ctx) {
        const self = this;

        const variables = ctx.header.accept(self);
        const states = ctx.body.accept(self);

        return {
            "variables": variables,
            "states": states
        };
    }

    /**
     * Create a serialization of an exit event.
     *
     * @param ctx - The ANTLR context.
     * @param label - The name or type of the exit.
     * @returns JS object serialization.
     */
    _createSellEvent(ctx, label) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.high.accept(self);
        const units = ctx.unit.getText();

        return {
            "action": label,
            "low": low,
            "high": high,
            "units": units
        };
    }

}
