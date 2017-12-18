// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import * as Utils from 'utils/utils';
import Constants from 'utils/constants';
import * as actions from 'actions/channel_actions';

import NewChannelFlow from 'components/new_channel_flow';

describe('components/NewChannelFlow', () => {
    global.window.mm_license = {};
    global.window.mm_config = {};

    beforeEach(() => {
        global.window.mm_license.IsLicensed = 'false';
    });

    afterEach(() => {
        global.window.mm_license = {};
        global.window.mm_config = {};
    });

    const baseProps = {
        show: true,
        channelType: Constants.OPEN_CHANNEL,
        onModalDismissed: jest.fn()
    };

    test('should match snapshot, with base props', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when channelDataChanged is called', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );
        const data = {displayName: 'name', purpose: 'purpose', header: 'header'};
        wrapper.instance().channelDataChanged(data);

        expect(wrapper.state('channelDisplayName')).toEqual(data.displayName);
        expect(wrapper.state('channelPurpose')).toEqual(data.purpose);
        expect(wrapper.state('channelHeader')).toEqual(data.header);
    });

    test('should match state when urlChangeDismissed is called', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );
        wrapper.instance().urlChangeDismissed();

        expect(wrapper.state('flowState')).toEqual(Constants.SHOW_NEW_CHANNEL);
    });

    test('should match state when urlChangeSubmitted is called', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );
        const newUrl = 'example.com';
        wrapper.instance().urlChangeSubmitted(newUrl);

        expect(wrapper.state('flowState')).toEqual(Constants.SHOW_NEW_CHANNEL);
        expect(wrapper.state('serverError')).toEqual(null);
        expect(wrapper.state('channelName')).toEqual(newUrl);
        expect(wrapper.state('nameModified')).toEqual(true);
    });

    test('should match state when urlChangeRequested is called', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.instance().urlChangeRequested({preventDefault: jest.fn()});
        expect(wrapper.state('flowState')).toEqual(Constants.SHOW_EDIT_URL);
    });

    test('should match state when typeSwitched is called, with state switched from OPEN_CHANNEL', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.instance().typeSwitched({preventDefault: jest.fn()});
        expect(wrapper.state('channelType')).toEqual(Constants.PRIVATE_CHANNEL);
    });

    test('should match state when typeSwitched is called, with state switched from PRIVATE_CHANNEL', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.setState({channelType: Constants.PRIVATE_CHANNEL});
        wrapper.instance().typeSwitched({preventDefault: jest.fn()});
        expect(wrapper.state('channelType')).toEqual(Constants.OPEN_CHANNEL);
    });

    test('should match state when onModalExited is called', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.instance().typeSwitched({preventDefault: jest.fn()});
        expect(wrapper.state('channelType')).toEqual(Constants.PRIVATE_CHANNEL);
    });

    test('should match state when onSubmit is called with invalid channelDisplayName', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.instance().onSubmit();
        expect(wrapper.state('serverError')).toEqual(Utils.localizeMessage('channel_flow.invalidName', 'Invalid Channel Name'));
    });

    test('should call createChannel when onSubmit is called with valid channelDisplayName', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );
        actions.createChannel = jest.fn();

        wrapper.setState({channelDisplayName: 'example'});
        wrapper.instance().onSubmit();
        expect(actions.createChannel).toHaveBeenCalled();
    });

    test('should not call doOnModalExited when onModalExited is called with doOnModalExited undefined', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.instance().onModalExited();
        expect(typeof wrapper.instance().doOnModalExited).toEqual('undefined');
    });

    test('should call doOnModalExited when onModalExited is called with doOnModalExited defined', () => {
        const wrapper = shallow(
            <NewChannelFlow {...baseProps}/>
        );

        wrapper.instance().doOnModalExited = jest.fn();
        wrapper.instance().onModalExited();
        expect(typeof wrapper.instance().doOnModalExited).not.toEqual('undefined');
        expect(wrapper.instance().doOnModalExited).toHaveBeenCalledTimes(1);
    });
});
