// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';
import {getRandomId} from '../../../utils';

describe('Integrations', () => {
    let testUser;
    let testChannel;
    let otherChannel;

    before(() => {
        cy.apiInitSetup({userPrefix: 'testUser'}).then(({team, user, channel}) => {
            testUser = user;
            testChannel = channel;

            cy.apiCreateChannel(team.id, 'other-channel', 'Other Channel').then((out) => {
                otherChannel = out.channel;
            });

            cy.apiLogin(testUser);
            cy.visit('/');
        });
    });

    beforeEach(() => {
        cy.get('#sidebarItem_off-topic').click();
        cy.uiGetPostTextBox();
    });

    it('MM-T686 /logout', () => {
        // # Type "/logout"
        cy.uiGetPostTextBox().should('be.visible').clear().type('/logout {enter}').wait(TIMEOUTS.HALF_SEC);

        // * Ensure that the user was redirected to the login page
        cy.url().should('include', '/login');
    });
});
