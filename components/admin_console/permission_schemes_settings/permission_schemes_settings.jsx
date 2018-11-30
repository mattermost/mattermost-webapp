// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import LoadingScreen from 'components/loading_screen.jsx';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header.jsx';

import PermissionsSchemeSummary from './permissions_scheme_summary';

const PAGE_SIZE = 30;
const PHASE_2_MIGRATION_IMCOMPLETE_STATUS_CODE = 501;

export default class PermissionSchemesSettings extends React.PureComponent {
    static propTypes = {
        schemes: PropTypes.object.isRequired,
        jobsAreEnabled: PropTypes.bool,
        clusterIsEnabled: PropTypes.bool,
        actions: PropTypes.shape({
            loadSchemes: PropTypes.func.isRequired,
            loadSchemeTeams: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            loadingMore: false,
            page: 0,
            phase2MigrationIsComplete: false,
        };
    }

    static defaultProps = {
        schemes: {},
    };

    async UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        let schemes;
        let phase2MigrationIsComplete = true; // Assume migration is complete unless HTTP status code says otherwise.
        try {
            schemes = await this.props.actions.loadSchemes('team', 0, PAGE_SIZE);
            if (schemes.error.status_code === PHASE_2_MIGRATION_IMCOMPLETE_STATUS_CODE) {
                phase2MigrationIsComplete = false;
            }
            const promises = [];
            for (const scheme of schemes.data) {
                promises.push(this.props.actions.loadSchemeTeams(scheme.id));
            }
            Promise.all(promises).then(() => this.setState({loading: false, phase2MigrationIsComplete}));
        } catch (err) {
            this.setState({loading: false, phase2MigrationIsComplete});
        }
    }

    loadMoreSchemes = () => {
        this.setState({loadingMore: true});
        this.props.actions.loadSchemes('team', this.state.page + 1, PAGE_SIZE).then((schemes) => {
            const promises = [];
            for (const scheme of schemes.data) {
                promises.push(this.props.actions.loadSchemeTeams(scheme.id));
            }
            Promise.all(promises).then(() => this.setState({loadingMore: false, page: this.state.page + 1}));
        });
    }

    // |RunJobs && !EnableCluster|(*App).IsPhase2MigrationCompleted|View                                                   |
    // |-------------------------|---------------------------------|-------------------------------------------------------|
    // |true                     |true                             |null                                                   |
    // |false                    |true                             |null (Jobs were disabled after a successful migration.)|
    // |false                    |false                            |On hold view.                                          |
    // |true                     |false                            |In progress view.                                      |
    teamOverrideSchemesMigrationView = () => {
        if (this.state.phase2MigrationIsComplete) {
            return null;
        }

        const docLink = (
            <a
                href='https://docs.mattermost.com/administration/config-settings.html#jobs'
                rel='noopener noreferrer'
                target='_blank'
            >
                <FormattedMessage
                    id='admin.permissions.documentationLinkText'
                    defaultMessage='documentation'
                />
            </a>
        );

        if (this.props.jobsAreEnabled && !this.props.clusterIsEnabled) {
            return this.teamOverrideUnavalableView(
                t('admin.permissions.teamOverrideSchemesInProgress'),
                'Migration job in progress: Team Override Schemes are not available until the job server completes the permissions migration. Learn more in the {documentationLink}.',
                docLink
            );
        }

        return this.teamOverrideUnavalableView(
            t('admin.permissions.teamOverrideSchemesNoJobsEnabled'),
            'Migration job on hold: Team Override Schemes are not available until the job server can execute the permissions migration. The job will be automatically started when the job server is enabled. Learn more in the {documentationLink}.',
            docLink,
        );
    }

    teamOverrideUnavalableView = (id, defaultMsg, documentationLink) => {
        return (
            <div className='team-override-unavailable'>
                <div className='team-override-unavailable__inner'>
                    <FormattedMessage
                        id={id}
                        defaultMessage={defaultMsg}
                        values={{documentationLink}}
                    />
                </div>
            </div>
        );
    };

    render = () => {
        if (this.state.loading) {
            return (<LoadingScreen/>);
        }
        const schemes = Object.values(this.props.schemes).map((scheme) => (
            <PermissionsSchemeSummary
                scheme={scheme}
                history={this.props.history}
                key={scheme.id}
            />
        ));

        const teamOverrideView = this.teamOverrideSchemesMigrationView();

        return (
            <div className='wrapper--fixed'>
                <FormattedAdminHeader
                    id='admin.permissions.permissionSchemes'
                    defaultMessage='Permission Schemes'
                />
                <div className={'banner info'}>
                    <div className='banner__content'>
                        <span>
                            <FormattedMarkdownMessage
                                id='admin.permissions.introBanner'
                                defaultMessage='Permission Schemes set the default permissions for Team Admins, Channel Admins and everyone else. Learn more about permission schemes in our [documentation](!https://about.mattermost.com/default-advanced-permissions).'
                            />
                        </span>
                    </div>
                </div>

                <div className='permissions-block'>
                    <div className='header'>
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.systemSchemeBannerTitle'
                                    defaultMessage='System Scheme'
                                />
                            </h3>
                            <span>
                                <FormattedMarkdownMessage
                                    id='admin.permissions.systemSchemeBannerText'
                                    defaultMessage='Set the default permissions inherited by all teams unless a [Team Override Scheme](!https://about.mattermost.com/default-team-override-scheme) is applied.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <Link
                                className='btn btn-primary'
                                to='/admin_console/permissions/system-scheme'
                            >
                                <FormattedMessage
                                    id='admin.permissions.systemSchemeBannerButton'
                                    defaultMessage='Edit Scheme'
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className='permissions-block'>
                    <div className='header'>
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.teamOverrideSchemesTitle'
                                    defaultMessage='Team Override Schemes'
                                />
                            </h3>
                            <span>
                                <FormattedMarkdownMessage
                                    id='admin.permissions.teamOverrideSchemesBannerText'
                                    defaultMessage='Use when specific teams need permission exceptions to the [System Scheme](!https://about.mattermost.com/default-system-scheme).'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <Link
                                className='btn btn-primary'
                                to='/admin_console/permissions/team-override-scheme'
                                disabled={teamOverrideView !== null}
                                onClick={(e) => {
                                    if (teamOverrideView !== null) {
                                        e.preventDefault();
                                        return false;
                                    }
                                    return true;
                                }}
                            >
                                <FormattedMessage
                                    id='admin.permissions.teamOverrideSchemesNewButton'
                                    defaultMessage='New Team Override Scheme'
                                />
                            </Link>
                        </div>
                    </div>
                    {schemes.length === 0 && teamOverrideView === null &&
                        <div className='no-team-schemes'>
                            <FormattedMessage
                                id='admin.permissions.teamOverrideSchemesNoSchemes'
                                defaultMessage='No team override schemes created.'
                            />
                        </div>}
                    {teamOverrideView}
                    {schemes.length > 0 && schemes}
                    {!this.state.loadingMore && schemes.length === (PAGE_SIZE * (this.state.page + 1)) &&
                        <button
                            className='more-schemes theme style--none color--link'
                            onClick={this.loadMoreSchemes}
                        >
                            <FormattedMessage
                                id='admin.permissions.loadMoreSchemes'
                                defaultMessage='Load more schemes'
                            />
                        </button>}
                    {this.state.loadingMore &&
                        <button className='more-schemes theme style--none color--link'>
                            <span className='fa fa-refresh icon--rotate'/>
                            <FormattedMessage
                                id='admin.permissions.loadingMoreSchemes'
                                defaultMessage='Loading...'
                            />
                        </button>}
                </div>
            </div>
        );
    };
}

t('admin.permissions.group.delete_posts.description');
t('admin.permissions.group.delete_posts.name');
t('admin.permissions.group.integrations.description');
t('admin.permissions.group.integrations.name');
t('admin.permissions.group.posts.description');
t('admin.permissions.group.posts.name');
t('admin.permissions.group.private_channel.description');
t('admin.permissions.group.private_channel.name');
t('admin.permissions.group.public_channel.description');
t('admin.permissions.group.public_channel.name');
t('admin.permissions.group.reactions.description');
t('admin.permissions.group.reactions.name');
t('admin.permissions.group.send_invites.description');
t('admin.permissions.group.send_invites.name');
t('admin.permissions.group.teams.description');
t('admin.permissions.group.teams.name');
t('admin.permissions.group.edit_posts.description');
t('admin.permissions.group.edit_posts.name');
t('admin.permissions.group.teams_team_scope.description');
t('admin.permissions.group.teams_team_scope.name');
t('admin.permissions.permission.assign_system_admin_role.description');
t('admin.permissions.permission.assign_system_admin_role.name');
t('admin.permissions.permission.create_direct_channel.description');
t('admin.permissions.permission.create_direct_channel.name');
t('admin.permissions.permission.create_group_channel.description');
t('admin.permissions.permission.create_group_channel.name');
t('admin.permissions.permission.create_private_channel.description');
t('admin.permissions.permission.create_private_channel.name');
t('admin.permissions.permission.create_public_channel.description');
t('admin.permissions.permission.create_public_channel.name');
t('admin.permissions.permission.create_team.description');
t('admin.permissions.permission.create_team.name');
t('admin.permissions.permission.create_user_access_token.description');
t('admin.permissions.permission.create_user_access_token.name');
t('admin.permissions.permission.delete_others_posts.description');
t('admin.permissions.permission.delete_others_posts.name');
t('admin.permissions.permission.delete_post.description');
t('admin.permissions.permission.delete_post.name');
t('admin.permissions.permission.delete_private_channel.description');
t('admin.permissions.permission.delete_private_channel.name');
t('admin.permissions.permission.delete_public_channel.description');
t('admin.permissions.permission.delete_public_channel.name');
t('admin.permissions.permission.edit_other_users.description');
t('admin.permissions.permission.edit_other_users.name');
t('admin.permissions.permission.edit_post.description');
t('admin.permissions.permission.edit_post.name');
t('admin.permissions.permission.import_team.description');
t('admin.permissions.permission.import_team.name');
t('admin.permissions.permission.list_team_channels.description');
t('admin.permissions.permission.list_team_channels.name');
t('admin.permissions.permission.list_users_without_team.description');
t('admin.permissions.permission.list_users_without_team.name');
t('admin.permissions.permission.manage_channel_roles.description');
t('admin.permissions.permission.manage_channel_roles.name');
t('admin.permissions.permission.manage_emojis.description');
t('admin.permissions.permission.manage_emojis.name');
t('admin.permissions.permission.manage_jobs.description');
t('admin.permissions.permission.manage_jobs.name');
t('admin.permissions.permission.manage_oauth.description');
t('admin.permissions.permission.manage_oauth.name');
t('admin.permissions.permission.manage_private_channel_members.description');
t('admin.permissions.permission.manage_private_channel_members.name');
t('admin.permissions.permission.manage_private_channel_properties.description');
t('admin.permissions.permission.manage_private_channel_properties.name');
t('admin.permissions.permission.manage_public_channel_members.description');
t('admin.permissions.permission.manage_public_channel_members.name');
t('admin.permissions.permission.manage_public_channel_properties.description');
t('admin.permissions.permission.manage_public_channel_properties.name');
t('admin.permissions.permission.manage_roles.description');
t('admin.permissions.permission.manage_roles.name');
t('admin.permissions.permission.manage_slash_commands.description');
t('admin.permissions.permission.manage_slash_commands.name');
t('admin.permissions.permission.manage_system.description');
t('admin.permissions.permission.manage_system.name');
t('admin.permissions.permission.manage_team.description');
t('admin.permissions.permission.manage_team.name');
t('admin.permissions.permission.manage_team_roles.description');
t('admin.permissions.permission.manage_team_roles.name');
t('admin.permissions.permission.manage_webhooks.description');
t('admin.permissions.permission.manage_webhooks.name');
t('admin.permissions.permission.permanent_delete_user.description');
t('admin.permissions.permission.permanent_delete_user.name');
t('admin.permissions.permission.read_channel.description');
t('admin.permissions.permission.read_channel.name');
t('admin.permissions.permission.read_user_access_token.description');
t('admin.permissions.permission.read_user_access_token.name');
t('admin.permissions.permission.remove_user_from_team.description');
t('admin.permissions.permission.remove_user_from_team.name');
t('admin.permissions.permission.revoke_user_access_token.description');
t('admin.permissions.permission.revoke_user_access_token.name');
t('admin.permissions.permission.upload_file.description');
t('admin.permissions.permission.upload_file.name');
t('admin.permissions.permission.view_team.description');
t('admin.permissions.permission.view_team.name');
t('admin.permissions.permission.edit_others_posts.description');
t('admin.permissions.permission.edit_others_posts.name');
t('admin.permissions.roles.all_users.name');
t('admin.permissions.roles.channel_admin.name');
t('admin.permissions.roles.channel_user.name');
t('admin.permissions.roles.system_admin.name');
t('admin.permissions.roles.system_user.name');
t('admin.permissions.roles.team_admin.name');
t('admin.permissions.roles.team_user.name');
