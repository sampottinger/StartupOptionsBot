function getCompiled(input) {
    return applyVisitor(input, new CompileVisitor());
}


function getSerialization(input) {
    return applyVisitor(input, new SerializationVisitor());
}


function applyVisitor(input, visitor) {
    const preVisitor = getProgram(input);
    if (preVisitor["errors"].length > 0) {
        return {"errors": preVisitor["errors"], "result": null};
    }

    const program = preVisitor["program"];
    return {"errors": [], "result": program.accept(visitor)};
}


function visitProgram(input) {
    const programSource = getProgram(input);
    if (programSource["errors"].length > 0) {
        return programSource;
    }

    const visitor = new CompileVisitor();
    const program = programSource["program"].accept(visitor);
    return {
        "program": program,
        "errors": []
    };
}


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

    parser.buildParseTrees = true;
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
