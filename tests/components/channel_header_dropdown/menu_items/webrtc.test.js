// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import General from 'mattermost-redux/constants/general';

import Webrtc from 'components/channel_header_dropdown/menu_items/webrtc/webrtc';
import {Constants} from 'utils/constants';

jest.mock('utils/utils', () => ({
    isUserMediaAvailable: jest.fn().mockReturnValue(true),
}));

jest.mock('actions/webrtc_actions', () => ({
    initWebrtc: jest.fn(),
}));

describe('components/ChannelHeaderDropdown/MenuItem.Webrtc', () => {
    const baseProps = {
        channel: {
            type: Constants.DM_CHANNEL,
        },
        teammateId: 'user_id',
        teammateStatus: General.ONLINE,
        isWebrtcEnabled: true,
        isWebrtcBusy: false,
        actions: {
            closeRightHandSide: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<Webrtc {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel is not DM', () => {
        const props = {
            ...baseProps,
            channel: {
                type: Constants.OPEN_CHANNEL,
            },
        };
        const wrapper = shallow(<Webrtc {...props}/>);

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the user media is not available', () => {
        const props = baseProps;
        const {isUserMediaAvailable} = require('utils/utils');
        isUserMediaAvailable.mockReturnValueOnce(false);

        const wrapper = shallow(<Webrtc {...props}/>);

        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should runs initWebrtc and closeRHS function only if the contact to teammate is available', () => {
        const props = baseProps;
        const wrapper = shallow(<Webrtc {...props}/>);
        wrapper.find('button').simulate('click');

        expect(props.actions.closeRightHandSide).toHaveBeenCalled();

        const {initWebrtc} = require('actions/webrtc_actions');
        expect(initWebrtc).toHaveBeenCalledWith(props.teammateId, true);
    });
});
