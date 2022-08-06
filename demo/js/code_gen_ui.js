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

const NUMBER_REGEX = /^\d+(\.\d+)?$/;


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
            outputVariables[varName] = self._checkAndGetVar(inputVariables, varName);
        });

        const derived = {};
        derived["longTerm"] = outputVariables["waitToSell"] > 0.5;
        derived["highConfidence"] = outputVariables["rangeStd"] > 1.5;

        const events = serialization["states"].map((x) => x["current"]);
        const simplifiedEvents = events.map((x) => self._simplifyEvent(x))

        return self._getTemplate().then((template) => {
            const result = template({
                "derived": derived,
                "variables": outputVariables,
                "events": simplifiedEvents
            });
            document.getElementById(targetId).innerHTML = result;
        }, (x) => console.log(x));
    }

    _simplifyEvent(originalEvent) {
        const self = this;
        
        const outputRecord = {
            "quit": {"percent": 0},
            "buy": {"percent": 0, "amount": 0},
            "fail": {"percent": 0},
            "sell": {"percent": 0, "amount": {"low": 0, "high": 0}, "shares": true},
            "ipo": {"percent": 0, "amount": {"low": 0, "high": 0}, "shares": true},
            "raise": {
                "fmv": {"low": 0, "high": 0},
                "dilute": {"low": 0, "high": 0},
                "delay": {"low": 0, "high": 0}
            }
        };
        
        const strategies = {
            "quit": (x) => { outputRecord["quit"]["percent"] = x["proba"] * 100; },
            "buy": (x) => {
                outputRecord["buy"]["percent"] = x["proba"] * 100;
                outputRecord["buy"]["amount"] = x["target"]["percentAmount"];
            },
            "fail": (x) => {
                outputRecord["fail"]["percent"] = x["proba"] * 100;
            },
            "sell": (x) => {
                outputRecord["sell"]["percent"] = x["proba"] * 100;
                outputRecord["sell"]["amount"]["low"] = x["target"]["low"];
                outputRecord["sell"]["amount"]["high"] = x["target"]["high"];
                outputRecord["sell"]["shares"] = x["target"]["units"] === "share";
            },
            "ipo": (x) => {
                outputRecord["ipo"]["percent"] = x["proba"] * 100;
                outputRecord["ipo"]["amount"]["low"] = x["target"]["low"];
                outputRecord["ipo"]["amount"]["high"] = x["target"]["high"];
                outputRecord["ipo"]["shares"] = x["target"]["units"] === "share";
            },
            "raise": (x) => {
                outputRecord["raise"]["fmv"]["low"] = x["target"]["fmvLow"];
                outputRecord["raise"]["fmv"]["high"] = x["target"]["fmvHigh"];
                outputRecord["raise"]["dilute"]["low"] = x["target"]["diluteLow"];
                outputRecord["raise"]["dilute"]["high"] = x["target"]["diluteHigh"];
                outputRecord["raise"]["delay"]["low"] = x["target"]["diluteLow"];
                outputRecord["raise"]["delay"]["high"] = x["target"]["diluteHigh"];
            }
        };

        originalEvent.forEach((option) => {
            const action = option["target"]["action"];
            strategies[action](option);
        });
        
        return outputRecord;
    }

    _getTemplate() {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self._template !== null) {
                resolve(self._template);
            }

            fetch(self._templateUrl).then((templateContent) => {
                templateContent.text().then((templateContentText) => {
                    self._template = Handlebars.compile(templateContentText);
                    resolve(self._template);
                });
            }, (x) => { console.log(x); });
        });
    }

    _checkAndGetVar(target, name) {
        const self = this;

        if (target[name] === undefined) {
            throw "Missing " + name;
        }

        const candidateValue = "" + target[name];

        if (self._isNumber(candidateValue)) {
            return candidateValue;
        } else {
            throw "Not a number for " + name;
        }
    }

    _isNumber(target) {
        const self = this;
        return NUMBER_REGEX.test(target);
    }

}