// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const measurePerformance = (name, upperLimit, callback, runs = 5) => {
    return cy.window().its('performance').then(async (performance) => {
        const durations = [];

        Cypress._.times(runs, (i) => {
            const measureName = `${name}_run_${i}`;
            performance.mark(measureName);
            callback();
            performance.measure(measureName);

            const measure = performance.getEntriesByName(measureName)[0];
            durations.push(measure.duration);
        });

        const avgDuration = Math.round(durations.reduce((a, b) => a + b) / runs);
        cy.log(`[PERFORMANCE] ${name}: ${avgDuration}ms`, avgDuration <= upperLimit ? ' within upper limit' : ' outside upper limit', ` of ${upperLimit}ms`);
        assert.isAtMost(avgDuration, upperLimit);

        // Clean the marks
        performance.clearMarks();
        performance.clearMeasures();
    });
};
