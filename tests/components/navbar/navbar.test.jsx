// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Navbar from 'components/navbar/navbar.jsx';

describe('components/navbar/Navbar', () => {
    const baseProps = {
        teamDisplayName: 'team_display_name',
        isPinnedPosts: true,
        actions: {
            showEditChannelHeaderModal: jest.fn()
        }
    };

    const validState = {
        channel: {type: 'O', id: 'channel_id', display_name: 'display_name', team_id: 'team_id'},
        member: {id: 'member_id'},
        users: [{id: 'user_id_1'}],
        currentUser: {id: 'current_user_id'}
    };

    global.window.mm_license = {};
    global.window.mm_config = {};

    beforeEach(() => {
        global.window.mm_license.IsLicensed = 'true';
        global.window.mm_config.EnableWebrtc = 'true';
    });

    afterEach(() => {
        global.window.mm_license = {};
        global.window.mm_config = {};
    });

    test('should match snapshot, invalid state', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, valid state', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        wrapper.setState(validState);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if not licensed', () => {
        global.window.mm_license.IsLicensed = 'false';
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        wrapper.setState(validState);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if enabled WebRTC and DM channel', () => {
        global.window.mm_config.EnableWebrtc = 'true';
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        const newValidState = {...validState, channel: {type: 'D', id: 'channel_id', name: 'user_id_1__user_id_2', display_name: 'display_name', team_id: 'team_id'}};
        wrapper.setState(newValidState);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if WebRTC is not enabled', () => {
        global.window.mm_config.EnableWebrtc = 'false';
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        wrapper.setState(validState);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, for private channel', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        const newValidState = {...validState, channel: {type: 'P', id: 'channel_id', display_name: 'display_name', team_id: 'team_id'}};
        wrapper.setState(newValidState);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when corresponding function is called', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        wrapper.setState({showEditChannelHeaderModal: false});
        wrapper.instance().showEditChannelHeaderModal();
        expect(wrapper.state('showEditChannelHeaderModal')).toEqual(true);
        wrapper.instance().hideEditChannelHeaderModal();
        expect(wrapper.state('showEditChannelHeaderModal')).toEqual(false);

        wrapper.setState({showEditChannelPurposeModal: false});
        wrapper.instance().showChannelPurposeModal();
        expect(wrapper.state('showEditChannelPurposeModal')).toEqual(true);
        wrapper.instance().hideChannelPurposeModal();
        expect(wrapper.state('showEditChannelPurposeModal')).toEqual(false);

        wrapper.setState({showRenameChannelModal: false});
        wrapper.instance().showRenameChannelModal();
        expect(wrapper.state('showRenameChannelModal')).toEqual(true);
        wrapper.instance().hideRenameChannelModal();
        expect(wrapper.state('showRenameChannelModal')).toEqual(false);

        wrapper.setState({showMembersModal: false});
        wrapper.instance().showMembersModal({preventDefault: jest.fn()});
        expect(wrapper.state('showMembersModal')).toEqual(true);
        wrapper.instance().hideMembersModal();
        expect(wrapper.state('showMembersModal')).toEqual(false);

        wrapper.setState({showQuickSwitchModal: false, quickSwitchMode: 'channel'});
        wrapper.instance().toggleQuickSwitchModal('other_mode');
        expect(wrapper.state('showQuickSwitchModal')).toEqual(true);
        expect(wrapper.state('quickSwitchMode')).toEqual('other_mode');
        wrapper.instance().toggleQuickSwitchModal();
        expect(wrapper.state('showQuickSwitchModal')).toEqual(false);
        expect(wrapper.state('quickSwitchMode')).toEqual('channel');

        wrapper.setState({showQuickSwitchModal: true, quickSwitchMode: 'other_mode'});
        wrapper.instance().hideQuickSwitchModal();
        expect(wrapper.state('showQuickSwitchModal')).toEqual(false);
        expect(wrapper.state('quickSwitchMode')).toEqual('channel');

        wrapper.setState({isBusy: false});
        wrapper.instance().onBusy(true);
        expect(wrapper.state('isBusy')).toEqual(true);
        wrapper.instance().onBusy(false);
        expect(wrapper.state('isBusy')).toEqual(false);
    });
});
