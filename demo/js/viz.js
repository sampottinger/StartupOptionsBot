/**
 * Logic for rendering information displays which describe the results from a set of simulations.
 *
 * @license MIT
 */

const NUM_BUCKETS = 20;


/**
 * Object which renders information displays describing a set of simulations.
 */
class VisualizationPresenter {

    /**
     * Create a new information display presenter.
     *
     * @param summaryContainerId - The ID for the container in which a simulation set summary
     *      should be rendered.
     * @param detailsContainerId - The ID for the container in which a simulation set detailed
     *      visualization should be rendered.
     */
    constructor(summaryContainerId, detailsContainerId) {
        const self = this;
        self._summaryContainerId = summaryContainerId;
        self._detailsContainerId = detailsContainerId;
    }

    /**
     * Render information displays describing the results from a set of simulations.
     *
     * @param results - Array of SimulationResults.
     */
    render(results) {
        const self = this;
        
        self._renderTable(results);
        
        self._clearDetailsContainer();
        self._renderDetailsContainer(results);

        self._clearSummaryContainer();
        const summarizedFrequencies = self._summarizeFrequencies(results);
        self._renderSummaryContainer(summarizedFrequencies);
    }
    
    /**
     * Render the summary table.
     *
     * @param results - Array of SimulationResults.
     */
    _renderTable(results) {
        const self = this;
        const profits = results.map((x) => x.getProfit()).sort();
        
        const roundAndFormat = (target) => {
            
        };
        
        const addDollarSign = (target) => {
            const rounded = Math.round(target * 100) / 100;
            if (target < 0) {
                const absStr = Math.abs(rounded).toLocaleString("en-US");
                return "-$" + absStr;
            } else {
                return "$" + rounded.toLocaleString("en-US");
            }
        };
        
        const minProfit = addDollarSign(Math.min(...profits));
        const maxProfit = addDollarSign(Math.max(...profits));
        const numSims = profits.length;
        
        const meanUnrounded = profits.reduce((a, b) => a + b) / numSims;
        const meanProfit = addDollarSign(meanUnrounded);
        
        const medianIndexLow = Math.floor(profits.length / 2);
        const medianIndexHigh = Math.ceil(profits.length / 2);
        const medianLow = profits[medianIndexLow];
        const medianHigh = profits[medianIndexHigh];
        const medianProfit = addDollarSign((medianLow + medianHigh) / 2);
        
        const percentProfitRaw = profits.filter((x) => x > 0).length / numSims;
        const percentProfit = (Math.round(percentProfitRaw * 1000) / 10) + "%";
        const millionPercentRaw = profits.filter((x) => x > 1000000).length / numSims;
        const millionPercent = (Math.round(millionPercentRaw * 1000) / 10) + "%";
        
        const minDisplay = document.getElementById("minDisplay");
        const lossDisplay = document.getElementById("lossDisplay");
        const meanDisplay = document.getElementById("meanDisplay");
        const medianDisplay = document.getElementById("medianDisplay");
        const millionDisplay = document.getElementById("millionDisplay");
        const maxDisplay = document.getElementById("maxDisplay");
        
        minDisplay.innerHTML = minProfit;
        profitDisplay.innerHTML = percentProfit;
        meanDisplay.innerHTML = meanProfit;
        medianDisplay.innerHTML = medianProfit;
        millionDisplay.innerHTML = millionPercent;
        maxDisplay.innerHTML = maxProfit;
    }

    /**
     * Create the data structure for a histogram.
     *
     * @param results - Array of SimulationResults.
     * @returns Array of objects with properties profit and count.
     */
    _summarizeFrequencies(results) {
        const self = this;

        const profits = results.map((x) => x.getProfit());
        const minProfit = Math.round(Math.min(...profits));
        const maxProfit = Math.round(Math.max(...profits));
        const profitRange = maxProfit - minProfit;
        if (profitRange == 0) {
            return [{'bin': minProfit, 'count': results.length}];
        }

        const bucketSize = Math.round(profitRange / NUM_BUCKETS);
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

        flatOutputs.sort((a, b) => a["profit"] - b["profit"]);
        const total = flatOutputs.map((x) => x["count"]).reduce((a, b) => a + b);

        return flatOutputs.map((x) => {
            const displayProfit = x["profit"] + bucketSize / 2;
            return {
                "profit": formatNumber(displayProfit),
                "count": x["count"] / total * 100
            };
        });
    }

    /**
     * Clear the HTML of the container in which the detailed visualizations should be rendered.
     */
    _clearDetailsContainer() {
        const self = this;
        document.getElementById(self._detailsContainerId).innerHTML = "";
    }

    /**
     * Render the detailed visualizations (histogram, scatter plot).
     *
     * @param details - Array of SimulationResults.
     */
    _renderDetailsContainer(details) {
        const self = this;
        
        const getData = () => {
            const data = details.map((x) => {
                return {"x": x.getMonths(), "y": x.getProfit(), "events": x.getEvents()};
            });
            return {
                "datasets": [{
                    "label": "Simulations",
                    "data": data,
                    "backgroundColor": "rgba(140, 140, 220, 0.2)"
                }]
            };
        };
        
        const getConfig = () => {
            return {
                type: "scatter",
                data: getData(),
                options: {
                    plugins: {
                        title: {
                            text: "Individual Simulation Outcomes",
                            display: true
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const months = Math.round(context.parsed.x);
                                    const profit = formatNumber(Math.round(context.parsed.y));
                                    return months + " months to profit of " + profit;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                text: "Months",
                                display: true
                            }
                        },
                        y: {
                            title: {
                                text: "Profit",
                                display: true
                            }
                        }
                    },
                    onClick(event) {
                        const points = chart.getElementsAtEventForMode(
                            event,
                            "nearest",
                            {intersect: true},
                            false
                        );
                        const firstPoint = points[0];
                        const simNum = firstPoint.index;
                        const value = chart.data.datasets[
                            firstPoint.datasetIndex
                        ].data[simNum];
                        const messageInner = value["events"].map(
                            (x) => {
                                const months = Math.round(x["months"]);
                                const event = x["event"];
                                return "<li>" + months + " months: " + event + "</li>"
                            }
                        ).join("\n");
                        
                        const profit = Math.round(value["y"]);
                        const messageStart = "<ul class='event-log'>" + messageInner;
                        const messageEnd = "</ul> Profit: " + formatNumber(profit);
                        const message = messageStart + messageEnd;
                        const simNumStr = formatNumber(simNum);
                        
                        vex.dialog.alert({
                            unsafeMessage: "<b>Simulation " + simNumStr + ":<b> " + "\n" + message
                        });
                    }
                }
            };
        };

        const canvasId = self._createCanvas(self._detailsContainerId, "details-chart");

        const chart = new Chart(document.getElementById(canvasId), getConfig());
    }

    /**
     * Clear the HTML of the container into which the summary table will be rendered.
     */
    _clearSummaryContainer() {
        const self = this;
        document.getElementById(self._summaryContainerId).innerHTML = "";
    }

    /**
     * Render the summary table.
     *
     * @param summaries - Array of objects with properties profit and count.
     */
    _renderSummaryContainer(summaries) {
        const self = this;
        
        const getData = () => {
            const labels = summaries.map((x) => x["profit"]);
            const counts = summaries.map((x) => x["count"]);
            return {
                "labels": labels,
                "datasets": [{
                    label: "Percent of Simulations",
                    data: counts,
                    backgroundColor: "rgb(140, 140, 220)"
                }]
            };
        };
        
        const getConfig = () => {
            return {
                type: "bar",
                data: getData(),
                options: {
                    plugins: {
                        title: {
                            text: "Histogram of Simulation Profit",
                            display: true
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                title: (tooltipItems) => {
                                    const profit = tooltipItems[0].label;
                                    return "Approx profit of " + profit;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                text: "Profit",
                                display: true
                            }
                        },
                        y: {
                            title: {
                                text: "Percent of Simulations",
                                display: true
                            }
                        }
                    }
                }
            };
        };

        const canvasId = self._createCanvas(self._summaryContainerId, "summary-chart");

        new Chart(document.getElementById(canvasId), getConfig());
    }

    /**
     * Create the canvas for a chart js visualization.
     *
     * @param outsideId - The ID of the containing element.
     * @param chartClass - The class to add to the canvas element.
     */
    _createCanvas(outsideId, chartClass) {
        const self = this;
        const canvasId = outsideId + "Canvas";
        const canvasPrefix = "<canvas id='" + canvasId;
        const canvasMiddle = "' class='" + chartClass;
        const canvasPostfix = "'></canvas>";
        const canvasHtml = canvasPrefix + canvasMiddle + canvasPostfix;
        document.getElementById(outsideId).innerHTML = canvasHtml;
        return canvasId;
    }

}
