const NUM_BUCKETS = 20;


class VisualizationPresenter {

    constructor(summaryContainerId, detailsContainerId) {
        const self = this;
        self._summaryContainerId = summaryContainerId;
        self._detailsContainerId = detailsContainerId;
    }

    render(results) {
        const self = this;
        
        self._renderTable(results);
        
        self._clearDetailsContainer();
        self._renderDetailsContainer(results);

        self._clearSummaryContainer();
        const summarizedFrequencies = self._summarizeFrequencies(results);
        self._renderSummaryContainer(summarizedFrequencies);
    }
    
    _renderTable(results) {
        const self = this;
        const profits = results.map((x) => x.getProfit()).sort();
        
        const roundAndFormat = (target) => {
            const rounded = Math.round(target * 100) / 100;
            return rounded.toLocaleString("en-US");
        };
        
        const minProfit = roundAndFormat(Math.min(...profits));
        const maxProfit = roundAndFormat(Math.max(...profits));
        
        const meanUnrounded = profits.reduce((a, b) => a + b) / profits.length;
        const meanProfit = roundAndFormat(meanUnrounded);
        
        const medianIndexLow = Math.floor(profits.length / 2);
        const medianIndexHigh = Math.ceil(profits.length / 2);
        const medianLow = profits[medianIndexLow];
        const medianHigh = profits[medianIndexHigh];
        const medianProfit = roundAndFormat((medianLow + medianHigh) / 2);
        
        const minDisplay = document.getElementById("minDisplay");
        const meanDisplay = document.getElementById("meanDisplay");
        const medianDisplay = document.getElementById("medianDisplay");
        const maxDisplay = document.getElementById("maxDisplay");
        
        minDisplay.innerHTML = minProfit;
        meanDisplay.innerHTML = meanProfit;
        medianDisplay.innerHTML = medianProfit;
        maxDisplay.innerHTML = maxProfit;
    }

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
                "profit": self._formatNumber(displayProfit),
                "count": x["count"] / total * 100
            };
        });
    }

    _formatNumber(target) {
        const self = this;
        return target.toLocaleString("en-US");
    }

    _clearDetailsContainer() {
        const self = this;
        document.getElementById(self._detailsContainerId).innerHTML = "";
    }

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
                                    const profit = Math.round(context.parsed.y);
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
                        const messageEnd = "</ul> Profit: " + profit;
                        const message = messageStart + messageEnd;
                        
                        vex.dialog.alert({
                            unsafeMessage: "<b>Simulation " + simNum + ":<b> " + "\n" + message
                        });
                    }
                }
            };
        };

        const canvasId = self._createCanvas(self._detailsContainerId, "details-chart");

        const chart = new Chart(document.getElementById(canvasId), getConfig());
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
