# btc-models
Shared models and validation for the Bicycle Touring Companion

BTC-Models offers a way for other parts of the application (like the server and client applications) to agree on how certain pieces of information (such as passwords, emails, schedules, etc…)  should look. When included into other parts of the application, btc-models handles logic and functions for it’s represented objects effectively separating out the data-logic code from the view code in the btc-app.

[![Build
Status](https://travis-ci.org/bikelomatic-complexity/btc-models.svg?branch=master)](https://travis-ci.org/bikelomatic-complexity/btc-models)
[![Coverage
Status](https://coveralls.io/repos/github/bikelomatic-complexity/btc-models/badge.svg?branch=master)](https://coveralls.io/github/bikelomatic-complexity/btc-models?branch=master)
[![Dependency
Status](http://david-dm.org/bikelomatic-complexity/btc-models.svg)](http://david-dm.org/bikelomatic-complexity/btc-models)
[![License: AGPL
v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

# How to link in developement
1. To test a working version of the `btc-models`, run `npm link` in the root folder of this repo.
2. Build changes in `src` by running `npm run build`
3. Then in any other repo you wish to test `btc-models` (like `btc-app`, `btc-server`, etc...) run `npm link btc-models`.
That's it! To find more info check out the npm-link documents https://docs.npmjs.com/cli/link

# How to test
1. Make sure NODE_ENV is set to `test`
2. run `npm run build`
3. run `npm run test`
4. If you'd like a coverage report, run 'npm run coverage' and check the coverage folder that appears in your project's root directory for lcov-report/index.html. Also, 'npm run test' will also provide a brief coverage report via it's CLI output.
