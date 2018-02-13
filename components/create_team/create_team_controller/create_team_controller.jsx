// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Route, Switch, Redirect} from 'react-router-dom';

import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button.jsx';

import TeamUrl from '../team_url';
import DisplayName from '../display_name';

export default class CreateTeamController extends React.Component {
    constructor(props) {
        super(props);

        const state = {};
        state.team = {};
        state.wizard = 'display_name';
        this.state = state;
    }

    submit = () => {
        // todo fill in
    }

    updateParent = (state) => {
        this.setState(state);
        this.props.history.push('/create_team/' + state.wizard);
    }

    render() {
        let description = null;
        if (this.props.isLicensed && this.props.customBrand && this.props.enableCustomBrand) {
            description = this.props.customDescriptionText;
        } else {
            description = (
                <FormattedMessage
                    id='web.root.signup_info'
                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                />
            );
        }

        let url = '/select_team';
        const team = TeamStore.getCurrent();
        const channel = ChannelStore.getCurrent();
        if (team) {
            url = `/${team.name}`;
            if (channel) {
                url += `/channels/${channel.name}`;
            }
        }

        return (
            <div>
                <AnnouncementBar/>
                <BackButton url={url}/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <h1>{this.props.siteName}</h1>
                        <h4 className='color--light'>
                            {description}
                        </h4>
                        <div className='signup__content'>
                            <Switch>
                                <Route
                                    path={`${this.props.match.url}/display_name`}
                                    render={(props) => (
                                        <DisplayName
                                            state={this.state}
                                            updateParent={this.updateParent}
                                            {...props}
                                        />
                                )}
                                />
                                <Route
                                    path={`${this.props.match.url}/team_url`}
                                    render={(props) => (
                                        <TeamUrl
                                            state={this.state}
                                            updateParent={this.updateParent}
                                            {...props}
                                        />
                                )}
                                />
                                <Redirect to={`${this.props.match.url}/display_name`}/>
                            </Switch>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CreateTeamController.propTypes = {
    children: PropTypes.node,
    isLicensed: PropTypes.bool.isRequired,
    customBrand: PropTypes.bool.isRequired,
    enableCustomBrand: PropTypes.bool.isRequired,
    customDescriptionText: PropTypes.string,
    siteName: PropTypes.string
};
