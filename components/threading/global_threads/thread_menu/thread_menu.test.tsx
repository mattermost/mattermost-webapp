// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {set} from 'lodash';
import {shallow} from 'enzyme';

import {Provider} from 'react-redux';

import {setThreadFollow, updateThreadRead, markThreadAsUnread} from 'mattermost-redux/actions/threads';
jest.mock('mattermost-redux/actions/threads');
import {Posts} from 'mattermost-redux/constants';

import {manuallyMarkThreadAsUnread} from 'actions/views/threads';
jest.mock('actions/views/threads');

import mockStore from 'tests/test_store';
import ThreadMenu from '../thread_menu';
import Menu from 'components/widgets/menu/menu';

import {
    flagPost as savePost,
    unflagPost as unsavePost,
} from 'actions/post_actions';
jest.mock('actions/post_actions');

import {copyToClipboard} from 'utils/utils';
import {fakeDate} from 'tests/helpers/date';
import {GlobalState} from 'types/store';
import { mountWithIntl } from 'tests/helpers/intl-test-helper';
jest.mock('utils/utils');

const mockRouting = {
    params: {
        team: 'team-name-1',
    },
    currentUserId: 'uid',
    currentTeamId: 'tid',
    goToInChannel: jest.fn(),
};
jest.mock('../../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const mockDispatch = jest.fn();
let mockState: GlobalState;

const latestPost = {
    id: 'latest_post_id',
    user_id: 'current_user_id',
    message: 'test msg',
    channel_id: 'current_channel_id',
    type: 'normal,',
};

const initialState = {
    entities: {
        posts: {
            posts: {
                [latestPost.id]: latestPost,
            },
            postsInChannel: {
                current_channel_id: [
                    {order: [latestPost.id], recent: true},
                ],
            },
            postsInThread: {},
            messagesHistory: {
                index: {
                    [Posts.MESSAGE_TYPES.COMMENT]: 0,
                },
                messages: ['test message'],
            },
        },
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                [latestPost.channel_id]: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                },
                other_channel_id: {
                    channel_id: 'other_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                },
            },
            roles: {
                [latestPost.channel_id]: [
                    'current_channel_id',
                    'current_user_id',
                    'channel_role',
                ],
                other_channel_id: [
                    'other_channel_id',
                    'current_user_id',
                    'channel_role',
                ],
            },
            channels: {
                current_channel_id: {team_a: 'team_a', id: 'current_channel_id'},
            },
            manuallyUnread: {},
        },
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
            },
        },
        teams: {
            currentTeamId: 'team-a',
            teams: {
                team_a: {
                    id: 'team_a',
                    name: 'team-a',
                    displayName: 'Team A',
                },
                team_b: {
                    id: 'team_b',
                    name: 'team-a',
                    displayName: 'Team B',
                },
            },
            myMembers: {
                'team-a': {roles: 'team_role'},
                'team-b': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {
                    id: 'current_user_id',
                    username: 'current_username',
                    roles: 'system_role',
                    useAutomaticTimezone: true,
                    automaticTimezone: '',
                    manualTimezone: '',
                },
            },
        },
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
        roles: {
            roles: {
                system_role: {
                    permissions: ['edit_post'],
                },
                team_role: {
                    permissions: [],
                },
                channel_role: {
                    permissions: [],
                },
            },
        },
        emojis: {customEmoji: {}},
        search: {results: []},
    },
    views: {
        posts: {
            editingPost: {},
        },
        rhs: {
            searchTerms: '',
            filesSearchExtFilter: [],
        },
    },
};

const store = mockStore(initialState);

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/threading/common/thread_menu', () => {
    let props: ComponentProps<typeof ThreadMenu>;

    beforeEach(() => {
        props = {
            threadId: '1y8hpek81byspd4enyk9mp1ncw',
            unreadTimestamp: 1610486901110,
            hasUnreads: false,
            isFollowing: false,
            children: (
                <button>{'test'}</button>
            ),
        };

        mockState = {entities: {preferences: {myPreferences: {}}}} as GlobalState;
    });

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot after opening', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu {...props}/>
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        expect(wrapper).toMatchSnapshot();
    });

    test('should allow following', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                    isFollowing={false}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Follow thread'}).at(1).simulate('click');
        expect(setThreadFollow).toHaveBeenCalledWith('uid', 'tid', '1y8hpek81byspd4enyk9mp1ncw', true);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    test('should allow unfollowing', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                    isFollowing={true}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Unfollow thread'}).at(1).simulate('click');
        expect(setThreadFollow).toHaveBeenCalledWith('uid', 'tid', '1y8hpek81byspd4enyk9mp1ncw', false);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    test('should allow opening in channel', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Open in channel'}).at(1).simulate('click');
        expect(mockRouting.goToInChannel).toHaveBeenCalledWith('1y8hpek81byspd4enyk9mp1ncw');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    test('should allow marking as read', () => {
        const resetFakeDate = fakeDate(new Date(1612582579566));
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                    hasUnreads={true}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Mark as read'}).at(1).simulate('click');
        expect(markThreadAsUnread).not.toHaveBeenCalled();
        expect(updateThreadRead).toHaveBeenCalledWith('uid', 'tid', '1y8hpek81byspd4enyk9mp1ncw', 1612582579566);
        expect(manuallyMarkThreadAsUnread).toHaveBeenCalledWith('1y8hpek81byspd4enyk9mp1ncw', 1612582579566);
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        resetFakeDate();
    });

    test('should allow marking as unread', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                    hasUnreads={false}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Mark as unread'}).at(1).simulate('click');
        expect(updateThreadRead).not.toHaveBeenCalled();
        expect(markThreadAsUnread).toHaveBeenCalledWith('uid', 'tid', '1y8hpek81byspd4enyk9mp1ncw', '1y8hpek81byspd4enyk9mp1ncw');
        expect(manuallyMarkThreadAsUnread).toHaveBeenCalledWith('1y8hpek81byspd4enyk9mp1ncw', 1610486901110);
        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    test('should allow saving', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Save'}).at(1).simulate('click');
        expect(savePost).toHaveBeenCalledWith('1y8hpek81byspd4enyk9mp1ncw');
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
    test('should allow unsaving', () => {
        set(mockState, 'entities.preferences.myPreferences', {
            'flagged_post--1y8hpek81byspd4enyk9mp1ncw': {
                user_id: 'uid',
                category: 'flagged_post',
                name: '1y8hpek81byspd4enyk9mp1ncw',
                value: 'true',
            },
        });

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Unsave'}).at(1).simulate('click');
        expect(unsavePost).toHaveBeenCalledWith('1y8hpek81byspd4enyk9mp1ncw');
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    test('should allow link copying', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ThreadMenu
                    {...props}
                />
            </Provider>,
        );
        wrapper.find('button').simulate('click');
        wrapper.find(Menu.ItemAction).find({text: 'Copy link'}).at(1).simulate('click');
        expect(copyToClipboard).toHaveBeenCalledWith('http://localhost:8065/team-name-1/pl/1y8hpek81byspd4enyk9mp1ncw');
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});

