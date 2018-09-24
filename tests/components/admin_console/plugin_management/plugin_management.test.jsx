// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PluginState from 'mattermost-redux/constants/plugins';

import PluginManagement from 'components/admin_console/plugin_management/plugin_management.jsx';

describe('components/PluginManagement', () => {
    const defaultProps = {
        config: {
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
            },
        },
        pluginStatuses: {
            plugin_0: {
                id: 'plugin_0',
                version: '0.1.0',
                state: PluginState.PLUGIN_STATE_NOT_RUNNING,
                name: 'Plugin 0',
                description: 'The plugin 0.',
                is_prepackaged: false,
                active: false,
                instances: [
                    {
                        cluster_id: 'cluster_id_1',
                        state: PluginState.PLUGIN_STATE_NOT_RUNNING,
                        version: '0.1.0',
                    },
                ],
            },
            plugin_1: {
                id: 'plugin_1',
                version: '0.0.1',
                state: PluginState.PLUGIN_STATE_STOPPING,
                name: 'Plugin 1',
                description: 'The plugin.',
                is_prepackaged: false,
                active: true,
                instances: [
                    {
                        cluster_id: 'cluster_id_1',
                        state: PluginState.PLUGIN_STATE_NOT_RUNNING,
                        version: '0.0.1',
                    },
                    {
                        cluster_id: 'cluster_id_2',
                        state: PluginState.PLUGIN_STATE_RUNNING,
                        version: '0.0.2',
                    },
                ],
            },
        },
        plugins: {
            plugin_0: {
                active: false,
                description: 'The plugin 0.',
                id: 'plugin_0',
                name: 'Plugin 0',
                version: '0.1.0',
                settings_schema: {
                    footer: 'This is a footer',
                    header: 'This is a header',
                    settings: [],
                },
                webapp: {},
            },
            plugin_1: {
                active: true,
                description: 'The plugin 1.',
                id: 'plugin_1',
                name: 'Plugin 1',
                version: '0.1.0',
                settings_schema: {
                    footer: 'This is a footer',
                    header: 'This is a header',
                    settings: [],
                },
                webapp: {},
            },
        },
        actions: {
            uploadPlugin: jest.fn(),
            removePlugin: jest.fn(),
            getPluginStatuses: jest.fn().mockResolvedValue([]),
            enablePlugin: jest.fn(),
            disablePlugin: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...defaultProps};
        const wrapper = shallow(<PluginManagement {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, disabled', () => {
        const props = {
            ...defaultProps,
            config: {
                ...defaultProps.config,
                PluginSettings: {
                    ...defaultProps.config.PluginSettings,
                    Enable: false,
                },
            },
        };
        const wrapper = shallow(<PluginManagement {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, upload disabled', () => {
        const props = {
            ...defaultProps,
            config: {
                ...defaultProps.config,
                PluginSettings: {
                    ...defaultProps.config.PluginSettings,
                    EnableUploads: false,
                },
            },
        };
        const wrapper = shallow(<PluginManagement {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, No installed plugins', () => {
        const props = {
            config: {
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            pluginStatuses: {},
            plugins: {},
            actions: {
                uploadPlugin: jest.fn(),
                removePlugin: jest.fn(),
                getPluginStatuses: jest.fn().mockResolvedValue([]),
                enablePlugin: jest.fn(),
                disablePlugin: jest.fn(),
            },
        };
        const wrapper = shallow(<PluginManagement {...props}/>);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with installed plugins', () => {
        const wrapper = shallow(<PluginManagement {...defaultProps}/>);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with installed plugins and not settings link', () => {
        const props = {
            config: {
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            pluginStatuses: {
                plugin_0: {
                    id: 'plugin_0',
                    version: '0.1.0',
                    state: PluginState.PLUGIN_STATE_NOT_RUNNING,
                    name: 'Plugin 0',
                    description: 'The plugin 0.',
                    is_prepackaged: false,
                    active: false,
                    instances: [
                        {
                            cluster_id: 'cluster_id_1',
                            state: PluginState.PLUGIN_STATE_NOT_RUNNING,
                            version: '0.1.0',
                        },
                    ],
                },
                plugin_1: {
                    id: 'plugin_1',
                    version: '0.0.1',
                    state: PluginState.PLUGIN_STATE_STOPPING,
                    name: 'Plugin 1',
                    description: 'The plugin.',
                    is_prepackaged: false,
                    active: true,
                    instances: [
                        {
                            cluster_id: 'cluster_id_1',
                            state: PluginState.PLUGIN_STATE_NOT_RUNNING,
                            version: '0.0.1',
                        },
                        {
                            cluster_id: 'cluster_id_2',
                            state: PluginState.PLUGIN_STATE_RUNNING,
                            version: '0.0.2',
                        },
                    ],
                },
            },
            plugins: {
                plugin_0: {
                    active: false,
                    description: 'The plugin 0.',
                    id: 'plugin_0',
                    name: 'Plugin 0',
                    version: '0.1.0',
                    webapp: {},
                },
                plugin_1: {
                    active: true,
                    description: 'The plugin 1.',
                    id: 'plugin_1',
                    name: 'Plugin 1',
                    version: '0.1.0',
                    webapp: {},
                },
            },
            actions: {
                uploadPlugin: jest.fn(),
                removePlugin: jest.fn(),
                getPluginStatuses: jest.fn().mockResolvedValue([]),
                enablePlugin: jest.fn(),
                disablePlugin: jest.fn(),
            },
        };
        const wrapper = shallow(<PluginManagement {...props}/>);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });
});
