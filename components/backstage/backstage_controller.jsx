// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Route, Switch} from 'react-router-dom';

import Pluggable from 'plugins/pluggable';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import AnnouncementBar from 'components/announcement_bar';
import Integrations from 'components/integrations/components/integrations.jsx';
import Emoji from 'components/emoji';
import AddEmoji from 'components/emoji/add_emoji';
import InstalledIncomingWebhooks from 'components/integrations/components/installed_incoming_webhooks';
import AddIncomingWehook from 'components/integrations/components/add_incoming_webhook';
import EditIncomingWebhook from 'components/integrations/components/edit_incoming_webhook';
import InstalledOutgoingWebhooks from 'components/integrations/components/installed_outgoing_webhooks';
import AddOutgoingWebhook from 'components/integrations/components/add_outgoing_webhook';
import EditOutgoingWebhook from 'components/integrations/components/edit_outgoing_webhook';
import InstalledOauthApps from 'components/integrations/components/installed_oauth_apps';
import AddOauthApp from 'components/integrations/components/add_oauth_app';
import EditOauthApp from 'components/integrations/components/edit_oauth_app';
import CommandsContainer from 'components/integrations/components/commands_container';
import ConfirmIntegration from 'components/integrations/components/confirm_integration';

import BackstageSidebar from './components/backstage_sidebar.jsx';
import BackstageNavbar from './components/backstage_navbar';

const BackstageRoute = ({component: Component, extraProps, ...rest}) => ( //eslint-disable-line react/prop-types
    <Route
        {...rest}
        render={(props) => (
            <Component
                {...extraProps}
                {...props}
            />
        )}
    />
);

export default class BackstageController extends React.Component {
    constructor(props) {
        super(props);

        this.onTeamChange = this.onTeamChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);

        const team = TeamStore.getCurrent();
        const user = UserStore.getCurrentUser();

        this.state = {
            user,
            team,
            isAdmin: UserStore.isSystemAdminForCurrentUser(user) ||
                TeamStore.isTeamAdminForCurrentTeam(team)
        };
    }

    componentDidMount() {
        TeamStore.addChangeListener(this.onTeamChange);
        UserStore.addChangeListener(this.onUserChange);
    }

    componentWillUnmount() {
        TeamStore.removeChangeListener(this.onTeamChange);
        UserStore.removeChangeListener(this.onUserChange);
    }

    onUserChange() {
        const user = UserStore.getCurrentUser();

        this.setState({
            user
        });
    }

    onTeamChange() {
        const team = TeamStore.getCurrent();

        this.setState({
            team,
            isAdmin: UserStore.isSystemAdminForCurrentUser(this.state.user) ||
                TeamStore.isTeamAdminForCurrentTeam(team)
        });
    }

    render() {
        if (this.state.team == null || this.state.user == null) {
            return <div/>;
        }
        const extraProps = {
            team: this.state.team,
            user: this.state.user,
            isAdmin: this.state.isAdmin
        };
        return (
            <div className='backstage'>
                <AnnouncementBar/>
                <BackstageNavbar team={this.state.team}/>
                <Pluggable pluggableName='Root'/>
                <div className='backstage-body'>
                    <BackstageSidebar
                        team={this.state.team}
                        user={this.state.user}
                    />
                    <Switch>
                        <BackstageRoute
                            extraProps={extraProps}
                            exact={true}
                            path={'/:team/integrations'}
                            component={Integrations}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            exact={true}
                            path={`${this.props.match.url}/incoming_webhooks`}
                            component={InstalledIncomingWebhooks}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/incoming_webhooks/add`}
                            component={AddIncomingWehook}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/incoming_webhooks/edit`}
                            component={EditIncomingWebhook}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            exact={true}
                            path={`${this.props.match.url}/outgoing_webhooks`}
                            component={InstalledOutgoingWebhooks}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/outgoing_webhooks/add`}
                            component={AddOutgoingWebhook}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/outgoing_webhooks/edit`}
                            component={EditOutgoingWebhook}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/commands`}
                            component={CommandsContainer}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            exact={true}
                            path={`${this.props.match.url}/oauth2-apps`}
                            component={InstalledOauthApps}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/oauth2-apps/add`}
                            component={AddOauthApp}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/oauth2-apps/edit`}
                            component={EditOauthApp}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/confirm`}
                            component={ConfirmIntegration}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            exact={true}
                            path={'/:team/emoji'}
                            component={Emoji}
                        />
                        <BackstageRoute
                            extraProps={extraProps}
                            path={`${this.props.match.url}/add`}
                            component={AddEmoji}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
