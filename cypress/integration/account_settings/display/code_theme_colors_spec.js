// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

const THEMES = [{name: 'github', backgroundColor: 'rgb(248, 248, 248)', color: 'rgb(51, 51, 51)'},
    {name: 'monokai', backgroundColor: 'rgb(39, 40, 34)', color: 'rgb(221, 221, 221)'},
    {name: 'solarized-light', backgroundColor: 'rgb(253, 246, 227)', color: 'rgb(101, 123, 131)'},
    {name: 'solarized-dark', backgroundColor: 'rgb(0, 43, 54)', color: 'rgb(131, 148, 150)'},
];

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
    cy.toAccountSettingsModal(null, true);
    cy.get('#displayButton').click();
    cy.get('#displaySettingsTitle').should('exist');

    // Open edit theme
    cy.get('#themeTitle').should('be.visible');
    cy.get('#themeEdit').click();
    cy.get('.section-max').scrollIntoView();
}

describe('AS14319 Theme Colors - Code', () => {
    before(() => {
        // 1. Login and navigate to the app
        cy.login('user-1');
        cy.visit('/');

        // 2. Enter in code block for message
        cy.get('#post_textbox').type('```\ncode\n```{enter}');
    });

    // reset settings to default mattermost theme
    after(() => {
        navigateToThemeSettings();

        // 1. Select the Theme Colors radio
        cy.get('#standardThemes').check().should('be.checked');

        // 2. Select the Mattermost pre-made theme
        cy.get('#premadeThemeMattermost').first().click();

        // 3. Save and close settings modal
        cy.get('#saveSetting').click();
        cy.get('#accountSettingsHeader > .close').click();
    });

    THEMES.forEach((THEME) => {
        it(`${THEME.name} theme renders correctly`, () => {
            // 1. Navigate to the theme settings
            navigateToThemeSettings();

            // 2. Check Custom Themes
            cy.get('#customThemes').check().should('be.checked');

            // 3. Open Center Channel Styles section
            cy.get('#centerChannelStyles').click();

            // 4. Select custom code theme
            cy.get('#codeThemeSelect').scrollIntoView().should('be.visible').select(THEME.name);

            // * Verify that the setting changes in the background?
            verifyLastPostStyle(THEME);

            // 5. Save and close settings modal
            cy.get('#saveSetting').click();
            cy.get('#accountSettingsHeader > .close').click();

            // * Verify that the styles remain after saving and closing modal
            verifyLastPostStyle(THEME);

            // 6. Reload the browser
            cy.reload();

            // * Verify the styles are still intact
            verifyLastPostStyle(THEME);
        });
    });
});
