// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('System Console > Site Statistics', () => {
    let testTeam;

    it('MM-T904_2 Site Statistics displays expected content categories', () => {
        // # Remove license.
        cy.apiDeleteLicense();

        // # Visit site statistics page.
        cy.visit('/admin_console/reporting/system_analytics');

        // * Check that the header has loaded correctly and contains the expected text.
        cy.get('.admin-console__header span', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').should('contain', 'System Statistics');

        // * Check that the rows for the table were generated.
        cy.get('.admin-console__content .row').should('have.length', 4);

        // * Check that the title content for the stats is as expected.
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(0).should('contain', 'Total Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(1).should('contain', 'Total Teams');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(2).should('contain', 'Total Channels');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(3).should('contain', 'Total Posts');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(4).should('contain', 'Daily Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(5).should('contain', 'Monthly Active Users');

        // * Check that the values for the stats are valid.
        cy.get('.admin-console__content .row').eq(0).find('.content').each((el) => {
            cy.waitUntil(() => cy.wrap(el).then((content) => {
                return content[0].innerText !== 'Loading...';
            }));
            cy.wrap(el).eq(0).invoke('text').then(parseFloat).should('be.gt', 0);
        });
    });

    it('MM-T903 - Site Statistics > Deactivating a user increments the Daily and Monthly Active Users counts down', () => {
        cy.apiInitSetup().then(({team, user}) => {
            const testUser = user;
            testTeam = team;

            // # Login as test user and visit town-square
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Wait two seconds then go to admin console
            cy.wait(TIMEOUTS.TWO_SEC);
            goToAdminConsole();

            // # Go to system analytics
            cy.findByTestId('reporting.system_analytics', {timeout: TIMEOUTS.ONE_MIN}).click();
            cy.wait(TIMEOUTS.ONE_SEC);

            let totalActiveUsersInitial;
            let dailyActiveUsersInital;
            let monthlyActiveUsersInital;
            let totalActiveUsersFinal;
            let dailyActiveUsersFinal;
            let monthlyActiveUsersFinal;

            // # Get the number and turn them into numbers
            cy.findByTestId('totalActiveUsers').invoke('text').then((text) => {
                totalActiveUsersInitial = parseInt(text, 10);
                cy.findByTestId('dailyActiveUsers').invoke('text').then((text2) => {
                    dailyActiveUsersInital = parseInt(text2, 10);
                    cy.findByTestId('monthlyActiveUsers').invoke('text').then((text3) => {
                        monthlyActiveUsersInital = parseInt(text3, 10);

                        // # Deactivate user and relaod page and then wait 2 seconds
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
                                    expect(dailyActiveUsersFinal).equal(dailyActiveUsersInital - 1);
                                    expect(monthlyActiveUsersFinal).equal(monthlyActiveUsersInital - 1);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
