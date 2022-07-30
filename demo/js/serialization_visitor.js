class SerializationVisitor extends toolkit.StartUpOptionsBotLangVisitor {

    visitNumber(ctx) {
        const self = this;

        const targetStr = ctx.getChild(0).getText();
        const isFloat = targetStr.includes(".");
        return isFloat ? parseFloat(targetStr) : parseInt(targetStr);
    }

    visitFail(ctx) {
        const self = this;

        return {"action": "fail"};
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

    visitQuit(ctx) {
        const self = this;

        return {"action": "quit"};
    }

    visitBuy(ctx) {
        const self = this;

        const percentAmount = ctx.amount.accept(self);

        return {"action": "buy", "percentAmount": percentAmount};
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

        let next = [];

        const allBranches = [];
        const numChildren = ctx.getChildCount();
        for (let i = 1; i < numChildren; i += 2) {
            let curChild = ctx.getChild(i);
            
            let parsedBranch = curChild.accept(self);
            let branchTarget = parsedBranch["target"][0];
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

    visitName(ctx) {
        const self = this;

        return ctx.getChild(0).getText();
    }

    visitAssignment(ctx) {
        const self = this;

        const target = ctx.target.accept(self);
        const value = ctx.value.accept(self);

        return {"key": target, "value": value};
    }

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

    visitProgram(ctx) {
        const self = this;

        const variables = ctx.header.accept(self);
        const states = ctx.body.accept(self);

        return {
            "variables": variables,
            "states": states
        };
    }

    _createSellEvent(ctx, label) {
        const self = this;

        const low = ctx.low.accept(self);
        const high = ctx.low.accept(self);
        const units = ctx.unit.getText();

        return {
            "action": label,
            "low": low,
            "high": high,
            "units": units
        };
    }

}
