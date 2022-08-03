const SIMPLE_VARIABLES = [
    "ipoBuy",
    "sellBuy",
    "quitBuy",
    "optionTax",
    "regularIncomeTax",
    "longTermTax",
    "waitToSell",
    "rangeStd",
    "startMonthLow",
    "startMonthHigh",
    "strikePrice",
    "totalGrant",
    "startFMV",
    "startTotalShares"
];


class CodeGenUiUtil {

    constructor(templateUrl) {
        const self = this;
        self._templateUrl = templateUrl;
        self._template = null;
    }

    render(targetId, serialization) {
        const self = this;

        const inputVariables = serialization["variables"];

        const outputVariables = {};
        SIMPLE_VARIABLES.forEach((varName) => {
            outputVariables = self._checkAndGetVar(inputVariables, varName);
        });

        const derived = {};
        derived["longTerm"] = outputVariables["waitToSell"] > 0.5;
        derived["highConfidence"] = outputVariables["rangeStd"] > 1.5;

        self._getTemplate().then((template) => {
            template({"derived": derived, "variables": variables});
        });
    }

    _getTemplate() {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self._template !== null) {
                resolve(self._template);
            }

            fetch(self._templateUrl).then((templateContent) => {
                const templateContentText = templateContent.text();
                self._template = Handlebars.compile(templateContentText);
                resolve(self._template);
            });
        });
    }

    _checkAndGetVar(target, name) {
        const self = this;

        if (target[name] === undefined) {
            throw "Missing " + name;
        }

        return target[name];
    }

}