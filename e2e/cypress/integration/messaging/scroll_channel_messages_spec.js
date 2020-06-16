// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import {getAdminAccount} from '../../support/env';

describe('Scroll channel`s messages in mobile view', () => {
    const sysadmin = getAdminAccount();
    let newChannel;

    before(() => {
        // # resize browser to phone view
        cy.viewport('iphone-6');

        // # Create and visit new channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            newChannel = channel;
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('M18759 - detect change in floating timestamp', () => {
        let date;

        // # Post a day old message
        for (let j = 2; j >= 0; j--) {
            date = Cypress.moment().subtract(j, 'days').valueOf();
            for (let i = 0; i < 5; i++) {
                cy.postMessageAs({sender: sysadmin, message: `Hello \n from \n other \n day \n - ${j}`, channelId: newChannel.id, createAt: date});
            }
        }

        // # reload to see correct changes
        cy.reload();

        // * check date on scroll and save it
        cy.findAllByTestId('postView').eq(15).scrollIntoView();

        // * check date on scroll is today
        cy.findByTestId('floatingTimestamp').should('be.visible').and('have.text', 'Today');

        // * check date on scroll and save it
        cy.findAllByTestId('postView').eq(9).scrollIntoView();

        // * check date on scroll is yesterday
        cy.findByTestId('floatingTimestamp').should('be.visible').and('have.text', 'Yesterday');

        // * check date on scroll and save it
        cy.findAllByTestId('postView').eq(4).scrollIntoView();

        // * check date on scroll is two days ago
        cy.findByTestId('floatingTimestamp').should('be.visible').and('have.text', Cypress.moment().subtract(2, 'days').format('ddd, MMM DD, YYYY'));
    });
});
