// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import SidebarChannelButtonOrLinkCloseButton from './sidebar_channel_button_or_link_close_button.jsx';

describe('component/legacy_sidebar/sidebar_channel_button_or_link/SidebarChannelButtonOrLinkCloseButton', () => {
    test('should be null, on close button without handleClose', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                channelId={'test-id'}
                channelType={Constants.DM_CHANNEL}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should be null, on close button with badge', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                handleClose={jest.fn()}
                channelId={'test-id'}
                channelType={Constants.DM_CHANNEL}
                badge={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on close button with public channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                handleClose={jest.fn()}
                channelId={'test-id'}
                channelType={Constants.OPEN_CHANNEL}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on close button with private channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                handleClose={jest.fn()}
                channelId={'test-id'}
                channelType={Constants.PRIVATE_CHANNEL}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on close button with direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                handleClose={jest.fn()}
                channelId={'test-id'}
                channelType={Constants.DM_CHANNEL}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on close button with group message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                handleClose={jest.fn()}
                channelId={'test-id'}
                channelType={Constants.GM_CHANNEL}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call handleClose, on button clicked', () => {
        const mock = jest.fn();
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkCloseButton
                handleClose={mock}
                channelId={'test-id'}
                channelType={Constants.GM_CHANNEL}
            />,
        );
        expect(mock).not.toBeCalled();
        wrapper.find('.btn-close').simulate('click', {stopPropagation: jest.fn(), preventDefault: jest.fn()});
        expect(mock).toBeCalled();
    });
});
