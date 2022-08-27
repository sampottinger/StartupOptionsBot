class BeautifyVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    visitNumber(ctx) {
        const self = this;

        const targetStr = ctx.getText();
        const isFloat = targetStr.includes(".");
        const value = isFloat ? parseFloat(targetStr) : parseInt(targetStr);
        return value.toLocaleString("en-US");
    }

    visitFail(ctx) {
        const self = this;

        return () => "fail()";
    }

    visitIpo(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "ipo");
    }

    visitSell(ctx) {
        const self = this;

        return self._createSellEvent(ctx, "sell");
    }

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

    visitQuit(ctx) {
        const self = this;

        return () => "quit()";
    }

    visitBuy(ctx) {
        const self = this;

        const percentAmount = ctx.amount.accept(self);

        return () => "buy(" + percentAmount + ")";
    }

    visitPercent(ctx) {
        const self = this;
        return ctx.target.accept(self) + "%";
    }

    visitProbval(ctx) {
        const self = this;

        const child = ctx.getChild(0);

        if(child.getText().includes("else")) {
            return "else";
        } else {
            return child.accept(self);
        }
    }

    visitProbability(ctx) {
        const self = this;

        const actor = ctx.target.getText();
        const value = ctx.value.accept(self);
        return actor + value;
    }

    visitBranch(ctx) {
        const self = this;

        return (depth) => {
            const chance = ctx.chance.accept(self);
            const targetFuture = ctx.target.accept(self)[0];
            const target = targetFuture(depth);
            return chance + ": " + target;
        };
    }

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

    visitName(ctx) {
        const self = this;

        return ctx.getChild(0).getText();
    }

    visitAssignment(ctx) {
        const self = this;

        const target = ctx.target.accept(self);
        const value = ctx.value.accept(self);

        return target + "=" + value;
    }

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

    visitProgram(ctx) {
        const self = this;

        const variables = ctx.header.accept(self);
        const states = ctx.body.accept(self);

        return "[" + variables + "]\n{" + states(1) + "\n}";
    }

    _createSellEvent(ctx, label) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.high.accept(self);
        const units = ctx.unit.getText();

        return () => label + "(" + low + " - " + high + " " + units + ")";
    }

    _indent(target, depth) {
        let outputStr = "";
        for (let i = 0; i < depth; i++) {
            outputStr += "  ";
        }
        return outputStr + target;
    }

}
