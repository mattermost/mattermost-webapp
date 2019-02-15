// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Markdown from 'components/markdown/markdown';

describe('components/Markdown', () => {
    const baseProps = {
        channelNamesMap: {},
        enableFormatting: true,
        mentionKeys: [],
        message: 'This _is_ some **Markdown**',
        siteURL: 'https://markdown.example.com',
        team: {name: 'yourteamhere'},
        hasImageProxy: false,
        minimumHashtagLength: 3,
        metadata: {},
    };

    test('should render properly', () => {
        const wrapper = shallow(
            <Markdown {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render markdown when formatting is disabled', () => {
        const props = {
            ...baseProps,
            enableFormatting: false,
        };

        const wrapper = shallow(
            <Markdown {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
