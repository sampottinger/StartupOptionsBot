/**
 * High level functions to convert programs between different representations.
 *
 * @license MIT
 */


/**
 * Compile a program to a JS function.
 *
 * @param input - String code to compile.
 * @returns Result object whose result is a function which will run a simulation on a state
 *      provided as its only argument.
 */
function getCompiled(input) {
    return applyVisitor(removeCommas(input), new CompileVisitor());
}


/**
 * Compile a program to a plain old object serialization.
 *
 * @param input - String code to interpret into a structured serialization.
 * @returns Result object whose result is a structured serialization.
 */
function getSerialization(input) {
    return applyVisitor(removeCommas(input), new SerializationVisitor());
}


/**
 * Compile a program to formatted (beauitifed) string code.
 *
 * @param input - String code to format.
 * @returns Result object whose result is a formatted code string.
 */
function getBeautified(input) {
    return applyVisitor(removeCommas(input), new BeautifyVisitor());
}


/**
 * Apply a visitor to parsed string code in order to execute an operation.
 *
 * @param input - String to operate on.
 * @param visitor - The ANTLR visitor with which to perform an operatino.
 * @returns Result object with an errors property whose array contains zero or more errors and a
 *      result property which is visitor specific. Note that result property will be null if one or
 *      more errors encountered in parsing.
 */
function applyVisitor(input, visitor) {
    const preVisitor = getProgram(input);
    if (preVisitor["errors"].length > 0) {
        return {"errors": preVisitor["errors"], "result": null};
    }

    const program = preVisitor["program"];
    return {"errors": [], "result": program.accept(visitor)};
}


/**
 * Parse a program for later use in a visitor.
 *
 * @param input - The string code to parse.
 * @returns Object whose program property is the parsed program and whose error property is a
 *      string array of zero or more errors encountered. If there was one or more errors, the
 *      program proprety is null.
 */
function getProgram(input) {
    const errors = [];

    const chars = new toolkit.antlr4.InputStream(input.replaceAll(",", ""));
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


/**
 * Preproc which removes commas from code as to not confuse the tokenizer.
 *
 * @param input - The string code to preprocess.
 * @returns The same code without commas which are to be ignored in the DSL.
 */
function removeCommas(input) {
    return input.replaceAll(",", "");
}
