/**
 * Logic which formats (beautifies) simulation code.
 *
 * @license MIT License
 */


/**
 * Visitor which performs code formatting.
 */
class BeautifyVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    /**
     * Format a number, putting it into en-US locale format.
     *
     * @param ctx ANTLR context.
     * @returns String representation of the number.
     */
    visitNumber(ctx) {
        const self = this;

        const targetStr = ctx.getText();
        const isFloat = targetStr.includes(".");
        const value = isFloat ? parseFloat(targetStr) : parseInt(targetStr);
        return value.toLocaleString("en-US");
    }

    /**
     * Format a fail action.
     *
     * @param ctx ANTLR context.
     * @returns Function which formats the function given indent level.
     */
    visitFail(ctx) {
        const self = this;

        return (depth) => "fail()";
    }

    /**
     * Format an initial public offering action.
     *
     * @param ctx ANTLR context.
     * @returns Function which formats the function given indent level.
     */
    visitIpo(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "ipo");
    }

    /**
     * Format a sell action.
     *
     * @param ctx ANTLR context.
     * @returns Function which formats the function given indent level.
     */
    visitSell(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "sell");
    }

    /**
     * Format an action for a fund raise event.
     *
     * Format an action for a fund raise event, indenting the branches listed and recursively
     * beautifying.
     *
     * @param ctx ANTLR context.
     * @returns Function which formats the function given indent level.
     */
    visitRaise(ctx) {
        const self = this;

        const fmvLow = ctx.vlow.accept(self);
        const fmvHigh = ctx.vhigh.accept(self);
        const diluteLow = ctx.dilutelow.accept(self);
        const diluteHigh = ctx.dilutehigh.accept(self);
        const delayLow = ctx.delaylow.accept(self);
        const delayHigh = ctx.delayhigh.accept(self);

        const nextBranchesFuture = ctx.next.accept(self);

        return (depth) => {
            const fmvSection = "raise(" + fmvLow + " - " + fmvHigh + " fmv";
            const dilutingSection = " diluting " + diluteLow + " - " + diluteHigh;
            const delaySection = " wait " + delayLow + " - " + delayHigh + " months";
            const thenSection = " then {" + nextBranchesFuture(depth + 1) + "\n";
            const thenTail = self._indent("})", depth);

            return fmvSection + dilutingSection + delaySection + thenSection + thenTail;
        }
    }

    /**
     * Format a quit action.
     *
     * @param ctx ANTLR context.
     * @returns Function which formats the function given indent level.
     */
    visitQuit(ctx) {
        const self = this;

        return (depth) => "quit()";
    }

    /**
     * Format a buy action.
     *
     * @param ctx ANTLR context.
     * @returns Function which formats the function given indent level.
     */
    visitBuy(ctx) {
        const self = this;

        const percentAmount = ctx.amount.accept(self);

        return (depth) => "buy(" + percentAmount + ")";
    }

    /**
     * Format a percent value by putting a % character at the end.
     *
     * @param ctx ANTLR context.
     * @returns String with the percent sign.
     */
    visitPercent(ctx) {
        const self = this;
        return ctx.target.accept(self) + "%";
    }

    /**
     * Format a probability which can be a number or "else" keyword.
     *
     * @param ctx ANTLR context.
     * @returns The probability value as a string which may be "else" keyword.
     */
    visitProbval(ctx) {
        const self = this;

        const child = ctx.getChild(0);

        if(child.getText().includes("else")) {
            return "else";
        } else {
            return child.accept(self);
        }
    }

    /**
     * Format a probability.
     *
     * @param ctx ANTLR context.
     * @returns Formatted probability in actor_probability format.
     */
    visitProbability(ctx) {
        const self = this;

        const actor = ctx.target.getText();
        const value = ctx.value.accept(self);
        return actor + value;
    }

    /**
     * Format a single branch (possible action with probability).
     *
     * Format a single branch (possible action with probability) which is one of many branches that
     * the simulation may select.
     *
     * @param ctx ANTLR context.
     * @returns Function returning the probability followed by a colon followed by a formatted
     *      potential action when given the indentation depth.
     */
    visitBranch(ctx) {
        const self = this;

        return (depth) => {
            const chance = ctx.chance.accept(self);
            const targetFuture = ctx.target.accept(self)[0];
            const target = targetFuture(depth);
            return chance + ": " + target;
        };
    }

    /**
     * Format a branches set.
     *
     * @param ctx ANTLR context.
     * @returns Function which, given starting indentation, returns formatted set of branches with
     *      recursive indentation.
     */
    visitBranches(ctx) {
        const self = this;

        const numChildren = ctx.getChildCount();
        const outputChildrenFutures = []
        for (let i = 1; i < numChildren; i += 2) {
            let curChild = ctx.getChild(i);
            let parsedBranchFuture = curChild.accept(self);
            outputChildrenFutures.push(parsedBranchFuture);
        }

        return (depth) => {
            const result = outputChildrenFutures.map(
                (x) => x(depth)
            ).join("\n" + self._indent("|", depth));
            return "\n" + self._indent(result, depth);
        }
    }

    /**
     * Format a variable name as part of a variable assignment. 
     *
     * @param ctx ANTLR context.
     * @returns Formatted variable name as a string.
     */
    visitName(ctx) {
        const self = this;

        return ctx.getChild(0).getText();
    }

    /**
     * Format a variable assignment.
     *
     * @param ctx ANTLR context.
     * @returns Formatted variable assignment as a string.
     */
    visitAssignment(ctx) {
        const self = this;

        const target = ctx.target.accept(self);
        const value = ctx.value.accept(self);

        return target + "=" + value;
    }

    /**
     * Format a set of variable assignments.
     *
     * @param ctx ANTLR context.
     * @returns Formatted variable assignments without square braces.
     */
    visitAssignments(ctx) {
        const self = this;

        const assignments = [];
        const numAssignments = ctx.getChildCount() - 2;
        for (let i = 0; i < numAssignments; i++) {
            let child = ctx.getChild(i + 1);
            let newAssignment = child.accept(self);
            assignments.push(newAssignment);
        }

        return assignments.join(" ");
    }

    /**
     * Format an entire program.
     *
     * @param ctx ANTLR context.
     * @returns String fully formatted program.
     */
    visitProgram(ctx) {
        const self = this;

        const variables = ctx.header.accept(self);
        const states = ctx.body.accept(self);

        return "[" + variables + "]\n{" + states(1) + "\n}";
    }

    /**
     * Format an exit event (IPO, sell).
     *
     * @param ctx ANTLR context.
     * @returns Function taking an indentation depth and returning string formatted action.
     */
    _createSellEvent(ctx, label) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.high.accept(self);
        const units = ctx.unit.getText();

        return (depth) => label + "(" + low + " - " + high + " " + units + ")";
    }

    /**
     * Indent a string.
     *
     * @param target The string to indent.
     * @param depth The indentation level.
     * @returns Target string with indentation (as spaces) prepended.
     */
    _indent(target, depth) {
        let outputStr = "";
        for (let i = 0; i < depth; i++) {
            outputStr += "  ";
        }
        return outputStr + target;
    }

}
