// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ChannelHeaderDropdown from './channel_header_dropdown_items.js';

describe('components/ChannelHeaderDropdown', () => {
    const defaultProps = {
        user: {id: 'test-user-id'},
        channel: {id: 'test-channel-id'},
        isDefault: false,
        isFavorite: false,
        isReadonly: false,
        isMuted: false,
        isArchived: false,
        isMobile: false,
        penultimateViewedChannelName: 'test-channel',
        pluginMenuItems: [],
    };

    test('should match snapshot with no plugin items', () => {
        const wrapper = shallowWithIntl(<ChannelHeaderDropdown {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with plugins', () => {
        const props = {
            ...defaultProps,
            pluginMenuItems: [
                {id: 'plugin-1', action: jest.fn(), text: 'plugin-1-text'},
                {id: 'plugin-2', action: jest.fn(), text: 'plugin-2-text'},
            ],
        };
        const wrapper = shallowWithIntl(<ChannelHeaderDropdown {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
