export const measure = async (name, upperLimit, cb, runs=10) => {
    return cy.window().its('performance').then(async (performance) => {
        performance.mark(name);

        for(let i = 0; i < runs; i++) {
            await cb();
        }
    
        performance.measure(name);
        const measure = performance.getEntriesByName(name)[0];
        const durationMs = Math.round(measure.duration/runs);

        cy.log(`[PERFORMANCE] ${name}: ${durationMs}ms`, durationMs <= upperLimit ? ' within upper limit' : ' outside upper limit', ` of ${upperLimit}ms`);
    
        assert.isAtMost(durationMs, upperLimit);    
    });
};
