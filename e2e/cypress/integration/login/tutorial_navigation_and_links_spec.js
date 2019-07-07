// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

describe('Test Tutorial Navigation', () => {
    before(() => {
        cy.loginAsNewUserWithTutorial();
    }); // before

    it('MM-13989 / On13989: After login, the first page of the tutorial should display.', () => {
        checkStepOne();
    }); // should display the first step of the tutorial

    it('A click of the middle circle should display the second page.', () => {
        cy.get('#tutorialIntroCircle1').click();
        checkStepTwo();
    }); // should go to second step

    it('A click of the third circle should display the third page.', () => {
        cy.get('#tutorialIntroCircle2').click();
        checkStepThree();
    }); // should go to third step

    it('A click of the first circle should display the first page again.', () => {
        cy.get('#tutorialIntroCircle0').click();
        checkStepOne();
    }); // should go to first step

    it('Clicking next on first step should show the second page', () => {
        cy.get('#tutorialNextButton').click();
        checkStepTwo();
    }); // should go to second step

    it('Clicking the icon should display the Mattermost download page.', () => {
        // Source: https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/testing-dom__tab-handling-links/cypress/integration/tab_handling_anchor_links_spec.js
        //
        // This fetches the contents of the appDownloadImage link and checks it without actually
        // clicking it and opening it in a new tab as Cypress doesn't appear to handle this.

        cy.get('#appDownloadImage').then(($a) => {
            const href = $a.prop('href');

            // request the contents of https://www.google.com/
            cy.request(href).

            // drill into the response body
                its('body').
                should('include', 'https://mattermost.com/wp-content/themes/mattermostv3/img/android-icon.png').
                should('include', 'https://mattermost.com/wp-content/themes/mattermostv3/img/google-play.png').
                should('include', 'https://mattermost.com/wp-content/themes/mattermostv3/img/ios.png').
                should('include', 'https://mattermost.com/wp-content/themes/mattermostv3/img/app-store.png').
                should('include', 'https://mattermost.com/wp-content/themes/mattermostv3/img/windows-icon.png');
        });
    }); // click link for new tab

    it('Clicking the Off-Topic link in sidebar should display that channel highlighted in the sidebar.', () => {
        cy.get('#sidebarItem_off-topic').parent().should('not.have.class', 'active');
        cy.get('#sidebarItem_off-topic').click();
        cy.get('#sidebarItem_off-topic').parent().should('have.class', 'active');

        //  Retest tutorial to ensure it has not changed:
        checkStepTwo();
    }); // click Off Topic link in sidebar

    it('Clicking Next on page 2 should lead to page 3.', () => {
        cy.get('#tutorialNextButton').click();
        checkStepThree();
    }); // click next to see step 3

    it('Clicking Next on step 3 should hide the tutorial and show the previously selected Off Topic channel', () => {
        cy.get('#tutorialNextButton').click();
        checkOffTopicChannel();
    }); // click to see Off Topic channel

    it('Another user who views the tutorial and clicks Skip button should go right to the default channel.', () => {
        cy.apiLogout();
        cy.loginAsNewUserWithTutorial();
        checkStepOne();
        cy.get('#tutorialSkipLink').click();
        checkTownSquare();
    });
}); // describe

/*  This function checks the contents of the first step of the tutorial.
*/

function checkStepOne() {
    cy.get('#tutorialIntroContent').should('be.visible').should('contain', 'Welcome to:');
    cy.get('#tutorialIntroContent').should('be.visible').should('contain', 'Mattermost');
    cy.get('#tutorialIntroContent').should('be.visible').should('contain', 'Your team communication all in one place, instantly searchable and available anywhere.');
    cy.get('#tutorialIntroContent').should('be.visible').should('contain', 'Keep your team connected to help them achieve what matters most.');
    cy.get('#tutorialIntroCircle0').should('be.visible');
    cy.get('#tutorialIntroCircle1').should('be.visible');
    cy.get('#tutorialIntroCircle2').should('be.visible');
    cy.get('#tutorialNextButton').should('be.visible');
    cy.get('#tutorialSkipLink').should('be.visible');
} // check Step One

/*  This function checks the contents of the second step of the tutorial.
*/

function checkStepTwo() {
    cy.get('#tutorialIntroTwo').should('be.visible').should('contain', 'Communication happens in public discussion channels, private channels and direct messages.');
    cy.get('#tutorialIntroTwo').should('be.visible').should('contain', 'Everything is archived and searchable from any web-enabled desktop, laptop or phone.');
    cy.get('#tutorialIntroTwo').should('be.visible').should('contain', 'Install the apps for PC, Mac, iOS and Android for easy access and notifications on the go.');
    cy.get('#appDownloadLink').should('be.visible').should('contain', 'PC, Mac, iOS and Android');
    cy.get('#tutorialIntroCircle0').should('be.visible');
    cy.get('#tutorialIntroCircle1').should('be.visible');
    cy.get('#tutorialIntroCircle2').should('be.visible');
    cy.get('#tutorialNextButton').should('be.visible');
    cy.get('#tutorialSkipLink').should('be.visible');
} // check step two

/*  This function checks the contents of the third step of the tutorial.
*/

function checkStepThree() {
    cy.get('#tutorialIntroThree').should('be.visible').should('contain', 'Invite teammates when you\'re ready.');
    cy.get('#tutorialIntroThree').should('be.visible').should('contain', 'Need anything, just email us at feedback@mattermost.com.');
    cy.get('#tutorialIntroThree').should('be.visible').should('contain', 'Click "Next" to enter Town Square. This is the first channel teammates see when they sign up. Use it for posting updates everyone needs to know.');
    cy.get('#tutorialIntroCircle0').should('be.visible');
    cy.get('#tutorialIntroCircle1').should('be.visible');
    cy.get('#tutorialIntroCircle2').should('be.visible');
    cy.get('#tutorialNextButton').should('be.visible');
    cy.get('#tutorialSkipLink').should('be.visible');
} // check step three

/*  This function checks to see if the Off-Topic channel displays by the header info and the post box.
*/

function checkOffTopicChannel() {
    cy.get('#channelHeaderInfo').should('be.visible').should('contain', 'Off-Topic');
    cy.get('#post_textbox').should('be.visible');
}

/*  This function checks to see if the Town Square channel displays by the header info and the post box.
*/

function checkTownSquare() {
    cy.get('#channelHeaderInfo').should('be.visible').should('contain', 'Town Square');
    cy.get('#post_textbox').should('be.visible');
}
