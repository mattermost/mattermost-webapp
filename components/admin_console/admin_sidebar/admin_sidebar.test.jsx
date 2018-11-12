// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminSidebar from 'components/admin_console/admin_sidebar/admin_sidebar.jsx';

jest.mock('utils/utils', () => {
    const original = require.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => true),
    };
});

describe('components/AdminSidebar', () => {
    const defaultProps = {
        license: {},
        config: {
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
            },
        },
        buildEnterpriseReady: false,
        siteName: 'test snap',
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
        },
        actions: {
            getPlugins: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...defaultProps};
        const context = {router: {}};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, not render the plugin in the sidebar because does not have settings', () => {
        const props = {
            license: {},
            config: {
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            buildEnterpriseReady: false,
            siteName: 'test snap',
            plugins: {
                plugin_0: {
                    active: false,
                    description: 'The plugin 0.',
                    id: 'plugin_0',
                    name: 'Plugin 0',
                    version: '0.1.0',
                    settings_schema: {
                        footer: '',
                        header: '',
                        settings: [],
                    },
                    webapp: {},
                },
            },
            actions: {
                getPlugins: jest.fn(),
            },
        };

        const context = {router: {}};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });
});
