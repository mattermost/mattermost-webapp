// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @files_and_attachments

import * as TIMEOUTS from '../../fixtures/timeouts';

import {testAudioFile, testImage, testVideoFile} from './helpers';

describe('Upload Files - Failing cases', () => {
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

    it('MM-T2264_3 - BMP', () => {
        const properties = {
            route: 'mm_file_testing/Images/BMP.bmp',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_6 - PSD', () => {
        const properties = {
            route: 'mm_file_testing/Images/PSD.psd',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T3826_4 - MOV', () => {
        const properties = {
            route: 'mm_file_testing/Video/MOV.mov',
            shouldPreview: true,
        };
        testVideoFile(properties);
    });

    it('MM-T3825_2 - M4A', () => {
        const properties = {
            route: 'mm_file_testing/Audio/M4A.m4a',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });

    it('MM-T3825_4 - FLAC', () => {
        const properties = {
            route: 'mm_file_testing/Audio/FLAC.flac',
            shouldPreview: true,
        };
        testAudioFile(properties);
    });
});
