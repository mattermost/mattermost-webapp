// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

const timestamp = Date.now();

function verifyChannel(res, verifyExistence = true) {
    const channel = res.body;

    // # Wait for Channel to be c
    cy.wait(TIMEOUTS.TINY);

    // # Hover on the channel name
    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').trigger('mouseover');

    // * Verify that the tooltip is displayed
    if (verifyExistence) {
        cy.get('div.tooltip-inner').
            should('be.visible').
            and('contain', channel.display_name);
    } else {
        cy.get('div.tooltip-inner').should('not.exist');
    }

    // # Move cursor away from channel
    cy.get(`#sidebarItem_${channel.name}`).should('be.visible').trigger('mouseout');
}

describe('channel name tooltips', () => {
    let loggedUser;
    let team;

    before(() => {
        // # Login and go to /
        cy.apiLogin('sysadmin');

        // # Create new test team
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            team = response.body;
            cy.loginAsNewUser({}, [team.id]).then((user) => {
                loggedUser = user;

                // # Go to "/"
                cy.visit(`/${response.body.name}/town-square`);
            });
        });
    });

    it('Should show tooltip on hover - open/public channel with long name', () => {
        // # Create new test channel
        cy.apiCreateChannel(
            team.id,
            'channel-test',
            `Public channel with a long name-${timestamp}`
        ).then((res) => {
            verifyChannel(res);
        });
    });

    it('Should show tooltip on hover - private channel with long name', () => {
        // # Create new test channel
        cy.apiCreateChannel(
            team.id,
            'channel-test',
            `Private channel with a long name-${timestamp}`,
            'P'
        ).then((res) => {
            verifyChannel(res);
        });
    });

    it('Should not show tooltip on hover - open/public channel with short name', () => {
        // # Create new test channel
        cy.apiCreateChannel(
            team.id,
            'channel-test',
            'Public channel',
        ).then((res) => {
            verifyChannel(res, false);
        });
    });

    it('Should not show tooltip on hover - private channel with short name', () => {
        // # Create new test channel
        cy.apiCreateChannel(
            team.id,
            'channel-test',
            'Private channel',
            'P'
        ).then((res) => {
            verifyChannel(res, false);
        });
    });

    it('Should show tooltip on hover - user with a long username', () => {
        // # Create new user
        cy.createNewUser({
            email: `longUser${timestamp}@sample.mattermost.com`,
            username: `thisIsALongUsername${timestamp}`,
            firstName: `thisIsALongFirst${timestamp}`,
            lastName: `thisIsALongLast${timestamp}`,
            nickname: `thisIsALongNickname${timestamp}`,
            password: 'password123',
        }, [team.id]).then((user) => {
            // # Open a DM with the user
            cy.get('#addDirectChannel').should('be.visible').click();
            cy.focused().as('searchBox').type(user.username, {force: true});

            // * Verify that the user is selected in the results list before typing enter
            cy.get('div.more-modal__row').
                should('have.length', 1).
                and('have.class', 'clickable').
                and('have.class', 'more-modal__row--selected').
                and('contain.text', user.username.toLowerCase());

            cy.get('@searchBox').type('{enter}', {force: true});
            cy.get('#saveItems').should('be.visible').click();

            // # Hover on the channel name
            cy.get(`#sidebarItem_${Cypress._.sortBy([loggedUser.id, user.id]).join('__')}`).scrollIntoView().should('be.visible').trigger('mouseover');

            // * Verify that the tooltip is displayed
            cy.get('div.tooltip-inner').should('be.visible');

            // # Move cursor away from channel
            cy.get(`#sidebarItem_${Cypress._.sortBy([loggedUser.id, user.id]).join('__')}`).scrollIntoView().should('be.visible').trigger('mouseout');
        });
    });
});
