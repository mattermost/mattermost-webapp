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

import {testAudioFile} from './helpers';

describe('Upload Files - Audio', () => {
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

    it('MM-T3825_1 - MP3', () => {
        const properties = {
            route: 'mm_file_testing/Audio/MP3.mp3',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T3825_3 - AAC', () => {
        const properties = {
            route: 'mm_file_testing/Audio/AAC.aac',
            shouldPreview: false,
        };
        testAudioFile(properties);
    });

    it('MM-T3825_5 - OGG', () => {
        const properties = {
            route: 'mm_file_testing/Audio/OGG.ogg',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T3825_6 - WAV', () => {
        const properties = {
            route: 'mm_file_testing/Audio/WAV.wav',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T3825_7 - WMA', () => {
        const properties = {
            route: 'mm_file_testing/Audio/WMA.wma',
            shouldPreview: false,
        };
        testAudioFile(properties);
    });
});
