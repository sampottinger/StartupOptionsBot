let globalCodeEditor = null;


/**
 * Get the global Ace editor.
 * 
 * @returns Flobal Ace editor.
 */
function getGlobalEditor() {
    return globalCodeEditor;
}


/**
 * Enable and disable Ace editor commands.
 *
 * To better support accessibility, turn editor commands on and off like for
 * tab support. Thanks stackoverflow.com/questions/24963246/ace-editor-simply-re-enable-command-after-disabled-it.
 *
 * @param editor The Ace editor to modify.
 * @param name The name of the command to modify.
 * @param enabled Flag indicating if the command should be enabled.
 */
 function setCommandEnabled(editor, name, enabled) {
    let command = editor.commands.byName[name]
    if (!command.bindKeyOriginal) {
        command.bindKeyOriginal = command.bindKey
    }
    command.bindKey = enabled ? command.bindKeyOriginal : null;
    editor.commands.addCommand(command);
    // special case for backspace and delete which will be called from
    // textarea if not handled by main commandb binding
    if (!enabled) {
        let key = command.bindKeyOriginal;
        if (key && typeof key == "object") {
            key = key[editor.commands.platform];
        }
        if (/backspace|delete/i.test(key)) {
            editor.commands.bindKey(key, "null")
        }
    }
}
  
  
/**
 * Initalize the editor.
 */
function initEditor() {
    const editor = ace.edit("codeEditorInput");
    editor.getSession().setUseWorker(false);

    editor.session.setOptions({
        tabSize: 2,
        useSoftTabs: true
    });

    editor.renderer.setOptions({
        maxLines: 45,
        minLines: 35
    })

    // Support keyboard escape for better accessibility
    const setTabsEnabled = (target) => {
        setCommandEnabled(editor, "indent", target);
        setCommandEnabled(editor, "outdent", target);
    };

    editor.on("focus", () => { setTabsEnabled(true); });

    editor.commands.addCommand({
        name: "escape",
        bindKey: {win: "Esc", mac: "Esc"},
        exec: () => { setTabsEnabled(false); }
    });

    globalCodeEditor = editor;
}