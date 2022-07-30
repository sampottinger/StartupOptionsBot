QUnit.module("SimulationState", function() {

    function makeState() {
        const newState = new SimulationState();
        newState.setValue("ipoPercentBuy", 1);
        newState.setValue("sellPercentBuy", 0.9);
        newState.setValue("quitPercentBuy", 0.5);
        newState.setValue("optionTax", 0.22);
        newState.setValue("regularIncomeTax", 0.33);
        newState.setValue("longTermTax", 0.2);
        newState.setValue("waitToSell", 0.8);
        newState.setValue("strikePrice", 1.1);
        newState.setValue("numOptionsAvailable", 123);
        newState.setValue("startFMV", 1.2);
        newState.setValue("startTotalShares", 1234567);
        return newState;
    }

    function makeSetUpState() {
        const newState = makeState();
        newState.finishSetup();
        return newState;
    }

    QUnit.test("assure value pass", function(assert) {
        const newState = makeState();
        newState._assureValuePresent("startFMV");
        assert.ok(true);
    });

    QUnit.test("assure value fail", function(assert) {
        const newState = makeState();
        assert.throws(function() {
            newState._assureValuePresent("test");
        });
    });

    QUnit.test("finish setup success", function(assert) {
        const newState = makeState();
        newState.finishSetup();
        assert.ok(true);
    });

    QUnit.test("finish setup fail", function(assert) {
        const newState = new SimulationState();
        assert.throws(function() {
            newState.finishSetup();
        });
    });

    QUnit.test("add events with delay", function(assert) {
        const newState = makeSetUpState();
        
        newState.addEvent("event1");
        newState.delay(1);
        newState.addEvent("event2");
        newState.delay(2);
        newState.addEvent("event3");

        const newEvents = newState.getEvents();

        assert.equal(newEvents[0]["months"], 0);
        assert.equal(newEvents[1]["months"], 1);
        assert.equal(newEvents[2]["months"], 3);

        assert.deepEqual(newEvents[0]["event"], "event1");
        assert.deepEqual(newEvents[1]["event"], "event2");
        assert.deepEqual(newEvents[2]["event"], "event3");
    });

    QUnit.test("get and set value", function(assert) {
        const newState = makeSetUpState();
        newState.setValue("test", 1234);
        assert.equal(newState.getValue("test"), 1234);
    });

    QUnit.test("set exit value", function(assert) {
        const newState = makeSetUpState();
        
        newState.setExitValue(1234567 * 2);
        assert.ok(Math.abs(newState._exitShare - 2) < 0.0001);

        newState.setExitShare(3);
        assert.ok(Math.abs(newState._exitShare - 3) < 0.0001);
    });

    QUnit.test("update options", function(assert) {
        const newState = makeSetUpState();
        const expectNewShares = 1234567 * 1.1;
        
        newState.setFairMarketValue(1.3);
        newState.diluteOptions(0.1);

        assert.ok(Math.abs(newState._fairMarketValue - 1.3) < 0.0001);
        assert.ok(Math.abs(newState._numTotalShares - expectNewShares) < 0.0001);
    });

    QUnit.test("clear remaining options", function(assert) {
        const newState = makeSetUpState();
        newState.clearRemainingOptions();

        assert.equal(newState._numOptionsAvailable, 0);
    });

    /*QUnit.test("get proceeds pre-tax", function(assert) {

    });

    QUnit.test("buy options", function(assert) {

    });

    QUnit.test("finalize and get profit", function(assert) {

    });*/

});