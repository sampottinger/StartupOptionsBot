cd language
java -jar antlr-4.9.3-complete.jar -Dlanguage=JavaScript StartUpOptionsBotLang.g4 -visitor -o ../intermediate
cd ..
cd intermediate
npm run build
cd ..
cd demo
cd js
rm startupoptionsbotlang.js
cp ../../intermediate/static/startupoptionsbotlang.js startupoptionsbotlang.js