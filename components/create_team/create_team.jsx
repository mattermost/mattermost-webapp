// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Route, Switch, Redirect} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button.jsx';

import TeamUrl from 'components/create_team/components/team_url';
import DisplayName from 'components/create_team/components/display_name';

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
         * Boolean value that determines whether server has a valid Enterprise license
         */
        isLicensed: PropTypes.bool.isRequired,

        /*
         * Boolean value that determines whether license supports custom branding
         */
        customBrand: PropTypes.bool.isRequired,

        /*
         * Boolean value that determines whether the custom brand feature has been enabled
         */
        enableCustomBrand: PropTypes.bool.isRequired,

        /*
         * String containing the custom branding's text
         */
        customDescriptionText: PropTypes.string,

        /*
         * String containing the custom branding's Site Name
         */
        siteName: PropTypes.string,
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
        const team = this.props.currentTeam;
        const channel = this.props.currentChannel;
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
