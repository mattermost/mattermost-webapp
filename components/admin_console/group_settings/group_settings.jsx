// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import GroupsList from 'components/admin_console/group_settings/groups_list';
import AdminPanel from 'components/admin_console/admin_panel.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class GroupSettings extends React.PureComponent {
    render = () => {
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.group_settings.groupsPageTitle'
                        defaultMessage='Groups'
                    />
                </h3>

                <div className={'banner info'}>
                    <div className='banner__content'>
                        <FormattedMarkdownMessage
                            id='admin.group_settings.introBanner'
                            defaultMessage={'Groups are a way to organize users and apply actions to all users within that group.\nFor more information on Groups, please see [documentation](!https://www.mattermost.com/default-ad-ldap-groups).'}
                        />
                    </div>
                </div>

                <AdminPanel
                    id='ldap_groups'
                    titleId={t('admin.group_settings.ldapGroupsTitle')}
                    titleDefaultMessage='AD/LDAP Groups'
                    subtitleId={t('admin.group_settings.ldapGroupsDescription')}
                    subtitleDefaultMessage='Link and configure groups from your AD/LDAP to Mattermost. Please ensure you have configured a [group filter](/admin_console/authentication/ldap).'
                >
                    <GroupsList/>
                </AdminPanel>
            </div>
        );
    };
}
