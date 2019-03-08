// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import HelpText from './help_text';

describe('HelpText', () => {
    const baseProps = {
        isMarkdown: false,
        isTranslated: false,
        text: 'This is help text',
    };

    test('should render plain text correctly', () => {
        const wrapper = shallow(<HelpText {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render markdown text correctly', () => {
        const props = {
            ...baseProps,
            isMarkdown: true,
            text: 'This is **HELP TEXT**',
        };

        const wrapper = shallow(<HelpText {...props}/>);

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

        const wrapper = shallow(<HelpText {...props}/>);

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

        const wrapper = shallow(<HelpText {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
