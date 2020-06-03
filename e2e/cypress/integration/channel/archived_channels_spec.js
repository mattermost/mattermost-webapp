// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {testWithConfig} from '../../support/hooks';

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Leave an archived channel', () => {
    testWithConfig({
        TeamSettings: {
            ExperimentalViewArchivedChannels: true,
        },
    });

    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('should leave recently archived channel', () => {
        const channelName = 'archived-channels-spec-' + Date.now().toString();

        cy.createAndVisitNewChannel(channelName).then((channel) => {
            // # Archive the channel
            cy.get('#channelHeaderDropdownIcon').click();
            cy.get('#channelArchiveChannel').click();
            cy.get('#deleteChannelModalDeleteButton').click();

            // # Switch to another channel
            cy.visit('/ad-1/channels/town-square');

            // # Switch back to the archived channel
            cy.visit(`/ad-1/channels/${channel.name}`);

            // # Leave the channel
            cy.get('#channelHeaderDropdownIcon').click();
            cy.get('#channelLeaveChannel').click();

            // # Wait to make sure that the Loading page does not get back
            cy.wait(TIMEOUTS.SMALL);

            // * Verify sure that we have switched channels
            cy.get('#channelHeaderTitle').should('not.contain', channel.display_name);
        });
    });
});

