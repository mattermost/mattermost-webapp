// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Selectors from 'mattermost-redux/selectors/entities/apps';
import {GlobalState} from 'types/store';
import {AppBinding} from 'mattermost-redux/types/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';

const makeNewState = (flag?: string, bindings?: AppBinding[]) => ({
    entities: {
        general: {
            config: {
                FeatureFlagAppsEnabled: flag,
            },
        },
        apps: {
            main: {
                bindings,
                forms: {},
            },
        },
    },
}) as unknown as GlobalState;

describe('Selectors.Apps', () => {
    describe('appsEnabled', () => {
        it('should return true when feature flag is enabled', () => {
            const state: GlobalState = makeNewState('true');
            const result = Selectors.appsEnabled(state);
            expect(result).toEqual(true);
        });

        it('should return false when feature flag is disabled', () => {
            let state: GlobalState = makeNewState('false');
            let result = Selectors.appsEnabled(state);
            expect(result).toEqual(false);

            state = makeNewState('');
            result = Selectors.appsEnabled(state);
            expect(result).toEqual(false);

            state = makeNewState();
            result = Selectors.appsEnabled(state);
            expect(result).toEqual(false);
        });
    });

    describe('makeAppBindingsSelector', () => {
        const allBindings = [
            {
                location: '/post_menu',
                bindings: [
                    {
                        app_id: 'app1',
                        location: 'post-menu-1',
                        label: 'App 1 Post Menu',
                    },
                    {
                        app_id: 'app2',
                        location: 'post-menu-2',
                        label: 'App 2 Post Menu',
                    },
                ],
            },
            {
                location: '/channel_header',
                bindings: [
                    {
                        app_id: 'app1',
                        location: 'channel-header-1',
                        label: 'App 1 Channel Header',
                    },
                    {
                        app_id: 'app2',
                        location: 'channel-header-2',
                        label: 'App 2 Channel Header',
                    },
                ],
            },
            {
                location: '/command',
                bindings: [
                    {
                        app_id: 'app1',
                        location: 'command-1',
                        label: 'App 1 Command',
                    },
                    {
                        app_id: 'app2',
                        location: 'command-2',
                        label: 'App 2 Command',
                    },
                ],
            },
        ] as AppBinding[];

        it('should return an empty array when feature flag is false', () => {
            const state = makeNewState('false', allBindings);
            const selector = Selectors.makeAppBindingsSelector(AppBindingLocations.POST_MENU_ITEM);
            const result = selector(state);
            expect(result).toEqual([]);
        });

        it('should return post menu bindings', () => {
            const state = makeNewState('true', allBindings);
            const selector = Selectors.makeAppBindingsSelector(AppBindingLocations.POST_MENU_ITEM);
            const result = selector(state);
            expect(result).toEqual([
                {
                    app_id: 'app1',
                    location: 'post-menu-1',
                    label: 'App 1 Post Menu',
                },
                {
                    app_id: 'app2',
                    location: 'post-menu-2',
                    label: 'App 2 Post Menu',
                },
            ]);
        });

        it('should return channel header bindings', () => {
            const state = makeNewState('true', allBindings);
            const selector = Selectors.makeAppBindingsSelector(AppBindingLocations.CHANNEL_HEADER_ICON);
            const result = selector(state);
            expect(result).toEqual([
                {
                    app_id: 'app1',
                    location: 'channel-header-1',
                    label: 'App 1 Channel Header',
                },
                {
                    app_id: 'app2',
                    location: 'channel-header-2',
                    label: 'App 2 Channel Header',
                },
            ]);
        });

        it('should return command bindings', () => {
            const state = makeNewState('true', allBindings);
            const selector = Selectors.makeAppBindingsSelector(AppBindingLocations.COMMAND);
            const result = selector(state);
            expect(result).toEqual([
                {
                    app_id: 'app1',
                    location: 'command-1',
                    label: 'App 1 Command',
                },
                {
                    app_id: 'app2',
                    location: 'command-2',
                    label: 'App 2 Command',
                },
            ]);
        });
    });
});
