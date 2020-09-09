// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Customization', () => {
    before(() => {
        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Customization');
    });

    beforeEach(() => {
        // # as many of the tests logout the user, ensure it's logged
        // in as an admin before each test
        cy.apiAdminLogin();
    });

    it('MM-T1024 - Can change name and desc with Custom Branding set to false', () => {
        // # Make sure necessary field is false
        cy.apiUpdateConfig({TeamSettings: {EnableCustomBrand: false}});

        // * Verify that setting is visible and matches text content
        cy.findByTestId('TeamSettings.SiteNamelabel').scrollIntoView().should('be.visible').and('have.text', 'Site Name:');

        // # Update both Site Name and Description to store test values
        const siteName = 'Mattermost_Text';
        const siteDescription = 'This is a testing Mattermost site';
        cy.findByTestId('TeamSettings.SiteNameinput').clear().type(siteName);
        cy.findByTestId('TeamSettings.CustomDescriptionTextinput').clear().type(siteDescription);

        // # Save setting
        saveSetting();

        // # Logout
        cy.apiLogout();

        // * Ensure that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Ensure Site Name and Description are shown the updated values in the login screen
        cy.get('#site_name').should('have.text', siteName);
        cy.get('#site_description').should('have.text', siteDescription);
    });

    it('MM-T1029 - Custom branding text can render markdown text', () => {
        // # Visit emoji system console page
        cy.visit('/admin_console/site_config/emoji');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Emoji');

        // # Set Enable Custom Emoji to true
        cy.findByTestId('ServiceSettings.EnableCustomEmojitrue').check();

        // # Save setting
        saveSetting();

        // * Visit the add custom emoji page for ad-1
        cy.visit('/ad-1/emoji/add');
        cy.get('.backstage-header').should('be.visible');

        // * Ensure the form is visible
        cy.get('.backstage-form').should('be.visible').within(() => {
            // # Fill the emoji data
            cy.get('input#name').clear().type('yay');
            cy.get('input#select-emoji').attachFile('mattermost-icon.png');

            // # Save emoji
            cy.get('.backstage-form__footer button').click();
        });

        // # Make sure necessary field is true
        cy.apiUpdateConfig({TeamSettings: {EnableCustomBrand: true}});
        cy.reload();

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Customization');

        // eslint-disable-next-line no-irregular-whitespace
        const customBrandText = `​​​​:yay:

- This is a bullet point
- This is another bullet point

**This has been bolded**
~~This has been strikethrough~~
*This has been italicized*
[This is a link to mattermost.com](https://mattermost.com)
` + '`This is inline code`'; // eslint-disable-line no-useless-concat

        // # Update custom brand text
        cy.findByTestId('TeamSettings.CustomBrandTextinput').clear().type(customBrandText);

        // # Save setting
        saveSetting();

        // # Logout
        cy.apiLogout();

        // * Ensure that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        cy.get('.signup__markdown div div').should('be.visible').within(() => {
            // * Ensure emoji has been rendered
            // ToDo: uncomment after fixing MM-28443
            //cy.get('span.emoticon').should('have.attr', 'title', ':yay:');

            // * Ensure the list and two bullets have been rendered
            cy.get('ul.markdown__list').should('be.visible').within(() => {
                cy.contains('This is a bullet point');
                cy.contains('This is another bullet point');
            });

            // * Find within the paragraph after the list
            cy.get('ul+p').should('be.visible').within(() => {
                // * Ensure the bold text has been rendered
                cy.get('strong').should('be.visible').and('have.text', 'This has been bolded');

                // * Ensure the strikethrough text has been rendered
                cy.get('del').should('be.visible').and('have.text', 'This has been strikethrough');

                // * Ensure the italic text has been rendered
                cy.get('em').should('be.visible').and('have.text', 'This has been italicized');

                // * Ensure the link has been rendered
                cy.get('a.markdown__link').should('be.visible').and('have.text', 'This is a link to mattermost.com').and('have.attr', 'href', 'https://mattermost.com');

                // * Ensure the inline code has been rendered
                cy.get('.codespan__pre-wrap').should('be.visible').and('have.text', 'This is inline code');
            });
        });
    });
});

function saveSetting() {
    // # Click save button, and verify text and visibility
    cy.get('#saveSetting').
        should('have.text', 'Save').
        and('be.enabled').
        click().
        should('be.disabled').
        wait(TIMEOUTS.HALF_SEC);
}
