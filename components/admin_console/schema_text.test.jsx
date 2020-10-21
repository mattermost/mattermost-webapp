// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import SchemaText from './schema_text';

describe('SchemaText', () => {
    const baseProps = {
        isMarkdown: false,
        isTranslated: false,
        text: 'This is help text',
    };

    test('should render plain text correctly', () => {
        const wrapper = shallow(<SchemaText {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render markdown text correctly', () => {
        const props = {
            ...baseProps,
            isMarkdown: true,
            text: 'This is **HELP TEXT**',
        };

        const wrapper = shallow(<SchemaText {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render translated text correctly', () => {
        const props = {
            ...baseProps,
            isTranslated: true,
            text: 'help.text',
            textDefault: 'This is {object}',
            textValues: {
                object: 'help text',
            },
        };

        const wrapper = shallow(<SchemaText {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render translated markdown text correctly', () => {
        const props = {
            ...baseProps,
            isMarkdown: true,
            isTranslated: true,
            text: 'help.text.markdown',
            textDefault: 'This is [{object}](https://example.com)',
            textValues: {
                object: 'a help link',
            },
        };

        const wrapper = shallow(<SchemaText {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should open most links in the current window like FormattedMarkdownMessage', () => {
        const props = {
            ...baseProps,
            isMarkdown: true,
            text: 'This is [a link](https://example.com)',
        };

        const wrapper = shallow(<SchemaText {...props}/>);

        expect(wrapper.find('span').prop('dangerouslySetInnerHTML')).toEqual({
            __html: 'This is <a href="https://example.com">a link</a>',
        });
    });

    test('should support explicit external links like FormattedMarkdownMessage', () => {
        const props = {
            ...baseProps,
            isMarkdown: true,
            text: 'This is [a link](!https://example.com)',
        };

        const wrapper = shallow(<SchemaText {...props}/>);

        expect(wrapper.find('span').prop('dangerouslySetInnerHTML')).toEqual({
            __html: 'This is <a href="https://example.com" rel="noopener noreferrer" target="_blank">a link</a>',
        });
    });
});
