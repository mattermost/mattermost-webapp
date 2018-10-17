// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MoreChannels from 'components/more_channels/more_channels.jsx';
import SearchableChannelList from 'components/searchable_channel_list.jsx';

jest.mock('utils/browser_history', () => {
    const original = require.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

describe('components/MoreChannels', () => {
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
});
