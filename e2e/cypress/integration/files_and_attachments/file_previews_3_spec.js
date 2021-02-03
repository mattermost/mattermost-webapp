// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @files_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {testVideoFile} from './helpers';

describe('Upload Files - Video', () => {
    let testTeam;

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.get('#post_textbox', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        });
    });

    it('MM-T3826_1 - MP4', () => {
        const properties = {
            route: 'mm_file_testing/Video/MP4.mp4',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_2 - AVI', () => {
        const properties = {
            route: 'mm_file_testing/Video/AVI.avi',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_3 - MKV', () => {
        const properties = {
            route: 'mm_file_testing/Video/MKV.mkv',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_5 - MPG', () => {
        const properties = {
            route: 'mm_file_testing/Video/MPG.mpg',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_6 - WEBM', () => {
        const properties = {
            route: 'mm_file_testing/Video/WEBM.webm',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T3826_7 - WMV', () => {
        const properties = {
            route: 'mm_file_testing/Video/WMV.wmv',
            shouldPreview: false,
        };
        testVideoFile(properties);
    });
});
