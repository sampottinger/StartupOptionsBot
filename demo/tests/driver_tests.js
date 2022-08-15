QUnit.module("Driver", function() {

    QUnit.test("change editor visibility", function(assert) {
        document.getElementById("codeEditor").style.display = "block";
        document.getElementById("uiEditor").style.display = "none";
        document.getElementById("uiNotSupported").style.display = "block";
        
        changeEditorVisibility(false, true, false);
        
        assert.deepEqual(document.getElementById("codeEditor").style.display, "none");
        assert.deepEqual(document.getElementById("uiEditor").style.display, "block");
        assert.deepEqual(document.getElementById("uiNotSupported").style.display, "none");
    });

    QUnit.test("code to and from url", function(assert) {
        pushCodeToUrl("test");
        assert.deepEqual(getCodeFromUrl(), "test");
    });

    QUnit.test("show code editor", function(assert) {
        document.getElementById("codeEditorInput").value = "";
        pushCodeToUrl("test");
        showCodeEditor();
        assert.deepEqual(document.getElementById("codeEditorInput").value, "test");
    });

    QUnit.test("default supported", function(assert) {
        const defaultSerailization = getSerialization(DEFAULT_CODE);
        assert.equal(defaultSerailization["errors"].length, 0);
        assert.ok(codeSupportedByUiEditor(defaultSerailization["result"]));
    });

    QUnit.test("show UI editor supported", function(assert) {
        assert.deepEqual(document.getElementById("uiEditor").style.display, "none");
        assert.deepEqual(document.getElementById("uiNotSupported").style.display, "none");
        pushCodeToUrl(DEFAULT_CODE);
        showUiEditor("../templates/code_gen_ui.html");
        assert.deepEqual(document.getElementById("uiEditor").style.display, "block");
        assert.deepEqual(document.getElementById("uiNotSupported").style.display, "none");
    });

});
