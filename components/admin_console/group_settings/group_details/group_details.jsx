// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Groups} from 'mattermost-redux/constants';

import {t} from 'utils/i18n';
import {localizeMessage} from 'utils/utils.jsx';

import FormError from 'components/form_error';
import {GroupProfileAndSettings} from 'components/admin_console/group_settings/group_details/group_profile_and_settings';
import GroupTeamsAndChannels from 'components/admin_console/group_settings/group_details/group_teams_and_channels';
import GroupUsers from 'components/admin_console/group_settings/group_details/group_users';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import BlockableLink from 'components/admin_console/blockable_link';

import SaveChangesPanel from 'components/admin_console/team_channel_settings/save_changes_panel';

import TeamSelectorModal from 'components/team_selector_modal';
import ChannelSelectorModal from 'components/channel_selector_modal';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

export default class GroupDetails extends React.PureComponent {
    static propTypes = {
        groupID: PropTypes.string.isRequired,
        group: PropTypes.object,
        groupTeams: PropTypes.arrayOf(PropTypes.object),
        groupChannels: PropTypes.arrayOf(PropTypes.object),
        members: PropTypes.arrayOf(PropTypes.object),
        memberCount: PropTypes.number.isRequired,
        isDisabled: PropTypes.bool,
        actions: PropTypes.shape({
            getGroup: PropTypes.func.isRequired,
            getMembers: PropTypes.func.isRequired,
            getGroupStats: PropTypes.func.isRequired,
            getGroupSyncables: PropTypes.func.isRequired,
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
            patchGroupSyncable: PropTypes.func.isRequired,
            patchGroup: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        members: [],
        groupTeams: [],
        groupChannels: [],
        group: {name: '', allow_reference: false},
        memberCount: 0,
    };

    constructor(props) {
        super(props);
        this.state = {
            loadingTeamsAndChannels: true,
            addTeamOpen: false,
            addChannelOpen: false,
            allowReference: Boolean(props.group.allow_reference),
            groupMentionName: props.group.name,
            saving: false,
            saveNeeded: false,
            serverError: null,
            hasAllowReferenceChanged: false,
            hasGroupMentionNameChanged: false,
            teamsToAdd: [],
            channelsToAdd: [],
            itemsToRemove: [],
            rolesToChange: {},
            groupTeams: [],
            groupChannels: [],
        };
    }

    componentDidMount() {
        const {groupID, actions, group} = this.props;
        actions.getGroup(groupID);

        Promise.all([
            actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_TEAM),
            actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_CHANNEL),
            actions.getGroupStats(groupID),
        ]).then(() => {
            this.setState({
                loadingTeamsAndChannels: false,
                group,
                allowReference: Boolean(this.props.group.allow_reference),
                groupMentionName: this.props.group.name,
            });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        /* eslint-disable react/no-did-update-set-state */

        // groupchannels
        if (prevState.saveNeeded !== this.state.saveNeeded && !this.state.saveNeeded && prevProps.groupChannels === this.props.groupChannels) {
            this.setState({groupChannels: this.props.groupChannels});
        }
        if (prevProps.groupChannels !== this.props.groupChannels) {
            let gcs;
            if (this.state.saveNeeded) {
                const stateIDs = this.state.groupChannels.map((gc) => gc.channel_id);
                gcs = this.props.groupChannels.filter((gc) => !stateIDs.includes(gc.channel_id)).concat(this.state.groupChannels);
            } else {
                gcs = this.props.groupChannels;
            }
            this.setState({groupChannels: gcs});
        }

        // groupteams
        if (prevState.saveNeeded !== this.state.saveNeeded && !this.state.saveNeeded && prevProps.groupTeams === this.props.groupTeams) {
            this.setState({groupTeams: this.props.groupTeams});
        }
        if (prevProps.groupTeams !== this.props.groupTeams) {
            let gcs;
            if (this.state.saveNeeded) {
                const stateIDs = this.state.groupTeams.map((gc) => gc.team_id);
                gcs = this.props.groupTeams.filter((gc) => !stateIDs.includes(gc.team_id)).concat(this.state.groupTeams);
            } else {
                gcs = this.props.groupTeams;
            }
            this.setState({groupTeams: gcs});
        }
    }

    openAddChannel = () => {
        this.setState({addChannelOpen: true});
    }

    closeAddChannel = () => {
        this.setState({addChannelOpen: false});
    }

    openAddTeam = () => {
        this.setState({addTeamOpen: true});
    }

    closeAddTeam = () => {
        this.setState({addTeamOpen: false});
    }

    addTeams = (teams) => {
        const {groupID} = this.props;
        const {groupTeams} = this.state;
        const teamsToAdd = teams.map((team) => ({
            group_id: groupID,
            scheme_admin: false,
            team_display_name: team.display_name,
            team_id: team.id,
            team_type: team.type,
        }));
        this.setState({
            saveNeeded: true,
            groupTeams: groupTeams.concat(teamsToAdd),
            teamsToAdd,
        });
        this.props.actions.setNavigationBlocked(true);
    }

    addChannels = (channels) => {
        const {groupID} = this.props;
        const {groupChannels} = this.state;
        const channelsToAdd = channels.map((channel) => ({
            channel_display_name: channel.display_name,
            channel_id: channel.id,
            channel_type: channel.type,
            group_id: groupID,
            scheme_admin: false,
            team_display_name: channel.team_display_name,
            team_id: channel.team_id,
        }));
        this.setState({
            saveNeeded: true,
            groupChannels: groupChannels.concat(channelsToAdd),
            channelsToAdd,
        });
        this.props.actions.setNavigationBlocked(true);
    }

    onRemoveTeamOrChannel = (id, type) => {
        const {groupTeams, groupChannels, itemsToRemove, channelsToAdd, teamsToAdd} = this.state;
        const newState = {saveNeeded: true, itemsToRemove, serverError: null};
        const syncableType = this.syncableTypeFromEntryType(type);

        let makeAPIRequest = true;
        if (syncableType === Groups.SYNCABLE_TYPE_CHANNEL) {
            newState.channelsToAdd = channelsToAdd.filter((item) => item.channel_id !== id);
            if (!this.props.groupChannels.some((item) => item.channel_id === id)) {
                makeAPIRequest = false;
            }
        } else if (syncableType === Groups.SYNCABLE_TYPE_TEAM) {
            newState.teamsToAdd = teamsToAdd.filter((item) => item.team_id !== id);
            if (!this.props.groupTeams.some((item) => item.team_id === id)) {
                makeAPIRequest = false;
            }
        }
        if (makeAPIRequest) {
            itemsToRemove.push({id, type});
        }

        if (this.syncableTypeFromEntryType(type) === Groups.SYNCABLE_TYPE_TEAM) {
            newState.groupTeams = groupTeams.filter((gt) => gt.team_id !== id);
        } else {
            newState.groupChannels = groupChannels.filter((gc) => gc.channel_id !== id);
        }
        this.setState(newState);
        this.props.actions.setNavigationBlocked(true);
    }

    syncableTypeFromEntryType = (entryType) => {
        switch (entryType) {
        case 'public-team':
        case 'private-team':
            return Groups.SYNCABLE_TYPE_TEAM;
        case 'public-channel':
        case 'private-channel':
            return Groups.SYNCABLE_TYPE_CHANNEL;
        default:
            return null;
        }
    }

    onChangeRoles = (id, type, schemeAdmin) => {
        const {rolesToChange, groupTeams, groupChannels} = this.state;
        let listToUpdate;
        let keyName;
        let stateKey;

        const key = `${id}/${type}`;
        rolesToChange[key] = schemeAdmin;

        if (this.syncableTypeFromEntryType(type) === Groups.SYNCABLE_TYPE_TEAM) {
            listToUpdate = groupTeams;
            keyName = 'team_id';
            stateKey = 'groupTeams';
        } else {
            listToUpdate = groupChannels;
            keyName = 'channel_id';
            stateKey = 'groupChannels';
        }

        const updatedItems = listToUpdate.map((item) => ({...item})); // clone list of objects
        updatedItems.find((item) => item[keyName] === id).scheme_admin = schemeAdmin;

        this.setState({saveNeeded: true, rolesToChange, [stateKey]: updatedItems});
        this.props.actions.setNavigationBlocked(true);
    }

    onMentionToggle = (allowReference) => {
        const {group} = this.props;
        const originalAllowReference = group.allow_reference;
        const saveNeeded = true;
        let {groupMentionName} = this.state;

        if (!originalAllowReference && allowReference && !groupMentionName) {
            groupMentionName = group.display_name.toLowerCase().replace(/\s/g, '-');
        }

        this.setState({
            saveNeeded,
            allowReference,
            groupMentionName,
            hasAllowReferenceChanged: allowReference !== originalAllowReference},
        );
        this.props.actions.setNavigationBlocked(saveNeeded);
    }

    onMentionChange = (e) => {
        const {group} = this.props;
        const originalGroupMentionName = group.name;
        const groupMentionName = e.target.value;
        const saveNeeded = true;

        this.setState({
            saveNeeded,
            groupMentionName,
            hasGroupMentionNameChanged: groupMentionName !== originalGroupMentionName,
        });
        this.props.actions.setNavigationBlocked(saveNeeded);
    }

    handleSubmit = async () => {
        this.setState({saving: true});

        const patchGroupSuccessful = await this.handlePatchGroup();
        const addsSuccessful = await this.handleAddedTeamsAndChannels();
        const removesSuccessful = await this.handleRemovedTeamsAndChannels();
        const rolesSuccessful = await this.handleRolesToUpdate();

        await Promise.all([
            this.props.actions.getGroupSyncables(this.props.groupID, Groups.SYNCABLE_TYPE_CHANNEL),
            this.props.actions.getGroupSyncables(this.props.groupID, Groups.SYNCABLE_TYPE_TEAM),
        ]);

        const allSuccuessful = patchGroupSuccessful && addsSuccessful && removesSuccessful && rolesSuccessful;

        this.setState({saveNeeded: !allSuccuessful, saving: false});

        this.props.actions.setNavigationBlocked(!allSuccuessful);
    }

    roleChangeKey = (groupTeamOrChannel) => {
        let fieldKey;
        if (this.syncableTypeFromEntryType(groupTeamOrChannel.type) === Groups.SYNCABLE_TYPE_TEAM) {
            fieldKey = 'team_id';
        } else {
            fieldKey = 'channel_id';
        }
        return `${groupTeamOrChannel[fieldKey]}/${groupTeamOrChannel.type}`;
    };

    handlePatchGroup = async () => {
        const {allowReference, groupMentionName, hasAllowReferenceChanged, hasGroupMentionNameChanged} = this.state;
        let serverError = null;

        const GroupNameIsTakenError = (
            <FormattedMessage
                id='admin.group_settings.group_detail.duplicateMentionNameError'
                defaultMessage='Group mention is already taken.'
            />
        );

        if (!groupMentionName && allowReference) {
            serverError = (
                <FormattedMessage
                    id='admin.group_settings.need_groupname'
                    defaultMessage='You must specify a group mention.'
                />
            );
            this.setState({allowReference, serverError});
            return false;
        } else if (hasAllowReferenceChanged || hasGroupMentionNameChanged) {
            let lcGroupMentionName;
            if (allowReference) {
                lcGroupMentionName = groupMentionName.toLowerCase();
            }
            const result = await this.props.actions.patchGroup(this.props.groupID, {allow_reference: allowReference, name: lcGroupMentionName});
            if (result.error) {
                if (result.error.server_error_id === 'store.sql_group.unique_constraint') {
                    serverError = GroupNameIsTakenError;
                } else if (result.error.server_error_id === 'model.group.name.invalid_chars.app_error') {
                    serverError = (
                        <FormattedMessage
                            id='admin.group_settings.group_detail.invalidOrReservedMentionNameError'
                            defaultMessage='Only letters (a-z), numbers(0-9), periods, dashes and underscores are allowed.'
                        />
                    );
                } else if (result.error.server_error_id === 'api.ldap_groups.existing_reserved_name_error' ||
                    result.error.server_error_id === 'api.ldap_groups.existing_user_name_error' ||
                    result.error.server_error_id === 'api.ldap_groups.existing_group_name_error') {
                    serverError = GroupNameIsTakenError;
                } else if (result.error.server_error_id === 'model.group.name.invalid_length.app_error') {
                    serverError = (
                        <FormattedMessage
                            id='admin.group_settings.group_detail.invalid_length'
                            defaultMessage='Name must be 1 to 64 lowercase alphanumeric characters.'
                        />
                    );
                } else {
                    serverError = result.error?.message;
                }
            }
            this.setState({
                allowReference,
                groupMentionName: lcGroupMentionName,
                serverError,
                hasAllowReferenceChanged: result.error ? hasAllowReferenceChanged : false,
                hasGroupMentionNameChanged: result.error ? hasGroupMentionNameChanged : false,
            });
        }

        return !serverError;
    };

    handleRolesToUpdate = async () => {
        const {rolesToChange} = this.state;
        const promises = Object.entries(rolesToChange).map(([key, value]) => {
            const [syncableID, type] = key.split('/');
            return this.props.actions.patchGroupSyncable(this.props.groupID, syncableID, this.syncableTypeFromEntryType(type), {scheme_admin: value});
        });
        const results = await Promise.all(promises);
        const errors = results.map((r) => r.error?.message).filter((item) => item);
        if (errors.length) {
            this.setState({serverError: <>{errors[0]}</>});
            return false;
        }
        this.setState({rolesToChange: {}});
        return true;
    }

    handleAddedTeamsAndChannels = async () => {
        const {teamsToAdd, channelsToAdd, rolesToChange} = this.state;
        const promises = [];
        if (teamsToAdd.length) {
            teamsToAdd.forEach((groupTeam) => {
                const roleChangeKey = this.roleChangeKey(groupTeam);
                groupTeam.scheme_admin = rolesToChange[roleChangeKey];
                delete rolesToChange[roleChangeKey]; // delete the key because it won't need a patch, it's being handled by the link request.
                promises.push(this.props.actions.link(this.props.groupID, groupTeam.team_id, Groups.SYNCABLE_TYPE_TEAM, {auto_add: true, scheme_admin: groupTeam.scheme_admin}));
            });
        }
        if (channelsToAdd.length) {
            channelsToAdd.forEach((groupChannel) => {
                const roleChangeKey = this.roleChangeKey(groupChannel);
                groupChannel.scheme_admin = rolesToChange[roleChangeKey];
                delete rolesToChange[roleChangeKey]; // delete the key because it won't need a patch, it's being handled by the link request.
                promises.push(this.props.actions.link(this.props.groupID, groupChannel.channel_id, Groups.SYNCABLE_TYPE_CHANNEL, {auto_add: true, scheme_admin: groupChannel.scheme_admin}));
            });
        }
        const results = await Promise.all(promises);
        const errors = results.map((r) => r.error?.message).filter((item) => item);
        if (errors.length) {
            this.setState({serverError: <>{errors[0]}</>});
            return false;
        }
        this.setState({teamsToAdd: [], channelsToAdd: []});
        return true;
    }

    handleRemovedTeamsAndChannels = async () => {
        const {itemsToRemove, rolesToChange} = this.state;
        const promises = [];
        if (itemsToRemove.length) {
            itemsToRemove.forEach((item) => {
                delete rolesToChange[this.roleChangeKey(item)]; // no need to update the roles of group-teams that were unlinked.
                promises.push(this.props.actions.unlink(this.props.groupID, item.id, this.syncableTypeFromEntryType(item.type)));
            });
        }
        const results = await Promise.all(promises);
        const errors = results.map((r) => r.error?.message).filter((item) => item);
        if (errors.length) {
            this.setState({serverError: <>{errors[0]}</>});
            return false;
        }
        this.setState({itemsToRemove: []});
        return true;
    }

    render = () => {
        const {group, members, memberCount, isDisabled} = this.props;
        const {groupTeams, groupChannels} = this.state;
        const {allowReference, groupMentionName, saving, saveNeeded, serverError} = this.state;

        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/groups'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.group_settings.group_detail.group_configuration'
                            defaultMessage='Group Configuration'
                        />
                    </div>
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <div className='banner info'>
                            <div className='banner__content'>
                                <FormattedMessage
                                    id='admin.group_settings.group_detail.introBanner'
                                    defaultMessage='Configure default teams and channels and view users belonging to this group.'
                                />
                            </div>
                        </div>

                        <GroupProfileAndSettings
                            displayname={group.display_name || ''}
                            mentionname={groupMentionName}
                            allowReference={allowReference}
                            onToggle={this.onMentionToggle}
                            onChange={this.onMentionChange}
                            readOnly={isDisabled}
                        />

                        <AdminPanel
                            id='group_teams_and_channels'
                            titleId={t('admin.group_settings.group_detail.groupTeamsAndChannelsTitle')}
                            titleDefault='Team and Channel Membership'
                            subtitleId={t('admin.group_settings.group_detail.groupTeamsAndChannelsDescription')}
                            subtitleDefault='Set default teams and channels for group members. Teams added will include default channels, town-square, and off-topic. Adding a channel without setting the team will add the implied team to the listing below.'
                            button={(
                                <div className='group-profile-add-menu'>
                                    <MenuWrapper
                                        isDisabled={isDisabled}
                                    >
                                        <button
                                            type='button'
                                            id='add_team_or_channel'
                                            className='btn btn-primary'
                                        >
                                            <FormattedMessage
                                                id='admin.group_settings.group_details.add_team_or_channel'
                                                defaultMessage='Add Team or Channel'
                                            />
                                            <i className={'fa fa-caret-down'}/>
                                        </button>
                                        <Menu ariaLabel={localizeMessage('admin.group_settings.group_details.menuAriaLabel', 'Add Team or Channel Menu')}>
                                            <Menu.ItemAction
                                                id='add_team'
                                                onClick={this.openAddTeam}
                                                text={localizeMessage('admin.group_settings.group_details.add_team', 'Add Team')}
                                            />
                                            <Menu.ItemAction
                                                id='add_channel'
                                                onClick={this.openAddChannel}
                                                text={localizeMessage('admin.group_settings.group_details.add_channel', 'Add Channel')}
                                            />
                                        </Menu>
                                    </MenuWrapper>
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
                                onChangeRoles={this.onChangeRoles}
                                onRemoveItem={this.onRemoveTeamOrChannel}
                                isDisabled={isDisabled}
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
                                groupID={this.props.groupID}
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
                </div>

                <SaveChangesPanel
                    saving={saving}
                    cancelLink='/admin_console/user_management/groups'
                    saveNeeded={saveNeeded}
                    onClick={this.handleSubmit}
                    serverError={serverError &&
                        <FormError
                            iconClassName={'fa-exclamation-triangle'}
                            textClassName={'has-error'}
                            error={serverError}
                        />
                    }
                />
            </div>
        );
    };
}
