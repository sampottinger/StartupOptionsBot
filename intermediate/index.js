import antlr4 from 'antlr4';
import StartUpOptionsBotLangLexer from './StartUpOptionsBotLangLexer.js';
import StartUpOptionsBotLangParser from './StartUpOptionsBotLangParser.js';
import StartUpOptionsBotLangListener from './StartUpOptionsBotLangListener.js';
import StartUpOptionsBotLangVisitor from './StartUpOptionsBotLangVisitor.js';


function getToolkit() {
  return {
    "antlr4": antlr4,
    "StartUpOptionsBotLangLexer": StartUpOptionsBotLangLexer,
    "StartUpOptionsBotLangParser": StartUpOptionsBotLangParser,
    "StartUpOptionsBotLangListener": StartUpOptionsBotLangListener,
    "StartUpOptionsBotLangVisitor": StartUpOptionsBotLangVisitor
  };
}


export {getToolkit};