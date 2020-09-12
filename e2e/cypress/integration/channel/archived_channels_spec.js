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

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.visit(`/${team.name}/channels/${testChannel.name}`);
        });
    });

    it('should leave recently archived channel', () => {
        // # Archive the channel
        cy.uiArchiveChannel();

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
});

