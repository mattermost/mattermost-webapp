// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {t} from 'utils/i18n';
import GroupsList from 'components/admin_console/group_settings/groups_list';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {getSiteURL} from 'utils/url';

export default class GroupSettings extends React.PureComponent {
    static propTypes = {
        isDisabled: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.bool,
        ]),
    }

    render = () => {
        const siteURL = getSiteURL();
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header'>
                    <FormattedMessage
                        id='admin.group_settings.groupsPageTitle'
                        defaultMessage='Groups'
                    />
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
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
                            titleDefault='AD/LDAP Groups'
                            subtitleId={t('admin.group_settings.ldapGroupsDescription')}
                            subtitleDefault={`Connect AD/LDAP and create groups in Mattermost. To get started, configure group attributes on the [AD/LDAP] (${siteURL}/admin_console/authentication/ldap) configuration page.`}
                            subtitleValues={{siteURL}}
                        >
                            <GroupsList
                                readOnly={this.props.isDisabled}
                            />
                        </AdminPanel>
                    </div>
                </div>
            </div>
        );
    };
}
