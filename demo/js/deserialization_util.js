class CodeDeserializer {

    constructor() {
        const self = this;
        self._stateStrategies = {
            "fail": (target, next) => self._failToCode(target, next),
            "ipo": (target, next) => self._ipoToCode(target, next),
            "sell": (target, next) => self._sellToCode(target, next),
            "quit": (target, next) => self._quitToCode(target, next),
            "buy": (target, next) => self._buyToCode(target, next),
            "raise": (target, next) => self._raiseToCode(target, next)
        };
    }

    serializationToCode(serialization) {
        const self = this;

        const variables = serialization["variables"];
        const headerStr = "[" + self._variablesToCode(variables) + "]";

        const states = serialization["states"];
        const firstTarget = states.shift();
        const bodyStr = self._branchesToCode(firstTarget, states);

        return headerStr + bodyStr;
    }

    _variablesToCode(variables) {
        const self = this;
        const keys = Object.keys(variables);
        const variableStrs = keys.map((x) => x + "=" + variables[x]);
        return variableStrs.join(" ");
    }

    _branchesToCode(target, next) {
        const self =  this;

        return self._currentToCode(target["current"], next);
    }

    _currentToCode(states, next) {
        const self = this;
        const componentStrs = states.map((x) => self._currentOptionToCode(x, next)).filter(
            (x) => x !== null
        );
        return "{" + componentStrs.join(",") + "}";
    }

    _currentOptionToCode(state, next) {
        const self = this;

        const isElse = state["isElse"];
        const proba = isElse ? "else" : state["proba"];
        const isCompany = state["isCompany"];
        const actor = isCompany ? "c." : "e.";
        const target = state["target"];
        const action = target["action"];
        const body = self._stateStrategies[action](target, next);

        if (body === null) {
            return null;
        }

        return actor + proba + ":" + body;
    }

    _failToCode(target, next) {
        const self = this;
        return "fail()";
    }

    _ipoToCode(target, next) {
        const self = this;

        const low = target["low"];
        const high = target["high"];
        const units = target["units"];

        return "ipo(" + low + "-" + high + " " + units + ")";
    }

    _sellToCode(target, next) {
        const self = this;

        const low = target["low"];
        const high = target["high"];
        const units = target["units"];
        
        return "sell(" + low + "-" + high + " " + units + ")";
    }

    _quitToCode(target, next) {
        const self = this;
        return "quit()";
    }

    _buyToCode(target, next) {
        const self = this;
        
        const amount = target["percentAmount"];
        
        return "buy(" + amount + "%)";
    }

    _raiseToCode(target, next) {
        const self = this;

        if (next.length == 0) {
            return null;
        }

        const fmvLow = target["fmvLow"];
        const fmvHigh = target["fmvHigh"];
        const diluteLow = target["diluteLow"];
        const diluteHigh = target["diluteHigh"];
        const delayLow = target["delayLow"];
        const delayHigh = target["delayHigh"];

        const nextBranches = next.shift();
        const nextBranchesStr = self._branchesToCode(nextBranches, next);

        const fmvStr = fmvLow + "-" + fmvHigh + "fmv";
        const diluteStr = diluteLow + "-" + diluteHigh + "%";
        const delayStr = delayLow + "-" + delayHigh + "months";
        
        const components = [fmvStr, diluteStr, delayStr, nextBranchesStr];
        const componentsStr = components.join(",");

        return "raise(" + componentsStr + ")";
    }


}
