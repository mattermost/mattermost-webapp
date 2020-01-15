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
        // # Login as user-1
        cy.apiLogin('user-1');

        // # Create and visit new channel
        cy.createAndVisitNewChannel().then((channel) => {
            // # Post messages from the past and now
            [
                Date.UTC(2020, 0, 5, 4, 30), // Jan 5, 2020 4:30am
                Date.UTC(2020, 0, 5, 12, 30), // Jan 5, 2020 4:30am
                Date.UTC(2020, 0, 5, 20, 30), // Jan 5, 2020 4:30am
            ].forEach((createAt, index) => {
                cy.postMessageAs({sender: sysadmin, message: `Hello from ${index}`, channelId: channel.id, createAt});
            });
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
        const re12Hour = /(?=.*\d{2}:\d{2} [AMP]{2})(^[0-9:\sAMP]{8}$)/; // matches 12-hour format with exact length of 8
        const re24Hour = /(?=.*\d{2}:\d{2})(^[0-9:]{5}$)/; // matches 24-hour format with exact length of 5

        [
            {
                name: 'in English',
                channelIntro: 'Beginning of Channel Test',
                locale: 'en',
                manualTimezone: 'UTC',
                localTimes: [
                    {postIndex: 0, match12hour: '4:30 AM', match24hour: '04:30'},
                    {postIndex: 1, match12hour: '12:30 PM', match24hour: '12:30'},
                    {postIndex: 2, match12hour: '8:30 PM', match24hour: '20:30'},
                ]
            },
            {
                name: 'in other locale like Spanish',
                channelIntro: 'Inicio de Channel Test',
                locale: 'es',
                manualTimezone: 'UTC',
                localTimes: [
                    {postIndex: 0, match12hour: /4:30 a\. m\./, match24hour: '4:30'},
                    {postIndex: 1, match12hour: /12:30 p\. m\./, match24hour: '12:30'},
                    {postIndex: 2, match12hour: /8:30 p\. m\./, match24hour: '20:30'},
                ]
            },
            {
                name: 'for react-intl unsupported timezone',
                channelIntro: 'Inicio de Channel Test',
                locale: 'es',
                manualTimezone: 'NZ-CHAT',
                localTimes: [
                    {postIndex: 0, match12hour: re12Hour, match24hour: re24Hour},
                    {postIndex: 1, match12hour: re12Hour, match24hour: re24Hour},
                    {postIndex: 2, match12hour: re12Hour, match24hour: re24Hour},
                ]
            },
        ].forEach((testCase) => {
            it(testCase.name, () => {
                verifyLocalizeTime(testCase);
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

function verifyPostTime(postPosition, match) {
    cy.findAllByTestId('postView').eq(postPosition).find('.post__time').within(() => {
        cy.findByText(match).should('be.visible');
    });
}

function verifyLocalizeTime({locale, manualTimezone, channelIntro, localTimes}) {
    // # Set user preference to 12-hour format
    setTo24HourTimeFormat(false);

    // # Set user locale and timezone
    setLocaleAndTimezone(locale, manualTimezone);

    // * Verify that the channel is loaded correctly based on locale
    cy.findByText(channelIntro).should('be.visible');

    // * Verify that the local time of each post is rendered in 12-hour format based on locale
    localTimes.forEach((localTime, index) => {
        verifyPostTime(index, localTime.match12hour);
    });

    // # Change user preference to 24-hour format
    setTo24HourTimeFormat(true);

    // * Verify that the local time of each post is rendered in 24-hour format based on locale
    localTimes.forEach((localTime, index) => {
        verifyPostTime(index, localTime.match24hour);
    });
}
