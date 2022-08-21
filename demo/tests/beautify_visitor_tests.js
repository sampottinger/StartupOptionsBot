const EXAMPLE_PROGRAM_BEAUTIFY = "[testa=1 testb=2.3]{e_0.1: buy(80%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv diluting 10 - 20% wait 12 - 24 months then {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";

QUnit.module("CompileVisitor", function() {

    function beautifyTests() {
        return getBeautified(EXAMPLE_PROGRAM_BEAUTIFY);
    }

    QUnit.test("visitor init", function(assert) {
        const visitor = new BeautifyVisitor();
        assert.ok(visitor !== null);
    });

    QUnit.test("beautify and read", function(assert) {
        const result = getBeautified(EXAMPLE_PROGRAM_BEAUTIFY);
        assert.equal(result.errors.length, 0);
        const recompile = getCompiled(result.result);
        assert.equal(recompile.errors.length, 0);
    });

});