// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import GroupTeamsAndChannelsRow from 'components/admin_console/group_settings/group_details/group_teams_and_channels_row.jsx';

export default class GroupTeamsAndChannels extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        teams: PropTypes.arrayOf(PropTypes.object),
        channels: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.shape({
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            collapsed: {},
        };
    }

    teamsAndChannelsToEntries = (teams, channels) => {
        const entries = [];

        const teamEntries = teams.map((team) => ({
            type: team.team_type === 'O' ? 'public-team' : 'private-team',
            hasChildren: channels.some((channel) => channel.team_id === team.id),
            name: team.team_display_name,
            collapsed: false,
            id: team.id,
        }));

        const channelEntries = channels.map((channel) => ({
            type: channel.channel_type === 'O' ? 'public-channel' : 'private-channel',
            name: channel.channel_name,
            id: channel.id,
        }));

        console.log('teamEntries', teamEntries);
        console.log('channelEntries', channelEntries);

        return entries;
    }

    render = () => {
        const entries = this.teamsAndChannelsToEntries(this.props.teams, this.props.channels);

        // const entries = [
        //     {
        //         type: 'public-team',
        //         hasChildren: true,
        //         name: 'Contributors',
        //         collapsed: false,
        //         id: '1',
        //     },
        //     {
        //         type: 'private-channel',
        //         name: 'Authentication',
        //         id: '2',
        //     },
        //     {
        //         type: 'public-team',
        //         hasChildren: false,
        //         name: 'Customer Support',
        //         id: '3',
        //     },
        //     {
        //         type: 'private-team',
        //         hasChildren: true,
        //         name: 'Deepmind Product Team',
        //         collapsed: false,
        //         id: '4',
        //     },
        //     {
        //         type: 'private-channel',
        //         name: 'Advertisements',
        //         id: '5',
        //     },
        //     {
        //         type: 'public-channel',
        //         name: 'Decisions',
        //         id: '6',
        //     },
        // ];
        return (
            <div className='group-teams-and-channels'>
                <div className='group-teams-and-channels--header'>
                    <FormattedMessage
                        id='admin.group_settings.group_profile.group_teams_and_channels.name'
                        defaultMessage='Name'
                    />
                </div>
                <div className='group-teams-and-channels--body'>
                    {entries.map((entry) => (
                        <GroupTeamsAndChannelsRow
                            key={entry.id}
                            {...entry}
                        />
                    ))}
                </div>
            </div>
        );
    };
}
