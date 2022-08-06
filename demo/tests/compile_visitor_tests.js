const EXAMPLE_PROGRAM_COMPILE = "[testa=1 testb=2.3]{e_0.1: buy(80%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv, 10 - 20%, 12 - 24 months, {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";


QUnit.module("CompileVisitor", function() {

    function compileTest() {
        return getCompiled(EXAMPLE_PROGRAM_COMPILE);
    }

    QUnit.test("visitor init", function(assert) {
        const visitor = new CompileVisitor();
        assert.ok(visitor !== null);
    });

    QUnit.test("compilation runs", function(assert) {
        const result = compileTest();
        assert.ok(result["result"] !== null);
        assert.ok(result["result"] !== undefined);
    });

    QUnit.test("compilation with errors", function(assert) {
        const result = getCompiled("test");
        assert.ok(result["errors"].length > 0);
    });

    QUnit.test("compilation without errors", function(assert) {
        const result = compileTest();
        if (result["errors"].length > 0) {
            assert.equal(result["errors"][0], "");
        }
        assert.equal(result["errors"].length, 0);
    });

    QUnit.test("norm value", function(assert) {
        const visitor = new CompileVisitor();
        const result = visitor._getNormVal(1000, 1001, true, 2);
        assert.ok(result > 100);
    });

    QUnit.test("norm value reversed", function(assert) {
        const visitor = new CompileVisitor();
        const result = visitor._getNormVal(1001, 1000, true, 2);
        assert.ok(result > 100);
    });

    QUnit.test("norm value static", function(assert) {
        const visitor = new CompileVisitor();
        const result = visitor._getNormVal(1000, 1000, true, 2);
        assert.equal(result, 1000);
    });

    QUnit.test("norm value positive", function(assert) {
        const visitor = new CompileVisitor();
        const result = visitor._getNormVal(-1000, -1001, true, 2);
        assert.equal(result, 0);
    });

    QUnit.test("norm value negative", function(assert) {
        const visitor = new CompileVisitor();
        const result = visitor._getNormVal(-1000, -1001, false, 2);
        assert.ok(result < 0);
    });

});
