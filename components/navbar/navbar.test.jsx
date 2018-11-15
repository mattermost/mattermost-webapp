// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Navbar from 'components/navbar/navbar.jsx';

jest.mock('utils/browser_history', () => {
    const original = require.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

describe('components/navbar/Navbar', () => {
    const baseProps = {
        teamDisplayName: 'team_display_name',
        isPinnedPosts: true,
        actions: {
            closeLhs: jest.fn(),
            closeRhs: jest.fn(),
            closeRhsMenu: jest.fn(),
            leaveChannel: jest.fn(),
            markFavorite: jest.fn(),
            showPinnedPosts: jest.fn(),
            toggleLhs: jest.fn(),
            toggleRhsMenu: jest.fn(),
            unmarkFavorite: jest.fn(),
            updateChannelNotifyProps: jest.fn(),
            updateRhsState: jest.fn(),
        },
        isLicensed: true,
        isFavoriteChannel: false,
    };

    const validState = {
        channel: {type: 'O', id: 'channel_id', display_name: 'display_name', team_id: 'team_id'},
        member: {id: 'member_id'},
        users: [{id: 'user_id_1'}],
        currentUser: {id: 'current_user_id'},
    };

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

    test('should match snapshot, for default channel', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        const channel = {type: 'O', id: '123', name: 'town-square', display_name: 'Town Square', team_id: 'team_id'};
        wrapper.setState({...validState, channel});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if not licensed', () => {
        const wrapper = shallow(
            <Navbar
                {...baseProps}
                isLicensed={false}
            />
        );

        wrapper.setState(validState);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, for DM channel', () => {
        const wrapper = shallow(
            <Navbar
                {...baseProps}
            />
        );

        const newValidState = {...validState, channel: {type: 'D', id: 'channel_id', name: 'user_id_1__user_id_2', display_name: 'display_name', team_id: 'team_id'}};
        wrapper.setState(newValidState);
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

    test('should match snapshot, renderEditChannelHeaderOption', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        const editChannelHeaderOption = wrapper.instance().renderEditChannelHeaderOption(wrapper.state('channel'));

        expect(editChannelHeaderOption).toMatchSnapshot();
    });

    test('should match state when corresponding function is called', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

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
    });

    test('should toggle favorite channel', () => {
        const wrapper = shallow(
            <Navbar {...baseProps}/>
        );

        const event = {
            preventDefault: jest.fn(),
        };

        wrapper.setState(validState);
        wrapper.instance().toggleFavorite(event);
        expect(wrapper.instance().props.actions.markFavorite).toBeCalled();

        wrapper.setProps({isFavoriteChannel: true});
        wrapper.instance().toggleFavorite(event);
        expect(wrapper.instance().props.actions.unmarkFavorite).toBeCalled();
    });

    test('should leave public channel', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                leaveChannel: jest.fn().mockImplementation(() => {
                    const data = true;

                    return Promise.resolve({data});
                }),
            },
        };

        const channel = {
            id: 'channel-1',
            name: 'test-channel-1',
            display_name: 'Test Channel 1',
            type: 'O',
            team_id: 'team-1',
        };

        const wrapper = shallow(
            <Navbar {...props}/>
        );

        wrapper.setState({channel});
        wrapper.instance().handleLeave();
        expect(wrapper.instance().props.actions.leaveChannel).toHaveBeenCalledTimes(1);
    });
});
