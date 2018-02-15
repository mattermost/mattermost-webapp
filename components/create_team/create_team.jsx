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

        /**
         * children components
         */
        children: PropTypes.node,

        /**
         * Object containing information about current team
         */
        currentTeam: PropTypes.object,

        /**
         * Object containing information about current channel
         */
        currentChannel: PropTypes.object
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
        if (global.window.mm_license.IsLicensed === 'true' && global.window.mm_license.CustomBrand === 'true' && global.window.mm_config.EnableCustomBrand === 'true') {
            description = global.window.mm_config.CustomDescriptionText;
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
                        <h1>{global.window.mm_config.SiteName}</h1>
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
