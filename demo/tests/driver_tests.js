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
        pushCodeToState("test");
        assert.deepEqual(getCodeFromState(), "test");
    });

    QUnit.test("show code editor", function(assert) {
        document.getElementById("codeEditorInput").value = "";
        pushCodeToState("test");
        showCodeEditor();
        assert.deepEqual(getGlobalEditor().getValue(), "test");
    });

    QUnit.test("default supported", function(assert) {
        const defaultSerailization = getSerialization(DEFAULT_CODE);
        assert.equal(defaultSerailization["errors"].length, 0);
        assert.ok(codeSupportedByUiEditor(defaultSerailization["result"]));
    });

    QUnit.test("show UI editor supported", function(assert) {
        document.getElementById("uiEditor").style.display = "none";
        document.getElementById("uiNotSupported").style.display = "none";
        pushCodeToState(DEFAULT_CODE);
        showUiEditor("../templates/code_gen_ui.html");
        assert.deepEqual(document.getElementById("uiNotSupported").style.display, "none");
        assert.deepEqual(document.getElementById("uiEditor").style.display, "block");
    });

    QUnit.test("generate UI from show UI editor", function(assert) {
        pushCodeToState(DEFAULT_CODE);
        const done = assert.async();
        showUiEditor("../templates/code_gen_ui.html").then(() => {
            const outsideDiv = document.getElementById("codeUiBody");
            assert.equal(outsideDiv.getElementsByClassName("inner-event").length, 2);
            done();
        });
    });

    QUnit.test("show UI editor not supported", function(assert) {
        document.getElementById("uiEditor").style.display = "none";
        document.getElementById("uiNotSupported").style.display = "none";
        pushCodeToState("test");
        showUiEditor("../templates/code_gen_ui.html");
        assert.deepEqual(document.getElementById("uiEditor").style.display, "none");
        assert.deepEqual(document.getElementById("uiNotSupported").style.display, "block");
    });

    QUnit.test("remove whitespace", function(assert) {
        const result = removeWhitespace("test\n1\t2 3");
        assert.deepEqual(result, "test123");
    });

    QUnit.test("cycleState", function(assert) {
        pushCodeToState(DEFAULT_CODE);
        const done = assert.async();
        showUiEditor("../templates/code_gen_ui.html").then(() => {

            cycleUiState("../templates/code_gen_ui.html").then(() => {
                const outsideDiv = document.getElementById("codeUiBody");
                assert.equal(outsideDiv.getElementsByClassName("inner-event").length, 2);

                const outputCode = removeWhitespace(getEditorCode());
                assert.ok(outputCode.includes("totalGrant=200"));
                assert.ok(outputCode.includes("c_0.5:ipo(500,000,000"));

                done();
            });
        });
    });

    QUnit.test("add UI state", function(assert) {
        pushCodeToState(DEFAULT_CODE);
        const done = assert.async();
        showUiEditor("../templates/code_gen_ui.html").then(() => {
            addUiState("../templates/code_gen_ui.html").then(() => {
                const outsideDiv = document.getElementById("codeUiBody");
                assert.equal(outsideDiv.getElementsByClassName("inner-event").length, 3);
                done();
            });
        });
    });

    QUnit.test("remove UI state", function(assert) {
        pushCodeToState(DEFAULT_CODE);
        const done = assert.async();
        showUiEditor("../templates/code_gen_ui.html").then(() => {
            removeUiState(1, "../templates/code_gen_ui.html").then(() => {
                const outsideDiv = document.getElementById("codeUiBody");
                assert.equal(outsideDiv.getElementsByClassName("inner-event").length, 1);
                done();
            });
        });
    });

    QUnit.test("run simulations", function(assert) {
        pushCodeToState(DEFAULT_CODE);
        const done = assert.async();
        
        document.getElementById("outputSummaryContainer").innerHTML = "";
        document.getElementById("outputDetailsContainer").innerHTML = "";

        assert.deepEqual(document.getElementById("outputSummaryContainer").innerHTML, "");
        assert.deepEqual(document.getElementById("outputDetailsContainer").innerHTML, "");
        
        runSimulations(100).then(() => {
            assert.ok(document.getElementById("outputSummaryContainer").innerHTML !== "");
            assert.ok(document.getElementById("outputDetailsContainer").innerHTML !== "");
            done();
        });
    });

});
