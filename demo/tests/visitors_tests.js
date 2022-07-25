QUnit.module("CompileVisitor", function() {

    QUnit.test("visitor inits", function(assert) {
        const visitor = new CompileVisitor();
        assert.ok(visitor !== null);
    });

});