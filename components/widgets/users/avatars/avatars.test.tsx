// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mount} from 'enzyme';

import Avatar from '../avatar';

import {mockStore} from 'tests/test_store';

import Avatars from './avatars';

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
                        username: 'first.last1',
                        nickname: 'nickname1',
                        first_name: 'First1',
                        last_name: 'Last1',
                    },
                    2: {
                        id: '2',
                        username: 'first.last2',
                        nickname: 'nickname2',
                        first_name: 'First2',
                        last_name: 'Last2',
                    },
                    3: {
                        id: '3',
                        username: 'first.last3',
                        nickname: 'nickname3',
                        first_name: 'First3',
                        last_name: 'Last3',
                    },
                    4: {
                        id: '4',
                        username: 'first.last4',
                        nickname: 'nickname4',
                        first_name: 'First4',
                        last_name: 'Last4',
                    },
                    5: {
                        id: '5',
                        username: 'first.last5',
                        nickname: 'nickname5',
                        first_name: 'First5',
                        last_name: 'Last5',
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

    test('should support userIds', () => {
        const {mountOptions} = mockStore(state);
        const wrapper = mount(
            <Avatars
                size='xl'
                userIds={[
                    '1',
                    '2',
                    '3',
                ]}
            />,
            mountOptions,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/1/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/2/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/3/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).length).toBe(3);
    });

    test('should properly count overflow', () => {
        const {mountOptions} = mockStore(state);

        const wrapper = mount(
            <Avatars
                size='xl'
                userIds={[
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                ]}
            />,
            mountOptions,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/1/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/2/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/3/image?_=0'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/4/image?_=0'}).exists()).toBe(false);
        expect(wrapper.find(Avatar).find({url: '/api/v4/users/5/image?_=0'}).exists()).toBe(false);
    });
});
