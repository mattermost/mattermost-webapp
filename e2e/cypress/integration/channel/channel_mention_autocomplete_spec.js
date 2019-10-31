// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Channel Mention Autocomplete', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Clear channel textbox
        cy.clearPostTextbox('town-square');
    });

    it('Channel mention autocomplete should have both lists populated correctly', () => {
        // # Go to Town Square
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # Start typing "~"
        cy.get('#post_textbox').should('be.visible').type('~');

        // * At mention auto-complete appears
        cy.get('#suggestionList').should('be.visible');

        // * My Channels list should be visible
        cy.get('#suggestionList .suggestion-list__divider').eq(0).should('be.visible', 'contain', 'My Channels');

        // * My Channels list should contain Town Square channel
        cy.get('#suggestionList .suggestion-list__divider').eq(0).nextAll().eq(2).should('contain', 'Town Square');

        // * My Channels list should NOT contain Off Topic channel
        cy.get('#suggestionList .suggestion-list__divider').eq(0).nextAll().should('not.contain', 'Off Topic');

        // # Wait for Other Channels list to get populated
        cy.wait(TIMEOUTS.TINY);

        // * Other Channels list should be visible
        cy.get('#suggestionList .suggestion-list__divider').eq(1).should('be.visible', 'contain', 'Other Channels');

        // * Other Channels list should contain Off Topic channel
        cy.get('#suggestionList .suggestion-list__divider').eq(1).nextAll().eq(2).should('contain', 'Off-Topic');

        // * Other Channels list should not contain Town Square channel
        cy.get('#suggestionList .suggestion-list__divider').eq(1).nextAll().should('not.contain', 'Town Square');

        // # Clear channel textbox
        cy.clearPostTextbox('town-square');
    });

    it('Joining a channel should alter channel mention autocomplete lists accordingly', () => {
        // # Go to Town Square
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # Start typing "~off-topic"
        cy.get('#post_textbox').should('be.visible').type('/join ~off-topic');

        // # Wait for Other Channels list to get populated
        cy.wait(TIMEOUTS.TINY);

        // * Other Channels list should be visible
        cy.get('#suggestionList .suggestion-list__divider').eq(0).should('be.visible', 'contain', 'Other Channels');

        // * Other Channels list should ONLY contain Off Topic channel
        cy.get('#suggestionList .suggestion-list__divider').eq(0).nextAll().eq(0).should('contain', 'Off-Topic');

        // # Join Off Topic
        cy.get('#create_post').submit();

        // # Wait for channel to be joined
        cy.wait(TIMEOUTS.TINY);

        // # Go to Town Square
        cy.get('#sidebarItem_town-square').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # Start typing "~"
        cy.get('#post_textbox').should('be.visible').type('~');

        // * My Channels list should be visible
        cy.get('#suggestionList .suggestion-list__divider').eq(0).should('be.visible', 'contain', 'My Channels');

        // * My Channels list should contain Off Topic channel
        cy.get('#suggestionList .suggestion-list__divider').eq(0).nextAll().eq(1).should('contain', 'Off-Topic');

        // # Wait for Other Channels list to get populated
        cy.wait(TIMEOUTS.TINY);

        // * Other Channels list should be visible
        cy.get('#suggestionList .suggestion-list__divider').eq(1).should('be.visible', 'contain', 'Other Channels');

        // * Other Channels list should NOT contain Off Topic channel
        cy.get('#suggestionList .suggestion-list__divider').eq(1).nextAll().should('not.contain', 'Off-Topic');

        // # Clear channel textbox
        cy.clearPostTextbox('town-square');
    });

    it('Getting removed from a channel should alter channel mention autocomplete lists accordingly', () => {
        let channelId;
        cy.apiGetChannelByName('ad-1', 'Off-Topic').then((res) => {
            channelId = res.body.id;
            return cy.apiGetMe();
        }).then((res) => {
            const userId = res.body.id;
            return cy.removeUserFromChannel(channelId, userId);
        }).then((res) => {
            expect(res).to.equal(200);

            // # Go to Town Square
            cy.get('#sidebarItem_town-square').click({force: true});

            // * Validate if the channel has been opened
            cy.url().should('include', '/channels/town-square');

            // # Start typing "~"
            cy.get('#post_textbox').should('be.visible').type('~');

            // * My Channels list should NOT contain Off Topic channel
            cy.get('#suggestionList .suggestion-list__divider').eq(0).nextAll().should('not.contain', 'Off Topic');

            // # Wait for Other Channels list to get populated
            cy.wait(TIMEOUTS.TINY);

            // * Other Channels list should be visible
            cy.get('#suggestionList .suggestion-list__divider').eq(1).should('be.visible', 'contain', 'Other Channels');

            // * Other Channels list should contain Off Topic channel
            cy.get('#suggestionList .suggestion-list__divider').eq(1).nextAll().should('contain', 'Off-Topic');

            // # Clear channel textbox
            cy.clearPostTextbox('town-square');
        });
    });
});
