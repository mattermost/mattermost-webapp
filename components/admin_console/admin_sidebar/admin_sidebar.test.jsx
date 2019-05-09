// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
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
    const intlProvider = new IntlProvider({locale: 'en', defaultLocale: 'en'}, {});
    const {intl} = intlProvider.getChildContext();
    const defaultProps = {
        license: {},
        config: {
            ExperimentalSettings: {
                RestrictSystemAdmin: false,
            },
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
            },
        },
        buildEnterpriseReady: false,
        navigationBlocked: false,
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
        onFilterChange: jest.fn(),
        actions: {
            getPlugins: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...defaultProps};
        const context = {router: {}, intl};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, not render the plugin in the sidebar because does not have settings', () => {
        const props = {
            license: {},
            config: {
                ExperimentalSettings: {
                    RestrictSystemAdmin: false,
                },
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            buildEnterpriseReady: false,
            siteName: 'test snap',
            navigationBlocked: false,
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
            onFilterChange: jest.fn(),
            actions: {
                getPlugins: jest.fn(),
            },
        };

        const context = {router: {}, intl};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, not prevent the console from loading when empty settings_schema provided', () => {
        const props = {
            license: {},
            config: {
                ExperimentalSettings: {
                    RestrictSystemAdmin: false,
                },
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            buildEnterpriseReady: false,
            siteName: 'test snap',
            navigationBlocked: false,
            plugins: {
                plugin_0: {
                    active: false,
                    description: 'The plugin 0.',
                    id: 'plugin_0',
                    name: 'Plugin 0',
                    version: '0.1.0',
                    settings_schema: {},
                    webapp: {},
                },
            },
            onFilterChange: jest.fn(),
            actions: {
                getPlugins: jest.fn(),
            },
        };

        const context = {router: {}, intl};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with license (without any explicit feature)', () => {
        const props = {
            license: {
                IsLicensed: 'true',
            },
            config: {
                ExperimentalSettings: {
                    RestrictSystemAdmin: false,
                },
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            buildEnterpriseReady: true,
            navigationBlocked: false,
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
            onFilterChange: jest.fn(),
            actions: {
                getPlugins: jest.fn(),
            },
        };

        const context = {router: {}, intl};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with license (with all feature)', () => {
        const props = {
            license: {
                IsLicensed: 'true',
                DataRetention: 'true',
                LDAPGroups: 'true',
                LDAP: 'true',
                Cluster: 'true',
                Metrics: 'true',
                SAML: 'true',
                Compliance: 'true',
                CustomTermsOfService: 'true',
                MessageExport: 'true',
                Elasticsearch: 'true',
                CustomPermissionsSchemes: 'true',
            },
            config: {
                ServiceSettings: {
                    ExperimentalLdapGroupSync: true,
                },
                ExperimentalSettings: {
                    RestrictSystemAdmin: false,
                },
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            buildEnterpriseReady: true,
            navigationBlocked: false,
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
            onFilterChange: jest.fn(),
            actions: {
                getPlugins: jest.fn(),
            },
        };

        const context = {router: {}, intl};
        const wrapper = shallow(<AdminSidebar {...props}/>, {context});
        expect(wrapper).toMatchSnapshot();
    });
});
