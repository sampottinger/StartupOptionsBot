function getProgram(input) {
    const errors = [];

    const chars = new toolkit.antlr4.InputStream(input);
    const lexer = new toolkit.StartUpOptionsBotLangLexer(chars);
    lexer.removeErrorListeners();
    lexer.addErrorListener({
        syntaxError: (recognizer, offendingSymbol, line, column, msg, err) => {
            const result = `(line ${line}, col ${column}): ${msg}`;
            errors.push(result);
        }
    });

    const tokens = new toolkit.antlr4.CommonTokenStream(lexer);
    const parser = new toolkit.StartUpOptionsBotLangParser(tokens);

    parser.buildParsePlants = true;
    parser.removeErrorListeners();
    parser.addErrorListener({
        syntaxError: (recognizer, offendingSymbol, line, column, msg, err) => {
            const result = `(line ${line}, col ${column}): ${msg}`;
            errors.push(result);
        }
    });

    const program = parser.program();

    const outputProgram = errors.length == 0 ? program : null;
    return {"program": outputProgram, "errors": errors};
}
