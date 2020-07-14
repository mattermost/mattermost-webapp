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
            sidebarBg: '#4d394b',
            sidebarText: '#ffffff',
            sidebarUnreadText: '#ffffff',
            sidebarTextHoverBg: '#3e313c',
            sidebarTextActiveBorder: '#4c9689',
            sidebarTextActiveColor: '#ffffff',
            sidebarHeaderBg: '#3e313c',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#38978d',
            awayIndicator: '#ffbc42',
            dndIndicator: '#f74343',
            mentionBg: '#eb4d5c',
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

        const themeString = '#4d394b,#3e313c,#4c9689,#ffffff,#3e313c,#ffffff,#38978d,#eb4d5c';
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
