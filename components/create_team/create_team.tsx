// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Route, Switch, Redirect, RouteComponentProps} from 'react-router-dom';

import {Channel} from 'mattermost-redux/types/channels';

import {Team} from 'mattermost-redux/types/teams';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button';
import DisplayName from 'components/create_team/components/display_name';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import TeamUrl from 'components/create_team/components/team_url';

type Props = {

    /*
   * Object containing information on the current team, used to define BackButton's url
   */
    currentTeam: Team;

    /*
   * Object containing information on the current selected channel, used to define BackButton's url
   */
    currentChannel: Channel;

    /*
    * String containing the custom branding's text
    */
    customDescriptionText: string;

    /*
   * String containing the custom branding's Site Name
   */
    siteName: string;

    /*
   * Object from react-router
   */
    match: {
        url: string;
    };
};

type State = {
    team: object;
    wizard: string;
};

export default class CreateTeam extends React.PureComponent<Props & RouteComponentProps<{}>, State> {
    public constructor(props: Props & RouteComponentProps<{}>) {
        super(props);

        this.state = {
            team: {},
            wizard: 'display_name',
        };
    }

    public updateParent = (state: State) => {
        this.setState(state);
        this.props.history.push('/create_team/' + state.wizard);
    };

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