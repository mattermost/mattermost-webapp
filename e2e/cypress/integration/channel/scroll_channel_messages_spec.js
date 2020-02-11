// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
import users from '../../fixtures/users';

const sysadmin = users.sysadmin;

describe('Scroll channel`s messages in mobile view', () => {
    let newChannel;

    before(() => {
        cy.apiLogin('user-1');

        // # resize browser to phone view
        cy.viewport('iphone-6');

        // # visit channel
        cy.createAndVisitNewChannel().then((channel) => {
            newChannel = channel;
        });
    });

    it('M18759 - detect change in floating timestamp', () => {
        let date;

        // # Post a day old message
        for (let j = 2; j >= 0; j--) {
            date = Cypress.moment().add(j, 'days').valueOf();
            for (let i = 0; i < 5; i++) {
                cy.postMessageAs({sender: sysadmin, message: `Hello \n from \n other \n day \n - ${j}`, channelId: newChannel.id, createAt: date});
            }
        }

        // # reload to see correct changes
        cy.reload();

        const twoDaysAgo = Cypress.moment();

        // # set date 3 days fron now because channel created today and scroll not working because of it
        cy.clock(Cypress.moment().add(2, 'days').valueOf(), ['Date']);

        // * check date on scroll and save it
        cy.findAllByTestId('postView').eq(15).scrollIntoView();

        // * check date on scroll is today
        cy.findByTestId('floatingTimestamp').should('be.visible').and('have.text', 'Today');

        // * check date on scroll and save it
        cy.findAllByTestId('postView').eq(10).scrollIntoView();

        // * check date on scroll is yesterday
        cy.findByTestId('floatingTimestamp').should('be.visible').and('have.text', 'Yesterday');

        // * check date on scroll and save it
        cy.findAllByTestId('postView').eq(4).scrollIntoView();

        // * check date on scroll is two days ago
        cy.findByTestId('floatingTimestamp').should('be.visible').and('have.text', twoDaysAgo.format('ddd, MMM DD, YYYY'));
    });
});
