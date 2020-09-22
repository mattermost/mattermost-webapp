// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

describe('Account Settings', () => {
    before(() => {
        // # Login as new user, visit town-square and post a message
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage('```\ncode\n```{enter}');
        });
    });

    [
        {name: 'github', backgroundColor: 'rgb(248, 248, 248)', color: 'rgb(51, 51, 51)'},
        {name: 'monokai', backgroundColor: 'rgb(39, 40, 34)', color: 'rgb(221, 221, 221)'},
        {name: 'solarized-light', backgroundColor: 'rgb(253, 246, 227)', color: 'rgb(101, 123, 131)'},
        {name: 'solarized-dark', backgroundColor: 'rgb(0, 43, 54)', color: 'rgb(131, 148, 150)'},
    ].forEach((theme, index) => {
        it(`MM-T293_${index + 1} Theme Colors - Code (${theme.name})`, () => {
            // # Navigate to the theme settings
            navigateToThemeSettings();

            // # Check Custom Themes
            cy.get('#customThemes').check().should('be.checked');

            // # Open Center Channel Styles section
            cy.get('#centerChannelStyles').click({force: true});

            // # Select custom code theme
            cy.get('#codeThemeSelect').scrollIntoView().should('be.visible').select(theme.name);

            // * Verify that the setting changes in the background?
            verifyLastPostStyle(theme);

            // # Save and close settings modal
            cy.get('#saveSetting').click();
            cy.get('#accountSettingsHeader > .close').click();
            cy.get('#accountSettingsHeader').should('be.hidden');

            // * Verify that the styles remain after saving and closing modal
            verifyLastPostStyle(theme);

            // # Reload the browser
            cy.reload();

            // * Verify the styles are still intact
            verifyLastPostStyle(theme);
        });
    });
});

function verifyLastPostStyle(codeTheme) {
    cy.getLastPostId().then((postId) => {
        const postCodeBlock = `#postMessageText_${postId} code`;

        // * Verify that the code block background color and color match the desired theme
        cy.get(postCodeBlock).
            should('have.css', 'background-color', codeTheme.backgroundColor).
            and('have.css', 'color', codeTheme.color);
    });
}

function navigateToThemeSettings() {
    // Change theme to desired theme (keeps settings modal open)
    cy.toAccountSettingsModal();
    cy.get('#displayButton').click();
    cy.get('#displaySettingsTitle').should('exist');

    // Open edit theme
    cy.get('#themeTitle').should('be.visible');
    cy.get('#themeEdit').click();
    cy.get('.section-max').scrollIntoView();
}
