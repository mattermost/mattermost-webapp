// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;

describe('Messaging', () => {
    before(() => {
        // # Enable Timezone
        cy.apiUpdateConfig({
            DisplaySettings: {
                ExperimentalTimezone: true,
            },
        });

        // # Login as user-1
        cy.apiLogin('user-1');

        // # Create and visit new channel
        cy.createAndVisitNewChannel().then((channel) => {
            // # Post messages from the past
            [
                Date.UTC(2020, 0, 5, 4, 30), // Jan 5, 2020 04:30
                Date.UTC(2020, 0, 5, 12, 30), // Jan 5, 2020 12:30
                Date.UTC(2020, 0, 5, 20, 30), // Jan 5, 2020 20:30
                Date.UTC(2020, 0, 6, 0, 30), // Jan 6, 2020 00:30
            ].forEach((createAt, index) => {
                cy.postMessageAs({sender: sysadmin, message: `Hello from ${index}`, channelId: channel.id, createAt});
            });

            // # Post messages from now
            cy.postMessage('Hello from now');

            // # Reload to re-arrange posts
            cy.reload();
        });
    });

    after(() => {
        cy.apiPatchMe({
            locale: 'en',
            timezone: {automaticTimezone: '', manualTimezone: 'UTC', useAutomaticTimezone: 'false'},
        });
    });

    describe('MM-21342 Post time should render correct format and locale', () => {
        const testCases = [
            {
                name: 'in English',
                channelIntro: 'Beginning of Channel Test',
                locale: 'en',
                manualTimezone: 'UTC',
                localTimes: [
                    {postIndex: 0, standard: '4:30 AM', military: '04:30'},
                    {postIndex: 1, standard: '12:30 PM', military: '12:30'},
                    {postIndex: 2, standard: '8:30 PM', military: '20:30'},
                    {postIndex: 3, standard: '12:30 AM', military: '00:30'},
                ]
            },
            {
                name: 'in Spanish',
                channelIntro: 'Inicio de Channel Test',
                locale: 'es',
                manualTimezone: 'UTC',
                localTimes: [
                    {postIndex: 0, standard: '4:30 a. m.', military: '4:30'},
                    {postIndex: 1, standard: '12:30 p. m.', military: '12:30'},
                    {postIndex: 2, standard: '8:30 p. m.', military: '20:30'},
                    {postIndex: 3, standard: '12:30 a. m.', military: '0:30'},
                ]
            },
            {
                name: 'in react-intl unsupported timezone',
                channelIntro: 'Inicio de Channel Test',
                locale: 'es',
                manualTimezone: 'NZ-CHAT',
                localTimes: [
                    {postIndex: 0, standard: '06:15 PM', military: '18:15'},
                    {postIndex: 1, standard: '02:15 AM', military: '02:15'},
                    {postIndex: 2, standard: '10:15 AM', military: '10:15'},
                    {postIndex: 3, standard: '02:15 PM', military: '14:15'},
                ]
            },
        ];

        testCases.forEach((testCase) => {
            describe(testCase.name, () => {
                describe('standard time', () => {
                    testCase.localTimes.forEach((localTime, index) => {
                        it('post ' + index + ' should match', () => {
                            // # Change user preference to 12-hour format
                            setTo24HourTimeFormat(false);

                            // # Set user locale and timezone
                            setLocaleAndTimezone(testCase.locale, testCase.manualTimezone);

                            // * Verify that the channel is loaded correctly based on locale
                            cy.findByText(testCase.channelIntro).should('be.visible');

                            // * Verify that the local time of each post is rendered in 12-hour format based on locale
                            cy.findAllByTestId('postView').eq(index).find('.post__time', {timeout: 500}).should('have.text', localTime.standard);
                        });
                    });
                });

                describe('military time', () => {
                    testCase.localTimes.forEach((localTime, index) => {
                        it('post ' + index + ' should match', () => {
                            // # Change user preference to 24-hour format
                            setTo24HourTimeFormat(true);

                            // # Set user locale and timezone
                            setLocaleAndTimezone(testCase.locale, testCase.manualTimezone);

                            // # Increase viewport to ensure channel intro remains in view.
                            cy.viewport(1300, 800);

                            // * Verify that the channel is loaded correctly based on locale
                            cy.findByText(testCase.channelIntro).should('be.visible');

                            // * Verify that the local time of each post is rendered in 24-hour format based on locale
                            cy.findAllByTestId('postView').eq(index).find('.post__time', {timeout: 500}).should('have.text', localTime.military);
                        });
                    });
                });
            });
        });
    });
});

function setLocaleAndTimezone(locale, manualTimezone) {
    cy.apiPatchMe({
        locale,
        timezone: {
            manualTimezone,
            automaticTimezone: '',
            useAutomaticTimezone: 'false',
        },
    });
}

function setTo24HourTimeFormat(is24Hour) {
    cy.getCookie('MMUSERID').then((cookie) => {
        const preference = {
            user_id: cookie.value,
            category: 'display_settings',
            name: 'use_military_time',
            value: is24Hour.toString(),
        };

        cy.apiSaveUserPreference([preference]);
    });
}
