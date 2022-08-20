QUnit.module("CodeDeserializer", function() {

    QUnit.test("init deserializer", function(assert) {
        const deserializer = new CodeDeserializer();
        assert.ok(deserializer !== null);
    });

    QUnit.test("deserialize variables", function(assert) {
        const deserializer = new CodeDeserializer();
        const result = deserializer._variablesToCode({"testa": 1, "testb": 2.3});
        assert.deepEqual(result, "testa=1 testb=2.3");
    });

    QUnit.test("deserialize current simple", function(assert) {
        const deserializer = new CodeDeserializer();

        const result = deserializer._currentToCode([
            {"isElse": false, "proba": 0.1, "isCompany": true, "target": {"action": "fail"}},
            {"isElse": false, "proba": 0.2, "isCompany": true, "target": {
                "action": "ipo",
                "low": 0.3,
                "high": 0.4,
                "units": "share"
            }},
            {"isElse": true, "isCompany": true, "target": {
                "action": "sell",
                "low": 0.5,
                "high": 0.6,
                "units": "share"
            }},
            {"isElse": false, "isCompany": false, "proba": 0.7, "target": {"action": "quit"}},
            {"isElse": true, "isCompany": false, "target": {
                "action": "buy",
                "percentAmount": 80
            }}
        ], []);
        const resultCompact = result.replaceAll(" ", "");

        assert.deepEqual(resultCompact, "{c_0.1:fail()|c_0.2:ipo(0.3-0.4share)|c_else:sell(0.5-0.6share)|e_0.7:quit()|e_else:buy(80%)}");
    });

    QUnit.test("deserialize recursive", function(assert) {
        const deserializer = new CodeDeserializer();
        
        const result = deserializer._branchesToCode(
            {"current": [
                {"isElse": false, "proba": 0.1, "isCompany": true, "target": {"action": "fail"}},
                {"isElse": true, "isCompany": true, "target": {
                    "action": "raise",
                    "fmvLow": 0.3,
                    "fmvHigh": 0.4,
                    "diluteLow": 5,
                    "diluteHigh": 6,
                    "delayLow": 7,
                    "delayHigh": 8,
                }}
            ]},
            [{"current": [
                {"isElse": false, "proba": 0.9, "isCompany": true, "target": {"action": "fail"}},
                {"isElse": true, "isCompany": true, "target": {
                    "action": "ipo",
                    "low": 0.12,
                    "high": 0.34,
                    "units": "share"
                }}
            ]}]
        );
        const resultCompact = result.replaceAll(" ", "");

        assert.ok(resultCompact.includes("c_0.1:fail()"));
        assert.ok(resultCompact.includes("c_0.9:fail()"));
        assert.ok(resultCompact.includes("raise(0.3-0.4fmvdiluting5-6%wait7-8months"));
    });

    QUnit.test("serialization to code", function(assert) {
        const target = {
            "variables": {"testa": 1, "testb": 2.3},
            "states": [
                {"current": [
                    {"isElse": false, "proba": 0.1, "isCompany": true, "target": {"action": "fail"}},
                    {"isElse": true, "isCompany": true, "target": {
                        "action": "raise",
                        "fmvLow": 0.3,
                        "fmvHigh": 0.4,
                        "diluteLow": 5,
                        "diluteHigh": 6,
                        "delayLow": 7,
                        "delayHigh": 8,
                    }}
                ]},
                {"current": [
                    {"isElse": false, "proba": 0.9, "isCompany": true, "target": {"action": "fail"}},
                    {"isElse": true, "isCompany": true, "target": {
                        "action": "ipo",
                        "low": 0.12,
                        "high": 0.34,
                        "units": "share"
                    }}
                ]}
            ]
        };

        const deserializer = new CodeDeserializer();
        const result = deserializer.serializationToCode(target);
        const resultCompact = result.replaceAll(" ", "");

        assert.ok(resultCompact.includes("[testa=1testb=2.3]"));
        assert.ok(resultCompact.includes("c_0.1:fail()"));
        assert.ok(resultCompact.includes("c_0.9:fail()"));
        assert.ok(resultCompact.includes("raise(0.3-0.4fmvdiluting5-6%wait7-8monthsthen{"));
    });

});