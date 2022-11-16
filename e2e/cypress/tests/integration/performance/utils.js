// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const measurePerformance = (startMark, upperLimit, endMark = undefined, runs = 5) => {
    return cy.window().its('performance').then(async (performance) => {
        const durations = [];

        for (let i = 0; i < runs; i++) {
            const startName = `${startMark}_run_${i}`;
            if (endMark) {
                const endName = `${endMark}_run_${i}`;
                performance.mark(endName);
                performance.measure(startName, endName);
            }
            performance.mark(startName);
            performance.measure(startName);

            const measure = performance.getEntriesByName(startName)[0];
            durations.push(measure.duration);
        }

        const avgDuration = Math.round(durations.reduce((a, b) => a + b) / runs);
        cy.log(`[PERFORMANCE] ${startMark}: ${avgDuration}ms`, avgDuration <= upperLimit ? ' within upper limit' : ' outside upper limit', ` of ${upperLimit}ms`);
        assert.isAtMost(avgDuration, upperLimit);
    });
};
