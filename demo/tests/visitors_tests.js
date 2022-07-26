const EXAMPLE_PROGRAM = "[testa=1 testb=2.3]{e_0.1: buy(0.8%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv, 0.1 - 0.2%, 12 - 24 months, {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";


QUnit.module("CompileVisitor", function() {

    function compileTest() {
        return getProgram(EXAMPLE_PROGRAM);
    }

    QUnit.test("visitor init", function(assert) {
        const visitor = new CompileVisitor();
        assert.ok(visitor !== null);
    });

    QUnit.test("compilation without errors", function(assert) {
        const result = compileTest();
        if (result["errors"].length > 0) {
            assert.equal(result["errors"][0], "");
        }
        assert.equal(result["errors"].length, 0);
    });

    QUnit.test("compilation runs", function(assert) {
        const result = compileTest();
        assert.ok(result["program"] !== null);
    });

});