QUnit.module("VizTest", function() {

    function makeVizPresenter() {
        return new VisualizationPresenter("summaryContainer", "detailsContainer");
    }

    function makeSampleDataset() {
        return [
            new SimulationResult(1, -1),
            new SimulationResult(1, 1),
            new SimulationResult(2, 2),
            new SimulationResult(3, 3),
            new SimulationResult(4, 4),
            new SimulationResult(5, 5),
            new SimulationResult(6, 6),
            new SimulationResult(7, 7),
            new SimulationResult(7.1, 7.1),
            new SimulationResult(8, 8),
            new SimulationResult(9, 9)
        ];
    }

    QUnit.test("Initialize viz presenter", function(assert) {
        assert.ok(makeVizPresenter() !== null);
    });

    QUnit.test("Clear details container", function(assert) {
        const presenter = makeVizPresenter();
        document.getElementById("detailsContainer").innerHTML = "test";
        presenter._clearDetailsContainer();
        assert.deepEqual(document.getElementById("detailsContainer").innerHTML, "");
    });

    QUnit.test("Render details container", function(assert) {
        const presenter = makeVizPresenter();
        const dataset = makeSampleDataset();
        presenter._renderDetailsContainer(dataset);
        assert.ok(document.getElementById("detailsContainerCanvas") !== null);
    });

    QUnit.test("Clear summary container", function(assert) {
        const presenter = makeVizPresenter();
        document.getElementById("summaryContainer").innerHTML = "test";
        presenter._clearSummaryContainer();
        assert.deepEqual(document.getElementById("summaryContainer").innerHTML, "");
    });

    QUnit.test("Summarize frequencies", function(assert) {
        const presenter = makeVizPresenter();
        const dataset = makeSampleDataset();
        const summary = presenter._summarizeFrequencies(dataset);
        assert.equal(summary.length, 10);
        assert.ok(Math.abs(summary[7]["profit"] - 7) < 0.001);
        assert.equal(Math.abs(summary[7]["count"] - 18.1818) < 1);
    });

    QUnit.test("Render summary container", function(assert) {
        const presenter = makeVizPresenter();
        const dataset = makeSampleDataset();
        const summary = presenter._summarizeFrequencies(dataset);
        presenter._renderSummaryContainer(summary);
        assert.ok(document.getElementById("summaryContainerCanvas") !== null);
    });

});
