// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import moment from 'moment-timezone';

import {getAdminAccount} from '../../../support/env';
import * as DATE_TIME_FORMAT from '../../../fixtures/date_time_format';
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
    const datesInUTC = [
        moment(date1).tz(timezoneUTC.expectedValue),
        moment(date2).tz(timezoneUTC.expectedValue),
        moment(date3).tz(timezoneUTC.expectedValue),
        moment(date4).tz(timezoneUTC.expectedValue),
    ];

    before(() => {
        // # Enable Timezone
        cy.apiUpdateConfig({
            DisplaySettings: {
                ExperimentalTimezone: true,
            },
        });

        // # Create and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Post messages from the past
            [date1, date2, date3, date4].forEach((createAt, index) => {
                cy.getCurrentChannelId().then((channelId) => {
                    cy.postMessageAs({sender: sysadmin, message: `Hello from ${index}`, channelId, createAt});
                });
            });

            // # Post messages from now
            cy.postMessage('Hello from now');
        });
    });

    beforeEach(() => {
        // # Reload to re-arrange posts
        cy.reload();
    });

    describe('MM-T301_1 Change timezone automatically', () => {
        const automaticTestCases = [
            {
                timezone: timezoneLocal,
                localTimes: [
                    {postIndex: 0, dateInTimezone: moment(date1).tz(timezoneLocal.expectedValue)},
                    {postIndex: 1, dateInTimezone: moment(date2).tz(timezoneLocal.expectedValue)},
                    {postIndex: 2, dateInTimezone: moment(date3).tz(timezoneLocal.expectedValue)},
                    {postIndex: 3, dateInTimezone: moment(date4).tz(timezoneLocal.expectedValue)},
                ],
            },
        ];

        automaticTestCases.forEach((testCase) => {
            describe('Type: ' + testCase.timezone.type + ', Actual: ' + testCase.timezone.actualValue + ', Expected: ' + testCase.timezone.expectedValue, () => {
                before(() => {
                    // # Set timezone display to automatic
                    setTimezoneDisplayToAutomatic(testCase.timezone);
                });

                describe('Clock Mode: 12-hour', () => {
                    before(() => {
                        // # Save Clock Display Mode to 12-hour
                        cy.apiSaveClockDisplayModeTo24HourPreference(false);
                    });

                    testCase.localTimes.forEach((localTime) => {
                        it('Post: ' + localTime.postIndex + ', UTC: ' + datesInUTC[localTime.postIndex].format(DATE_TIME_FORMAT.TIME_12_HOUR) + ', New: ' + localTime.dateInTimezone.format(DATE_TIME_FORMAT.TIME_12_HOUR), () => {
                            // * Verify local time is timezone formatted 12-hour
                            verifyLocalTimeIsTimezoneFormatted12Hour(localTime);
                        });
                    });
                });

                describe('Clock Mode: 24-hour', () => {
                    before(() => {
                        // # Save Clock Display Mode to 24-hour
                        cy.apiSaveClockDisplayModeTo24HourPreference(true);
                    });

                    testCase.localTimes.forEach((localTime) => {
                        it('Post: ' + localTime.postIndex + ', UTC: ' + datesInUTC[localTime.postIndex].format(DATE_TIME_FORMAT.TIME_24_HOUR) + ', New: ' + localTime.dateInTimezone.format(DATE_TIME_FORMAT.TIME_24_HOUR), () => {
                            // * Verify local time is timezone formatted 24-hour
                            verifyLocalTimeIsTimezoneFormatted24Hour(localTime);
                        });
                    });
                });
            });
        });
    });

    describe('MM-T301_2 Change timezone manually', () => {
        const manualTestCases = [
            {
                timezone: timezoneCanonical,
                localTimes: [
                    {postIndex: 0, dateInTimezone: moment(date1).tz(timezoneCanonical.expectedValue)},
                    {postIndex: 1, dateInTimezone: moment(date2).tz(timezoneCanonical.expectedValue)},
                    {postIndex: 2, dateInTimezone: moment(date3).tz(timezoneCanonical.expectedValue)},
                    {postIndex: 3, dateInTimezone: moment(date4).tz(timezoneCanonical.expectedValue)},
                ],
            },
            {
                timezone: timezoneUTC,
                localTimes: [
                    {postIndex: 0, dateInTimezone: moment(date1).tz(timezoneUTC.expectedValue)},
                    {postIndex: 1, dateInTimezone: moment(date2).tz(timezoneUTC.expectedValue)},
                    {postIndex: 2, dateInTimezone: moment(date3).tz(timezoneUTC.expectedValue)},
                    {postIndex: 3, dateInTimezone: moment(date4).tz(timezoneUTC.expectedValue)},
                ],
            },
            {
                timezone: timezoneInvalid,
                localTimes: [
                    {postIndex: 0, dateInTimezone: moment(date1).tz(timezoneInvalid.expectedValue)},
                    {postIndex: 1, dateInTimezone: moment(date2).tz(timezoneInvalid.expectedValue)},
                    {postIndex: 2, dateInTimezone: moment(date3).tz(timezoneInvalid.expectedValue)},
                    {postIndex: 3, dateInTimezone: moment(date4).tz(timezoneInvalid.expectedValue)},
                ],
            },
        ];

        manualTestCases.forEach((testCase) => {
            describe('Type: ' + testCase.timezone.type + ', Actual: ' + testCase.timezone.actualValue + ', Expected: ' + testCase.timezone.expectedValue, () => {
                before(() => {
                    // # Set timezone display to manual
                    setTimezoneDisplayToManual(testCase.timezone);
                });

                describe('Clock Mode: 12-hour', () => {
                    before(() => {
                        // # Save Clock Display Mode to 12-hour
                        cy.apiSaveClockDisplayModeTo24HourPreference(false);
                    });

                    testCase.localTimes.forEach((localTime) => {
                        it('Post: ' + localTime.postIndex + ', UTC: ' + datesInUTC[localTime.postIndex].format(DATE_TIME_FORMAT.TIME_12_HOUR) + ', New: ' + localTime.dateInTimezone.format(DATE_TIME_FORMAT.TIME_12_HOUR), () => {
                            // * Verify local time is timezone formatted 12-hour
                            verifyLocalTimeIsTimezoneFormatted12Hour(localTime);
                        });
                    });
                });

                describe('Clock Mode: 24-hour', () => {
                    before(() => {
                        // # Save Clock Display Mode to 24-hour
                        cy.apiSaveClockDisplayModeTo24HourPreference(true);
                    });

                    testCase.localTimes.forEach((localTime) => {
                        it('Post: ' + localTime.postIndex + ', UTC: ' + datesInUTC[localTime.postIndex].format(DATE_TIME_FORMAT.TIME_24_HOUR) + ', New: ' + localTime.dateInTimezone.format(DATE_TIME_FORMAT.TIME_24_HOUR), () => {
                            // * Verify local time is timezone formatted 24-hour
                            verifyLocalTimeIsTimezoneFormatted24Hour(localTime);
                        });
                    });
                });
            });
        });
    });
});

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

function verifyLocalTimeIsTimezoneFormatted(localTime, timeFormat) {
    // * Verify that the local time of each post is in timezone format
    const formattedTime = localTime.dateInTimezone.format(timeFormat);
    cy.findAllByTestId('postView', {timeout: TIMEOUTS.ONE_MIN}).
        eq(localTime.postIndex).find('time', {timeout: TIMEOUTS.HALF_SEC}).
        should('have.text', formattedTime);
}

function verifyLocalTimeIsTimezoneFormatted12Hour(localTime) {
    verifyLocalTimeIsTimezoneFormatted(localTime, DATE_TIME_FORMAT.TIME_12_HOUR);
}

function verifyLocalTimeIsTimezoneFormatted24Hour(localTime) {
    verifyLocalTimeIsTimezoneFormatted(localTime, DATE_TIME_FORMAT.TIME_24_HOUR);
}
