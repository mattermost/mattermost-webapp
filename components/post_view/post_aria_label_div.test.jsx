// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {mount} from 'enzyme';
import React from 'react';

import {mockStore} from 'tests/test_store';

import {TestHelper} from 'utils/test_helper';

import PostAriaLabelDiv from './post_aria_label_div';

describe('PostAriaLabelDiv', () => {
    const author = TestHelper.getUserMock({
        username: 'some_user',
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
        post: TestHelper.getPostMock({
            user_id: author.id,
            message: 'This is a test.',
        }),
    };

    test('should render aria-label in the given locale', () => {
        const {mountOptions} = mockStore(baseState);

        let wrapper = mount(<PostAriaLabelDiv {...baseProps}/>, mountOptions);
        let div = wrapper.childAt(0);

        expect(div.prop('aria-label')).toContain(author.username);
        expect(div.prop('aria-label')).toContain('January');

        wrapper = mount(<PostAriaLabelDiv {...baseProps}/>, mountOptions);
        div = wrapper.childAt(0);

        expect(div.prop('aria-label')).toContain(author.username);
        expect(div.prop('aria-label')).toContain('enero');
    });

    test('should pass other props through to the rendered div', () => {
        const {mountOptions} = mockStore(baseState);

        let props = baseProps;

        let wrapper = mount(<PostAriaLabelDiv {...props}/>, mountOptions);
        let div = wrapper.childAt(0);

        expect(div.prop('className')).toBeUndefined();
        expect(div.prop('data-something')).toBeUndefined();
        expect(div.children()).toHaveLength(0);

        props = {
            ...props,
            children: (
                <p>{'This is a paragraph.'}</p>
            ),
            className: 'some-class',
            'data-something': 'something',
        };

        wrapper = mount(<PostAriaLabelDiv {...props}/>, mountOptions);
        div = wrapper.childAt(0);

        expect(div.prop('className')).toBe('some-class');
        expect(div.prop('data-something')).toBe('something');
        expect(div.children()).toHaveLength(1);
    });
});
