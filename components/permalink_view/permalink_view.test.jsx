// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {getPostThread} from 'mattermost-redux/actions/posts';

import {ErrorPageTypes} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import {focusPost} from 'components/permalink_view/actions';
import PermalinkView from 'components/permalink_view/permalink_view.jsx';

const mockStore = configureStore([thunk]);

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        replace: jest.fn(),
    },
}));

jest.mock('actions/channel_actions.jsx', () => ({
    loadChannelsForCurrentUser: jest.fn(() => {
        return {type: 'MOCK_LOAD_CHANNELS_FOR_CURRENT_USER'};
    }),
}));

jest.mock('mattermost-redux/actions/posts', () => ({
    getPostThread: jest.fn((postId) => {
        const post = {id: 'postid1', message: 'some message', channel_id: 'channelid1'};
        const post2 = {id: 'postid2', message: 'some message', channel_id: 'channelid2'};
        const dmPost = {id: 'dmpostid1', message: 'some message', channel_id: 'dmchannelid'};
        const gmPost = {id: 'gmpostid1', message: 'some message', channel_id: 'gmchannelid'};

        switch (postId) {
        case 'postid1':
            return {type: 'MOCK_GET_POST_THREAD', data: {posts: {postid1: post}, order: [post.id]}};
        case 'postid2':
            return {type: 'MOCK_GET_POST_THREAD', data: {posts: {postid2: post2}, order: [post2.id]}};
        case 'dmpostid1':
            return {type: 'MOCK_GET_POST_THREAD', data: {posts: {dmpostid1: dmPost}, order: [dmPost.id]}};
        case 'gmpostid1':
            return {type: 'MOCK_GET_POST_THREAD', data: {posts: {gmpostid1: gmPost}, order: [gmPost.id]}};
        default:
            return {type: 'MOCK_GET_POST_THREAD'};
        }
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    selectChannel: (...args) => ({type: 'MOCK_SELECT_CHANNEL', args}),
    joinChannel: (...args) => ({type: 'MOCK_JOIN_CHANNEL', args}),
    getChannelStats: (...args) => ({type: 'MOCK_GET_CHANNEL_STATS', args}),
    getChannel: jest.fn((channelId) => {
        switch (channelId) {
        case 'channelid2':
            return {type: 'MOCK_GET_CHANNEL', data: {id: 'channelid2', type: 'O', team_id: 'current_team_id'}};
        default:
            return {type: 'MOCK_GET_CHANNEL', args: [channelId]};
        }
    }),
}));

describe('components/PermalinkView', () => {
    const baseProps = {
        channelId: 'channel_id',
        channelName: 'channel_name',
        match: {params: {postid: 'post_id'}},
        returnTo: 'return_to',
        teamName: 'team_name',
        actions: {
            focusPost: jest.fn(),
        },
        currentUserId: 'current_user',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <PermalinkView {...baseProps}/>,
        );

        wrapper.setState({valid: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call baseProps.actions.focusPost on doPermalinkEvent', async () => {
        const wrapper = shallow(
            <PermalinkView {...baseProps}/>,
        );

        expect(baseProps.actions.focusPost).toHaveBeenCalledTimes(1);

        wrapper.setState({valid: false});
        await wrapper.instance().doPermalinkEvent(baseProps);
        expect(baseProps.actions.focusPost).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.focusPost).toBeCalledWith(baseProps.match.params.postid, baseProps.returnTo, baseProps.currentUserId);
    });

    test('should call baseProps.actions.focusPost when postid changes', async () => {
        const wrapper = shallow(
            <PermalinkView {...baseProps}/>,
        );
        const newPostid = `${baseProps.match.params.postid}_new`;
        await wrapper.setProps({...baseProps, match: {params: {postid: newPostid}}});

        expect(baseProps.actions.focusPost).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.focusPost).toBeCalledWith(newPostid, baseProps.returnTo, baseProps.currentUserId);
    });

    test('should match snapshot with archived channel', () => {
        const props = {...baseProps, channelIsArchived: true};

        const wrapper = shallow(
            <PermalinkView {...props}/>,
        );

        wrapper.setState({valid: true});
        expect(wrapper).toMatchSnapshot();
    });

    describe('actions', () => {
        const initialState = {
            entities: {
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        dmchannel: {
                            id: 'dmchannel',
                            username: 'otherUser',
                        },
                    },
                },
                channels: {
                    channels: {
                        channelid1: {id: 'channelid1', name: 'channel1', type: 'O', team_id: 'current_team_id'},
                        dmchannelid: {id: 'dmchannelid', name: 'dmchannel__current_user_id', type: 'D', team_id: ''},
                        gmchannelid: {id: 'gmchannelid', name: 'gmchannel', type: 'G', team_id: ''},
                    },
                    myMembers: {channelid1: {channel_id: 'channelid1', user_id: 'current_user_id'}},
                },
                teams: {
                    currentTeamId: 'current_team_id',
                    teams: {
                        current_team_id: {
                            id: 'current_team_id',
                            display_name: 'currentteam',
                            name: 'currentteam',
                        },
                    },
                },
            },
        };

        describe('focusPost', () => {
            test('should redirect to error page for DM channel not a member of', async () => {
                const testStore = await mockStore(initialState);
                await testStore.dispatch(focusPost('dmpostid1'));

                expect(getPostThread).toHaveBeenCalledWith('dmpostid1');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {dmpostid1: {id: 'dmpostid1', message: 'some message', channel_id: 'dmchannelid'}}, order: ['dmpostid1']}},
                ]);
                expect(browserHistory.replace).toHaveBeenCalledWith(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=`);
            });

            test('should redirect to error page for GM channel not a member of', async () => {
                const testStore = await mockStore(initialState);
                await testStore.dispatch(focusPost('gmpostid1'));

                expect(getPostThread).toHaveBeenCalledWith('gmpostid1');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {gmpostid1: {id: 'gmpostid1', message: 'some message', channel_id: 'gmchannelid'}}, order: ['gmpostid1']}},
                ]);
                expect(browserHistory.replace).toHaveBeenCalledWith(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=`);
            });

            test('should redirect to DM link with postId for permalink', async () => {
                const modifiedState = {
                    entities: {
                        ...initialState.entities,
                        channels: {
                            ...initialState.entities.channels,
                            myMembers: {
                                channelid1: {channel_id: 'channelid1', user_id: 'current_user_id'},
                                dmchannelid: {channel_id: 'dmchannelid', name: 'dmchannel', type: 'D', user_id: 'current_user_id'},
                            },
                        },
                    },
                };

                const testStore = await mockStore(modifiedState);
                await testStore.dispatch(focusPost('dmpostid1'));

                expect(getPostThread).toHaveBeenCalledWith('dmpostid1');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {dmpostid1: {id: 'dmpostid1', message: 'some message', channel_id: 'dmchannelid'}}, order: ['dmpostid1']}},
                    {type: 'MOCK_SELECT_CHANNEL', args: ['dmchannelid']},
                    {type: 'RECEIVED_FOCUSED_POST', channelId: 'dmchannelid', data: 'dmpostid1'},
                    {type: 'MOCK_LOAD_CHANNELS_FOR_CURRENT_USER'},
                    {type: 'MOCK_GET_CHANNEL_STATS', args: ['dmchannelid']},
                ]);
                expect(browserHistory.replace).toHaveBeenCalledWith('/currentteam/messages/@otherUser/dmpostid1');
            });

            test('should redirect to GM link with postId for permalink', async () => {
                const modifiedState = {
                    entities: {
                        ...initialState.entities,
                        channels: {
                            ...initialState.entities.channels,
                            myMembers: {
                                channelid1: {channel_id: 'channelid1', user_id: 'current_user_id'},
                                gmchannelid: {channel_id: 'gmchannelid', name: 'gmchannel', type: 'G', user_id: 'current_user_id'},
                            },
                        },
                    },
                };

                const testStore = await mockStore(modifiedState);
                await testStore.dispatch(focusPost('gmpostid1'));

                expect(getPostThread).toHaveBeenCalledWith('gmpostid1');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {gmpostid1: {id: 'gmpostid1', message: 'some message', channel_id: 'gmchannelid'}}, order: ['gmpostid1']}},
                    {type: 'MOCK_SELECT_CHANNEL', args: ['gmchannelid']},
                    {type: 'RECEIVED_FOCUSED_POST', channelId: 'gmchannelid', data: 'gmpostid1'},
                    {type: 'MOCK_LOAD_CHANNELS_FOR_CURRENT_USER'},
                    {type: 'MOCK_GET_CHANNEL_STATS', args: ['gmchannelid']},
                ]);
                expect(browserHistory.replace).toHaveBeenCalledWith('/currentteam/messages/gmchannel/gmpostid1');
            });

            test('should redirect to channel link with postId for permalink', async () => {
                const testStore = await mockStore(initialState);
                await testStore.dispatch(focusPost('postid1'));

                expect(getPostThread).toHaveBeenCalledWith('postid1');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {postid1: {id: 'postid1', message: 'some message', channel_id: 'channelid1'}}, order: ['postid1']}},
                    {type: 'MOCK_SELECT_CHANNEL', args: ['channelid1']},
                    {type: 'RECEIVED_FOCUSED_POST', channelId: 'channelid1', data: 'postid1'},
                    {type: 'MOCK_LOAD_CHANNELS_FOR_CURRENT_USER'},
                    {type: 'MOCK_GET_CHANNEL_STATS', args: ['channelid1']},
                ]);
                expect(browserHistory.replace).toHaveBeenCalledWith('/currentteam/channels/channel1/postid1');
            });
        });
    });
});
