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

import TopBoards from './top_boards';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn().mockReturnValue(() => {}),
}));

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

describe('components/activity_and_insights/insights/top_boards', () => {
    const props = {
        filterType: 'TEAM',
        timeFrame: TimeFrames.INSIGHTS_7_DAYS,
        size: CardSizes.small,
        widgetType: InsightsWidgetTypes.TOP_BOARDS,
        class: 'top-baords-card',
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
        plugins: {
            insightsHandlers: {
                focalboard: async () => {
                    return {
                        items: [
                            {
                                boardID: 'b8i4hjy9z6igjjbs68fudzr6z8h',
                                icon: '📅',
                                title: 'Test calendar ',
                                activityCount: 32,
                                activeUsers: ['9qobtrxa93dhfg1fqmhcq5wj4o'],
                                createdBy: '9qobtrxa93dhfg1fqmhcq5wj4o',
                            },
                            {
                                boardID: 'bf3mmu7hjgprpmp1ekiozyggrjh',
                                icon: '📅',
                                title: 'Content Calendar ',
                                activityCount: 24,
                                activeUsers: ['9qobtrxa93dhfg1fqmhcq5wj4o', '9x4to68xqiyfzb8dxwfpbqopie'],
                                createdBy: '9qobtrxa93dhfg1fqmhcq5wj4o',
                            },
                            {
                                boardID: 'bf3mmu7hjgprpmp1ekiozyggrjh',
                                icon: '📅',
                                title: 'Content Calendar ',
                                activityCount: 24,

                                // MM-49023
                                activeUsers: '9qobtrxa93dhfg1fqmhcq5wj4o,9x4to68xqiyfzb8dxwfpbqopie',
                                createdBy: '9qobtrxa93dhfg1fqmhcq5wj4o',
                            },
                        ],
                    };
                },
            },
        },
    };

    test('check if 3 team top boards render', async () => {
        const store = await mockStore(initialState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <BrowserRouter>
                    <TopBoards
                        {...props}
                    />
                </BrowserRouter>
            </Provider>,
        );
        await actImmediate(wrapper);

        // Link causes the class to render 3 times for each item
        expect(wrapper.find('.board-item').length).toEqual(9);
    });

    test('check if 0 top boards render', async () => {
        const state = {
            ...initialState,
            plugins: {
                insightsHandlers: {
                    focalboard: async () => {
                        return {
                            items: [],
                        };
                    },
                },
            },
        };
        const store = await mockStore(state);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <BrowserRouter>
                    <TopBoards
                        {...props}
                    />
                </BrowserRouter>
            </Provider>,
        );
        await actImmediate(wrapper);
        expect(wrapper.find('.empty-state').length).toEqual(1);
    });
});
