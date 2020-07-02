// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

describe('Account Settings > Display > Clock Display Mode', () => {
    before(() => {
        // # Login as new user, visit town-square and post a message
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage('Test for clock display mode');

            // # Open RHS
            cy.clickPostCommentIcon();
        });
    });

    after(() => {
        // # Set clock display to 12-hour
        setClockDisplayTo12Hour();
    });

    it('MM-T2098 Clock display mode setting to "12-hour clock"', () => {
        // # Set clock display to 12-hour
        setClockDisplayTo12Hour();

        // * Verify clock format is 12-hour in center channel
        cy.get('#post-list').within(() => {
            verifyClockFormatIs12Hour();
        });

        // * Verify clock format is 12-hour in RHS
        cy.get('#sidebar-right').within(() => {
            verifyClockFormatIs12Hour();
        });
    });

    it('MM-T2096 Clock display mode setting to "24-hour clock"', () => {
        // # Set clock display to 24-hour
        setClockDisplayTo24Hour();

        // * Verify clock format is 24-hour in center channel
        cy.get('#post-list').within(() => {
            verifyClockFormatIs24Hour();
        });

        // * Verify clock format is 24-hour in RHS
        cy.get('#sidebar-right').within(() => {
            verifyClockFormatIs24Hour();
        });
    });
});

function navigateToClockDisplaySettings() {
    // # Go to Account Settings
    cy.toAccountSettingsModal();

    // # Click the display tab
    cy.get('#displayButton').should('be.visible').click();

    // # Click "Edit" to the right of "Clock Display"
    cy.get('#clockEdit').should('be.visible').click();

    // # Scroll a bit to show the "Save" button
    cy.get('.section-max').should('be.visible').scrollIntoView();
}

function setClockDisplayTo(clockFormat) {
    // # Navigate to Clock Display Settings
    navigateToClockDisplaySettings();

    // # Click the radio button
    cy.get(`#${clockFormat}`).should('be.visible').click();

    // # Click Save button and close Account Settings modal
    cy.get('#saveSetting').should('be.visible').click();
    cy.get('#accountSettingsHeader > .close').should('be.visible').click();
}

function setClockDisplayTo12Hour() {
    setClockDisplayTo('clockFormatA');
}

function setClockDisplayTo24Hour() {
    setClockDisplayTo('clockFormatB');
}

function verifyClockFormat(isHour12) {
    cy.get('time').first().then(($timeEl) => {
        cy.wrap($timeEl).invoke('attr', 'datetime').then((dateTimeString) => {
            const formattedDateTime = new Date(dateTimeString).toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: isHour12});
            cy.wrap($timeEl).should('have.text', formattedDateTime);
        });
    });
}

function verifyClockFormatIs12Hour() {
    verifyClockFormat(true);
}

function verifyClockFormatIs24Hour() {
    verifyClockFormat(false);
}
