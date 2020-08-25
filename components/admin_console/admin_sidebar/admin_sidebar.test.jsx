// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {samplePlugin1} from 'tests/helpers/admin_console_plugin_index_sample_pluings';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import AdminSidebar from 'components/admin_console/admin_sidebar/admin_sidebar.jsx';
import AdminDefinition from 'components/admin_console/admin_definition';
import {generateIndex} from 'utils/admin_console_index';

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => true),
    };
});

jest.mock('utils/admin_console_index');

describe('components/AdminSidebar', () => {
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
        adminDefinition: AdminDefinition,
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
        consoleAccess: {
            read: {
                about: true,
                reporting: true,
                user_management: true,
                environment: true,
                site_configuration: true,
                authentication: true,
                plugins: true,
                integrations: true,
                compliance: true,
                experimental: true,
            },
            write: {
                about: true,
                reporting: true,
                user_management: true,
                environment: true,
                site_configuration: true,
                authentication: true,
                plugins: true,
                integrations: true,
                compliance: true,
                experimental: true,
            },
        },
    };

    test('should match snapshot', () => {
        const props = {...defaultProps};
        const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, no access', () => {
        const ca = {
            consoleAccess: {
                read: {
                    about: false,
                    reporting: false,
                    user_management: false,
                    environment: false,
                    site_configuration: false,
                    authentication: false,
                    plugins: false,
                    integrations: false,
                    compliance: false,
                    experimental: false,
                },
                write: {
                    about: false,
                    reporting: false,
                    user_management: false,
                    environment: false,
                    site_configuration: false,
                    authentication: false,
                    plugins: false,
                    integrations: false,
                    compliance: false,
                    experimental: false,
                },
            },
        };
        const props = {...defaultProps, ...ca};
        const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, render plugins without any settings as well', () => {
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
            adminDefinition: AdminDefinition,
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

        const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
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
            adminDefinition: AdminDefinition,
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

        const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
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
            adminDefinition: AdminDefinition,
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

        const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
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
                ExperimentalSettings: {
                    RestrictSystemAdmin: false,
                },
                PluginSettings: {
                    Enable: true,
                    EnableUploads: true,
                },
            },
            adminDefinition: AdminDefinition,
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

        const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    describe('generateIndex', () => {
        const props = {
            license: {},
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
            adminDefinition: AdminDefinition,
            buildEnterpriseReady: true,
            navigationBlocked: false,
            siteName: 'test snap',
            plugins: {
                'mattermost-autolink': samplePlugin1,
            },
            onFilterChange: jest.fn(),
            actions: {
                getPlugins: jest.fn(),
            },
        };

        beforeEach(() => {
            generateIndex.mockReset();
        });

        test('should refresh the index in case idx is already present and there is a change in plugins or adminDefinition prop', () => {
            generateIndex.mockReturnValue(['mocked-index']);

            const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
            wrapper.instance().idx = ['some value'];

            expect(generateIndex).toHaveBeenCalledTimes(0);

            wrapper.setProps({plugins: {}});
            expect(generateIndex).toHaveBeenCalledTimes(1);

            wrapper.setProps({adminDefinition: {}});
            expect(generateIndex).toHaveBeenCalledTimes(2);
        });

        test('should not call the generate index in case of idx is not already present', () => {
            generateIndex.mockReturnValue(['mocked-index']);

            const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);

            expect(generateIndex).toHaveBeenCalledTimes(0);

            wrapper.setProps({plugins: {}});
            expect(generateIndex).toHaveBeenCalledTimes(0);

            wrapper.setProps({adminDefinition: {}});
            expect(generateIndex).toHaveBeenCalledTimes(0);
        });

        test('should not generate index in case of same props', () => {
            generateIndex.mockReturnValue(['mocked-index']);

            const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);
            wrapper.instance().idx = ['some value'];

            expect(generateIndex).toHaveBeenCalledTimes(0);

            wrapper.setProps({plugins: {
                'mattermost-autolink': samplePlugin1,
            }});
            expect(generateIndex).toHaveBeenCalledTimes(0);

            wrapper.setProps({adminDefinition: AdminDefinition});
            expect(generateIndex).toHaveBeenCalledTimes(0);
        });
    });

    describe('Plugins', () => {
        const idx = {search: jest.fn()};

        beforeEach(() => {
            idx.search.mockReset();
            generateIndex.mockReturnValue(idx);
        });

        const props = {
            license: {},
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
            adminDefinition: AdminDefinition,
            buildEnterpriseReady: true,
            navigationBlocked: false,
            siteName: 'test snap',
            plugins: {
                'mattermost-autolink': samplePlugin1,
            },
            onFilterChange: jest.fn(),
            actions: {
                getPlugins: jest.fn(),
            },
            consoleAccess: {
                read: {
                    plugins: true,
                },
            },
        };

        test('should match snapshot', () => {
            const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);

            expect(wrapper).toMatchSnapshot();
        });

        test('should filter plugins', () => {
            const wrapper = shallowWithIntl(<AdminSidebar {...props}/>);

            idx.search.mockReturnValue(['plugin_mattermost-autolink']);
            wrapper.find('#adminSidebarFilter').simulate('change', {target: {value: 'autolink'}});

            expect(wrapper.instance().state.sections).toEqual(['plugin_mattermost-autolink']);
            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find('AdminSidebarCategory')).toHaveLength(1);
            expect(wrapper.find('AdminSidebarSection')).toHaveLength(1);
            const autoLinkPluginSection = wrapper.find('AdminSidebarSection').at(0);
            expect(autoLinkPluginSection.prop('name')).toBe('plugins/plugin_mattermost-autolink');
        });
    });
});
