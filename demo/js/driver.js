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

}


function pushCodeToUrl() {

}


function loadCodeToEditors() {

}


function runSimulations() {

}
