// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

import {testWithConfig} from '../../support/hooks';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Leave an archived channel', () => {
    testWithConfig({
        TeamSettings: {
            ExperimentalViewArchivedChannels: true,
        },
    });

    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.visit(`/${team.name}/channels/${testChannel.name}`);
        });
    });

    it('should leave recently archived channel', () => {
        // # Archive the channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelArchiveChannel').click();
        cy.get('#deleteChannelModalDeleteButton').click();

        // # Switch to another channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Switch back to the archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Leave the channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelLeaveChannel').click();

        // # Wait to make sure that the Loading page does not get back
        cy.wait(TIMEOUTS.FIVE_SEC);

        // * Verify sure that we have switched channels
        cy.get('#channelHeaderTitle').should('not.contain', testChannel.display_name);
    });

    it('MM-T1670 Can view channel info for an archived channel', () => {
        // # Visit archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select View Info
        cy.get('#channelViewInfo button').click();

        // * Channel title is shown with archived icon
        cy.get('#channelInfoModalLabel span.icon__archive').should('be.visible');
        cy.contains('#channelInfoModalLabel strong', `${testChannel.display_name}`).should('be.visible');

        // * Channel URL is listed (non-linked text)
        cy.url().then((loc) => {
            cy.contains('div.info__value', loc).should('be.visible');
        });
    });

    it('MM-T1671 Can view members', () => {
        // # Open an archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select "View Members"
        cy.get('#channelViewMembers button').click();

        // * Channel Members modal opens
        cy.get('div#channelMembersModal').should('be.visible');

        // # Ensure there are no options to change channel roles or membership
        // * Membership or role cannot be changed
        cy.get('div[data-testid=userListItemActions]').should('not.be.visible');

        // # Use search box to refine list of members
        // * Search box works as before to refine member list
        cy.get('[data-testid=userListItemDetails]').its('length').then((fullListLength) => {
            cy.get('#searchUsersInput').type(`${testUser.first_name}{enter}`);
            cy.get('[data-testid=userListItemDetails]').its('length').then((filteredLength) => {
                expect(fullListLength).to.be.greaterThan(filteredLength);
            });
        });
    });
});

