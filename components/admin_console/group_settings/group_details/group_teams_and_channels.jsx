// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import GroupTeamsAndChannelsTeamsManager from 'components/admin_console/group_settings/group_details/group_teams_and_channels_teams_manager.jsx';
import GroupTeamsAndChannelsChannelsManager from 'components/admin_console/group_settings/group_details/group_teams_and_channels_channels_manager.jsx';

export default class GroupTeamsAndChannels extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selected: 'teams',
        };
    }

    selectTeams = () => {
        this.setState({selected: 'teams'});
    }

    selectChannels = () => {
        this.setState({selected: 'channels'});
    }

    render = () => {
        return (
            <div className='group-teams-and-channels'>
                <div className='group-teams-and-channels--header'>
                    <button
                        className='specific-teams'
                        onClick={this.selectTeams}
                    >
                        <FormattedMessage
                            id='admin.group_settings.group_profile.group_teams_and_channels.specific_teams'
                            defaultMessage='Specific Teams'
                        />
                    </button>
                    <button
                        className='specific-channels'
                        onClick={this.selectChannels}
                    >
                        <FormattedMessage
                            id='admin.group_settings.group_profile.group_teams_and_channels.specific_channels'
                            defaultMessage='Specific Channels'
                        />
                    </button>
                </div>
                <div className='group-teams-and-channels--body'>
                    {this.state.selected === 'teams' &&
                        <GroupTeamsAndChannelsTeamsManager/>
                    }
                    {this.state.selected === 'channels' &&
                        <GroupTeamsAndChannelsChannelsManager/>
                    }
                </div>
            </div>
        );
    };
}
