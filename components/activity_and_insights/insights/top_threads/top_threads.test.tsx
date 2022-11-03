// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';

import {act} from '@testing-library/react';

import {ReactWrapper} from 'enzyme';

import {BrowserRouter} from 'react-router-dom';

import {CardSizes, InsightsWidgetTypes, TimeFrames} from '@mattermost/types/insights';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import TopThreads from './top_threads';

const actImmediate = (wrapper: ReactWrapper) =>
    act(
        () =>
            new Promise<void>((resolve) => {
                setImmediate(() => {
                    wrapper.update();
                    resolve();
                });
            }),
    );

jest.mock('mattermost-redux/actions/insights', () => ({
    ...jest.requireActual('mattermost-redux/actions/insights'),
    getMyTopThreads: () => ({type: 'adsf', data: {}}),
    getTopThreadsForTeam: () => ({type: 'adsf',
        data: {
            has_next: false,
            items: [
                {
                    post_id: 'post1',
                    reply_count: 18,
                    channel_id: 'channel1',
                    channel_display_name: 'nostrum',
                    channel_name: 'channel1',
                    message: 'ducimus sed aut sunt corrupti necessitatibus quasi.\nreiciendis ipsa consequuntur fugiat a eaque.',
                    participants: [
                        'user1',
                    ],
                    user_id: 'user1',
                    user_information: {
                        id: 'user1',
                        last_picture_update: 0,
                        first_name: 'Kathryn',
                        last_name: 'Mills',
                    },
                    post: {
                        id: 'post1',
                        create_at: 1653488972484,
                        update_at: 1653489070820,
                        edit_at: 0,
                        delete_at: 0,
                        is_pinned: false,
                        user_id: 'user1',
                        channel_id: 'channel1',
                        root_id: '',
                        original_id: '',
                        message: 'ducimus sed aut sunt corrupti necessitatibus quasi.\nreiciendis ipsa consequuntur fugiat a eaque.',
                        type: '',
                        props: {},
                        hashtags: '',
                        pending_post_id: '',
                        reply_count: 18,
                        last_reply_at: 0,
                        participants: null,
                        metadata: {},
                    },
                },
            ],
        }}),
}));

describe('components/activity_and_insights/insights/top_threads', () => {
    const props = {
        filterType: 'TEAM',
        timeFrame: TimeFrames.INSIGHTS_7_DAYS,
        size: CardSizes.small,
        widgetType: InsightsWidgetTypes.TOP_THREADS,
        class: 'top-threads-card',
        timeFrameLabel: 'Last 7 days',
    };

    const initialState = {
        entities: {
            teams: {
                currentTeamId: 'team_id1',
                teams: {
                    team_id1: {
                        id: 'team_id1',
                        name: 'team1',
                    },
                },
            },
            channels: {
                channels: {
                    channel1: {
                        id: 'channel1',
                        team_id: 'team_id1',
                        name: 'channel1',
                    },
                },
                myMembers: {
                    channel1: {
                        id: 'channel1',
                        team_id: 'team_id1',
                        name: 'channel1',
                    },
                },
            },
            general: {
                config: {},
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {
                        id: 'current_user_id',
                    },
                    user1: {
                        id: 'user1',
                    },
                },
            },
            preferences: {
                myPreferences: {},
            },
            groups: {
                groups: {},
                myGroups: [],
            },
            emojis: {
                customEmoji: {},
            },
        },
    };

    test('check if 1 team top threads render', async () => {
        const store = await mockStore(initialState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <BrowserRouter>
                    <TopThreads
                        {...props}
                    />
                </BrowserRouter>
            </Provider>,
        );
        await actImmediate(wrapper);
        expect(wrapper.find('.thread-item').length).toEqual(1);
    });

    test('check if 0 my top channels render', async () => {
        const store = await mockStore(initialState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <BrowserRouter>
                    <TopThreads
                        {...props}
                        filterType={'MY'}
                    />
                </BrowserRouter>
            </Provider>,
        );
        await actImmediate(wrapper);
        expect(wrapper.find('.empty-state').length).toEqual(1);
    });
});
