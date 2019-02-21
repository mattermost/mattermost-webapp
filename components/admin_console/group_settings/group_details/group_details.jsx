// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Groups} from 'mattermost-redux/constants';

import {t} from 'utils/i18n';
import GroupProfile from 'components/admin_console/group_settings/group_details/group_profile';
import GroupTeamsAndChannels from 'components/admin_console/group_settings/group_details/group_teams_and_channels';
import GroupUsers from 'components/admin_console/group_settings/group_details/group_users';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';

import TeamSelectorModal from 'components/team_selector_modal';
import ChannelSelectorModal from 'components/channel_selector_modal';
import {Constants} from 'utils/constants.jsx';

export default class GroupDetails extends React.PureComponent {
    static propTypes = {
        groupID: PropTypes.string.isRequired,
        group: PropTypes.object,
        groupTeams: PropTypes.arrayOf(PropTypes.object),
        groupChannels: PropTypes.arrayOf(PropTypes.object),
        members: PropTypes.arrayOf(PropTypes.object),
        memberCount: PropTypes.number.isRequired,
        actions: PropTypes.shape({
            getGroup: PropTypes.func.isRequired,
            getMembers: PropTypes.func.isRequired,
            getGroupSyncables: PropTypes.func.isRequired,
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        members: [],
        groupTeams: [],
        groupChannels: [],
        group: {display_name: ''},
        memberCount: 0,
    };

    constructor(props) {
        super(props);
        this.state = {
            loadingTeamsAndChannels: true,
            addTeamOpen: false,
            addChannelOpen: false,
            addTeamOrChannelOpen: false,
        };
    }

    componentDidMount() {
        const {groupID, actions} = this.props;
        actions.getGroup(groupID);
        Promise.all([
            actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_TEAM),
            actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_CHANNEL),
        ]).then(() => {
            this.setState({loadingTeamsAndChannels: false});
        });
    }

    openAddChannel = () => {
        this.setState({addChannelOpen: true, addTeamOrChannelOpen: false});
    }

    closeAddChannel = () => {
        this.setState({addChannelOpen: false, addTeamOrChannelOpen: false});
    }

    openAddTeam = () => {
        this.setState({addTeamOpen: true, addTeamOrChannelOpen: false});
    }

    closeAddTeam = () => {
        this.setState({addTeamOpen: false, addTeamOrChannelOpen: false});
    }

    toggleAddTeamOrChannel = () => {
        this.setState({addTeamOrChannelOpen: !this.state.addTeamOrChannelOpen});
    }

    addTeams = (teams) => {
        const promises = [];
        for (const team of teams) {
            promises.push(this.props.actions.link(this.props.groupID, team.id, Groups.SYNCABLE_TYPE_TEAM, {can_leave: true, auto_add: true}));
        }
        return Promise.all(promises).finally(() => this.props.actions.getGroupSyncables(this.props.groupID, Groups.SYNCABLE_TYPE_TEAM));
    }

    addChannels = async (channels) => {
        const promises = [];
        for (const channel of channels) {
            promises.push(this.props.actions.link(this.props.groupID, channel.id, Groups.SYNCABLE_TYPE_CHANNEL, {can_leave: true, auto_add: true}));
        }
        return Promise.all(promises).finally(() => this.props.actions.getGroupSyncables(this.props.groupID, Groups.SYNCABLE_TYPE_CHANNEL));
    }

    render = () => {
        const {group, members, groupTeams, groupChannels, memberCount} = this.props;
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.group_settings.group_detail.group_configuration'
                        defaultMessage='Group Configuration'
                    />
                </h3>

                <div className='banner info'>
                    <div className='banner__content'>
                        <FormattedMessage
                            id='admin.group_settings.group_detail.introBanner'
                            defaultMessage='Configure default teams and channels and view users belonging to this group.'
                        />
                    </div>
                </div>

                <AdminPanel
                    id='group_profile'
                    titleId={t('admin.group_settings.group_detail.groupProfileTitle')}
                    titleDefault='Group Profile'
                    subtitleId={t('admin.group_settings.group_detail.groupProfileDescription')}
                    subtitleDefault='The name for this group.'
                >
                    <GroupProfile
                        name={group.display_name}
                    />
                </AdminPanel>

                <AdminPanel
                    id='group_teams_and_channels'
                    titleId={t('admin.group_settings.group_detail.groupTeamsAndChannelsTitle')}
                    titleDefault='Team and Channel Membership'
                    subtitleId={t('admin.group_settings.group_detail.groupTeamsAndChannelsDescription')}
                    subtitleDefault='Set default teams and channels for group members. Teams added will include default channels, town-square, and off-topic. Adding a channel without setting the team will add the implied team to the listing below, but not to the group specifically.'
                    button={(
                        <div className='group-profile-add-menu'>
                            <button
                                className='btn btn-primary'
                                onClick={this.toggleAddTeamOrChannel}
                            >
                                <FormattedMessage
                                    id='admin.group_settings.group_details.add_team_or_channel'
                                    defaultMessage='Add Team or Channel'
                                />
                                <i className={'fa fa-caret-down'}/>
                            </button>
                            {this.state.addTeamOrChannelOpen && (
                                <ul className='add-team-or-channel-menu'>
                                    <a onClick={this.openAddTeam}>
                                        <FormattedMessage
                                            id='admin.group_settings.group_details.add_team'
                                            defaultMessage='Add Team'
                                        />
                                    </a>
                                    <a onClick={this.openAddChannel}>
                                        <FormattedMessage
                                            id='admin.group_settings.group_details.add_channel'
                                            defaultMessage='Add Channel'
                                        />
                                    </a>
                                </ul>
                            )}
                        </div>
                    )}
                >
                    <GroupTeamsAndChannels
                        id={this.props.groupID}
                        teams={groupTeams}
                        channels={groupChannels}
                        loading={this.state.loadingTeamsAndChannels}
                        getGroupSyncables={this.props.actions.getGroupSyncables}
                        unlink={this.props.actions.unlink}
                    />
                </AdminPanel>
                {this.state.addTeamOpen &&
                    <TeamSelectorModal
                        onModalDismissed={this.closeAddTeam}
                        onTeamsSelected={this.addTeams}
                        alreadySelected={this.props.groupTeams.map((team) => team.team_id)}
                    />
                }
                {this.state.addChannelOpen &&
                    <ChannelSelectorModal
                        onModalDismissed={this.closeAddChannel}
                        onChannelsSelected={this.addChannels}
                        alreadySelected={this.props.groupChannels.map((channel) => channel.channel_id)}
                        excludeNames={[Constants.DEFAULT_CHANNEL, Constants.OFFTOPIC_CHANNEL]}
                    />
                }

                <AdminPanel
                    id='group_users'
                    titleId={t('admin.group_settings.group_detail.groupUsersTitle')}
                    titleDefault='Users'
                    subtitleId={t('admin.group_settings.group_detail.groupUsersDescription')}
                    subtitleDefault='Listing of users in Mattermost associated with this group.'
                >
                    <GroupUsers
                        members={members}
                        total={memberCount}
                        groupID={this.props.groupID}
                        getMembers={this.props.actions.getMembers}
                    />
                </AdminPanel>
            </div>
        );
    };
}
