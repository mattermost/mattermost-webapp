// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {localizeMessage} from 'utils/utils.jsx';
import BackstageList from 'components/backstage/components/backstage_list.jsx';
import InstalledOAuthApp from '../installed_oauth_app';
import {matchesFilter} from '../installed_oauth_app/installed_oauth_app';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class InstalledOAuthApps extends React.PureComponent {
    static propTypes = {

        /**
        * The team data
        */
        team: PropTypes.object,

        /**
        * The oauthApps data
        */
        oauthApps: PropTypes.object,

        /**
        * Set if user can manage oath
        */
        canManageOauth: PropTypes.bool,

        actions: PropTypes.shape({

            /**
            * The function to call to fetch OAuth apps
            */
            loadOAuthAppsAndProfiles: PropTypes.func.isRequired,

            /**
            * The function to call when Regenerate Secret link is clicked
            */
            regenOAuthAppSecret: PropTypes.func.isRequired,

            /**
            * The function to call when Delete link is clicked
            */
            deleteOAuthApp: PropTypes.func.isRequired,
        }).isRequired,

        /**
        * Whether or not OAuth applications are enabled.
        */
        enableOAuthServiceProvider: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        if (this.props.enableOAuthServiceProvider) {
            this.props.actions.loadOAuthAppsAndProfiles().then(
                () => this.setState({loading: false}),
            );
        }
    }

    deleteOAuthApp = (app) => {
        if (app && app.id) {
            this.props.actions.deleteOAuthApp(app.id);
        }
    }

    oauthAppCompare(a, b) {
        let nameA = a.name;
        if (!nameA) {
            nameA = localizeMessage('installed_integrations.unnamed_oauth_app', 'Unnamed OAuth 2.0 Application');
        }

        let nameB = b.name;
        if (!nameB) {
            nameB = localizeMessage('installed_integrations.unnamed_oauth_app', 'Unnamed OAuth 2.0 Application');
        }

        return nameA.localeCompare(nameB);
    }

    oauthApps = (filter) => Object.values(this.props.oauthApps).
        filter((app) => matchesFilter(app, filter)).
        sort(this.oauthAppCompare).
        map((app) => {
            return (
                <InstalledOAuthApp
                    key={app.id}
                    team={this.props.team}
                    oauthApp={app}
                    onRegenerateSecret={this.props.actions.regenOAuthAppSecret}
                    onDelete={this.deleteOAuthApp}
                />
            );
        });

    render() {
        const integrationsEnabled = this.props.enableOAuthServiceProvider && this.props.canManageOauth;
        let props;
        if (integrationsEnabled) {
            props = {
                addLink: '/' + this.props.team.name + '/integrations/oauth2-apps/add',
                addText: localizeMessage('installed_oauth_apps.add', 'Add OAuth 2.0 Application'),
                addButtonId: 'addOauthApp',
            };
        }

        return (
            <BackstageList
                header={
                    <FormattedMessage
                        id='installed_oauth_apps.header'
                        defaultMessage='OAuth 2.0 Applications'
                    />
                }
                helpText={
                    <FormattedMessage
                        id='installed_oauth_apps.help'
                        defaultMessage='Create {oauthApplications} to securely integrate bots and third-party apps with Mattermost. Visit the {appDirectory} to find available self-hosted apps.'
                        values={{
                            oauthApplications: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://docs.mattermost.com/developer/oauth-2-0-applications.html'
                                >
                                    <FormattedMessage
                                        id='installed_oauth_apps.help.oauthApplications'
                                        defaultMessage='OAuth 2.0 applications'
                                    />
                                </a>
                            ),
                            appDirectory: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://about.mattermost.com/default-app-directory/'
                                >
                                    <FormattedMessage
                                        id='installed_oauth_apps.help.appDirectory'
                                        defaultMessage='App Directory'
                                    />
                                </a>
                            ),
                        }}
                    />
                }
                emptyText={
                    <FormattedMessage
                        id='installed_oauth_apps.empty'
                        defaultMessage='No OAuth 2.0 Applications found'
                    />
                }
                emptyTextSearch={
                    <FormattedMarkdownMessage
                        id='installed_oauth_apps.emptySearch'
                        defaultMessage='No OAuth 2.0 Applications match {searchTerm}'
                    />
                }
                searchPlaceholder={localizeMessage('installed_oauth_apps.search', 'Search OAuth 2.0 Applications')}
                loading={this.state.loading}
                {...props}
            >
                {(filter) => {
                    const children = this.oauthApps(filter);
                    return [children, children.length > 0];
                }}
            </BackstageList>
        );
    }
}
