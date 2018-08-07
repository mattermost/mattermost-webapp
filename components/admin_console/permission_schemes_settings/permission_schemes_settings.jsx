// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import LoadingScreen from 'components/loading_screen.jsx';

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
            <Link
                to='https://docs.mattermost.com/administration/config-settings.html#jobs'
                target='_blank'
            >
                <FormattedMessage
                    id='admin.permissions.documentationLinkText'
                    defaultMessage='documentation'
                />
            </Link>
        );

        if (this.props.jobsAreEnabled && !this.props.clusterIsEnabled) {
            return this.teamOverrideUnavalableView(
                'admin.permissions.teamOverrideSchemesInProgress',
                'Migration job in progress: Team Override Schemes are not available until the job server completes the permissions migration. Learn more in the {documentationLink}.',
                docLink
            );
        }

        return this.teamOverrideUnavalableView(
            'admin.permissions.teamOverrideSchemesNoJobsEnabled',
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
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.permissions.permissionSchemes'
                        defaultMessage='Permission Schemes'
                    />
                </h3>

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
