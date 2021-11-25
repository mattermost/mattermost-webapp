// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from 'types/store';
import {UserTimezone} from 'mattermost-redux/types/users';

import {PreferenceType} from 'mattermost-redux/types/preferences';

import {doMapStateToProps, mapStateToProps} from './index';

describe('mapStateToProps + doMapStateToProps', () => {
    const currentUserId = 'user-id';

    const initialState = {
        entities: {
            general: {
                config: {
                    ExperimentalTimezone: 'true',
                },
            },
            preferences: {
                myPreferences: {},
            },
            users: {
                currentUserId,
                profiles: {
                    [currentUserId]: {
                        id: currentUserId,
                    },
                },
            },
        },
    } as unknown as GlobalState;

    describe('hourCycle', () => {
        test('hourCycle should be h12 when military time is false and the prop was not set', () => {
            const props = mapStateToProps(initialState, {});
            expect(props.hourCycle).toBe('h12');
        });

        test('hourCycle should be h23 when military time is true and the prop was not set', () => {
            const testState = {...initialState};
            testState.entities.preferences.myPreferences['display_settings--use_military_time'] = {
                category: 'display_settings',
                name: 'use_military_time',
                user_id: currentUserId,
                value: 'true',
            } as PreferenceType;

            const props = mapStateToProps(testState, {});
            expect(props.hourCycle).toBe('h23');
        });

        test('hourCycle should have the value of prop.hourCycle when given', () => {
            const testState = {...initialState};
            testState.entities.preferences.myPreferences['display_settings--use_military_time'] = {
                category: 'display_settings',
                name: 'use_military_time',
                user_id: currentUserId,
                value: 'true',
            } as PreferenceType;

            const props = mapStateToProps(testState, {hourCycle: 'h24'});
            expect(props.hourCycle).toBe('h24');
        });
    });

    describe('timeZone', () => {
        test('timeZone should be the user TZ when the prop was not set', () => {
            const testState = {...initialState};
            testState.entities.users.profiles[currentUserId].timezone = {
                useAutomaticTimezone: false,
                manualTimezone: 'Europe/Paris',
            } as UserTimezone;

            const props = mapStateToProps(testState, {});
            expect(props.timeZone).toBe('Europe/Paris');
        });

        test('timeZone should be the value of prop.timeZone when given', () => {
            const testState = {...initialState};
            testState.entities.users.profiles[currentUserId].timezone = {
                useAutomaticTimezone: false,
                manualTimezone: 'Europe/Paris',
            } as UserTimezone;

            const props = mapStateToProps(testState, {timeZone: 'America/Phoenix'});
            expect(props.timeZone).toBe('America/Phoenix');
        });

        test('timeZone should be the value of prop.timeZone when given, even when timezone are disabled', () => {
            const testState = {...initialState};
            testState.entities.general.config.ExperimentalTimezone = 'false';

            const props = mapStateToProps(testState, {timeZone: 'America/Chicago'});
            expect(props.timeZone).toBe('America/Chicago');
        });
    });

    describe('hour12', () => {
        test('hour12 should be false when using military time', () => {
            const testState = {...initialState};
            testState.entities.preferences.myPreferences['display_settings--use_military_time'] = {
                category: 'display_settings',
                name: 'use_military_time',
                user_id: currentUserId,
                value: 'true',
            } as PreferenceType;

            const props = doMapStateToProps(testState, {}, false);
            expect(props.hour12).toBe(false);
        });

        test('hour12 should be true when not using military time', () => {
            const testState = {...initialState};
            testState.entities.preferences.myPreferences['display_settings--use_military_time'] = {
                category: 'display_settings',
                name: 'use_military_time',
                user_id: currentUserId,
                value: 'false',
            } as PreferenceType;

            const props = doMapStateToProps(testState, {}, false);
            expect(props.hour12).toBe(true);
        });

        test('hour12 should equal props.hour12 when defined', () => {
            const testState = {...initialState};
            testState.entities.preferences.myPreferences['display_settings--use_military_time'] = {
                category: 'display_settings',
                name: 'use_military_time',
                user_id: currentUserId,
                value: 'false',
            } as PreferenceType;

            const props = doMapStateToProps(testState, {hour12: false}, false);

            // this would return true if the prop was not set
            expect(props.hour12).toBe(false);
        });
    });
});
