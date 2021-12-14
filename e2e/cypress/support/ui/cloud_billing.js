// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetPaymentCardInput', () => {
    return cy.
        get('.__PrivateStripeElement > iframe').
        its('0.contentDocument.body').should('not.be.empty').
        then(cy.wrap);
});

Cypress.Commands.add('waitForResources', (resources = []) => {
    const globalTimeout = 20000;
    const resourceCheckInterval = 2000;
    const idleTimesInit = 3;
    let idleTimes = idleTimesInit;
    let resourcesLengthPrevious;
    let timeout;

    return new Cypress.Promise((resolve, reject) => {
        const checkIfResourcesLoaded = () => {
            const resourcesLoaded = cy.state('window').
                performance.getEntriesByType('resource').
                filter((r) => !['script', 'xmlhttprequest', 'fetch'].includes(r.initiatorType));

            const allFilesFound = resources.every(
                (resource) => {
                    const found = resourcesLoaded.filter(
                        (resourceLoaded) => {
                            return resourceLoaded.name.includes(resource.name);
                        },
                    );
                    if (found.length === 0) {
                        return false;
                    }
                    return !resource.number || found.length >= resource.number;
                },
            );

            if (allFilesFound) {
                if (resourcesLoaded.length === resourcesLengthPrevious) {
                    idleTimes--;
                } else {
                    idleTimes = idleTimesInit;
                    resourcesLengthPrevious = resourcesLoaded.length;
                }
            }
            if (!idleTimes) {
                resolve();
                return;
            }

            timeout = setTimeout(checkIfResourcesLoaded, resourceCheckInterval);
        };

        checkIfResourcesLoaded();
        setTimeout(() => {
            reject();
            clearTimeout(timeout);
        }, globalTimeout);
    });
});
