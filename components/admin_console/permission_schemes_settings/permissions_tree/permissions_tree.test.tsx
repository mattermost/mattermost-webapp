// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {LicenseSkus} from 'mattermost-redux/types/general';

import PermissionsTree from 'components/admin_console/permission_schemes_settings/permissions_tree/permissions_tree';

import PermissionGroup from 'components/admin_console/permission_schemes_settings/permission_group.jsx';

describe('components/admin_console/permission_schemes_settings/permission_tree', () => {
    const defaultProps = {
        scope: 'channel_scope',
        config: {
            EnableIncomingWebhooks: 'true',
            EnableOutgoingWebhooks: 'true',
            EnableOAuthServiceProvider: 'true',
            EnableCommands: 'true',
            EnableCustomEmoji: 'true',
        },
        role: {
            name: 'test',
            permissions: [],
        },
        onToggle: jest.fn(),
        selectRow: jest.fn(),
        parentRole: null,
        readOnly: false,
        license: {
            LDAPGroups: 'true',
            isLicensed: 'true',
            SkuShortName: LicenseSkus.Enterprise,
        },
        customGroupsEnabled: true,
    };

    test('should match snapshot on default data', () => {
        const wrapper = shallow(
            <PermissionsTree {...defaultProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on read only', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                readOnly={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on team scope', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                scope={'team_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on system scope', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                scope={'system_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on license without LDAPGroups', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                license={{}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with parentRole with permissions', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                parentRole={{permissions: ['invite_user']}}
                scope={'system_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should ask to toggle on row toggle', () => {
        const onToggle = jest.fn();
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                onToggle={onToggle}
            />,
        );
        wrapper.find(PermissionGroup).first().prop('onChange')(['test_permission', 'test_permission2']);
        expect(onToggle).toBeCalledWith('test', ['test_permission', 'test_permission2']);
    });

    test('should hide disabbled integration options', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
                config={{
                    EnableIncomingWebhooks: 'false',
                    EnableOutgoingWebhooks: 'false',
                    EnableCommands: 'false',
                    EnableCustomEmoji: 'false',
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should map groups in the correct order', () => {
        const wrapper = shallow(
            <PermissionsTree
                {...defaultProps}
            />,
        );

        const groups = wrapper.find(PermissionGroup).first().prop('permissions');
        expect(groups[0].id).toStrictEqual('teams');
        expect(groups[6].id).toStrictEqual('posts');
        expect(groups[7].id).toStrictEqual('integrations');
        expect(groups[8].id).toStrictEqual('manage_shared_channels');
        expect(groups[9].id).toStrictEqual('custom_groups');
    });

    describe('should show playbook permissions', () => {
        it('for starter license', () => {
            const props = {
                ...defaultProps,
                license: {
                    isLicensed: 'true',
                    SkuShortName: LicenseSkus.Starter,
                },
            };

            const wrapper = shallow(
                <PermissionsTree
                    {...props}
                />,
            );

            const groups = wrapper.find(PermissionGroup).first().prop('permissions');
            expect(groups[3].id).toStrictEqual('playbook_public');
            expect(groups[4].id).toStrictEqual('runs');
        });

        it('for professional license', () => {
            const props = {
                ...defaultProps,
                license: {
                    isLicensed: 'true',
                    SkuShortName: LicenseSkus.Professional,
                },
            };

            const wrapper = shallow(
                <PermissionsTree
                    {...props}
                />,
            );

            const groups = wrapper.find(PermissionGroup).first().prop('permissions');
            expect(groups[3].id).toStrictEqual('playbook_public');
            expect(groups[4].id).toStrictEqual('runs');
        });

        it('for enterprise license', () => {
            const props = {
                ...defaultProps,
                license: {
                    isLicensed: 'true',
                    SkuShortName: LicenseSkus.Enterprise,
                },
            };

            const wrapper = shallow(
                <PermissionsTree
                    {...props}
                />,
            );

            const groups = wrapper.find(PermissionGroup).first().prop('permissions');
            expect(groups[3].id).toStrictEqual('playbook_public');
            expect(groups[4].id).toStrictEqual('playbook_private');
            expect(groups[5].id).toStrictEqual('runs');
        });
    });
});
