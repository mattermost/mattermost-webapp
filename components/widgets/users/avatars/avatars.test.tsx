// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mount} from 'enzyme';

import Avatar from '../avatar';

import {mockStore} from 'tests/test_store';

import Avatars from './avatars';

const userActions = require('mattermost-redux/actions/users');

const users = [
    {
        url: 'test-url-1',
        username: 'jesus.espino',
        name: 'Jesus Espino',
    },
    {
        url: 'test-url-2',
        username: 'johnny.depp',
        name: 'Johnny Depp',
    },
    {
        url: 'test-url-3',
        username: 'bilbo.baggins',
        name: 'Bilbo Baggins',
    },
    {
        url: 'test-url-4',
        username: 'michael.hall',
        name: 'Anthony Michael Hall',
    },
    {
        url: 'test-url-5',
        username: 'kathy.baker',
        name: 'Kathy Baker',
    },
];

jest.mock('react-intl', () => {
    const reactIntl = jest.requireActual('react-intl');
    return {
        ...reactIntl,
        useIntl: () => reactIntl.createIntl({locale: 'en', defaultLocale: 'en', timeZone: 'Etc/UTC', textComponent: 'span'}),
    };
});

describe('components/widgets/users/Avatars', () => {
    const state = {
        entities: {
            general: {
                config: {},
            },
            users: {
                currentUserId: 'uid',
                profiles: {
                    1: {
                        id: '1',
                        username: 'jesus.espino',
                        nickname: 'nickname1',
                        first_name: 'Jesus',
                        last_name: 'Espino',
                    },
                },
            },
            teams: {
                currentTeamId: 'tid',
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    test('should support avatar-users and match snapshot', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <Avatars
                size='xl'
                users={users}
            />,
            mountOptions,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should support profile-users and fetch missing ones', () => {
        const {mountOptions} = mockStore(state);
        const spy = jest.spyOn(userActions, 'getProfilesByIds');
        const wrapper = mount(
            <Avatars
                size='xl'
                participants={[
                    {id: '1'},
                    {id: '2'},
                    {id: '3'},
                    {id: '4'},
                ]}
            />,
            mountOptions,
        );
        expect(spy).toBeCalledWith(['2', '3', '4']);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/1/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).length).toBe(1);
        expect(wrapper).toMatchSnapshot();
    });

    test('should properly count overflow', () => {
        const {mountOptions} = mockStore(state);

        const wrapper = mount(
            <Avatars
                size='xl'
                users={users}
            />,
            mountOptions,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Avatar).find({url: 'test-url-1'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: 'test-url-2'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: 'test-url-3'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: 'test-url-4'}).exists()).toBe(false);
        expect(wrapper.find(Avatar).find({url: 'test-url-5'}).exists()).toBe(false);
    });
});
