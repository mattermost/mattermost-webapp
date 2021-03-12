// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Theme} from 'mattermost-redux/types/preferences';

import {mountWithIntl, shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ImportThemeModal from './import_theme_modal';

describe('components/user_settings/ImportThemeModal', () => {
    it('should match snapshot', () => {
        const wrapper = shallowWithIntl(<ImportThemeModal/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should correctly parse a Slack theme', () => {
        const theme: Theme = {
            sidebarBg: '#1d2229',
            sidebarText: '#ffffff',
            sidebarUnreadText: '#ffffff',
            sidebarTextHoverBg: '#313843',
            sidebarTextActiveBorder: '#537aa6',
            sidebarTextActiveColor: '#ffffff',
            sidebarHeaderBg: '#0b161e',
            sidebarTeamBarBg: '#081118',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#94e864',
            awayIndicator: '#ffbc42',
            dndIndicator: '#f74343',
            mentionBg: '#78af8f',
            mentionBj: '#ffffff',
            mentionColor: '#145dbf',
            centerChannelBg: '#ffffff',
            centerChannelColor: '#3d3c40',
            newMessageSeparator: '#ff8800',
            linkColor: '#2389d7',
            buttonBg: '#166de0',
            buttonColor: '#ffffff',
            errorTextColor: '#fd5960',
            mentionHighlightBg: '#ffe577',
            mentionHighlightLink: '#166de0',
            codeTheme: 'github',
            type: 'custom',
        };

        const themeString = '#1d2229,#0b161e,#537aa6,#ffffff,#313843,#ffffff,#94e864,#78af8f,#0b161e,#ffffff';
        const wrapper = mountWithIntl(<ImportThemeModal/>);
        const instance = wrapper.instance();

        const callback = jest.fn();

        instance.setState({show: true, callback});
        wrapper.update();

        wrapper.find('input').simulate('change', {target: {value: themeString}});

        wrapper.find('#submitButton').simulate('click');

        expect(callback).toHaveBeenCalledWith(theme);
    });
});
