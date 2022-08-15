const DEFAULT_CODE = "";
const NUM_SIMULATIONS = 20000;

let isUsingCodeEditor = false;


function changeEditorVisibility(showCodeEditor, showUiEditor, showNotSupported) {
    document.getElementById("codeEditor").style.display = showCodeEditor ? "block" : "none";
    document.getElementById("uiEditor").style.display = showUiEditor ? "block" : "none";
    document.getElementById("uiNotSupported").style.display = showNotSupported ? "block" : "none";
}


function showCodeEditor() {
    const code = getCodeFromUrl();
    changeEditorVisibility(true, false, false);
    document.getElementById("codeEditorInput").value = code;
}


function showUiEditor(templateUrl) {
    const code = getCodeFromUrl();
    const serialization = getSerialization(code);
    const hasErrors = serialization.errors.length > 0;
    const isCodeUiSupported = !hasErrors && codeSupportedByUiEditor(serialization["result"]);

    if (templateUrl === undefined) {
        templateUrl = "/templates/code_gen_ui.html";
    }

    if (isCodeUiSupported) {
        isUsingCodeEditor = false;
        changeEditorVisibility(false, true, false);
        const codeGenUiUtil = new CodeGenUiUtil(templateUrl);
        codeGenUiUtil.render("codeUiBody", serialization);
    } else {
        isUsingCodeEditor = true;
        changeEditorVisibility(false, false, true);
    }
}


function getCodeFromUrl() {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const fromUrl = queryParams.get("code");
    return fromUrl === null ? DEFAULT_CODE : fromUrl;
}


function removeWhitespace(target) {
    return target.replaceAll(/\s/ig, "");
}


function addUiState(templateUrl) {
    const serialization = parseSerializationFromUi();
    serialization["states"].push({"current": []});
    
    const deserializer = new CodeDeserializer();
    const code = deserializer.serializationToCode(deserializer);
    pushCodeToUrl(code);

    showUiEditor(templateUrl);
}


function removeUiState(index) {
    const serialization = parseSerializationFromUi();
    serialization["states"].splice(index, 1);
    
    const deserializer = new CodeDeserializer();
    const code = deserializer.serializationToCode(deserializer);
    pushCodeToUrl(code);

    showUiEditor(templateUrl);
}


function getEditorCode() {
    const getFromUiEditor = () => {
        const serialization = parseSerializationFromUi();
        const deserializer = new CodeDeserializer();
        const code = deserializer.serializationToCode(deserializer);
        return code;
    };

    const getFromCodeEditor = () => {
        const code = document.getElementById("codeEditorInput").value;
        return code;
    };

    return isUsingCodeEditor ? getFromCodeEditor() : getFromUiEditor();
}


function pushCodeToUrl(code) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("code", removeWhitespace(code));
    window.location.search = searchParams.toString();
}


function loadCodeToEditors(templateUrl) {
    if (isUsingCodeEditor) {
        showCodeEditor();
    } else {
        showUiEditor();
    }
}


function runSimulations(numSimulations) {
    document.getElementById("runningSimDisplay").style.display = "block";
    document.getElementById("simOutputDisplay").style.display = "none";

    if (numSimulations === undefined) {
        numSimulations = NUM_SIMULATIONS;
    }

    setTimeout(() => {
        const result = visitProgram(getCodeFromUrl());
        if (result.errors.length > 0) {
            alert("Whoops! There's a coding error in your program: " + result.errors[0]);
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
    }, 500);
}
