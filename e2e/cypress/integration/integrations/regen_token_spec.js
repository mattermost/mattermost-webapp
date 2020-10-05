// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

let token1;
let token2;
let testTeam;

describe('Integrations', () => {
    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
            cy.visit(`/${team.name}/integrations/commands/add`);
        });
    });
    after(() => {
        // # clean up - remove slash command
        cy.visit(`/${testTeam.name}/integrations/commands/installed`);
        cy.get(':nth-child(3) > .color--link > span').click();
        cy.get('#confirmModalButton').click();
    });
    it('MM-T581 Regen token', () => {
        // # setup slash command
        cy.get('#displayName').type('Token Regen Test');
        cy.get('#description').type('test of token regeneration');
        cy.get('#trigger').type('regen');
        cy.get('#url').type('http://hidden-peak-21733.herokuapp.com/test_inchannel');
        cy.get('#autocomplete').check();
        cy.get('#saveCommand').click();

        // # grab token 1
        cy.get('p.word-break--all').then(number1 => {
            token1 = number1.text().split(' ').pop();
        });

        // # return to channel
        cy.visit('/', testTeam);

        // * post first message and assert token1 is present in the message
        cy.postMessage('/regen testing');
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).contains(token1);
        });

        // # return to slash command setup and regenerate the token
        cy.visit(`/${testTeam.name}/integrations/commands/installed`);
        cy.get('.item-actions > :nth-child(1) > span').click();
        cy.wait(TIMEOUTS.HALF_SEC);

        // # grab token 2
        cy.get('.item-details__token > span').then(number2 => {
            token2 = number2.text().split(' ').pop();
        });

        // return to channel
        cy.visit('/', testTeam);

        // * post second message and assert token2 is present in the message
        cy.postMessage('/regen testing 2nd message');
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.getLastPostId().then((lastPostId) => {
            cy.get(`#${lastPostId}_message`).contains(token2).should('not.contain', token1);
        });
    });
});
