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

});