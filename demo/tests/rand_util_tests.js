QUnit.module("RandUtil", function() {

    QUnit.test("norm value", function(assert) {
        const result = getNormVal(1000, 1001, true, 2);
        assert.ok(result > 100);
    });

    QUnit.test("norm value reversed", function(assert) {
        const result = getNormVal(1001, 1000, true, 2);
        assert.ok(result > 100);
    });

    QUnit.test("norm value static", function(assert) {
        const result = getNormVal(1000, 1000, true, 2);
        assert.equal(result, 1000);
    });

    QUnit.test("norm value positive", function(assert) {
        const result = getNormVal(-1000, -1001, true, 2);
        assert.equal(result, 0);
    });

    QUnit.test("norm value negative", function(assert) {;
        const result = getNormVal(-1000, -1001, false, 2);
        assert.ok(result < 0);
    });

});