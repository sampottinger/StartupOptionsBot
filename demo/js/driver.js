/**
 * High level logic for running StartupOptionsBot.com
 *
 * @license MIT
 */

const DEFAULT_CODE = "[useLogNorm = 0 ipoBuy = 100 sellBuy = 90 quitBuy = 50 optionTax = 26 regularIncomeTax = 33 longTermTax = 20 waitToSell = 0 strikePrice = 1 totalGrant = 200 startVestingMonths = 10 immediatelyVest = 20 monthlyVest = 10 startFMV = 2 startTotalShares = 100000 rangeStd = 2 startMonthLow = 5 startMonthHigh = 15]{e_0.1: buy(80%) | c_0.1: ipo(500,000,000 - 1,000,000,000 total) | c_0.4: sell(100,000,000 - 500,000,000 total) | c_else:raise(2 - 3 fmv diluting 10 - 20% wait 12 - 24 months then {c_0.1: fail() | c_0.4: sell(200,000,000 - 700,000,000 total) | c_0.5: ipo(500,000,000 - 1,500,000,000 total)} ) }";

const NUM_SIMULATIONS = 10000;

let isUsingCodeEditor = false;


/**
 * Get the current code loaded into the tool.
 *
 * @returns String code.
 */
function getCodeFromState() {
    return document.getElementById("codeShadow").value.replace("code=", "");
}


/**
 * Set the current code loaded into the tool.
 *
 * @param code - The latest code to reflect in the tool
 */
function pushCodeToState(code) {
    document.getElementById("codeShadow").value = "code=" + code;
}


/**
 * Change which editor is visible to the user.
 *
 * @param showCodeEditor - Boolean flag indicating if the free text code editor should be shown.
 * @param showUiEditor - Boolean flag indicating if the UI wizard should be shown.
 * @param showNotSupported - Boolean flag indicating if the not supported warning should be shown.
 */
function changeEditorVisibility(showCodeEditor, showUiEditor, showNotSupported) {
    document.getElementById("codeEditor").style.display = showCodeEditor ? "block" : "none";
    document.getElementById("uiEditor").style.display = showUiEditor ? "block" : "none";
    document.getElementById("uiNotSupported").style.display = showNotSupported ? "block" : "none";

    const uiEditorLink = document.getElementById("uiEditorLink");
    const codeEditorLink = document.getElementById("codeEditorLink");
    if (showCodeEditor) {
        uiEditorLink.classList.remove("active");
        codeEditorLink.classList.add("active");
        uiEditorLink.setAttribute("aria-current", "false");
        codeEditorLink.setAttribute("aria-current", "location");
    } else {
        uiEditorLink.classList.add("active");
        codeEditorLink.classList.remove("active");
        uiEditorLink.setAttribute("aria-current", "location");
        codeEditorLink.setAttribute("aria-current", "false");
    }
}


/**
 * Show the free text code editor.
 */
function showCodeEditor() {
    const codeRaw = getCodeFromState();
    
    const beautifyResult = getBeautified(codeRaw);
    const beautifiedOk = beautifyResult.errors.length == 0
    const code = beautifiedOk ? beautifyResult.result : codeRaw;
    
    isUsingCodeEditor = true;
    changeEditorVisibility(true, false, false);
    document.getElementById("codeEditorInput").value = code;
}


/**
 * Show the UI editor / UI wizard for generating code.
 *
 * @param templateUrl - The full URL to the Handlebars template to use for the UI editor. If not
 *      given, will use a default.
 * @param targetId - The ID of the container in which the UI editor should be rendered.
 * @returns Promise which resolves after the UI editor has been rendered.
 */
function showUiEditor(templateUrl, targetId) {
    return new Promise((resolve) => {
        const code = getCodeFromState();
        const serialization = getSerialization(code);
        const hasErrors = serialization.errors.length > 0;
        const isCodeUiSupported = !hasErrors && codeSupportedByUiEditor(serialization["result"]);
    
        if (templateUrl === undefined) {
            templateUrl = "/templates/code_gen_ui.html";
        }
    
        if (targetId === undefined) {
            targetId = "codeUiBody";
        }
    
        if (isCodeUiSupported) {
            isUsingCodeEditor = false;
            changeEditorVisibility(false, true, false);
            const codeGenUiUtil = new CodeGenUiUtil(templateUrl);
            return codeGenUiUtil.render(targetId, serialization["result"]).then(() => {
                resolve();
            });
        } else {
            isUsingCodeEditor = true;
            changeEditorVisibility(false, false, true);
            resolve();
        }
    });
}


/**
 * Remove whitespace from code.
 *
 * @param target - The code from which whitespace should be removed.
 * @returns The code without whitespace.
 */
function removeWhitespace(target) {
    return target.replaceAll(/\s/ig, "");
}


/**
 * Re-render the UI editor even if it is currently rendered.
 *
 * @param templateUrl - The full URL to the Handlebars template to use for the UI editor. If not
 *      given, will use a default.
 * @returns Promise which resolves when render done.
 */
function cycleUiState(templateUrl) {
    const serialization = parseSerializationFromUi();
    
    const deserializer = new CodeDeserializer();
    const code = deserializer.serializationToCode(serialization);
    pushCodeToState(code);

    return showUiEditor(templateUrl);
}


/**
 * Scroll to an MCMC state.
 *
 * @param index - Index of the state (MCMC state).
 * @returns Promise which resolves after the scroll and focus has been requested.
 */
function makeFocusOnState(index) {
    return new Promise((resolve) => {
        const targetId = "event" + index;
        document.getElementById("statesDetails").setAttribute("open", "true");
        const scrollTarget = document.getElementById(targetId);
        if (scrollTarget !== null) {
            scrollTarget.scrollIntoView();
            scrollTarget.focus();
        }
        resolve(); 
    });
}


/**
 * Add a new MCMC state to the structure of the simulation.
 *
 * @param templateUrl - The URL at which the Handlebars template can be found. If not given, a
 *      default will be used.
 * @returns Promise which is resolved when rendered.
 */
function addUiState(templateUrl) {
    return new Promise((resolve) => {
        const serialization = parseSerializationFromUi();
        serialization["states"].push({"current": [
            {
                "proba": 1,
                "isElse": false,
                "isCompany": true,
                "target": {"action": "fail"}
            }
        ]});
        const newIndex = serialization["states"].length - 1;
        
        const deserializer = new CodeDeserializer();
        const code = deserializer.serializationToCode(serialization);
        pushCodeToState(code);
    
        return showUiEditor(templateUrl).then(() => {
            makeFocusOnState(newIndex).then(() => {
               resolve(); 
            });
        });
    });
}


/**
 * Remove an MCMC state from the structure of the simulation.
 *
 * @param templateUrl - The URL at which the Handlebars template can be found. If not given, a
 *      default will be used.
 * @returns Promise which is resolved when rendered.
 */
function removeUiState(index, templateUrl) {
    const future = (resolve) => {
        const serialization = parseSerializationFromUi();
        serialization["states"].splice(index, 1);
        
        const deserializer = new CodeDeserializer();
        const code = deserializer.serializationToCode(serialization);
        pushCodeToState(code);
    
        showUiEditor(templateUrl).then(() => {
            makeFocusOnState(index).then(() => {
                resolve();
            });
        });
    };
    
    return new Promise((resolve) => {
        const eventSelection = d3.select("#event" + index);
        eventSelection.style("opacity", 1);
        eventSelection.transition()
            .style("opacity", 0)
            .duration(700)
            .on("end", () => {
                future(resolve);
            });
    });
}


/**
 * Get the code in the current editor.
 *
 * @returns Code in the currently selected editor.
 */
function getEditorCode() {
    const getFromUiEditor = () => {
        const serialization = parseSerializationFromUi();
        const deserializer = new CodeDeserializer();
        const code = deserializer.serializationToCode(serialization);
        return code;
    };

    const getFromCodeEditor = () => {
        const code = document.getElementById("codeEditorInput").value;
        return code;
    };

    return isUsingCodeEditor ? getFromCodeEditor() : getFromUiEditor();
}


/**
 * Load the current editor code into the tool.
 */
function pushCurrentCode() {
    pushCodeToState(getEditorCode());
}


/**
 * Load the current tool code into the currently selected editor.
 * 
 * @param templateUrl - The full URL to the Handlebars template to use for the UI editor. If not
 *      given, will use a default.
 */
function loadCodeToEditors(templateUrl) {
    if (isUsingCodeEditor) {
        showCodeEditor();
    } else {
        showUiEditor();
    }
}


/**
 * Run simulations using the code currently loaded into the tool.
 *
 * @param numSimulations - The number of simulations to run using the current code. If not given,
 *      will use a default.
 */
function runSimulations(numSimulations) {
    document.getElementById("simButtonHolder").style.display = "none";
    document.getElementById("runningSimDisplay").style.display = "block";
    document.getElementById("simOutputDisplay").style.display = "none";

    if (numSimulations === undefined) {
        numSimulations = NUM_SIMULATIONS;
    }

    const cleanUpUi = () => {
        document.getElementById("simButtonHolder").style.display = "block";
        document.getElementById("runningSimDisplay").style.display = "none";
        document.getElementById("simOutputDisplay").style.display = "block";
    };

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            pushCurrentCode();
            let result = null;
            try {
                result = getCompiled(getCodeFromState());
            } catch (e) {
                result = {'errors': [e]};
            }  
            if (result.errors.length > 0) {
                vex.dialog.alert("Whoops! There's an error in your program: " + result.errors[0]);
                cleanUpUi();
                return;
            } 
            const program = result["result"];
    
            const runProgram = () => {
                const newState = new SimulationState();
                program(newState);
                return newState.getResult();
            };
            
            const finish = () => {
                const vizPresenter = new VisualizationPresenter(
                    "outputSummaryContainer",
                    "outputDetailsContainer"
                );
    
                vizPresenter.render(outcomes);
                cleanUpUi();
                resolve();
            };
    
            const outcomes = [];
            const numRunDisplay = document.getElementById("numRunDisplay");
            let i = 0;
            const runSimBatch = () => {
                for (let subsetI = 0; subsetI < 100; subsetI++) {
                    outcomes.push(runProgram());
                    i++;
                }
                numRunDisplay.innerHTML = formatNumber(i);
                setTimeout(() => {
                    if (i >= numSimulations) {
                        finish();
                    } else {
                        runSimBatch();
                    }
                }, 10);
            };
            runSimBatch();
            
        }, 100);
    });
}


/**
 * Copy a URL embedding the current tool code to the user clipboard.
 */
function copyCodeToCb() {
    const code = getCodeFromState();
    const saveUrl = "https://startupoptionsbot.com/#code=" + escape(code);
    navigator.clipboard.writeText(saveUrl);
    vex.dialog.alert("Copied to clipboard.");
}


/**
 * Initialize the tool with basic event listeners.
 */
function init() {
    const disclaimerAgree = document.getElementById("disclaimerAgree");
    disclaimerAgree.addEventListener("click", () => {
        document.getElementById("disclaimerPanel").style.display = "none";
        document.getElementById("postDisclaimerLoadingPanel").style.display = "block";
        showUiEditor().then(() => {
            document.getElementById("postDisclaimerLoadingPanel").style.display = "none"
            document.getElementById("postDisclaimerPanel").style.display = "block";
        });
    });

    const uiEditorLink = document.getElementById("uiEditorLink");
    uiEditorLink.addEventListener("click", () => {
        pushCurrentCode();
        showUiEditor();
    });

    const codeEditorLink = document.getElementById("codeEditorLink");
    codeEditorLink.addEventListener("click", () => {
        pushCurrentCode();
        showCodeEditor();
    });

    const runSimButton = document.getElementById("runSimButton");
    runSimButton.addEventListener("click", () => {
        document.getElementById("outputs").style.display = "block";
        exampleNote.style.display = "none";
        runSimulations();
    });
    
    const shareButton = document.getElementById("shareButton");
    shareButton.addEventListener("click", (event) => {
        pushCurrentCode();
        const code = getCodeFromState();
        const saveUrl = "https://startupoptionsbot.com/#code=" + escape(code);
        const messagePrefix = "You can share or return to your work by going to: <br>";
        const message = "<input class='form-control' type='text' value='" + saveUrl + "' readonly><br>";
        const messageButton = "<button href='#' id='copyCbBtn' class='btn btn-outline-secondary'";
        const messageClose = "onclick='copyCodeToCb()'>Copy to clipboard</button>";
        
        vex.dialog.alert({
            unsafeMessage: messagePrefix + message + messageButton + messageClose
        });
        
        event.preventDefault();
    });
    
    const inlineUiEditLink = document.getElementById("inlineUiEditLink");
    inlineUiEditLink.addEventListener("click", (event) => {
        pushCurrentCode();
        showUiEditor();
    });
    
    const inlineCodeEditLink = document.getElementById("inlineCodeEditLink");
    inlineCodeEditLink.addEventListener("click", (event) => {
        pushCurrentCode();
        showCodeEditor();
    });
    
    const usNoticeLink = document.getElementById("usNoticeLink");
    usNoticeLink.addEventListener("click", (event) => {
        const usNoticeInner = document.getElementById("usNotice").innerHTML;
        vex.dialog.alert({unsafeMessage: usNoticeInner});
        event.preventDefault();
    });
    
    const fragment = window.location.hash;
    const exampleNote = document.getElementById("exampleNote");
    if (fragment.startsWith("#code=")) {
        const code = unescape(fragment.replace("#code=", ""));
        pushCodeToState(code);
        exampleNote.style.display = "none";
    } else {
        pushCodeToState(DEFAULT_CODE);
        exampleNote.style.display = "inline-block";
    }
}
