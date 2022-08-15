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


function codeSupportedByUiEditor(serialization) {
    const hasFinalOrRaiseElse = (event, i) => {
        const options = event["current"];
        const elseOptions = options.filter((x) => x["isElse"]);

        const isFinal = serialization["states"].length == i + 1;
        
        if (elseOptions.length > 1) {
            return false;
        }

        if (isFinal) {
            if (elseOptions.length == 0) {
                return true;
            } else {
                return false;
            }
        } else {
            if (elseOptions.length == 0) {
                return false;
            } else {
                return elseOptions[0]["target"]["action"] === "raise";
            }
        }
    };

    const hasMultiAction = (event) => {
        const options = event["current"];
        const actions = options.map((x) => x["target"]["action"]);
        const actionSet = new Set(actions);
        return actions.length != actionSet.size;
    };

    const raiseCompatible = (event, i) => {
        return event["current"].length == 0 || hasFinalOrRaiseElse(event, i);
    };

    const unsupportedState = (event, i) => !raiseCompatible(event, i) || hasMultiAction(event);
    
    return serialization["states"].filter(unsupportedState).length == 0;
}


function parseSerializationFromUi(targetId) {
    if (targetId === undefined) {
        targetId = "codeUiBody";
    }

    const getSimpleNumber = (target) => {
        const element = document.getElementById(target);
        if (element === null) {
            throw "Could not find " + target;
        }
        return parseFloat(element.value);
    };

    const getDropdownValue = (target) => {
        const targetDropdown = document.getElementById(target);
        return targetDropdown.options[targetDropdown.selectedIndex].value;
    };

    const getVariables = () => {
        return {
            "numOptionsAvailable": getSimpleNumber("numOptions"),
            "strikePrice": getSimpleNumber("strikePrice"),
            "startFMV": getSimpleNumber("strikePrice"),
            "startTotalShares": getSimpleNumber("startTotalShares"),
            "startVestingMonths": getSimpleNumber("startVestingMonths"),
            "immediatelyVest": getSimpleNumber("immediatelyVest"),
            "monthlyVest": getSimpleNumber("monthlyVest"),
            "optionTax": getSimpleNumber("optionTax"),
            "regularIncomeTax": getSimpleNumber("regularIncomeTax"),
            "longTermTax": getSimpleNumber("longTermTax"),
            "startMonthLow": getSimpleNumber("startMonthLow"),
            "startMonthHigh": getSimpleNumber("startMonthHigh"),
            "ipoBuy": getSimpleNumber("ipoBuy"),
            "sellBuy": getSimpleNumber("sellBuy"),
            "quitBuy": getSimpleNumber("quitBuy"),
            "waitToSell": parseFloat(getDropdownValue("waitToSell")),
            "rangeStd": parseFloat(getDropdownValue("rangeStd"))
        };
    };

    const getState = (index) => {
        const getSimpleNumberAtIndex = (target) => getSimpleNumber(target + index);
        const getDropdownAtIndex = (target) => getDropdownValue(target + index);

        const failProba = getSimpleNumberAtIndex("failPercent") / 100;

        const quitProba = getSimpleNumberAtIndex("quitPercent") / 100;
        
        const buyProba = getSimpleNumberAtIndex("buyPercent") / 100;
        const buyPercentAmount = getSimpleNumberAtIndex("buyAmount");
        
        const sellProba = getSimpleNumberAtIndex("sellPercent") / 100;
        const sellLow = getSimpleNumberAtIndex("sellAmountLow");
        const sellHigh = getSimpleNumberAtIndex("sellAmountHigh");
        const sellUnits = getDropdownAtIndex("sellUnits");

        const ipoProba = getSimpleNumberAtIndex("ipoPercent") / 100;
        const ipoLow = getSimpleNumberAtIndex("ipoAmountLow");
        const ipoHigh = getSimpleNumberAtIndex("ipoAmountHigh");
        const ipoUnits = getDropdownAtIndex("ipoUnits");

        const fmvLow = getSimpleNumberAtIndex("raiseFmvLow");
        const fmvHigh = getSimpleNumberAtIndex("raiseFmvHigh");
        const diluteLow = getSimpleNumberAtIndex("raiseDiluteLow");
        const diluteHigh = getSimpleNumberAtIndex("raiseDiluteHigh");
        const delayLow = getSimpleNumberAtIndex("raiseDelayLow");
        const delayHigh = getSimpleNumberAtIndex("raiseDelayHigh");

        return {
            "current": [
                {
                    "proba": failProba,
                    "isElse": false,
                    "target": {"action": "fail"}
                },
                {
                    "proba": quitProba,
                    "isElse": false,
                    "target": {"action": "quit"}
                },
                {
                    "proba": buyProba,
                    "isElse": false,
                    "target": {
                        "action": "buy",
                        "percentAmount": buyPercentAmount
                    }
                },
                {
                    "proba": sellProba,
                    "isElse": false,
                    "target": {
                        "action": "sell",
                        "low": sellLow,
                        "high": sellHigh,
                        "units": sellUnits
                    }
                },
                {
                    "proba": ipoProba,
                    "isElse": false,
                    "target": {
                        "action": "ipo",
                        "low": ipoLow,
                        "high": ipoHigh,
                        "units": ipoUnits
                    }
                },
                {
                    "proba": "else",
                    "isElse": true,
                    "target": {
                        "action": "raise",
                        "fmvLow": fmvLow,
                        "fmvHigh": fmvHigh,
                        "diluteLow": diluteLow,
                        "diluteHigh": diluteHigh,
                        "delayLow": delayLow,
                        "delayHigh": delayHigh
                    }
                }
            ]
        };
    };
    
    const outerDiv = document.getElementById(targetId);
    const numStates = outerDiv.getElementsByClassName("event").length;
    const states = [];
    for (let i = 0; i < numStates; i++) {
        states.push(getState(i));
    }

    return {
        "variables": getVariables(),
        "states": states
    };
}


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
        const simplifiedEvents = events.map((x) => self._simplifyEvent(x));

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