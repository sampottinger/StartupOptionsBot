const DEFAULT_CODE = "[ipoBuy = 100 sellBuy = 90 quitBuy = 50 optionTax = 22 regularIncomeTax = 33 longTermTax = 20 waitToSell = 0.8 strikePrice = 1.1 totalGrant = 123 startVestingMonths = 10 immediatelyVest = 20 monthlyVest = 10 startFMV = 1.2 startTotalShares = 1234567 rangeStd = 2 startMonthLow = 5 startMonthHigh = 15]{e_0.1: buy(80%) | c_0.1: ipo(3 - 4 share) | c_0.4: sell(2 - 3 share) | c_else:raise(1.1 - 1.2 fmv, 10 - 20%, 12 - 24 months, {c_0.45: sell(1 - 2 share) | c_0.55: ipo(2 - 3.5 share)} ) }";
const NUM_SIMULATIONS = 5000;

let isUsingCodeEditor = false;


function getCodeFromUrl() {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const fromUrl = queryParams.get("code");
    return fromUrl === null ? DEFAULT_CODE : fromUrl;
}


function pushCodeToUrl(code) {
    const startQueryString = window.location.search;
    const searchParams = new URLSearchParams(startQueryString);
    searchParams.set("code", removeWhitespace(code));
    const newLocationBase = window.location.protocol + "//" + window.location.host;
    const newLocationPath = window.location.pathname + '?' + searchParams.toString();
    const newLocation = newLocationBase + newLocationPath;
    window.history.pushState({"code": code}, "", newLocation);
}


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


function showCodeEditor() {
    const code = getCodeFromUrl();
    changeEditorVisibility(true, false, false);
    document.getElementById("codeEditorInput").value = code;
}


function showUiEditor(templateUrl, targetId) {
    const code = getCodeFromUrl();
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
        return codeGenUiUtil.render(targetId, serialization["result"]);
    } else {
        isUsingCodeEditor = true;
        changeEditorVisibility(false, false, true);
        return new Promise((resolve) => {
            resolve();
        });
    }
}


function removeWhitespace(target) {
    return target.replaceAll(/\s/ig, "");
}


function cycleUiState(templateUrl) {
    const serialization = parseSerializationFromUi();
    
    const deserializer = new CodeDeserializer();
    const code = deserializer.serializationToCode(serialization);
    pushCodeToUrl(code);

    return showUiEditor(templateUrl);
}


function addUiState(templateUrl) {
    const serialization = parseSerializationFromUi();
    serialization["states"].push({"current": [
        {
            "proba": 1,
            "isElse": false,
            "isCompany": true,
            "target": {"action": "fail"}
        }
    ]});
    
    const deserializer = new CodeDeserializer();
    const code = deserializer.serializationToCode(serialization);
    pushCodeToUrl(code);

    return showUiEditor(templateUrl);
}


function removeUiState(index, templateUrl) {
    const serialization = parseSerializationFromUi();
    serialization["states"].splice(index, 1);
    
    const deserializer = new CodeDeserializer();
    const code = deserializer.serializationToCode(serialization);
    pushCodeToUrl(code);

    return showUiEditor(templateUrl);
}


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


function pushCurrentCodeToUrl() {
    pushCodeToUrl(getEditorCode());
}


function loadCodeToEditors(templateUrl) {
    if (isUsingCodeEditor) {
        showCodeEditor();
    } else {
        showUiEditor();
    }
}


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
            const result = visitProgram(getCodeFromUrl());
            if (result.errors.length > 0) {
                alert("Whoops! There's a coding error in your program: " + result.errors[0]);
                cleanUpUi();
                return;
            }
            const program = result["program"];
    
            const runProgram = () => {
                const newState = new SimulationState();
                program(newState);
                return newState.getResult();
            };
    
            const outcomes = [];
            for (let i = 0; i < numSimulations; i++) {
                outcomes.push(runProgram());
            }
    
            const vizPresenter = new VisualizationPresenter(
                "outputSummaryContainer",
                "outputDetailsContainer"
            );

            vizPresenter.render(outcomes);
            cleanUpUi();
            resolve();
        }, 100);
    });
}


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
        pushCurrentCodeToUrl();
        showUiEditor();
    });

    const codeEditorLink = document.getElementById("codeEditorLink");
    codeEditorLink.addEventListener("click", () => {
        pushCurrentCodeToUrl();
        showCodeEditor();
    });

    const runSimButton = document.getElementById("runSimButton");
    runSimButton.addEventListener("click", () => {
        document.getElementById("outputs").style.display = "block";
        runSimulations();
    });
}
