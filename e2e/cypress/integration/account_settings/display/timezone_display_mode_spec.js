// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

import moment from 'moment-timezone';

import {getAdminAccount} from '../../../support/env';
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings > Display > Timezone Mode', () => {
    const sysadmin = getAdminAccount();
    const date1 = Date.UTC(2020, 0, 5, 4, 30); // Jan 5, 2020 04:30
    const date2 = Date.UTC(2020, 0, 5, 12, 30); // Jan 5, 2020 12:30
    const date3 = Date.UTC(2020, 0, 5, 20, 30); // Jan 5, 2020 20:30
    const date4 = Date.UTC(2020, 0, 6, 0, 30); // Jan 6, 2020 00:30
    const timezoneLocal = {type: 'Canonical', actualValue: moment.tz.guess(), expectedValue: moment.tz.guess()};
    const timezoneCanonical = {type: 'Canonical', actualValue: 'Asia/Hong_Kong', expectedValue: 'Asia/Hong_Kong'};
    const timezoneUTC = {type: 'Default', actualValue: 'UTC', expectedValue: 'UTC'};
    const timezoneInvalid = {type: 'Invalid', actualValue: 'NZ-Chat', expectedValue: 'UTC'};
    const timeFormat = 'h:mm A';
    const utcFormattedTimes = [
        moment(date1).tz(timezoneUTC.expectedValue).format(timeFormat),
        moment(date2).tz(timezoneUTC.expectedValue).format(timeFormat),
        moment(date3).tz(timezoneUTC.expectedValue).format(timeFormat),
        moment(date4).tz(timezoneUTC.expectedValue).format(timeFormat),
    ];

    before(() => {
        // # Enable Timezone
        cy.apiUpdateConfig({
            DisplaySettings: {
                ExperimentalTimezone: true,
            },
        });

        // # Reset timezone
        resetTimezone();

        // # Create and visit new channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);

            // # Post messages from the past
            [date1, date2, date3, date4].forEach((createAt, index) => {
                cy.postMessageAs({sender: sysadmin, message: `Hello from ${index}`, channelId: channel.id, createAt});
            });

            // # Post messages from now
            cy.postMessage('Hello from now');

            // # Reload to re-arrange posts
            cy.reload();
        });
    });

    after(() => {
        // # Reset timezone
        resetTimezone();
    });

    describe('MM-T301 Change timezone automatically', () => {
        const automaticTestCases = [
            {
                timezone: timezoneLocal,
                localTimes: [
                    {postIndex: 0, formattedTime: moment(date1).tz(timezoneLocal.expectedValue).format(timeFormat)},
                    {postIndex: 1, formattedTime: moment(date2).tz(timezoneLocal.expectedValue).format(timeFormat)},
                    {postIndex: 2, formattedTime: moment(date3).tz(timezoneLocal.expectedValue).format(timeFormat)},
                    {postIndex: 3, formattedTime: moment(date4).tz(timezoneLocal.expectedValue).format(timeFormat)},
                ],
            },
        ];

        automaticTestCases.forEach((testCase) => {
            describe('Type: ' + testCase.timezone.type + ', Actual: ' + testCase.timezone.actualValue + ', Expected: ' + testCase.timezone.expectedValue, () => {
                before(() => {
                    // # Set timezone display to automatic
                    setTimezoneDisplayToAutomatic(testCase.timezone);
                });

                testCase.localTimes.forEach((localTime) => {
                    it('Post: ' + localTime.postIndex + ', UTC: ' + utcFormattedTimes[localTime.postIndex] + ', New: ' + localTime.formattedTime, () => {
                        // * Verify local time is timezone formatted
                        verifyLocalTimeIsTimezoneFormatted(localTime);
                    });
                });
            });
        });
    });

    describe('MM-T301 Change timezone manually', () => {
        const manualTestCases = [
            {
                timezone: timezoneCanonical,
                localTimes: [
                    {postIndex: 0, formattedTime: moment(date1).tz(timezoneCanonical.expectedValue).format(timeFormat)},
                    {postIndex: 1, formattedTime: moment(date2).tz(timezoneCanonical.expectedValue).format(timeFormat)},
                    {postIndex: 2, formattedTime: moment(date3).tz(timezoneCanonical.expectedValue).format(timeFormat)},
                    {postIndex: 3, formattedTime: moment(date4).tz(timezoneCanonical.expectedValue).format(timeFormat)},
                ],
            },
            {
                timezone: timezoneUTC,
                localTimes: [
                    {postIndex: 0, formattedTime: moment(date1).tz(timezoneUTC.expectedValue).format(timeFormat)},
                    {postIndex: 1, formattedTime: moment(date2).tz(timezoneUTC.expectedValue).format(timeFormat)},
                    {postIndex: 2, formattedTime: moment(date3).tz(timezoneUTC.expectedValue).format(timeFormat)},
                    {postIndex: 3, formattedTime: moment(date4).tz(timezoneUTC.expectedValue).format(timeFormat)},
                ],
            },
            {
                timezone: timezoneInvalid,
                localTimes: [
                    {postIndex: 0, formattedTime: moment(date1).tz(timezoneInvalid.expectedValue).format(timeFormat)},
                    {postIndex: 1, formattedTime: moment(date2).tz(timezoneInvalid.expectedValue).format(timeFormat)},
                    {postIndex: 2, formattedTime: moment(date3).tz(timezoneInvalid.expectedValue).format(timeFormat)},
                    {postIndex: 3, formattedTime: moment(date4).tz(timezoneInvalid.expectedValue).format(timeFormat)},
                ],
            },
        ];

        manualTestCases.forEach((testCase) => {
            describe('Type: ' + testCase.timezone.type + ', Actual: ' + testCase.timezone.actualValue + ', Expected: ' + testCase.timezone.expectedValue, () => {
                before(() => {
                    // # Set timezone display to manual
                    setTimezoneDisplayToManual(testCase.timezone);
                });

                testCase.localTimes.forEach((localTime) => {
                    it('Post: ' + localTime.postIndex + ', UTC: ' + utcFormattedTimes[localTime.postIndex] + ', New: ' + localTime.formattedTime, () => {
                        // * Verify local time is timezone formatted
                        verifyLocalTimeIsTimezoneFormatted(localTime);
                    });
                });
            });
        });
    });
});

function resetTimezone() {
    cy.apiPatchMe({
        locale: 'en',
        timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
    });
}

function navigateToTimezoneDisplaySettings() {
    // # Go to Account Settings
    cy.toAccountSettingsModal();

    // # Click the display tab
    cy.get('#displayButton').should('be.visible').click();

    // # Click "Edit" to the right of "Timezone"
    cy.get('#timezoneEdit').should('be.visible').click();

    // # Scroll a bit to show the "Save" button
    cy.get('.section-max').should('be.visible').scrollIntoView();
}

function setTimezoneDisplayTo(isAutomatic, timezone) {
    const actualTimezoneValue = timezone.actualValue;
    const expectedTimezoneValue = timezone.expectedValue;

    // # Navigate to Timezone Display Settings
    navigateToTimezoneDisplaySettings();

    cy.get('.setting-list-item').within(() => {
        // # Uncheck the automatic timezone checkbox and verify unchecked
        cy.get('#automaticTimezoneInput').should('be.visible').uncheck().should('be.not.checked');

        // * Verify Change timezone exists
        cy.findByText('Change timezone').should('exist');
        if (isAutomatic) {
            // # Check automatic timezone checkbox and verify checked
            cy.get('#automaticTimezoneInput').check().should('be.checked');

            // * Verify timezone text is visible
            cy.get('.section-describe').should('be.visible').invoke('text').then((timezoneDesc) => {
                expect(expectedTimezoneValue.replace('_', ' ')).to.contain(timezoneDesc);
            });

            // * Verify Change timezone does not exist
            cy.findByText('Change timezone').should('not.exist');
        } else {
            // # Manually type new timezone
            cy.get('input[type="search"]').should('be.visible').clear().type(actualTimezoneValue);

            // # Click on suggestion if exists
            if (timezone.type === 'Invalid') {
                cy.get('#suggestionList').should('not.exist');
            } else if (actualTimezoneValue) {
                cy.get('#suggestionList').findByText(expectedTimezoneValue).should('exist').click();
            }
        }
    });

    // # Click Save button
    cy.get('#saveSetting').should('be.visible').click();

    // * Verify timezone description is correct
    cy.get('#timezoneDesc').should('be.visible').invoke('text').then((timezoneDesc) => {
        expect(expectedTimezoneValue.replace('_', ' ')).to.contain(timezoneDesc);
    });

    // # Close Account Settings modal
    cy.get('#accountSettingsHeader > .close').should('be.visible').click();
}

function setTimezoneDisplayToAutomatic(timezone) {
    setTimezoneDisplayTo(true, timezone);
}

function setTimezoneDisplayToManual(timezone) {
    setTimezoneDisplayTo(false, timezone);
}

function verifyLocalTimeIsTimezoneFormatted(localTime) {
    // * Verify that the local time of each post is in timezone format
    cy.findAllByTestId('postView').eq(localTime.postIndex).find('time', {timeout: TIMEOUTS.HALF_SEC}).should('have.text', localTime.formattedTime);
}
