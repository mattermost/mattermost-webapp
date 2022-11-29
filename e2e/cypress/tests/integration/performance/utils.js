// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const measurePerformance = (name, upperLimit, callback, reset, runs = 5) => {
    return cy.window().its('performance').then(async (performance) => {
        const durations = [];

        for (let i = 0; i < runs; i++) {
            const markerNameA = `${name}_start_${i}`;
            const markerNameB = `${name}_end_${i}`;

            performance.mark(markerNameA);
            callback();
            performance.mark(markerNameB);

            performance.measure(`${name}_${i}`, markerNameA, markerNameB);
            const measure = performance.getEntriesByName(`${name}_${i}`)[0];
            durations.push(measure.duration);

            reset();
        }

        const avgDuration = Math.round(durations.reduce((a, b) => a + b) / runs);
        cy.log(`[PERFORMANCE] ${name}: ${avgDuration}ms`, avgDuration <= upperLimit ? ' within upper limit' : ' outside upper limit', ` of ${upperLimit}ms`);
        assert.isAtMost(avgDuration, upperLimit);

        // Clean the marks
        performance.clearMarks();
        performance.clearMeasures();
    });
};
