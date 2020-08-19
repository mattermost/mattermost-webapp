// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***********************************************************  ****

// Group: @notifications

import {getRandomId} from '../../utils';

describe('Notifications', () => {
    let testTeam;
    let firstUser;
    let secondUser;


    before(() => {
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;

            // # Create a second user that will be searched
            cy.apiCreateUser({user: generateTestUser()}).then(({user: user1}) => {
                firstUser = user1;
                cy.apiAddUserToTeam(testTeam.id, firstUser.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, firstUser.id);
                }));
            });

            cy.apiCreateUser({user: generateTestUser()}).then(({user: user2}) => {
                secondUser = user2;
                cy.apiAddUserToTeam(testTeam.id, secondUser.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, secondUser.id);
                }));
            });

            cy.apiLogin(firstUser);

            // # Visit created test team
            cy.visit(`/${team.name}/${channel.name}`);
    });

    it('MM-T486 Users with the same firstname in their username should not get a mention when one of them leaves a channel', () => {
        // // # Type either cmd+K / ctrl+K depending on OS and type in the first character of the second user's name
        // cy.get('#post_textbox').cmdOrCtrlShortcut('K');
        // cy.get('#quickSwitchInput').should('be.visible').type(secondUser.username.charAt(0));

        // // # Scroll to the second user and click to start a DM
        // cy.get(`#switchChannel_${secondUser.username}`).scrollIntoView().click();

        // // # Type in a message in the automatically focused message box, logout as the first user and login as the second user
        // cy.focused().type(`Hi there, ${secondUser.username}!`).type('{enter}');
        // cy.apiLogout();
        // cy.reload();
        // cy.apiLogin(secondUser);

        // // * Check that the DM exists
        // cy.get('#directChannelList').should('be.visible').within(() => {
        //     cy.findByLabelText(`${firstUser.username} 1 mention`).should('exist');
        // });
    });

    function generateTestUser(prefix = 'user') {
        const randomId = getRandomId();

        return {
            email: `${prefix}${randomId}@sample.mattermost.com`,
            username: `${prefix}${randomId}`,
            password: 'passwd',
            first_name: 'Saturnino',
            last_name: `Last${randomId}`,
            nickname: `Nickname${randomId}`,
        }
    };
