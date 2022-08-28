StartupOptionsBot
===============================================================================
Tool to build and run Monte Carlo simulations in browser to get a distribution of outcomes for statup options.

<br>

Purpose
===============================================================================
When joining a start up, often folks will get options: stocks they can purchase but often can't immediately sell. Some start ups will eventually offer employees an opportunity to sell options at profit while others may end up in a loss. This tool builds simulations which may help paint a picture of potential options outcomes and also serves as a demonstration of both data science and MLUX techniques (Monte Carlo, Markov Chain, building domain specific languages, and visualizing probabilites).

<br>

Discalimers
===============================================================================
By using this you agree to our [disclaimers](https://startupoptionsbot.com/disclaimer.html) and [license](https://startupoptionsbot.com/license.txt).

<br>

Structure
===============================================================================
This project uses a small domain specific language to represent simulations built by users. This tool interprets this code using JS in browser. That in mind, the project has the following structure:

 - **demo**: Code for website and primary logic for the simulation.
 - **intermediate**: Staging area for webpack used for ANTLR.
 - **language**: Definition of the domain specific language.
 
<br>

Local environment setup
===============================================================================
This project requires a local server of your choice, webpack, and OpenJDK for compliation of the ANTLR language definition.

 - [Install Java](https://adoptium.net)
 - [Install node and npm](https://nodejs.org/en/download/)
 - Build the environment: `bash make.sh`
 - Start a local server: `cd demo; python -m http.server`

<br>

Testing
===============================================================================
This project offers extensive unit tests via QUnit and optionally Grunt.

 - Run interactively by running a local server (`cd demo; python -m http.server`) and going to `tests/tests.html`.
 - Run from command line by [Grunt](https://gruntjs.com/getting-started).

<br>

Development Standards
===============================================================================
This is a side project / community project so this isn't too strict:

 - [JSDoc](https://jsdoc.app) is encournaged but not currently enforced.
 - VanillaJS encouraged.
 - Please maintain as close to 100% test coverage as possible.
 - Not currently using typescript and it's not a priority.

<br>

Deployment
===============================================================================
CI / CD run through [GitHub Actions](https://github.com/features/actions). Actions used include:

 - [checkout](https://github.com/actions/checkout) by GitHub under the [MIT License](https://github.com/actions/checkout/blob/main/LICENSE).
 - [chromium](https://chromium.googlesource.com/chromium/src/) by The Chromium Authors under the [BSD 3-Clause License](https://github.com/chromium/chromium/blob/main/LICENSE).
 - [setup-java](https://github.com/actions/setup-java) by GitHub under the [MIT License](https://github.com/actions/setup-java/blob/main/LICENSE).
 - [sftp-actions](https://github.com/actions/setup-java) by Niklas / Creep under the [MIT License](https://github.com/Creepios/sftp-action/blob/master/LICENSE).

<br>

Open Source
===============================================================================
This project is available under the [MIT License](https://startupoptionsbot.com/LICENSE.txt). In addition to the technologies listed in the deployment section, this project also uses the following:

 - [ANTLR](https://www.antlr.org) by The ANTLR Project under [BSD 3-Clause License](https://github.com/antlr/antlr4/blob/master/LICENSE.txt).
 - [Bootstrap v5](https://getbootstrap.com) by Twitter and The Bootstrap Authors under the [MIT License](https://github.com/twbs/bootstrap/blob/main/LICENSE).
 - [Bootstrap Icons](https://icons.getbootstrap.com) by The Bootstrap Authors under the [MIT License](https://github.com/twbs/icons/blob/main/LICENSE.md).
 - [Chart.js](https://www.chartjs.org) by Chart.js Contributors under the [MIT License](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md).
 - [d3](https://d3js.org) by Mike Bostock under the [3-Clause BSD License](https://opensource.org/licenses/BSD-3-Clause).
 - [Grunt](https://gruntjs.com) by jQuery Foundation and other contributors under the [MIT License](https://github.com/gruntjs/grunt/blob/main/LICENSE).
 - [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) by under "Cowboy" Ben Alman and other contributors the [MIT License](https://github.com/gruntjs/grunt-contrib-connect/blob/main/LICENSE-MIT).
 - [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit) by under "Cowboy" Ben Alman and other contributors the [MIT License](https://github.com/gruntjs/grunt-contrib-qunit/blob/main/LICENSE-MIT).
 - [Handlebars](https://handlebarsjs.com) by Yehuda Katz under the [MIT License](https://github.com/handlebars-lang/handlebars.js/blob/master/LICENSE).
 - [QUnit](https://qunitjs.com) by OpenJS Foundation and other contributors under the [MIT License](https://github.com/qunitjs/qunit/blob/main/LICENSE.txt).
 - [Vex](https://github.hubspot.com/vex/docs/welcome/) by HubSpot under the [MIT License](https://github.com/HubSpot/vex/blob/master/LICENSE).
 - [Webpack](https://webpack.js.org) by JS Foundation and other contributors under the [MIT License](https://github.com/webpack/webpack/blob/main/LICENSE).

Other technologies may be used as transitive dependencies.
