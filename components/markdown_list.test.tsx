// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import MarkdownList from './markdown_list';

describe('MarkdownList', () => {
    const baseProps = {
        tag: 'ol'
    };

    test('should have padding of 2 characters for a 1 digit bullet', () => {
        const wrapper = shallow<MarkdownList>(
            <MarkdownList {...baseProps}>
                <>{'\n'}</>
                <li value='1'>{'one'}</li>
                <li>{'two'}</li>
                <li>{'three'}</li>
            </MarkdownList>
        );

        expect(wrapper.instance().getMaxOrdinal()).toBe(3);
        expect(wrapper.find('ol').prop('style')).toEqual({paddingLeft: '4ch'});
    });

    test('should have a padding of 5 characters for a 4 digit bullet', () => {
        const wrapper = shallow<MarkdownList>(
            <MarkdownList {...baseProps}>
                <>{'\n'}</>
                <li value='999'>{'one'}</li>
                <li>{'two'}</li>
                <li>{'three'}</li>
            </MarkdownList>
        );

        expect(wrapper.instance().getMaxOrdinal()).toBe(1001);
        expect(wrapper.find('ol').prop('style')).toEqual({paddingLeft: '7ch'});
    });

    test('should not override padding for an unordered list', () => {
        const props = {
            ...baseProps,
            tag: 'ul',
        };

        const wrapper = shallow<MarkdownList>(
            <MarkdownList {...props}>
                <>{'\n'}</>
                <li value='1'>{'one'}</li>
                <li>{'two'}</li>
                <li>{'three'}</li>
            </MarkdownList>
        );

        expect(wrapper.instance().getMaxOrdinal()).toBe(-1);
        expect(wrapper.find('ul').prop('style')).toEqual({});
    });
});
