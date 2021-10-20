// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console @enterprise @not_cloud

describe('Edition and License', () => {
    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // * Check if server has license
        cy.apiRequireLicense();

        // # Go to admin console
        cy.visit('/admin_console');
    });

    it('MM-T899 - Edition and License: Verify Privacy Policy link points to correct URL', () => {
        // * Find privacy link and then assert that the href is what we expect it to be
        cy.findByTestId('privacyPolicyLink').then((el) => {
            expect(el[0].href).equal('https://about.mattermost.com/default-privacy-policy/');
        });
    });
});
