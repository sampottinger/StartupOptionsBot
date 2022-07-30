const EXAMPLE_PROGRAM_JSON = "[testa=1 testb=2.3]{e_0.1: buy(0.8%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv, 0.1 - 0.2%, 12 - 24 months, {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";


QUnit.module("SerializationVisitor", function() {

    function serializeTest() {
        return getSerialization(EXAMPLE_PROGRAM_JSON);
    }

    QUnit.test("visitor init", function(assert) {
        const visitor = new SerializationVisitor();
        assert.ok(visitor !== null);
    });

    QUnit.test("serialization runs", function(assert) {
        const result = serializeTest();
        assert.ok(result["result"] !== null);
        assert.ok(result["result"] !== undefined);
    });

    QUnit.test("compilation with errors", function(assert) {
        const result = getSerialization("test");
        assert.ok(result["errors"].length > 0);
    });

    QUnit.test("compilation without errors", function(assert) {
        const result = serializeTest();
        if (result["errors"].length > 0) {
            assert.equal(result["errors"][0], "");
        }
        assert.equal(result["errors"].length, 0);
    });

});