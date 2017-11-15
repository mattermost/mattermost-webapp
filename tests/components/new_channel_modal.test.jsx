// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import Constants from 'utils/constants.jsx';

import NewChannelModal from 'components/new_channel_modal/new_channel_modal.jsx';

describe('components/NewChannelModal', () => {
    global.window.mm_license = {};
    global.window.mm_config = {};

    beforeEach(() => {
        global.window.mm_license.IsLicensed = 'false';
    });

    afterEach(() => {
        global.window.mm_license = {};
        global.window.mm_config = {};
    });

    const channelData = {name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''};
    const baseProps = {
        show: true,
        channelType: Constants.OPEN_CHANNEL,
        channelData,
        onSubmitChannel: jest.fn(),
        onModalDismissed: jest.fn(),
        onTypeSwitched: jest.fn(),
        onChangeURLPressed: jest.fn(),
        onDataChanged: jest.fn()
    };

    test('should match snapshot, modal not showing', () => {
        const props = {...baseProps, show: false};
        const wrapper = shallow(
            <NewChannelModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(false);
    });

    test('should match snapshot, modal showing', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, private channel filled in header and purpose', () => {
        const newChannelData = {name: 'testchannel', displayName: 'testchannel', header: 'some header', purpose: 'some purpose'};
        const props = {...baseProps, channelData: newChannelData, channelType: Constants.PRIVATE_CHANNEL};

        const wrapper = shallow(
            <NewChannelModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on displayNameError', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>
        );
        wrapper.setState({displayNameError: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on serverError', () => {
        const props = {...baseProps, serverError: 'server error'};
        const wrapper = shallow(
            <NewChannelModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match when handleChange is called', () => {
        const newOnDataChanged = jest.fn();
        const props = {...baseProps, onDataChanged: newOnDataChanged};
        const wrapper = mountWithIntl(
            <NewChannelModal {...props}/>
        );

        const refDisplayName = wrapper.ref('display_name');
        refDisplayName.value = 'new display_name';

        const refChannelHeader = wrapper.ref('channel_header');
        refChannelHeader.value = 'new channel_header';

        const refChannelPurpose = wrapper.ref('channel_purpose');
        refChannelPurpose.value = 'new channel_purpose';

        wrapper.instance().handleChange();

        expect(newOnDataChanged).toHaveBeenCalledTimes(1);
        expect(newOnDataChanged).toHaveBeenCalledWith({displayName: 'new display_name', header: 'new channel_header', purpose: 'new channel_purpose'});
    });

    test('should match when handleSubmit is called', () => {
        const newOnSubmitChannel = jest.fn();
        const props = {...baseProps, onSubmitChannel: newOnSubmitChannel};
        const wrapper = mountWithIntl(
            <NewChannelModal {...props}/>
        );
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});

        expect(newOnSubmitChannel).toHaveBeenCalledTimes(1);
        expect(wrapper.state('displayNameError')).toEqual('');
    });

    test('should have called handleSubmit on onEnterKeyDown', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>
        );
        wrapper.instance().handleSubmit = jest.fn();

        let evt = {ctrlSend: true, keyCode: Constants.KeyCodes.ENTER, ctrlKey: true};
        wrapper.instance().onEnterKeyDown(evt);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledWith(evt);

        evt = {ctrlSend: false, keyCode: Constants.KeyCodes.ENTER, shiftKey: false, altKey: false};
        wrapper.instance().onEnterKeyDown(evt);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledTimes(2);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledWith(evt);
    });
});
