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

import {testImage} from './helpers';

describe('Upload Files - Image', () => {
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

    it('MM-T2264_1 - JPG', () => {
        const properties = {
            route: 'mm_file_testing/Images/JPG.jpg',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_2 - PNG', () => {
        const properties = {
            route: 'mm_file_testing/Images/PNG.png',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });

    it('MM-T2264_4 - GIF', () => {
        const properties = {
            route: 'mm_file_testing/Images/GIF.gif',
            originalWidth: 500,
            originalHeight: 500,
        };

        testImage(properties);
    });

    it('MM-T2264_5 - TIFF', () => {
        const properties = {
            route: 'mm_file_testing/Images/TIFF.tif',
            originalWidth: 400,
            originalHeight: 479,
        };

        testImage(properties);
    });
});
