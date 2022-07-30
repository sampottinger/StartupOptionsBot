class CodeDeserializer {

    constructor() {
        const self = this;
        self._stateStrategies = {
            "fail": (target, next) => self._failToCode(target, next),
            "ipo": (target, next) => self._ipoToCode(target, next),
            "sell": (target, next) => self._sellToCode(target, next),
            "quit": (target, next) => self._quitToCode(target, next),
            "buy": (target, next) => self._buyToCode(target, next),
        };
    }

    serializationToCode(serialization) {
        const self = this;

        const variables = serialization["variables"];
        const headerStr = "[" + self._variablesToCode(variables) + "]";

        return headerStr;
    }

    _variablesToCode(variables) {
        const self = this;
        const keys = Object.keys(variables);
        const variableStrs = keys.map((x) => x + "=" + variables[x]);
        return variableStrs.join(" ");
    }

    _statesToCode(states) {
        const self = this;
        const stateStrs = states.map((x) => self._stateToCode(x));
        return stateStrs.join(",");
    }

    _stateToCode(state) {
        const self = this;

        const isElse = state["isElse"];
        const proba = isElse ? "else" : state["proba"];
        const isCompany = state["isCompany"];
        const actor = isCompany ? "c." : "e.";
        const target = state["target"];
        const action = target["action"];
        const body = self._stateStrategies[action](target);

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


}
