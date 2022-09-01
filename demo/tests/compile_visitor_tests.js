const EXAMPLE_PROGRAM_COMPILE = "[testa=1 testb=2.3]{e_0.1: buy(80%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv diluting 10 - 20% wait 12 - 24 months then {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";
const EXAMPLE_PROGRAM_COMPILE_OVER_1 = "[testa=1 testb=2.3]{e_0.1: buy(80%) | c_0.9: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv diluting 10 - 20% wait 12 - 24 months then {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";


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
        assert.equal(result["errors"].length, 0);
        assert.ok(result["result"] !== undefined);
    });

    QUnit.test("compilation with errors", function(assert) {
        const result = getCompiled("test");
        assert.ok(result["errors"].length > 0);
    });

    QUnit.test("compilation with proba error", function(assert) {
        assert.throws(() => {
            getCompiled(EXAMPLE_PROGRAM_COMPILE_OVER_1);
        });
    });

    QUnit.test("compilation without errors", function(assert) {
        const result = compileTest();
        if (result["errors"].length > 0) {
            assert.equal(result["errors"][0], "");
        }
        assert.equal(result["errors"].length, 0);
    });

});
