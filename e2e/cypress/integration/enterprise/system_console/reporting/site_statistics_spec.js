// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getAdminAccount} from '../../../../support/env';

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('System Console > Site Statistics', () => {
    let testTeam;

    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();
    });

    afterEach(() => {
        // # Reset locale
        cy.apiPatchMe({locale: 'en'});
    });

    it('MM-T904_1 Site Statistics displays expected content categories', () => {
        // # Visit site statistics page.
        cy.visit('/admin_console/reporting/system_analytics');

        // * Check that the header has loaded correctly and contains the expected text.
        cy.get('.admin-console__header span', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').should('contain', 'System Statistics');

        // * Check that the rows for the table were generated.
        cy.get('.admin-console__content .row').should('have.length', 5);

        // * Check that the title content for the stats is as expected.
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(0).should('contain', 'Total Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(1).should('contain', 'Total Teams');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(2).should('contain', 'Total Channels');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(3).should('contain', 'Total Posts');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(4).should('contain', 'Total Sessions');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(5).should('contain', 'Total Commands');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(6).should('contain', 'Incoming Webhooks');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(7).should('contain', 'Outgoing Webhooks');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(8).should('contain', 'Daily Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(9).should('contain', 'Monthly Active Users');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(10).should('contain', 'WebSocket Conns');
        cy.get('.admin-console__content .row').eq(0).find('.title').eq(11).should('contain', 'Master DB Conns');

        // * Check that some of the values for the stats are valid.
        cy.get('.admin-console__content .row').eq(0).find('.content').each((el) => {
            cy.waitUntil(() => cy.wrap(el).then((content) => {
                return content[0].innerText !== 'Loading...';
            }));
            cy.wrap(el).eq(0).invoke('text').then(parseFloat).should('be.gte', 0);
        });
    });

    it('MM-T902 - Reporting ➜ Site statistics line graphs show same date', () => {
        const sysadmin = getAdminAccount();

        let newChannel;

        // # Create and visit new channel
        cy.apiInitSetup().then(({channel}) => {
            newChannel = channel;
        });

        // # Create a bot and get userID
        cy.apiCreateBot('bot-' + Date.now(), 'Test Bot', 'test bot for E2E test replying to older bot post').then(({bot}) => {
            const botUserId = bot.user_id;
            cy.externalRequest({user: sysadmin, method: 'put', path: `users/${botUserId}/roles`, data: {roles: 'system_user system_post_all system_admin'}});

            // # Get token from bots id
            cy.apiAccessToken(botUserId, 'Create token').then(({token}) => {
                //# Add bot to team
                cy.apiAddUserToTeam(newChannel.team_id, botUserId);

                const today = new Date();
                const yesterday = new Date(today);

                yesterday.setDate(yesterday.getDate() - 1);

                // # Post message as bot to the new channel
                cy.postBotMessage({token, channelId: newChannel.id, message: 'this is bot message', createAt: yesterday.getTime()}).then(() => {
                    goToAdminConsole();

                    // * Find site statistics and click it
                    cy.findByTestId('reporting.system_analytics', {timeout: TIMEOUTS.ONE_MIN}).click();

                    let totalPostsDataSet;
                    let totalPostsFromBots;
                    let activeUsersWithPosts;

                    // # Grab all data from the 3 charts from there data labels
                    cy.findByTestId('totalPostsLineChart').then((el) => {
                        totalPostsDataSet = el[0].dataset.labels;
                        cy.findByTestId('totalPostsFromBotsLineChart').then((el2) => {
                            totalPostsFromBots = el2[0].dataset.labels;
                            cy.findByTestId('activeUsersWithPostsLineChart').then((el3) => {
                                activeUsersWithPosts = el3[0].dataset.labels;

                                // * Assert that all the dates are the same
                                expect(totalPostsDataSet).equal(totalPostsFromBots);
                                expect(totalPostsDataSet).equal(activeUsersWithPosts);
                                expect(totalPostsFromBots).equal(activeUsersWithPosts);
                            });
                        });
                    });
                });
            });
        });
    });

    it('MM-T905 - Site Statistics card labels in different languages', () => {
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // # Login as admin and set the langauge to french
            cy.apiAdminLogin();
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.get('#headerUsername', {timeout: TIMEOUTS.ONE_MIN}).click();
            cy.get('#accountSettings').should('be.visible').click();
            cy.get('#displayButton').click();
            cy.get('#languagesEdit').click();
            cy.get('#displayLanguage').type('Français{enter}');
            cy.get('#saveSetting').click();

            // * Once in site statistics, check and make sure the boxes are truncated or not according to image on test
            cy.visit('/admin_console/reporting/system_analytics');

            const testIds = ['totalActiveUsersTitle', 'totalTeamsTitle', 'totalChannelsTitle', 'totalPostsTitle', 'totalSessionsTitle', 'totalCommandsTitle', 'incomingWebhooksTitle',
                'outgoingWebhooksTitle', 'dailyActiveUsersTitle', 'monthlyActiveUsersTitle', 'websocketConnsTitle', 'masterDbConnsTitle', 'replicaDbConnsTitle'];

            testIds.forEach((id) => {
                let expectedResult = false;
                if (id === 'totalCommandsTitle' || id === 'masterDbConnsTitle' || id === 'replicaDbConnsTitle') {
                    expectedResult = true;
                }

                cy.findByTestId(id, {timeout: TIMEOUTS.ONE_MIN}).then((el) => {
                    const titleSpan = el[0].childNodes[0];

                    // * All the boxes on System Statistics page should have UNTRUNCATED titles when in french except Total Commands, Master DB Conns, and Replica DB Conns.
                    // * The following asserts if the they are truncated or not. If false, it means they are not truncated. If true, they are truncated.
                    expect(titleSpan.scrollWidth > titleSpan.clientWidth).equal(expectedResult);
                });
            });
        });
    });
});
