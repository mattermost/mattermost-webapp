// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import tablemark from 'tablemark';

export function reportBenchmarkResults(cy, win) {
    const testName = getTestName();
    const selectors = win.getSortedTrackedSelectors();
    const dump = `Selector Measurements for ${testName} \n\n ${tablemark(selectors)}`;
    cy.log(dump);
    cy.writeFile(`cypress/benchmark/__benchmarks__/${testName}.json`, JSON.stringify(selectors));
}

// From https://github.com/cypress-io/cypress/issues/2972#issuecomment-577072392
function getTestName() {
    let cypressContext = Cypress.mocha.getRunner().suite.ctx.test;
    let testTitles = [];

    function extractTitles(obj) {
        if (obj.hasOwnProperty('parent')) {
            testTitles.push(obj.title);
            let nextObj = obj.parent;
            extractTitles(nextObj);
        }
    }

    extractTitles(cypressContext);
    let orderedTitles = testTitles.reverse();
    let fileName = orderedTitles.join(' -- ');
    return fileName;
}
