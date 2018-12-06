// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MoreChannels from 'components/more_channels/more_channels.jsx';
import SearchableChannelList from 'components/searchable_channel_list.jsx';

/* eslint-disable global-require */

jest.mock('utils/browser_history', () => {
    const original = require.requireActual('utils/browser_history');
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
        joinChannelAction: (userId, teamId, channelId) => {
            return new Promise((resolve) => {
                if (channelId !== 'channel-1') {
                    return resolve({
                        error: {
                            message: 'error',
                        },
                    });
                }

                return {data: true};
            });
        },
        searchMoreChannels: (term) => {
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

    const baseProps = {
        channels: [{id: 'channel_id_1', delete_at: 0, name: 'channel-1'}],
        currentUserId: 'user-1',
        teamId: 'team_id',
        teamName: 'team_name',
        channelsRequestStarted: false,
        onModalDismissed: jest.fn(),
        handleNewChannel: jest.fn(),
        actions: {
            getChannels: jest.fn(),
            joinChannel: jest.spyOn(channelActions, 'joinChannelAction'),
            searchMoreChannels: jest.spyOn(channelActions, 'searchMoreChannels'),
        },
    };

    test('should match snapshot and state', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('searchedChannels')).toEqual([]);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('search')).toEqual(false);
        expect(wrapper.state('serverError')).toBeNull();
        expect(wrapper.state('searching')).toEqual(false);

        // on componentDidMount
        expect(wrapper.instance().props.actions.getChannels).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().props.actions.getChannels).toHaveBeenCalledWith(wrapper.instance().props.teamId, 0, 100);
    });

    test('should match state on handleHide', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );
        wrapper.setState({show: true});
        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should call props.onModalDismissed on handleExit', () => {
        const props = {...baseProps, onModalDismissed: jest.fn()};
        const wrapper = shallow(
            <MoreChannels {...props}/>
        );

        wrapper.instance().handleExit();
        expect(props.onModalDismissed).toHaveBeenCalledTimes(1);
        expect(props.onModalDismissed).toHaveBeenCalledWith();
    });

    test('should match state on onChange', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );
        wrapper.setState({searchedChannels: [{id: 'other_channel_id'}]});
        wrapper.instance().onChange();
        expect(wrapper.state('searchedChannels')).toEqual([]);

        // on search
        wrapper.setState({search: true});
        expect(wrapper.instance().onChange(false)).toEqual();
    });

    test('should call props.getChannels on nextPage', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.nextPage(1);

        expect(instance.props.actions.getChannels).toHaveBeenCalledTimes(2);
        expect(instance.props.actions.getChannels).toHaveBeenCalledWith(instance.props.teamId, 2, 50);
    });

    test('should have loading prop true when searching state is true', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
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

        const wrapper = shallow(
            <MoreChannels {...props}/>
        );

        const instance = wrapper.instance();
        const callback = jest.fn();
        instance.handleJoin(baseProps.channels[0], callback);
        expect(instance.props.actions.joinChannel).toHaveBeenCalledTimes(1);
        expect(instance.props.actions.joinChannel).toHaveBeenCalledWith(instance.props.currentUserId, instance.props.teamId, baseProps.channels[0].id);
        process.nextTick(() => {
            expect(wrapper.state('serverError')).toEqual('error message');
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        });
    });

    test('should join the channel', (done) => {
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

        const wrapper = shallow(
            <MoreChannels {...props}/>
        );

        const instance = wrapper.instance();
        const callback = jest.fn();
        instance.handleJoin(baseProps.channels[0], callback);
        expect(instance.props.actions.joinChannel).toHaveBeenCalledTimes(1);
        expect(instance.props.actions.joinChannel).toHaveBeenCalledWith(instance.props.currentUserId, instance.props.teamId, baseProps.channels[0].id);
        process.nextTick(() => {
            expect(browserHistory.push).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(wrapper.state('show')).toEqual(false);
            done();
        });
    });

    test('should not perform a search if term is empty', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.onChange = jest.fn();
        instance.search('');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(instance.onChange).toHaveBeenCalledTimes(1);
        expect(instance.onChange).toHaveBeenCalledWith(true);
        expect(wrapper.state('search')).toEqual(false);
        expect(wrapper.state('searching')).toEqual(false);
        expect(instance.searchTimeoutId).toEqual('');
    });

    test('should handle a failed search', (done) => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.onChange = jest.fn();
        instance.setSearchResults = jest.fn();
        instance.search('fail');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(instance.onChange).not.toHaveBeenCalled();
        expect(wrapper.state('search')).toEqual(true);
        expect(wrapper.state('searching')).toEqual(true);
        expect(instance.searchTimeoutId).not.toEqual('');
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);

        jest.runAllTimers();
        expect(instance.props.actions.searchMoreChannels).toHaveBeenCalledTimes(1);
        expect(instance.props.actions.searchMoreChannels).toHaveBeenCalledWith('fail');
        process.nextTick(() => {
            expect(wrapper.state('search')).toEqual(true);
            expect(wrapper.state('searching')).toEqual(false);
            expect(wrapper.state('searchedChannels')).toEqual([]);
            expect(instance.setSearchResults).not.toBeCalled();
            done();
        });
    });

    test('should perform search and set the correct state', (done) => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.onChange = jest.fn();
        instance.search('channel');
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(instance.onChange).not.toHaveBeenCalled();
        expect(wrapper.state('search')).toEqual(true);
        expect(wrapper.state('searching')).toEqual(true);
        expect(instance.searchTimeoutId).not.toEqual('');
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);

        jest.runAllTimers();
        expect(instance.props.actions.searchMoreChannels).toHaveBeenCalledTimes(1);
        expect(instance.props.actions.searchMoreChannels).toHaveBeenCalledWith('channel');
        process.nextTick(() => {
            expect(wrapper.state('search')).toEqual(true);
            expect(wrapper.state('searching')).toEqual(false);
            expect(wrapper.state('searchedChannels')).toEqual([searchResults.data[0]]);
            done();
        });
    });
});
