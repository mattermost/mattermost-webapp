// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {mount} from 'enzyme';
import React from 'react';

import {mockStore} from 'tests/test_store';

import {TestHelper} from 'utils/test_helper';

import LatestPostReader from './latest_post_reader';

describe('LatestPostReader', () => {
    const author = TestHelper.getUserMock({
        username: 'some_user',
    });

    const post = TestHelper.getPostMock({
        user_id: author.id,
        message: 'This is a test.',
    });

    const baseState = {
        entities: {
            emojis: {
                customEmoji: {},
            },
            general: {
                config: {},
            },
            posts: {
                posts: {
                    [post.id]: post,
                },
                reactions: {},
            },
            preferences: {
                myPreferences: {},
            },
            users: {
                profiles: {
                    [author.id]: author,
                },
            },
        },
    };

    const baseProps = {
        postIds: [post.id],
    };

    test('should render aria-label as a child in the default locale', () => {
        const {mountOptions} = mockStore(baseState);

        const wrapper = mount(<LatestPostReader {...baseProps}/>, mountOptions);
        const span = wrapper.childAt(0);

        expect(span.prop('children')).toContain(author.username);
        expect(span.prop('children')).toContain('January');
    });

    test('should render aria-label as a child in the given locale', () => {
        jest.mock('react-intl', () => {
            const reactIntl = jest.requireActual('react-intl');
            const esMessages = require('i18n/es.json');

            const intl = reactIntl.createIntl({
                locale: 'es',
                messages: esMessages,
                defaultLocale: 'es',
            });

            return {
                ...reactIntl,
                useIntl: () => intl,
            };
        });

        const {mountOptions} = mockStore(baseState);

        const wrapper = mount(<LatestPostReader {...baseProps}/>, mountOptions);
        const span = wrapper.childAt(0);

        expect(span.prop('children')).toContain(author.username);
        expect(span.prop('children')).toContain('enero');
    });
});
