// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('delayRequestToRoutes', (routes = [], delay = 0) => {
    cy.on('window:before:load', (win) => addDelay(win, routes, delay));
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const addDelay = (win, routes, delay) => {
    const fetch = win.fetch;
    cy.stub(win, 'fetch').callsFake((...args) => {
        for (let i = 0; i < routes.length; i++) {
            if (args[0].includes(routes[i])) {
                return wait(delay).then(() => fetch(...args));
            }
        }

        return fetch(...args);
    });
};
