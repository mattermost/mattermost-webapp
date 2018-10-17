// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import GroupsList from 'components/admin_console/group_settings/groups_list.jsx';
import AdminPanel from 'components/admin_console/admin_panel.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

const LDAP_GROUPS_PAGE_SIZE = 10;

export default class GroupSettings extends React.PureComponent {
    static propTypes = {
        ldapGroups: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.shape({
            getLdapGroups: PropTypes.func.isRequired,
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        ldapGroups: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            page: 0,
        };
    }

    componentDidMount() {
        this.props.actions.getLdapGroups(this.state.page, LDAP_GROUPS_PAGE_SIZE).then(() => {
            this.setState({loading: false});
        });
    }

    previousPage = async (e) => {
        e.preventDefault();
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({checked: {}, page, loading: true});
        await this.props.actions.getLdapGroups(page, LDAP_GROUPS_PAGE_SIZE);
        this.setState({loading: false});
    }

    nextPage = async (e) => {
        e.preventDefault();
        const page = this.state.page + 1;
        this.setState({checked: {}, page, loading: true});
        await this.props.actions.getLdapGroups(page, LDAP_GROUPS_PAGE_SIZE);
        this.setState({loading: false});
    }

    renderLdapGroupsPanelFooter = () => {
        let prevButton = (<button className='btn btn-link prev'/>);
        if (this.state.page > 0) {
            prevButton = (
                <button
                    className='btn btn-link prev'
                    onClick={this.previousPage}
                >
                    <FormattedMessage
                        id='admin.group_settings.prev'
                        defaultMessage='Previous'
                    />
                </button>
            );
        }
        let nextButton = (<button className='btn btn-link next'/>);
        if (this.props.ldapGroups.length === LDAP_GROUPS_PAGE_SIZE) {
            nextButton = (
                <button
                    className='btn btn-link next'
                    onClick={this.nextPage}
                    disabled={this.state.nextDisabled}
                >
                    <FormattedMessage
                        id='admin.group_settings.next'
                        defaultMessage='Next'
                    />
                </button>
            );
        }
        return (
            <div className='groups-list--footer'>
                {prevButton}
                {nextButton}
            </div>
        );
    }

    renderLdapGroupsPanel = () => {
        return (
            <AdminPanel
                id='ldap_groups'
                titleId={t('admin.group_settings.ldapGroupsTitle')}
                titleDefaultMessage='AD/LDAP Groups'
                subtitleId={t('admin.group_settings.ldapGroupsDescription')}
                subtitleDefaultMessage='Link and configure groups from your AD/LDAP to Mattermost. Please ensure you have configured a [group filter](#).'
                footer={this.renderLdapGroupsPanelFooter()}
            >
                <GroupsList
                    groups={this.props.ldapGroups}
                    loading={this.state.loading}
                    actions={{
                        link: this.props.actions.link,
                        unlink: this.props.actions.unlink,
                    }}
                />
            </AdminPanel>
        );
    };

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
                            defaultMessage={'Groups are a way to organize users and apply actions to all users within that group.\nFor more information on Groups, please see [documentation](!https://about.mattermost.com).'}
                        />
                    </div>
                </div>

                {this.renderLdapGroupsPanel()}

            </div>
        );
    };
}
