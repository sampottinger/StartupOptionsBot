const EXAMPLE_PROGRAM_JSON = "[testa=1 testb=2.3]{e_0.1: buy(80%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv diluting 10 - 20% wait 12 - 24 months then {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";


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

    QUnit.test("serialization with errors", function(assert) {
        const result = getSerialization("test");
        assert.ok(result["errors"].length > 0);
    });

    QUnit.test("serialization without errors", function(assert) {
        const result = serializeTest();
        if (result["errors"].length > 0) {
            assert.equal(result["errors"][0], "");
        }
        assert.equal(result["errors"].length, 0);
    });

    QUnit.test("serialization for variables", function(assert) {
        const result = serializeTest()["result"];
        const variables = result["variables"];
        assert.ok(Math.abs(variables["testa"] - 1) < 0.001);
        assert.ok(Math.abs(variables["testb"] - 2.3) < 0.001);
    });

    QUnit.test("serialization for states", function(assert) {
        const result = serializeTest()["result"];
        const states = result["states"];
        
        assert.equal(states.length, 2);
        assert.equal(states[0]["current"].length, 4);
        assert.equal(states[1]["current"].length, 2);
    });

});