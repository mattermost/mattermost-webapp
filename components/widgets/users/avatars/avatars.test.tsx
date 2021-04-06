// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

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
        const wrapper = mountWithIntl(
            <Avatars
                size='xl'
                users={users}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should properly count overflow', () => {
        const wrapper = mountWithIntl(
            <Avatars
                size='xl'
                users={users}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.exists('img[src="test-url-1"]')).toBe(true);
        expect(wrapper.exists('img[src="test-url-2"]')).toBe(true);
        expect(wrapper.exists('img[src="test-url-3"]')).toBe(true);
        expect(wrapper.exists('img[src="test-url-4"]')).toBe(false);
        expect(wrapper.exists('img[src="test-url-5"]')).toBe(false);
    });
});
