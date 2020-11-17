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
        loading: PropTypes.bool.isRequired,
        onChangeRoles: PropTypes.func.isRequired,
        onRemoveItem: PropTypes.func.isRequired,
        isDisabled: PropTypes.bool,
    }

    constructor(props) {
        super(props);
        this.state = {
            collapsed: {},
        };
    }

    onToggleCollapse = (id) => {
        const collapsed = {...this.state.collapsed};
        collapsed[id] = !collapsed[id];
        this.setState({collapsed});
    }

    onRemoveItem = (id, type) => {
        this.props.onRemoveItem(id, type);
    }

    onChangeRoles = async (id, type, roleToBe) => {
        this.props.onChangeRoles(id, type, roleToBe);
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
                collapsed: this.state.collapsed[team.team_id],
                id: team.team_id,
                schemeAdmin: team.scheme_admin,
            });
        });

        const channelEntriesByTeam = {};
        channels.forEach((channel) => {
            channelEntriesByTeam[channel.team_id] = channelEntriesByTeam[channel.team_id] || [];
            channelEntriesByTeam[channel.team_id].push({
                type: channel.channel_type === 'O' ? 'public-channel' : 'private-channel',
                name: channel.channel_display_name,
                id: channel.channel_id,
                schemeAdmin: channel.scheme_admin,
            });

            if (!existingTeams.has(channel.team_id)) {
                existingTeams.add(channel.team_id);
                teamEntries.push({
                    type: channel.team_type === 'O' ? 'public-team' : 'private-team',
                    hasChildren: true,
                    name: channel.team_display_name,
                    collapsed: this.state.collapsed[channel.team_id],
                    id: channel.team_id,
                });
            }
        });
        teamEntries.sort((a, b) => ((a.name && b.name) ? a.name.localeCompare(b.name) : 0));
        teamEntries.forEach((team) => {
            entries.push(team);
            if (team.hasChildren && !team.collapsed) {
                const teamChannels = channelEntriesByTeam[team.id];
                teamChannels.sort((a, b) => a.name.localeCompare(b.name));
                entries.push(...teamChannels);
            }
        });

        return entries;
    }

    render = () => {
        const entries = this.teamsAndChannelsToEntries(this.props.teams, this.props.channels);

        if (this.props.loading) {
            return (
                <div className='group-teams-and-channels'>
                    <div className='group-teams-and-channels-loading'>
                        <i className='fa fa-spinner fa-pulse fa-2x'/>
                    </div>
                </div>
            );
        }

        if (entries.length === 0) {
            return (
                <div className='group-teams-and-channels'>
                    <div className='group-teams-and-channels-empty'>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_teams_and_channels.no-teams-or-channels-speicified'
                            defaultMessage='No teams or channels specified yet'
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className='AdminPanel__content'>
                <table
                    id='team_and_channel_membership_table'
                    className='AdminPanel__table group-teams-and-channels'
                >
                    <thead className='group-teams-and-channels--header'>
                        <tr>
                            <th width='30%'>
                                <FormattedMessage
                                    id='admin.group_settings.group_profile.group_teams_and_channels.name'
                                    defaultMessage='Name'
                                />
                            </th>
                            <th width='25%'>
                                <FormattedMessage
                                    id='admin.group_settings.group_profile.group_teams_and_channels.type'
                                    defaultMessage='Type'
                                />
                            </th>
                            <th width='25%'>
                                <FormattedMessage
                                    id='admin.group_settings.group_profile.group_teams_and_channels.assignedRoles'
                                    defaultMessage='Assigned Roles'
                                />
                            </th>
                            <th width='20%'/>
                        </tr>
                    </thead>
                    <tbody className='group-teams-and-channels--body'>
                        {entries.map((entry) => (
                            <GroupTeamsAndChannelsRow
                                key={entry.id}
                                onRemoveItem={this.onRemoveItem}
                                onChangeRoles={this.onChangeRoles}
                                onToggleCollapse={this.onToggleCollapse}
                                isDisabled={this.props.isDisabled}
                                {...entry}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
}
