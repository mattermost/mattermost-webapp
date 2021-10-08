// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppsTypes} from '../../action_types';
import {AppBinding} from '../../types/apps';

import * as Reducers from './apps';

describe('bindings', () => {
    const initialState: AppBinding[] = [];

    test('No element get filtered', () => {
        const data = [
            {
                app_id: '1',
                location: '/post_menu',
                bindings: [
                    {
                        location: 'locA',
                        label: 'a',
                        call: {},
                    },
                ],
            },
            {
                app_id: '2',
                location: '/post_menu',
                bindings: [
                    {
                        location: 'locA',
                        label: 'a',
                        call: {},
                    },
                ],
            },
            {
                app_id: '1',
                location: '/channel_header',
                bindings: [
                    {
                        location: 'locB',
                        label: 'b',
                        icon: 'icon',
                        call: {},
                    },
                ],
            },
            {
                app_id: '3',
                location: '/command',
                bindings: [
                    {
                        location: 'locC',
                        label: 'c',
                        call: {},
                    },
                ],
            },
        ];

        const state = Reducers.mainBindings(
            initialState,
            {
                type: AppsTypes.RECEIVED_APP_BINDINGS,
                data,
            },
        );

        expect(state).toMatchSnapshot();
    });

    test('Invalid channel header get filtered', () => {
        const data = [
            {
                app_id: '1',
                location: '/post_menu',
                bindings: [
                    {
                        location: 'locA',
                        label: 'a',
                        call: {},
                    },
                ],
            },
            {
                app_id: '2',
                location: '/post_menu',
                bindings: [
                    {
                        location: 'locA',
                        label: 'a',
                        call: {},
                    },
                ],
            },
            {
                app_id: '1',
                location: '/channel_header',
                bindings: [
                    {
                        location: 'locB',
                        label: 'b',
                        icon: 'icon',
                        call: {},
                    },
                    {
                        location: 'locC',
                        label: 'c',
                        call: {},
                    },
                ],
            },
            {
                app_id: '2',
                location: '/channel_header',
                bindings: [
                    {
                        icon: 'icon',
                        call: {},
                    },
                    {
                        location: 'locC',
                        label: 'c',
                        icon: 'icon',
                        call: {},
                    },
                ],
            },
            {
                app_id: '3',
                location: '/channel_header',
                bindings: [
                    {
                        location: 'locB',
                        call: {},
                    },
                    {
                        location: 'locC',
                        label: 'c',
                        call: {},
                    },
                ],
            },
            {
                app_id: '3',
                location: '/command',
                bindings: [
                    {
                        location: 'locC',
                        label: 'c',
                        call: {},
                    },
                ],
            },
        ];

        const state = Reducers.mainBindings(
            initialState,
            {
                type: AppsTypes.RECEIVED_APP_BINDINGS,
                data,
            },
        );

        expect(state).toMatchSnapshot();
    });

    test('Invalid post menu get filtered', () => {
        const data = [
            {
                app_id: '1',
                location: '/post_menu',
                bindings: [
                    {
                        call: {},
                    },
                    {
                        location: 'locB',
                        label: 'a',
                        call: {},
                    },
                ],
            },
            {
                app_id: '2',
                location: '/post_menu',
                bindings: [
                    {
                        location: 'locA',
                        label: 'a',
                        call: {},
                    },
                    {
                        location: 'locB',
                        label: 'b',
                        call: {},
                    },
                ],
            },
            {
                app_id: '3',
                location: '/post_menu',
                bindings: [
                    {
                        call: {},
                    },
                ],
            },
            {
                app_id: '1',
                location: '/channel_header',
                bindings: [
                    {
                        location: 'locB',
                        label: 'b',
                        icon: 'icon',
                        call: {},
                    },
                ],
            },
            {
                app_id: '3',
                location: '/command',
                bindings: [
                    {
                        location: 'locC',
                        label: 'c',
                        call: {},
                    },
                ],
            },
        ];

        const state = Reducers.mainBindings(
            initialState,
            {
                type: AppsTypes.RECEIVED_APP_BINDINGS,
                data,
            },
        );

        expect(state).toMatchSnapshot();
    });

    test('Invalid commands get filtered', () => {
        const data = [
            {
                app_id: '1',
                location: '/post_menu',
                bindings: [
                    {
                        location: 'locA',
                        label: 'a',
                        call: {},
                    },
                    {
                        location: 'locB',
                        label: 'a',
                        call: {},
                    },
                ],
            },
            {
                app_id: '1',
                location: '/channel_header',
                bindings: [
                    {
                        location: 'locB',
                        label: 'b',
                        icon: 'icon',
                        call: {},
                    },
                ],
            },
            {
                app_id: '3',
                location: '/command',
                bindings: [
                    {
                        location: 'locC',
                        label: 'c',
                        bindings: [
                            {
                                call: {},
                            },
                            {
                                location: 'subC2',
                                label: 'c2',
                                call: {},
                            },
                        ],
                    },
                    {
                        location: 'locD',
                        label: 'd',
                        bindings: [
                            {
                                call: {},
                            },
                        ],
                    },
                ],
            },
            {
                app_id: '1',
                location: '/command',
                bindings: [
                    {
                        call: {},
                    },
                ],
            },
            {
                app_id: '2',
                location: '/command',
                bindings: [
                    {
                        location: 'locC',
                        label: 'c',
                        call: {},
                        bindings: [
                            {
                                location: 'subC1',
                                label: 'c1',
                                call: {},
                            },
                            {
                                location: 'subC2',
                                label: 'c2',
                                call: {},
                            },
                        ],
                    },
                ],
            },
        ];

        const state = Reducers.mainBindings(
            initialState,
            {
                type: AppsTypes.RECEIVED_APP_BINDINGS,
                data,
            },
        );

        expect(state).toMatchSnapshot();
    });
});

