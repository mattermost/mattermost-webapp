// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ActionResult} from 'mattermost-redux/types/actions';

import MoreChannels, {Props} from 'components/more_channels/more_channels';
import SearchableChannelList from 'components/searchable_channel_list.jsx';
import {TestHelper} from 'utils/test_helper';

jest.mock('utils/browser_history', () => {
    const original = jest.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

jest.useFakeTimers();

describe('components/MoreChannels', () => {
    const searchResults = {
        data: [{
            id: 'channel-id-1',
            name: 'channel-name-1',
            display_name: 'Channel 1',
            delete_at: 0,
        }, {
            id: 'channel-id-2',
            name: 'archived-channel',
            display_name: 'Archived',
            delete_at: 123,
        }],
    };

    const channelActions = {
        joinChannelAction: (userId: string, teamId: string, channelId: string): Promise<ActionResult> => {
            return new Promise((resolve) => {
                if (channelId !== 'channel-1') {
                    return resolve({
                        error: {
                            message: 'error',
                        },
                    });
                }

                return resolve({data: true});
            });
        },
        searchMoreChannels: (term: string): Promise<ActionResult> => {
            return new Promise((resolve) => {
                if (term === 'fail') {
                    return resolve({
                        error: {
                            message: 'error',
                        },
                    });
                }

                return resolve(searchResults);
            });
        },
    };

    const baseProps: Props = {
        channels: [TestHelper.getChannelMock({})],
        archivedChannels: [TestHelper.getChannelMock({
            id: 'channel_id_2',
            team_id: 'channel_team_2',
            display_name: 'channel-2',
            name: 'channel-2',
            header: 'channel-2-header',
            purpose: 'channel-2-purpose',
        })],
        currentUserId: 'user-1',
        teamId: 'team_id',
        teamName: 'team_name',
        channelsRequestStarted: false,
        canShowArchivedChannels: true,
        actions: {
            getChannels: jest.fn(),
            getArchivedChannels: jest.fn(),
            joinChannel: jest.fn(channelActions.joinChannelAction),
            searchMoreChannels: jest.fn(channelActions.searchMoreChannels),
            openModal: jest.fn(),
            closeModal: jest.fn(),
        },
    };

    test('should match snapshot and state', () => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('searchedChannels')).toEqual([]);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('shouldShowArchivedChannels')).toEqual(false);
        expect(wrapper.state('search')).toEqual(false);
        expect(wrapper.state('serverError')).toBeNull();
        expect(wrapper.state('searching')).toEqual(false);

        // on componentDidMount
        expect(wrapper.instance().props.actions.getChannels).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.getChannels).toHaveBeenCalledWith(wrapper.instance().props.teamId, 0, 100);
    });

    test('should match state on handleHide', () => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );
        wrapper.setState({show: true});

        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should call closeModal on handleExit', () => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.instance().handleExit();
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
    });

    test('should match state on onChange', () => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );
        wrapper.setState({searchedChannels: [TestHelper.getChannelMock({id: 'other_channel_id'})]});

        wrapper.instance().onChange(true);
        expect(wrapper.state('searchedChannels')).toEqual([]);

        // on search
        wrapper.setState({search: true});

        expect(wrapper.instance().onChange(false)).toEqual(undefined);
    });

    test('should call props.getChannels on nextPage', () => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.instance().nextPage(1);

        expect(wrapper.instance().props.actions.getChannels).toHaveBeenCalledTimes(2);
        expect(wrapper.instance().props.actions.getChannels).toHaveBeenCalledWith(wrapper.instance().props.teamId, 2, 50);
    });

    test('should have loading prop true when searching state is true', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.setState({search: true, searching: true});
        const searchList = wrapper.find(SearchableChannelList);
        expect(searchList.props().loading).toEqual(true);
    });

    test('should attempt to join the channel and fail', (done) => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                joinChannel: jest.fn().mockImplementation(() => {
                    const error = {
                        message: 'error message',
                    };

                    return Promise.resolve({error});
                }),
            },
        };

        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...props}/>,
        );

        const callback = jest.fn();
        wrapper.instance().handleJoin(baseProps.channels[0], callback);
        expect(wrapper.instance().props.actions.joinChannel).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.joinChannel).toHaveBeenCalledWith(wrapper.instance().props.currentUserId, wrapper.instance().props.teamId, baseProps.channels[0].id);
        process.nextTick(() => {
            expect(wrapper.state('serverError')).toEqual('error message');
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        });
    });

    test('should join the channel', (done) => {
        // eslint-disable-next-line global-require
        const browserHistory = require('utils/browser_history').browserHistory;
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                joinChannel: jest.fn().mockImplementation(() => {
                    const data = true;

                    return Promise.resolve({data});
                }),
            },
        };

        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...props}/>,
        );

        const callback = jest.fn();
        wrapper.instance().handleJoin(baseProps.channels[0], callback);
        expect(wrapper.instance().props.actions.joinChannel).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.joinChannel).toHaveBeenCalledWith(wrapper.instance().props.currentUserId, wrapper.instance().props.teamId, baseProps.channels[0].id);
        process.nextTick(() => {
            expect(browserHistory.push).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(wrapper.state('show')).toEqual(false);
            done();
        });
    });

    test('should not perform a search if term is empty', () => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.instance().onChange = jest.fn();
        wrapper.instance().search('');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().onChange).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().onChange).toHaveBeenCalledWith(true);
        expect(wrapper.state('search')).toEqual(false);
        expect(wrapper.state('searching')).toEqual(false);
        expect(wrapper.instance().searchTimeoutId).toEqual(0);
    });

    test('should handle a failed search', (done) => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.instance().onChange = jest.fn();
        wrapper.instance().setSearchResults = jest.fn();
        wrapper.instance().search('fail');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().onChange).not.toHaveBeenCalled();
        expect(wrapper.state('search')).toEqual(true);
        expect(wrapper.state('searching')).toEqual(true);
        expect(wrapper.instance().searchTimeoutId).not.toEqual('');
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);

        jest.runOnlyPendingTimers();
        expect(wrapper.instance().props.actions.searchMoreChannels).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.searchMoreChannels).toHaveBeenCalledWith('fail', false);
        process.nextTick(() => {
            expect(wrapper.state('search')).toEqual(true);
            expect(wrapper.state('searching')).toEqual(false);
            expect(wrapper.state('searchedChannels')).toEqual([]);
            expect(wrapper.instance().setSearchResults).not.toBeCalled();
            done();
        });
    });

    test('should perform search and set the correct state', (done) => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.instance().onChange = jest.fn();
        wrapper.instance().search('channel');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().onChange).not.toHaveBeenCalled();
        expect(wrapper.state('search')).toEqual(true);
        expect(wrapper.state('searching')).toEqual(true);
        expect(wrapper.instance().searchTimeoutId).not.toEqual('');
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);

        jest.runOnlyPendingTimers();
        expect(wrapper.instance().props.actions.searchMoreChannels).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.searchMoreChannels).toHaveBeenCalledWith('channel', false);
        process.nextTick(() => {
            expect(wrapper.state('search')).toEqual(true);
            expect(wrapper.state('searching')).toEqual(false);
            expect(wrapper.state('searchedChannels')).toEqual([searchResults.data[0]]);
            done();
        });
    });

    test('should perform search on archived channels and set the correct state', (done) => {
        const wrapper = shallow<MoreChannels>(
            <MoreChannels {...baseProps}/>,
        );

        wrapper.instance().onChange = jest.fn();
        wrapper.instance().setState({shouldShowArchivedChannels: true});
        wrapper.instance().search('channel');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().onChange).not.toHaveBeenCalled();
        expect(wrapper.state('search')).toEqual(true);
        expect(wrapper.state('searching')).toEqual(true);
        expect(wrapper.instance().searchTimeoutId).not.toEqual('');
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);

        jest.runOnlyPendingTimers();
        expect(wrapper.instance().props.actions.searchMoreChannels).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.searchMoreChannels).toHaveBeenCalledWith('channel', true);
        process.nextTick(() => {
            expect(wrapper.state('search')).toEqual(true);
            expect(wrapper.state('searching')).toEqual(false);
            expect(wrapper.state('searchedChannels')).toEqual([searchResults.data[1]]);
            done();
        });
    });
});
