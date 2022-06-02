import assert from 'assert';

import {getChannelHeaderMenuPluginComponents} from 'selectors/plugins';

import {GlobalState} from 'types/store';

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
                    }
                },
            } as unknown as GlobalState;
            const components = getChannelHeaderMenuPluginComponents(state);
            assert.deepEqual(expectedComponents, components)
        });
        
        test('one channel header component found as shouldRender returns true', () => {
            const expectedComponents = [
                {
                    shouldRender: (state) => true,
                }
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
                    }
                },
            } as unknown as GlobalState;

            const components = getChannelHeaderMenuPluginComponents(state);
            assert.deepEqual(expectedComponents, components)
        });

        test('one channel header component found as shouldRender is not defined', () => {
            const expectedComponents = [
                {
                    id: 'testId',
                }
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
                    }
                },
            } as unknown as GlobalState;

            const components = getChannelHeaderMenuPluginComponents(state);
            assert.deepEqual(expectedComponents, components)
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
                            shouldRender: (state) => false,
                        }],
                    }
                },
            } as unknown as GlobalState;

            const components = getChannelHeaderMenuPluginComponents(state);
            assert.deepEqual(expectedComponents, components)
        });
    });
});