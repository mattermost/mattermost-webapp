// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('System Console > Site Statistics', () => {
    it('MM-T903 - Site Statistics > Deactivating a user increments the Daily and Monthly Active Users counts down', () => {
        cy.apiInitSetup().then(({team, user}) => {
            const testUser = user;

            // # Login as test user and visit town-square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);

            // # Go to admin console
            goToAdminConsole();

            // # Go to system analytics
            cy.findByTestId('reporting.system_analytics', {timeout: TIMEOUTS.ONE_MIN}).click();
            cy.wait(TIMEOUTS.ONE_SEC);

            let totalActiveUsersInitial;
            let dailyActiveUsersInitial;
            let monthlyActiveUsersInitial;
            let totalActiveUsersFinal;
            let dailyActiveUsersFinal;
            let monthlyActiveUsersFinal;

            // # Get the number and turn them into numbers
            cy.findByTestId('totalActiveUsers').invoke('text').then((text) => {
                totalActiveUsersInitial = parseInt(text, 10);
                cy.findByTestId('dailyActiveUsers').invoke('text').then((text2) => {
                    dailyActiveUsersInitial = parseInt(text2, 10);
                    cy.findByTestId('monthlyActiveUsers').invoke('text').then((text3) => {
                        monthlyActiveUsersInitial = parseInt(text3, 10);

                        // # Deactivate user and reload page and then wait 2 seconds
                        cy.externalActivateUser(testUser.id, false);
                        cy.reload();
                        cy.wait(TIMEOUTS.TWO_SEC);

                        // # Get the numbers required again
                        cy.findByTestId('totalActiveUsers').invoke('text').then((text4) => {
                            totalActiveUsersFinal = parseInt(text4, 10);

                            cy.findByTestId('dailyActiveUsers').invoke('text').then((text5) => {
                                dailyActiveUsersFinal = parseInt(text5, 10);

                                cy.findByTestId('monthlyActiveUsers').invoke('text').then((text6) => {
                                    monthlyActiveUsersFinal = parseInt(text6, 10);

                                    // * Assert that the final number is the initial number minus one
                                    expect(totalActiveUsersFinal).equal(totalActiveUsersInitial - 1);
                                    expect(dailyActiveUsersFinal).equal(dailyActiveUsersInitial - 1);
                                    expect(monthlyActiveUsersFinal).equal(monthlyActiveUsersInitial - 1);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};
