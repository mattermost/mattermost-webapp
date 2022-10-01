// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {verifyLastPostedEmoji} from './helpers';

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @emoji

describe('Gendered emoji', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T1539 Gendered emojis are rendered with the correct gender', () => {
        // # Post a man-gesturing-ok emoji
        cy.postMessage('🙆‍♂️');

        // # Assert posted emoji was rendered as man
        verifyLastPostedEmoji(':man-gesturing-ok:');
    });
});
