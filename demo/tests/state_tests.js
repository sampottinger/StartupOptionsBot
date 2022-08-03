QUnit.module("SimulationState", function() {

    function makeState() {
        const newState = new SimulationState();
        newState.setValue("ipoBuy", 100);
        newState.setValue("sellBuy", 90);
        newState.setValue("quitBuy", 50);
        newState.setValue("optionTax", 22);
        newState.setValue("regularIncomeTax", 33);
        newState.setValue("longTermTax", 20);
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
        assert.ok(Math.abs(newState._exitShare - 2) < 0.001);

        newState.setExitShare(3);
        assert.ok(Math.abs(newState._exitShare - 3) < 0.001);
    });

    QUnit.test("update options", function(assert) {
        const newState = makeSetUpState();
        const expectNewShares = 1234567 * 1.1;
        
        newState.setFairMarketValue(1.3);
        newState.diluteOptions(0.1);

        assert.ok(Math.abs(newState._fairMarketValue - 1.3) < 0.001);
        assert.ok(Math.abs(newState._numTotalShares - expectNewShares) < 0.0001);
    });

    QUnit.test("clear remaining options", function(assert) {
        const newState = makeSetUpState();
        newState.clearRemainingOptions();

        assert.equal(newState._numOptionsAvailable, 0);
    });

    QUnit.test("get proceeds pre-tax", function(assert) {
        const newState = makeSetUpState();
        newState.setExitShare(12);
        
        const proceeds = newState._getProceedsPreTax([
            {"count": 34, "basis": 5},
            {"count": 67, "basis": 8}
        ]);

        const expected = 34 * (12 - 1.1) + 67 * (12 - 1.1);

        assert.equal(proceeds, expected);
    });

    QUnit.test("decrement options", function(assert) {
        const newState = makeSetUpState();
        assert.equal(newState._numOptionsAvailable, 123);
        assert.equal(newState._numOptionsPurchased, 0);
        
        newState.buyOptions(99.9);
        assert.equal(newState._numOptionsAvailable, 23);
        assert.equal(newState._numOptionsPurchased, 100);

        newState.buyOptions(99.9);
        assert.equal(newState._numOptionsAvailable, 0);
        assert.equal(newState._numOptionsPurchased, 123);
    });

    QUnit.test("buy options", function(assert) {
        const newState = makeSetUpState();

        newState.setFairMarketValue(1.2);
        newState.buyOptions(99.9);

        newState.delay(23);
        newState.setFairMarketValue(2.3);
        newState.buyOptions(99.9);

        const history = newState._purchaseHistory;
        assert.equal(history.length, 2);

        assert.equal(history[0]["months"], 0);
        assert.equal(history[0]["count"], 100);
        assert.ok(Math.abs(history[0]["basis"] - (100 * 1.2)) < 0.001);

        assert.equal(history[1]["months"], 23);
        assert.equal(history[1]["count"], 23);
        assert.ok(Math.abs(history[1]["basis"] - (23 * 2.3)) < 0.001);
    });

    QUnit.test("get profit none", function(assert) {
        const newState = makeSetUpState();
        newState.finalize();
        assert.equal(newState.getProfit(), 0);
    });

    QUnit.test("get profit no short term", function(assert) {
        const newState = makeSetUpState();

        newState.setFairMarketValue(1.2);
        newState.buyOptions(99.9);

        newState.delay(23);
        newState.setFairMarketValue(2.3);
        newState.buyOptions(99.9);

        newState.setExitShare(4.5);
        newState.delay(6);

        const spreadAmount = (1.2 - 1.1) * 100 + (2.3 - 1.1) * 23;
        const spreadTax = spreadAmount * 0.22;

        const strikePaid = 123 * 1.1;

        const proceedsPreTax = 123 * 4.5 - 123 * 1.1;
        const longTermTax = proceedsPreTax * 0.2;

        const totalCosts = spreadTax + strikePaid + longTermTax;
        const proceeds = proceedsPreTax - totalCosts;

        newState.finalize();
        assert.equal(newState.getProfit(), proceeds);
    });

    QUnit.test("get profit short term", function(assert) {
        const newState = makeSetUpState();

        newState.setFairMarketValue(1.2);
        newState.buyOptions(99.9);

        newState.delay(23);
        newState.setFairMarketValue(2.3);
        newState.buyOptions(99.9);

        newState.setExitShare(4.5);
        newState.delay(6);
        newState.setValue("waitToSell", 0);

        const spreadAmount = (1.2 - 1.1) * 100 + (2.3 - 1.1) * 23;
        const spreadTax = spreadAmount * 0.22;

        const strikePaid = 123 * 1.1;

        const proceedsPreTax1 = 100 * (4.5 - 1.1);
        const proceedsPreTax2 = 23 * (4.5 - 1.1);
        const proceedsPreTax = proceedsPreTax1 + proceedsPreTax2;
        const longTermTax = proceedsPreTax1 * 0.2;
        const shortTermTax = proceedsPreTax2 * 0.33;

        const totalCosts = spreadTax + strikePaid + longTermTax + shortTermTax;
        const proceeds = proceedsPreTax - totalCosts;

        newState.finalize();
        assert.ok(Math.abs(newState.getProfit() - proceeds) < 0.001);
    });

});