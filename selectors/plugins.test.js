// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannelHeaderMenuPluginComponents} from 'selectors/plugins';

describe('selectors/plugins', () => {
    describe('getChannelHeaderMenuPluginComponents', () => {
        test('no channel header components found', () => {
            const expectedComponents = [];

            const state = {
                entities: {
                    general: {
                        config: {},
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
                plugins: {
                    components: {
                        ChannelHeader: expectedComponents,
                    },
                },
            };
            const components = getChannelHeaderMenuPluginComponents(state);
            expect(components).toEqual(expectedComponents);
        });

        test('one channel header component found as shouldRender returns true', () => {
            const expectedComponents = [
                {
                    shouldRender: () => true,
                },
            ];

            const state = {
                entities: {
                    general: {
                        config: {},
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
                plugins: {
                    components: {
                        ChannelHeader: expectedComponents,
                    },
                },
            };

            const components = getChannelHeaderMenuPluginComponents(state);
            expect(components).toEqual(expectedComponents);
        });

        test('one channel header component found as shouldRender is not defined', () => {
            const expectedComponents = [
                {
                    id: 'testId',
                },
            ];

            const state = {
                entities: {
                    general: {
                        config: {},
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
                plugins: {
                    components: {
                        ChannelHeader: expectedComponents,
                    },
                },
            };

            const components = getChannelHeaderMenuPluginComponents(state);
            expect(components).toEqual(expectedComponents);
        });

        test('no channel header components found as shouldRender returns false', () => {
            const expectedComponents = [];

            const state = {
                entities: {
                    general: {
                        config: {},
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
                plugins: {
                    components: {
                        ChannelHeader: [{
                            shouldRender: () => false,
                        }],
                    },
                },
            };

            const components = getChannelHeaderMenuPluginComponents(state);
            expect(components).toEqual(expectedComponents);
        });
    });
});
