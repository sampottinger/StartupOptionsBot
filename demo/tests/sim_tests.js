const FULL_PROGRAM = "[useLogNorm = 0 ipoBuy = 100 sellBuy = 90 quitBuy = 50 optionTax = 22 regularIncomeTax = 33 longTermTax = 20 waitToSell = 0.8 strikePrice = 1.1 totalGrant = 123 startVestingMonths = 10 immediatelyVest = 20 monthlyVest = 10 startFMV = 1.2 startTotalShares = 12300 rangeStd = 2 startMonthLow = 5 startMonthHigh = 15]{e_0.1: buy(80%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv, 10 - 20%, 12 - 24 months, {c_0.5: sell(1 - 2 share) | c_0.5: ipo(2 - 3 share)} ) }";

QUnit.module("SimTest", function() {

    QUnit.test("Make example program", function(assert) {
        const result = visitProgram(FULL_PROGRAM);
        const program = result["program"];
        assert.ok(program !== null);
    });

    QUnit.test("Run example program", function(assert) {
        const result = visitProgram(FULL_PROGRAM);
        const program = result["program"];

        runProgram = () => {
            const newState = new SimulationState();
            program(newState);
            return newState.getProfit();
        };

        const results = [];
        for (let i=0; i<100; i++) {
            results.push(runProgram());
        }

        assert.ok(Math.max(...results) > 1);
        
        const unique = new Set(results);
        assert.ok(unique.size > 1);
    });

});
