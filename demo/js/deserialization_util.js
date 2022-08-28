/**
 * Logic to convert a serilization to string code.
 *
 * @license MIT
 */


/**
 * Utility to deserialize a serialized program representation to string code.
 */
class CodeDeserializer {

    /**
     * Create a new deserializer.
     */
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

    /**
     * Convert a serialization to code.
     *
     * @param serialization - Serialized form of the program.
     * @returns Code form of the program.
     */
    serializationToCode(serialization) {
        const self = this;

        const variables = serialization["variables"];
        const headerStr = "[" + self._variablesToCode(variables) + "]";

        const states = serialization["states"];
        const firstTarget = states.shift();
        const bodyStr = self._branchesToCode(firstTarget, states);

        return headerStr + bodyStr;
    }

    /**
     * Convert a set of variable assignments to code.
     *
     * @param variables - The serialization form of variable assignments.
     * @returns Code form of the variable assignements.
     */
    _variablesToCode(variables) {
        const self = this;
        const keys = Object.keys(variables);
        const variableStrs = keys.map((x) => x + "=" + variables[x]);
        return variableStrs.join(" ");
    }

    /**
     * Convert a set of branches to code.
     *
     * @param variables - The serialization form of branches.
     * @returns Code form of the branches.
     */
    _branchesToCode(target, next) {
        const self =  this;

        return self._currentToCode(target["current"], next);
    }

    /**
     * Convert an MCMC state to code.
     *
     * @param state - The serialization form of the current MCMC state.
     * @param next - Array of later MCMC state serializations.
     * @returns Code form of the current MCMC state.
     */
    _currentToCode(states, next) {
        const self = this;
        const componentStrs = states.map((x) => self._currentOptionToCode(x, next)).filter(
            (x) => x !== null
        );
        return "{" + componentStrs.join("|") + "}";
    }

    /**
     * Convert a branch (option) to code.
     *
     * @param state - The serialization form of the current branch.
     * @param next - Array of later MCMC state serializations.
     * @returns Code form of the current MCMC state.
     */
    _currentOptionToCode(state, next) {
        const self = this;

        const isElse = state["isElse"];
        const proba = isElse ? "else" : state["proba"];
        const isCompany = state["isCompany"];
        const actor = isCompany ? "c_" : "e_";
        const target = state["target"];
        const action = target["action"];
        const body = self._stateStrategies[action](target, next);

        if (body === null) {
            return null;
        }

        return actor + proba + ":" + body;
    }

    /**
     * Convert a serialization of a fail action to code.
     *
     * @param target - The action serialization.
     * @returns String code form.
     */
    _failToCode(target, next) {
        const self = this;
        return "fail()";
    }

    /**
     * Convert a serialization of an IPO action to code.
     *
     * @param target - The action serialization.
     * @returns String code form.
     */
    _ipoToCode(target, next) {
        const self = this;

        const low = target["low"];
        const high = target["high"];
        const units = target["units"];

        return "ipo(" + low + "-" + high + " " + units + ")";
    }

    /**
     * Convert a serialization of a sell action to code.
     *
     * @param target - The action serialization.
     * @returns String code form.
     */
    _sellToCode(target, next) {
        const self = this;

        const low = target["low"];
        const high = target["high"];
        const units = target["units"];
        
        return "sell(" + low + "-" + high + " " + units + ")";
    }

    /**
     * Convert a serialization of a quit action to code.
     *
     * @param target - The action serialization.
     * @returns String code form.
     */
    _quitToCode(target, next) {
        const self = this;
        return "quit()";
    }

    /**
     * Convert a serialization of a buy action to code.
     *
     * @param target - The action serialization.
     * @returns String code form.
     */
    _buyToCode(target, next) {
        const self = this;
        
        const amount = target["percentAmount"];
        
        return "buy(" + amount + "%)";
    }

    /**
     * Convert a serialization of a raise action to code.
     *
     * @param target - The action serialization.
     * @returns String code form.
     */
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
        
        const beforeThen = fmvStr + " diluting " + diluteStr + " wait " + delayStr;
        const componentsStr = beforeThen + " then " + nextBranchesStr;

        return "raise(" + componentsStr + ")";
    }


}
