const NUM_BUCKETS = 20;


class VisualizationPresenter {

    constructor(summaryContainerId, detailsContainerId) {
        const self = this;
        self._summaryContainerId = summaryContainerId;
        self._detailsContainerId = detailsContainerId;
    }

    render(results) {
        const self = this;
        
        self._clearDetailsContainer();
        self._renderDetailsContainer(results);

        self._clearSummaryContainer();
        const summarizedFrequencies = self._summarizeFrequencies(results);
        self._renderSummaryContainer(summarizedFrequencies);
    }

    _summarizeFrequencies(results) {
        const self = this;

        const profits = results.map((x) => x.getProfit());
        const minProfit = Math.min(...profits);
        const maxProfit = Math.max(...profits);
        const profitRange = maxProfit - minProfit;
        if (profitRange == 0) {
            return [{'bin': minProfit, 'count': results.length}];
        }

        const bucketSize = profitRange / NUM_BUCKETS;
        const aggregator = new Map();
        results.forEach((x) => {
            const profit = x.getProfit();
            const key = Math.round((profit - minProfit) / bucketSize);
            
            if (!aggregator.has(key)){
                aggregator.set(key, 0);
            }
            
            aggregator.set(key, aggregator.get(key) + 1);
        });

        const flatOutputs = [];
        aggregator.forEach((count, key) => {
            const profit = key * bucketSize + minProfit;
            flatOutputs.push({"profit": profit, "count": count});
        });

        return flatOutputs;
    }

    _clearDetailsContainer() {
        const self = this;
        document.getElementById(self._detailsContainerId).innerHTML = "";
    }

    _renderDetailsContainer(details) {
        const self = this;
        
        const getData = () => {
            const data = details.map((x) => {
                return {"x": x.getMonths(), "y": x.getProfit()};
            });
            return {
                "datasets": [{
                    "label": "Individual Simluations",
                    "data": data
                }]
            };
        };
        
        const getConfig = () => {
            return {
                type: "scatter",
                data: getData()
            };
        };

        const canvasId = self._createCanvas(self._detailsContainerId, "details-chart");

        new Chart(document.getElementById(canvasId), getConfig());
    }

    _clearSummaryContainer() {
        const self = this;
        document.getElementById(self._summaryContainerId).innerHTML = "";
    }

    _renderSummaryContainer(summaries) {
        const self = this;
        
        const getData = () => {
            const labels = summaries.map((x) => x["profit"]);
            const counts = summaries.map((x) => x["count"]);
            return {
                "labels": labels,
                "datasets": [{
                    label: "Histogram of Simulation Outcomes",
                    data: counts
                }]
            };
        };
        
        const getConfig = () => {
            return {
                type: "bar",
                data: getData()
            };
        };

        const canvasId = self._createCanvas(self._summaryContainerId, "summary-chart");

        new Chart(document.getElementById(canvasId), getConfig());
    }

    _createCanvas(outsideId, chartClass) {
        const self = this;
        const canvasId = outsideId + "Canvas";
        const canvasPrefix = "<canvas id='" + canvasId;
        const canvasMiddle = "' class='" + chartClass;
        const canvasPostfix = "'></canvas>";
        const canvasHtml = canvasPrefix + canvasMiddle + canvasPostfix;
        document.getElementById(self._detailsContainerId).innerHTML = canvasHtml;
        return canvasId;
    }

}