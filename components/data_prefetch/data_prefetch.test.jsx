// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {loadProfilesForSidebar} from 'actions/user_actions.jsx';

import DataPrefetch from './data_prefetch.jsx';

jest.mock('actions/user_actions.jsx', () => ({
    loadProfilesForSidebar: jest.fn().mockResolvedValue({}),
}));

describe('/components/create_team', () => {
    jest.useFakeTimers();
    const defaultProps = {
        currentChannelId: '',
        actions: {
            prefetchChannelPosts: jest.fn().mockResolvedValue({}),
        },
        prefetchQueueObj: {
            1: ['mentionChannel'],
            2: ['unreadChannel'],
        },
        prefetchRequestStatus: {},
        unreadChannels: [{
            id: 'mentionChannel',
            last_post_at: 1234,
        }, {
            id: 'unreadChannel',
            last_post_at: 1235,
        }],
    };

    test('should call posts of current channel when it is set', async () => {
        const wrapper = shallow(
            <DataPrefetch {...defaultProps}/>,
        );
        const instance = wrapper.instance();

        instance.prefetchPosts = jest.fn();
        wrapper.setProps({currentChannelId: 'currentChannelId'});
        expect(instance.prefetchPosts).toHaveBeenCalledWith('currentChannelId');
    });

    test('should call for LHS profiles and also call for posts based on prefetchQueueObj', async () => {
        const wrapper = shallow(
            <DataPrefetch {...defaultProps}/>,
        );
        const instance = wrapper.instance();
        instance.prefetchPosts = jest.fn();
        wrapper.setProps({currentChannelId: 'currentChannelId'});

        expect(loadProfilesForSidebar).toHaveBeenCalledTimes(1);
        expect(instance.prefetchPosts).toHaveBeenCalledWith('currentChannelId');
        await loadProfilesForSidebar();
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel');
        expect(instance.prefetchPosts).toHaveBeenCalledWith('unreadChannel');
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(3);
    });

    test('Should call for posts based on prefetchQueueObj and obey concurrency', async () => {
        const props = {
            ...defaultProps,
            prefetchQueueObj: {
                1: ['mentionChannel0', 'mentionChannel1', 'mentionChannel2', 'mentionChannel3'],
                2: [],
                3: [],
            },
        };

        const wrapper = shallow(
            <DataPrefetch {...props}/>,
        );
        const instance = wrapper.instance();
        instance.prefetchPosts = jest.fn().mockResolvedValue({});

        wrapper.setProps({currentChannelId: 'currentChannelId'});
        expect(instance.prefetchPosts).toHaveBeenCalledWith('currentChannelId');
        await props.actions.prefetchChannelPosts();

        await loadProfilesForSidebar();
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel0');
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel1');
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(3);

        await props.actions.prefetchChannelPosts();
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel2');
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel3');
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(5);
    });

    test('Should call for new prefetchQueueObj channels on change of prop and cancel previous ones', async () => {
        const props = {
            ...defaultProps,
            prefetchQueueObj: {
                1: ['mentionChannel0', 'mentionChannel1', 'mentionChannel2', 'mentionChannel3', 'mentionChannel4'],
                2: [],
            },
        };

        const wrapper = shallow(
            <DataPrefetch {...props}/>,
        );
        const instance = wrapper.instance();
        instance.prefetchPosts = jest.fn().mockResolvedValue({});

        wrapper.setProps({currentChannelId: 'currentChannelId'});

        await props.actions.prefetchChannelPosts();
        await loadProfilesForSidebar();
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(3);
        wrapper.setProps({
            prefetchQueueObj: {
                1: ['mentionChannel5', 'mentionChannel6'],
                2: [],
                3: [],
            },

        });

        jest.runAllTimers();
        await props.actions.prefetchChannelPosts();
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(5);
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel5');
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel6');
    });

    test('Should call for new prefetchQueueObj channels on change of prop and cancel previous ones', async () => {
        const props = {
            ...defaultProps,
            prefetchQueueObj: {
                1: ['mentionChannel0', 'mentionChannel1', 'mentionChannel2', 'mentionChannel3', 'mentionChannel4'],
                2: [],
            },
        };

        const wrapper = shallow(
            <DataPrefetch {...props}/>,
        );
        const instance = wrapper.instance();
        instance.prefetchPosts = jest.fn().mockResolvedValue({});

        wrapper.setProps({currentChannelId: 'currentChannelId'});

        await props.actions.prefetchChannelPosts();
        await loadProfilesForSidebar();
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(3);
        wrapper.setProps({
            prefetchQueueObj: {
                1: ['mentionChannel5', 'mentionChannel6'],
                2: [],
                3: [],
            },
        });

        jest.runAllTimers();
        await props.actions.prefetchChannelPosts();
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(5);
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel5');
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel6');
    });

    test('should skip making request for posts if a request was made', async () => {
        const props = {
            ...defaultProps,
            prefetchRequestStatus: {
                unreadChannel: 'success',
            },
        };

        const wrapper = shallow(
            <DataPrefetch {...props}/>,
        );
        const instance = wrapper.instance();
        instance.prefetchPosts = jest.fn();
        wrapper.setProps({currentChannelId: 'currentChannelId'});

        expect(loadProfilesForSidebar).toHaveBeenCalledTimes(1);
        expect(instance.prefetchPosts).toHaveBeenCalledWith('currentChannelId');
        await loadProfilesForSidebar();
        expect(instance.prefetchPosts).toHaveBeenCalledWith('mentionChannel');
        expect(instance.prefetchPosts).toHaveBeenCalledTimes(2);
    });

    test('should add delay if last post is made in last min', async () => {
        Date.now = jest.fn().mockReturnValue(12346);
        Math.random = jest.fn().mockReturnValue(0.5);
        const props = {
            ...defaultProps,
            prefetchQueueObj: {
                1: ['mentionChannel'],
            },
            unreadChannels: [{
                id: 'mentionChannel',
                last_post_at: 12345,
            }],
        };

        const wrapper = shallow(
            <DataPrefetch {...props}/>,
        );
        wrapper.instance();
        wrapper.setProps({currentChannelId: 'currentChannelId'});

        expect(props.actions.prefetchChannelPosts).toHaveBeenCalledWith('currentChannelId', undefined);
        await loadProfilesForSidebar();
        expect(props.actions.prefetchChannelPosts).toHaveBeenCalledWith('mentionChannel', 500);
    });
});
