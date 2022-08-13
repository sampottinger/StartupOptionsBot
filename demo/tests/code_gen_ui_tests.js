QUnit.module("codeSupportedByEditor", function() {

    function makeSerializationActions() {
        return [
            {
                "proba": 0.01,
                "isElse": false,
                "target": {
                    "action": "quit"
                }
            },
            {
                "proba": 0.02,
                "isElse": false,
                "target": {
                    "action": "sell",
                    "amount": {
                        "low": 6,
                        "high": 7
                    },
                    "units": "share"
                }
            },
            {
                "proba": 0.03,
                "isElse": false,
                "target": {
                    "action": "ipo",
                    "amount": {
                        "low": 9,
                        "high": 10
                    },
                    "units": "total"
                }
            },
            {
                "proba": "else",
                "isElse": true,
                "target": {
                    "action": "raise"
                }
            }
        ];
    }

    function makeSerialization(actions) {
        return {
            "states": [
                {
                    "current": actions
                }
            ]
        };
    }

    QUnit.test("is supported", function(assert) {
        const actions = makeSerializationActions();
        const serialization = makeSerialization(actions);
        assert.ok((serialization));
    });

    QUnit.test("is supported empty", function(assert) {
        const testInput = {
            "states": [
                {
                    "current": []
                }
            ]
        };

        assert.ok(codeSupportedByUiEditor(testInput));
    });

    QUnit.test("has other else", function(assert) {
        const actions = makeSerializationActions();
        actions.push({
            "proba": "else",
            "isElse": true,
            "target": {
                "action": "buy",
                "amount": {
                    "low": 9,
                    "high": 10
                }
            }
        });
        const serialization = makeSerialization(actions);
        assert.ok(!codeSupportedByUiEditor(serialization));
    });

    QUnit.test("has multi else", function(assert) {
        const actions = makeSerializationActions();
        actions.push({
            "proba": "else",
            "isElse": true,
            "target": {
                "action": "raise"
            }
        });
        const serialization = makeSerialization(actions);
        assert.ok(!codeSupportedByUiEditor(serialization));
    });

    QUnit.test("has multi action", function(assert) {
        const actions = makeSerializationActions();
        actions.push({
            "proba": 0.03,
            "isElse": false,
            "target": {
                "action": "ipo",
                "amount": {
                    "low": 9,
                    "high": 10
                },
                "units": "total"
            }
        });
        const serialization = makeSerialization(actions);
        assert.ok(!codeSupportedByUiEditor(serialization));
    });

});


QUnit.module("CodeGenUiUtil", function() {

    const DEFAULT_INPUT = {
        "variables": {
            "ipoBuy": 100,
            "sellBuy": 90,
            "quitBuy": 80,
            "optionTax": 30,
            "regularIncomeTax": 31,
            "longTermTax": 22,
            "waitToSell": 0.1,
            "rangeStd": 1.9,
            "startMonthLow": 12,
            "startMonthHigh": 24,
            "strikePrice": 0.12,
            "totalGrant": 34,
            "startFMV": 0.56,
            "startTotalShares": 78
        },
        "states": [
            {
                "current": [
                    {
                        "proba": 0.01,
                        "target": {
                            "action": "quit"
                        }
                    },
                    {
                        "proba": 0.02,
                        "target": {
                            "action": "sell",
                            "low": 6,
                            "high": 7,
                            "units": "share"
                        }
                    },
                    {
                        "proba": 0.03,
                        "target": {
                            "action": "ipo",
                            "low": 9,
                            "high": 10,
                            "units": "total"
                        }
                    },
                ]
            }
        ]
    };

    function makeUtil() {
        return new CodeGenUiUtil("../templates/code_gen_ui.html");
    }

    QUnit.test("is number success", function(assert) {
        const util = makeUtil();
        assert.ok(util._isNumber("5"));
        assert.ok(util._isNumber("5.7"));
    });

    QUnit.test("is number fail", function(assert) {
        const util = makeUtil();
        assert.ok(!util._isNumber("test"));
        assert.ok(!util._isNumber("t5"));
        assert.ok(!util._isNumber("t5.7"));
    });

    QUnit.test("check and get var success", function(assert) {
        const util = makeUtil();
        assert.equal(util._checkAndGetVar({"a": "5"}, "a"), "5");
    });

    QUnit.test("check and get fail missing", function(assert) {
        assert.throws(function() {
            util._checkAndGetVar({"a": "5"}, "b");
        });
    });

    QUnit.test("check and get fail not num", function(assert) {
        assert.throws(function() {
            util._checkAndGetVar({"a": "t5"}, "a");
        });
    });

    QUnit.test("regular variables", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const ipoBuy = document.getElementById("ipoBuy").value;
            const sellBuy = document.getElementById("sellBuy").value;
            assert.deepEqual(ipoBuy, "100");
            assert.deepEqual(sellBuy, "90");
            done();
        });
    });

    QUnit.test("derived variables", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const waitToSell = document.getElementById("waitToSell").value;
            const rangeStd = document.getElementById("rangeStd").value;
            assert.deepEqual(waitToSell, "0");
            assert.deepEqual(rangeStd, "2");
            done();
        });
    });

    QUnit.test("event inputs", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const quitPercent = document.getElementById("quitPercent0").value;
            assert.deepEqual(quitPercent, "1");
            done();
        });
    });

    QUnit.test("event dropdown", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const sellUnits = document.getElementById("sellUnits0").value;
            const ipoUnits = document.getElementById("ipoUnits0").value;
            assert.deepEqual(sellUnits, "share");
            assert.deepEqual(ipoUnits, "total");
            done();
        });
    });

    QUnit.test("parse variables", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const result = parseSerializationFromUi();
            assert.equal(result["variables"]["ipoBuy"], 100);
            done();
        });
    });

    QUnit.test("parse probability", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const result = parseSerializationFromUi();
            assert.equal(result["states"][0]["current"][1]["proba"], 0.01);
            done();
        });
    });

    QUnit.test("parse simple", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const result = parseSerializationFromUi();
            assert.deepEqual(result["states"][0]["current"][4]["target"]["action"], "ipo");
            assert.equal(result["states"][0]["current"][4]["target"]["low"], 9);
            done();
        });
    });

    QUnit.test("parse dropdown", function(assert) {
        const done = assert.async();
        const util = makeUtil();
        util.render("templateTarget", DEFAULT_INPUT).then(() => {
            const result = parseSerializationFromUi();
            assert.equal(result["states"][0]["current"][3]["target"]["units"], "share");
            assert.equal(result["states"][0]["current"][4]["target"]["units"], "total");
            done();
        });
    });

});