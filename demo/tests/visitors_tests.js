QUnit.module("CompileVisitor", function() {

    function compileTest() {
        return getProgram('[test1:1 test2:2.3]{e_0.1: buy(0.8%), c_0.1: ipo(3 - 4 share), c_0.4: sell(2 - 3 share), c_else:raise()}');
    }

    QUnit.test("visitor init", function(assert) {
        const visitor = new CompileVisitor();
        assert.ok(visitor !== null);
    });

    QUnit.test("compilation", function(assert) {
        
    });

});