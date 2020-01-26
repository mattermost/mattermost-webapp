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
            <PermalinkView {...baseProps}/>
        );

        expect(baseProps.actions.focusPost).toHaveBeenCalledTimes(1);

        wrapper.setState({valid: false});
        await wrapper.instance().doPermalinkEvent(baseProps);
        expect(baseProps.actions.focusPost).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.focusPost).toBeCalledWith(baseProps.match.params.postid, baseProps.returnTo);
    });

    test('should call baseProps.actions.focusPost when postid changes', async () => {
        const wrapper = shallow(
            <PermalinkView {...baseProps}/>
        );
        const newPostid = `${baseProps.match.params.postid}_new`;
        await wrapper.setProps({...baseProps, match: {params: {postid: newPostid}}});

        expect(baseProps.actions.focusPost).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.focusPost).toBeCalledWith(newPostid, baseProps.returnTo);
    });

    test('should match snapshot with archived channel', () => {
        const props = {...baseProps, channelIsArchived: true};

        const wrapper = shallow(
            <PermalinkView {...props}/>
        );

        wrapper.setState({valid: true});
        expect(wrapper).toMatchSnapshot();
    });

    describe('actions', () => {
        const initialState = {
            entities: {
                users: {
                    currentUserId: 'current_user_id',
                },
                channels: {
                    channels: {
                        channelid1: {id: 'channelid1', name: 'channel1', type: 'O', team_id: 'current_team_id'},
                        dmchannelid: {id: 'dmchannelid', name: 'dmchannel', type: 'D'},
                        gmchannelid: {id: 'gmchannelid', name: 'gmchannel', type: 'G'},
                    },
                    myMembers: {channelid1: {channel_id: 'channelid1', user_id: 'current_user_id'}},
                },
                teams: {
                    currentTeamId: 'current_team_id',
                },
            },
        };

        describe('focusPost', () => {
            test('should focus post in already loaded channel', async () => {
                const testStore = await mockStore(initialState);
                await testStore.dispatch(focusPost('postid1'));

                expect(getPostThread).toHaveBeenCalledWith('postid1');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {postid1: {id: 'postid1', message: 'some message', channel_id: 'channelid1'}}, order: ['postid1']}},
                    {type: 'MOCK_SELECT_CHANNEL', args: ['channelid1']},
                    {type: 'RECEIVED_FOCUSED_POST', data: 'postid1', channelId: 'channelid1'},
                    {type: 'MOCK_LOAD_CHANNELS_FOR_CURRENT_USER'},
                    {type: 'MOCK_GET_CHANNEL_STATS', args: ['channelid1']},
                ]);
            });

            test('should focus post in not loaded channel', async () => {
                const testStore = await mockStore(initialState);

                await testStore.dispatch(focusPost('postid2'));

                expect(getPostThread).toHaveBeenCalledWith('postid2');
                expect(testStore.getActions()).toEqual([
                    {type: 'MOCK_GET_POST_THREAD', data: {posts: {postid2: {id: 'postid2', message: 'some message', channel_id: 'channelid2'}}, order: ['postid2']}},
                    {type: 'MOCK_GET_CHANNEL', data: {id: 'channelid2', type: 'O', team_id: 'current_team_id'}},
                    {type: 'MOCK_JOIN_CHANNEL', args: ['current_user_id', null, 'channelid2']},
                    {type: 'MOCK_SELECT_CHANNEL', args: ['channelid2']},
                    {type: 'RECEIVED_FOCUSED_POST', data: 'postid2', channelId: 'channelid2'},
                    {type: 'MOCK_LOAD_CHANNELS_FOR_CURRENT_USER'},
                    {type: 'MOCK_GET_CHANNEL_STATS', args: ['channelid2']},
                ]);
            });

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
        });
    });
});
