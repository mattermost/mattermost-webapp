// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';
import Sidebar from 'components/sidebar/sidebar.jsx';

jest.mock('utils/utils', () => {
    const original = require.requireActual('utils/utils');
    return {
        ...original,
        cmdOrCtrlPressed: jest.fn(),
    };
});

jest.mock('utils/browser_history', () => {
    const original = require.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

describe('component/sidebar/sidebar_channel/SidebarChannel', () => {
    const allChannels = {
        c1: {
            id: 'c1',
            display_name: 'Public test 1',
            name: 'public-test-1',
            type: Constants.OPEN_CHANNEL,
        },
        c2: {
            id: 'c2',
            display_name: 'Public test 2',
            name: 'public-test-2',
            type: Constants.OPEN_CHANNEL,
        },
        c3: {
            id: 'c3',
            display_name: 'Private test 1',
            name: 'private-test-1',
            type: Constants.PRIVATE_CHANNEL,
        },
        c4: {
            id: 'c4',
            display_name: 'Private test 2',
            name: 'private-test-2',
            type: Constants.PRIVATE_CHANNEL,
        },
        c5: {
            id: 'c5',
            display_name: 'Direct message test',
            name: 'direct-message-test',
            type: Constants.DM_CHANNEL,
        },
        c6: {
            id: 'c6',
            display_name: 'Group message test',
            name: 'group-message-test',
            type: Constants.GM_CHANNEL,
        },
    };

    const defaultProps = {
        config: {
            EnableXToLeaveChannelsFromLHS: 'false',
            SiteName: 'Test site',
        },
        isOpen: false,
        showUnreadSection: false,
        channelSwitcherOption: true,
        unreadChannelIds: [],
        orderedChannelIds: [
            {
                type: 'public',
                name: 'PUBLIC CHANNELS',
                items: ['c1', 'c2'],
            },
            {
                type: 'private',
                name: 'PRIVATE CHANNELS',
                items: ['c3', 'c4'],
            },
            {
                type: 'direct',
                name: 'DIRECT MESSAGES',
                items: ['c5', 'c6'],
            },
        ],
        currentChannel: {
            id: 'c1',
            display_name: 'Public test 1',
            name: 'public-test-1',
            type: Constants.OPEN_CHANNEL,
        },
        currentTeam: {
            id: 'team_id',
            name: 'test-team',
            display_name: 'Test team display name',
            description: 'Test team description',
            type: 'team-type',
        },
        currentUser: {
            id: 'my-user-id',
        },
        memberships: {
            c1: {
                name: 'Public test 1 membership',
            },
            c2: {
                name: 'Public test 2 membership',
            },
            c3: {
                name: 'Private test 1 membership',
            },
            c4: {
                name: 'Private test 2 membership',
            },
            c5: {
                name: 'Direct message test membership',
            },
            c6: {
                name: 'Group message test membership',
            },
        },
        unreads: {
            messageCount: 0,
            mentions: 0,
        },
        actions: {
            close: jest.fn(),
            switchToChannelById: jest.fn(),
            openModal: jest.fn(),
        },
        redirectChannel: 'default-channel',
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
    };

    test('should match snapshot, on sidebar show', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on sidebar show with favorites', () => {
        const wrapper = shallow(
            <Sidebar
                {...{
                    ...defaultProps,
                    favoriteChannelIds: ['c1', 'c3', 'c5'],
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on sidebar show with unreads', () => {
        const wrapper = shallow(
            <Sidebar
                {...{
                    ...defaultProps,
                    unreadChannelIds: ['c3', 'c5'],
                    showUnreadSection: true,
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on sidebar not show the channel switcher', () => {
        const wrapper = shallow(
            <Sidebar
                {...{
                    ...defaultProps,
                    unreadChannelIds: ['c3', 'c5'],
                    channelSwitcherOption: true,
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when render as an empty div because no have a team or a user', () => {
        let wrapper = shallow(
            <Sidebar
                {...{
                    ...defaultProps,
                    currentTeam: null,
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
        wrapper = shallow(
            <Sidebar
                {...{
                    ...defaultProps,
                    currentUser: null,
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('navigate to the next/prev channels', () => {
        const nextEvent = {
            preventDefault: jest.fn(),
            altKey: true,
            shiftKey: false,
            key: Constants.KeyCodes.DOWN[0],
            keyCode: Constants.KeyCodes.DOWN[1],
        };
        const prevEvent = {
            preventDefault: jest.fn(),
            altKey: true,
            shiftKey: false,
            key: Constants.KeyCodes.UP[0],
            keyCode: Constants.KeyCodes.UP[1],
        };

        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.updateScrollbarOnChannelChange = jest.fn();
        instance.componentDidUpdate = jest.fn();
        instance.navigateChannelShortcut({});
        expect(instance.props.actions.switchToChannelById).not.toBeCalled();
        expect(instance.updateScrollbarOnChannelChange).not.toBeCalled();

        instance.isSwitchingChannel = true;
        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).not.toBeCalled();
        expect(instance.updateScrollbarOnChannelChange).not.toBeCalled();
        instance.isSwitchingChannel = false;

        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c2');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c2');
        wrapper.setProps({currentChannel: allChannels.c2});

        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c3');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c3');
        wrapper.setProps({currentChannel: allChannels.c3});

        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c4');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c4');
        wrapper.setProps({currentChannel: allChannels.c4});

        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c5');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c5');
        wrapper.setProps({currentChannel: allChannels.c5});

        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c6');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c6');
        wrapper.setProps({currentChannel: allChannels.c6});

        instance.navigateChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c1');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c1');
        wrapper.setProps({currentChannel: allChannels.c1});

        instance.navigateChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c6');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c6');
        wrapper.setProps({currentChannel: allChannels.c6});

        instance.navigateChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c5');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c5');
        wrapper.setProps({currentChannel: allChannels.c5});

        instance.navigateChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c4');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c4');
        wrapper.setProps({currentChannel: allChannels.c4});

        instance.navigateChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c3');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c3');
        wrapper.setProps({currentChannel: allChannels.c3});

        instance.navigateChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c2');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c2');
        wrapper.setProps({currentChannel: allChannels.c2});
    });

    test('navigate to the next/prev unread channels', () => {
        const nextEvent = {
            preventDefault: jest.fn(),
            altKey: true,
            shiftKey: true,
            key: Constants.KeyCodes.DOWN[0],
            keyCode: Constants.KeyCodes.DOWN[1],
        };

        const prevEvent = {
            preventDefault: jest.fn(),
            altKey: true,
            shiftKey: true,
            key: Constants.KeyCodes.UP[0],
            keyCode: Constants.KeyCodes.UP[1],
        };

        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.updateScrollbarOnChannelChange = jest.fn();
        instance.updateUnreadIndicators = jest.fn();
        instance.componentDidUpdate = jest.fn();
        wrapper.setProps({unreadChannelIds: ['c3', 'c6']});

        instance.navigateUnreadChannelShortcut({});
        expect(instance.updateScrollbarOnChannelChange).not.toBeCalled();
        expect(instance.props.actions.switchToChannelById).not.toBeCalled();

        instance.isSwitchingChannel = true;
        instance.navigateUnreadChannelShortcut(nextEvent);
        expect(instance.updateScrollbarOnChannelChange).not.toBeCalled();
        expect(instance.props.actions.switchToChannelById).not.toBeCalled();
        instance.isSwitchingChannel = false;

        wrapper.setProps({unreadChannelIds: []});
        instance.navigateUnreadChannelShortcut(nextEvent);
        expect(instance.updateScrollbarOnChannelChange).not.toBeCalled();
        expect(instance.props.actions.switchToChannelById).not.toBeCalled();

        wrapper.setProps({unreadChannelIds: ['c3', 'c6']});
        instance.navigateUnreadChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c3');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c3');

        wrapper.setProps({currentChannel: allChannels.c3, unreadChannelIds: ['c6']});
        instance.navigateUnreadChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c6');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c6');

        wrapper.setProps({currentChannel: allChannels.c6, unreadChannelIds: ['c3']});
        instance.navigateUnreadChannelShortcut(nextEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c3');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c3');

        wrapper.setProps({currentChannel: allChannels.c1, unreadChannelIds: ['c3', 'c6']});
        instance.navigateUnreadChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c6');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c6');

        wrapper.setProps({currentChannel: allChannels.c6, unreadChannelIds: ['c3']});
        instance.navigateUnreadChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c3');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c3');

        wrapper.setProps({currentChannel: allChannels.c3, unreadChannelIds: ['c6']});
        instance.navigateUnreadChannelShortcut(prevEvent);
        expect(instance.props.actions.switchToChannelById).lastCalledWith('c6');
        expect(instance.updateScrollbarOnChannelChange).lastCalledWith('c6');
    });

    test('open direct channel selector on CTRL/CMD+SHIFT+K', () => {
        const utils = require.requireMock('utils/utils');
        utils.cmdOrCtrlPressed.mockImplementation(() => false);
        const ctrlShiftK = {
            preventDefault: jest.fn(),
            altKey: false,
            shiftKey: true,
            ctrlKey: true,
            key: Constants.KeyCodes.K[0],
            keyCode: Constants.KeyCodes.K[1],
        };
        const cmdShiftK = {
            preventDefault: jest.fn(),
            altKey: false,
            shiftKey: true,
            metaKey: true,
            key: Constants.KeyCodes.K[0],
            keyCode: Constants.KeyCodes.K[1],
        };

        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.handleOpenMoreDirectChannelsModal = jest.fn();
        expect(instance.handleOpenMoreDirectChannelsModal).not.toBeCalled();

        instance.navigateChannelShortcut(ctrlShiftK);
        expect(instance.handleOpenMoreDirectChannelsModal).not.toBeCalled();

        utils.cmdOrCtrlPressed.mockImplementation(() => true);
        instance.navigateChannelShortcut(cmdShiftK);
        expect(instance.handleOpenMoreDirectChannelsModal).toBeCalled();

        instance.navigateChannelShortcut(ctrlShiftK);
        expect(instance.handleOpenMoreDirectChannelsModal).toHaveBeenCalledTimes(2);
    });

    test('set correctly the title when needed', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.updateTitle();
        instance.componentDidUpdate = jest.fn();
        instance.render = jest.fn();
        expect(document.title).toBe('Public test 1 - Test team display name Test site');
        wrapper.setProps({config: {SiteName: null}});
        instance.updateTitle();
        expect(document.title).toBe('Public test 1 - Test team display name');
        wrapper.setProps({currentChannel: {type: Constants.DM_CHANNEL}, currentTeammate: {display_name: 'teammate'}});
        instance.updateTitle();
        expect(document.title).toBe('teammate - Test team display name');
        wrapper.setProps({unreads: {mentionCount: 3, messageCount: 4}});
        instance.updateTitle();
        expect(document.title).toBe('(3) * teammate - Test team display name');
    });

    test('should show/hide correctly more channels modal', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.componentDidUpdate = jest.fn();
        instance.showMoreChannelsModal();
        wrapper.setState(instance.state);
        expect(wrapper).toMatchSnapshot();
        instance.hideMoreChannelsModal();
        wrapper.setState(instance.state);
        expect(wrapper).toMatchSnapshot();
    });

    test('should show/hide correctly new channel modal', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.componentDidUpdate = jest.fn();
        instance.showNewChannelModal(Constants.PRIVATE_CHANNEL);
        wrapper.setState(instance.state);
        expect(wrapper).toMatchSnapshot();
        instance.hideNewChannelModal();
        wrapper.setState(instance.state);
        expect(wrapper).toMatchSnapshot();
    });

    test('should show/hide correctly more direct channels modal', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.componentDidUpdate = jest.fn();
        instance.showMoreDirectChannelsModal([]);
        wrapper.setState(instance.state);
        expect(wrapper).toMatchSnapshot();
        instance.hideMoreDirectChannelsModal();
        wrapper.setState(instance.state);
        expect(wrapper).toMatchSnapshot();
    });

    test('should verify if the channel is displayed for props', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        expect(instance.channelIdIsDisplayedForProps(instance.props.orderedChannelIds, 'c1')).toBe(true);
        expect(instance.channelIdIsDisplayedForProps(instance.props.orderedChannelIds, 'c9')).toBe(false);
    });

    test('should handle correctly open more direct channels toggle', () => {
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.showMoreDirectChannelsModal = jest.fn();
        instance.hideMoreDirectChannelsModal = jest.fn();

        instance.setState({showDirectChannelsModal: true});
        instance.handleOpenMoreDirectChannelsModal({preventDefault: jest.fn()});
        expect(instance.hideMoreDirectChannelsModal).toBeCalled();
        expect(instance.showMoreDirectChannelsModal).not.toBeCalled();

        instance.setState({showDirectChannelsModal: false});
        instance.handleOpenMoreDirectChannelsModal({preventDefault: jest.fn()});
        expect(instance.showMoreDirectChannelsModal).toBeCalled();
    });

    test('should listen/unlisten keydown events', () => {
        document.addEventListener = jest.fn();
        document.removeEventListener = jest.fn();
        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();

        expect(document.addEventListener).toHaveBeenCalledTimes(2);
        expect(document.removeEventListener).not.toBeCalled();
        instance.componentWillUnmount();
        expect(document.removeEventListener).toHaveBeenCalledTimes(2);
    });

    test('should display correct favicon', () => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.sizes = '16x16';
        document.head.appendChild(link);

        const wrapper = shallow(
            <Sidebar {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.updateFavicon = jest.fn();

        wrapper.setProps({unreads: {mentionCount: 3, messageCount: 4}});
        expect(instance.updateFavicon).lastCalledWith(true);

        wrapper.setProps({unreads: {mentionCount: 0, messageCount: 4}});
        expect(instance.updateFavicon).lastCalledWith(false);
    });
});
