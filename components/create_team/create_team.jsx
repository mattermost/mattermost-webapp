// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button';
import DisplayName from 'components/create_team/components/display_name';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import TeamUrl from 'components/create_team/components/team_url';

export default class CreateTeam extends React.PureComponent {
    static propTypes = {

        /*
         * Object containing information on the current team, used to define BackButton's url
         */
        currentTeam: PropTypes.object,

        /*
         * Object containing information on the current selected channel, used to define BackButton's url
         */
        currentChannel: PropTypes.object,

        /*
         * String containing the custom branding's text
         */
        customDescriptionText: PropTypes.string,

        /*
         * String containing the custom branding's Site Name
         */
        siteName: PropTypes.string,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const state = {};
        state.team = {};
        state.wizard = 'display_name';
        this.state = state;
    }

    updateParent = (state) => {
        this.setState(state);
        this.props.history.push('/create_team/' + state.wizard);
    }

    render() {
        const {
            currentChannel,
            currentTeam,
            customDescriptionText,
            match,
            siteName,
        } = this.props;

        let url = '/select_team';
        if (currentTeam) {
            url = `/${currentTeam.name}`;
            if (currentChannel) {
                url += `/channels/${currentChannel.name}`;
            }
        }

        return (
            <div>
                <AnnouncementBar/>
                <BackButton url={url}/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
                            siteName={siteName}
                        />
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
                                <Redirect to={`${match.url}/display_name`}/>
                            </Switch>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
