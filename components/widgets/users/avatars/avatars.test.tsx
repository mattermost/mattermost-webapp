// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import Avatar from '../avatar';

import Avatars from './avatars';

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

describe('components/widgets/users/Avatars', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <Avatars
                size='xl'
                users={users}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should properly count overflow', () => {
        const wrapper = shallow(
            <Avatars
                size='xl'
                users={users}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Avatar).find({url: 'test-url-1'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: 'test-url-2'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: 'test-url-3'}).exists()).toBe(true);
        expect(wrapper.find(Avatar).find({url: 'test-url-4'}).exists()).toBe(false);
        expect(wrapper.find(Avatar).find({url: 'test-url-5'}).exists()).toBe(false);
    });
});
