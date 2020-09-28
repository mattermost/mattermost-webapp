// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @onboarding @smoke

describe('Test Tutorial Navigation', () => {
    let testUser;
    let otherUser;
    let testTeam;
    let config;

    before(() => {
        cy.apiGetConfig().then((data) => {
            ({config} = data);
        });

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.apiCreateUser({bypassTutorial: false}).then(({user: user2}) => {
                otherUser = user2;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
                testUser = user1;
                cy.apiAddUserToTeam(testTeam.id, testUser.id);

                cy.apiLogin(testUser);
                cy.visit(`/${testTeam.name}/channels/town-square`);
            });
        });
    });

    it('On13989 - Tutorial Navigation and Links', () => {
        // * Check that step one displays after new user signs in.
        checkStepOne();

        // # Click the second dot
        cy.get('#tutorialIntroCircle1').click();

        // * Verify the second step displays.
        checkStepTwo(config.NativeAppSettings.AppDownloadLink);

        // # Click the third dot.
        cy.get('#tutorialIntroCircle2').click();

        // * Verify the third step displays.
        checkStepThree();

        // # click the first dot.
        cy.get('#tutorialIntroCircle0').click();

        // * Verify that the user returns to the first step.
        checkStepOne();

        // # Click the Next button.
        cy.get('#tutorialNextButton').click();

        // * Verify that the second step displays.
        checkStepTwo(config.NativeAppSettings.AppDownloadLink);

        // * Test the App Download Image link to ensure it returns a 200 result.
        cy.get('#appDownloadImage').should('have.attr', 'href').then((href) => {
            cy.request(href).its('status').should('equal', 200);
        });

        //* Check the Off-Topic sidebar link to ensure it is not active.
        cy.get('#sidebarItem_off-topic').parent().should('not.have.class', 'active');

        // # Click the Off-Topic sidebar link
        cy.get('#sidebarItem_off-topic').click();

        // * Verify the Off-Topic sidebar link is now active.
        cy.get('#sidebarItem_off-topic').parent().should('have.class', 'active');

        // * Verify that the second step of the tutorial still displays:
        checkStepTwo(config.NativeAppSettings.AppDownloadLink);

        // # Click the Next button
        cy.get('#tutorialNextButton').click();

        // * Verify that the third step displays.
        checkStepThree();

        // # Click the Next button.
        cy.get('#tutorialNextButton').click();

        // * Verify that the Off-Topic channel displays.
        checkOffTopicChannel();

        // # Log in as another new user with the tutorial bypass flag set to false.
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // * Verify that the first step of the tutorial displays.
        checkStepOne();

        // # Click the Skip Tutorial link.
        cy.get('#tutorialSkipLink').click();

        // * Verify that the default Town Square channel displays.
        checkTownSquare();
    });
});

/**
*    This function checks the contents of the first step of the tutorial.
*/

function checkStepOne() {
    cy.get('#tutorialIntroContent').should('be.visible').
        and('contain', 'Welcome to:').
        and('contain', 'Mattermost').
        and('contain', 'Your team communication all in one place, instantly searchable and available anywhere.').
        and('contain', 'Keep your team connected to help them achieve what matters most.');

    cy.get('#tutorialIntroCircle0').should('have.class', 'circle active');
    checkTutorialFooter();
}

/**
*    This function checks the contents of the second step of the tutorial.
*/

function checkStepTwo(appDownloadLink) {
    cy.get('#tutorialIntroTwo').should('be.visible').
        and('contain', 'Communication happens in public discussion channels, private channels and direct messages.').
        and('contain', 'Everything is archived and searchable from any web-enabled desktop, laptop or phone.').
        and('contain', 'Install the apps for PC, Mac, iOS and Android for easy access and notifications on the go.');

    cy.get('#appDownloadLink').should('be.visible').and('contain', 'PC, Mac, iOS and Android').
        and('have.attr', 'href', appDownloadLink);

    cy.get('#appDownloadImage').should('have.attr', 'href', appDownloadLink);
    cy.get('#tutorialIntroCircle1').should('have.class', 'circle active');

    checkTutorialFooter();
}

/**
*    This function checks the contents of the third step of the tutorial.
*/

function checkStepThree() {
    cy.get('#tutorialIntroThree').should('be.visible').
        and('contain', 'Invite Teammates when you\'re ready.').
        and('contain', 'Need anything, just email us at feedback@mattermost.com.').
        and('contain', 'Click "Next" to enter Town Square. This is the first channel teammates see when they sign up. Use it for posting updates everyone needs to know.');

    cy.get('#tutorialIntroCircle2').should('have.class', 'circle active');

    checkTutorialFooter();
}

/**
*    This function checks to see if the Off-Topic channel displays by the header info and the post box.
*/

function checkOffTopicChannel() {
    cy.get('#channelHeaderInfo').should('be.visible').and('contain', 'Off-Topic');
    cy.get('#post_textbox').should('be.visible');
}

/**
*    This function checks to see if the Town Square channel displays by the header info and the post box.
*/

function checkTownSquare() {
    cy.get('#channelHeaderInfo').should('be.visible').and('contain', 'Town Square');
    cy.get('#post_textbox').should('be.visible');
}

/**
*    This function checks the footer of the tutorial.
*/

function checkTutorialFooter() {
    cy.get('#tutorialIntroCircle0').should('be.visible');
    cy.get('#tutorialIntroCircle1').should('be.visible');
    cy.get('#tutorialIntroCircle2').should('be.visible');
    cy.get('#tutorialNextButton').should('be.visible');
    cy.get('#tutorialSkipLink').should('be.visible');
}
