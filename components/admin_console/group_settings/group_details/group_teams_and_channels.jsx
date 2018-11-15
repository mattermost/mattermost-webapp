// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Groups} from 'mattermost-redux/constants';

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

    onRemoveItem = (id, type) => {
        if (type === 'public-team' || type === 'private-team') {
            this.props.actions.unlink(this.props.id, id, Groups.SYNCABLE_TYPE_TEAM);
        } else {
            this.props.actions.unlink(this.props.id, id, Groups.SYNCABLE_TYPE_CHANNEL);
        }
    }

    teamsAndChannelsToEntries = (teams, channels) => {
        const entries = [];

        const existingTeams = new Set();
        const teamEntries = [];
        teams.forEach((team) => {
            existingTeams.add(team.team_id);
            teamEntries.push({
                type: team.team_type === 'O' ? 'public-team' : 'private-team',
                hasChildren: channels.some((channel) => channel.team_id === team.team_id),
                name: team.team_display_name,
                collapsed: false,
                id: team.team_id,
            });
        });

        const channelEntriesByTeam = {};
        channels.forEach((channel) => {
            channelEntriesByTeam[channel.team_id] = channelEntriesByTeam[channel.team_id] || [];
            channelEntriesByTeam[channel.team_id].push({
                type: channel.channel_type === 'O' ? 'public-channel' : 'private-channel',
                name: channel.channel_display_name,
                id: channel.channel_id,
            });

            if (!existingTeams.has(channel.team_id)) {
                existingTeams.add(channel.team_id);
                teamEntries.push({
                    type: channel.team_type === 'O' ? 'public-team' : 'private-team',
                    hasChildren: true,
                    name: channel.team_display_name,
                    collapsed: false,
                    id: channel.team_id,
                });
            }
        });

        teamEntries.forEach((team) => {
            entries.push(team);
            if (team.hasChildren) {
                entries.push(...channelEntriesByTeam[team.id]);
            }
        });

        return entries;
    }

    render = () => {
        const entries = this.teamsAndChannelsToEntries(this.props.teams, this.props.channels);

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
                            onRemoveItem={this.onRemoveItem}
                            {...entry}
                        />
                    ))}
                </div>
            </div>
        );
    };
}
