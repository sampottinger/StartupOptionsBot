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
                "percentAmount": "80"
            }}
        ]);
        const resultCompact = result.replaceAll(" ", "");
        assert.deepEqual(resultCompact, "{c.0.1:fail(),c.0.2:ipo(0.3-0.4share),c.else:sell(0.5-0.6share),e.0.7:quit(),e.else:buy(80%)}");
    });

});