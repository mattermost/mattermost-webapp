// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {cloneDeep} from 'lodash';

import {Groups, Permissions} from 'mattermost-redux/constants';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {Scheme} from 'mattermost-redux/types/schemes';
import {ChannelModerationRoles} from 'mattermost-redux/types/roles';
import {SyncablePatch, Group} from 'mattermost-redux/types/groups';
import {Channel, ChannelModeration as ChannelPermissions, ChannelModerationPatch} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import ConfirmModal from 'components/confirm_modal';
import BlockableLink from 'components/admin_console/blockable_link';
import FormError from 'components/form_error';
import Constants from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/diagnostics_actions.jsx';

import {NeedGroupsError, UsersWillBeRemovedError} from '../../errors';
import ConvertConfirmModal from '../../convert_confirm_modal';
import RemoveConfirmModal from '../../remove_confirm_modal';
import ConvertAndRemoveConfirmModal from '../../convert_and_remove_confirm_modal';
import SaveChangesPanel from '../../save_changes_panel';

import {ChannelModes} from './channel_modes';
import {ChannelGroups} from './channel_groups';
import {ChannelProfile} from './channel_profile';
import ChannelModeration from './channel_moderation';
import ChannelMembers from './channel_members';

interface ChannelDetailsProps {
    channelID: string;
    channel: Channel;
    team: Partial<Team>;
    groups: Group[];
    totalGroups: number;
    channelPermissions?: Array<ChannelPermissions>;
    allGroups: Dictionary<Group>;
    teamScheme?: Scheme;
    guestAccountsEnabled: boolean;
    isDisabled: boolean;
    actions: {
        getGroups: (channelID: string, q?: string, page?: number, perPage?: number) => Promise<Partial<Group>[]>;
        linkGroupSyncable: (groupID: string, syncableID: string, syncableType: string, patch: Partial<SyncablePatch>) => ActionFunc|ActionResult;
        unlinkGroupSyncable: (groupID: string, syncableID: string, syncableType: string) => ActionFunc;
        membersMinusGroupMembers: (channelID: string, groupIDs: Array<string>, page?: number, perPage?: number) => ActionFunc|ActionResult;
        setNavigationBlocked: (blocked: boolean) => any;
        getChannel: (channelId: string) => ActionFunc;
        getTeam: (teamId: string) => Promise<ActionResult>;
        getChannelModerations: (channelId: string) => Promise<Array<ChannelPermissions>>;
        patchChannel: (channelId: string, patch: Channel) => ActionFunc;
        updateChannelPrivacy: (channelId: string, privacy: string) => Promise<ActionResult>;
        patchGroupSyncable: (groupID: string, syncableID: string, syncableType: string, patch: Partial<SyncablePatch>) => ActionFunc;
        patchChannelModerations: (channelID: string, patch: Array<ChannelModerationPatch>) => any;
        loadScheme: (schemeID: string) => Promise<ActionResult>;
        addChannelMember: (channelId: string, userId: string, postRootId?: string) => Promise<ActionResult>;
        removeChannelMember: (channelId: string, userId: string) => Promise<ActionResult>;
        updateChannelMemberSchemeRoles: (channelId: string, userId: string, isSchemeUser: boolean, isSchemeAdmin: boolean) => Promise<ActionResult>;
        deleteChannel: (channelId: string) => Promise<ActionResult>;
        unarchiveChannel: (channelId: string) => Promise<ActionResult>;
    };
}

interface ChannelDetailsState {
    isSynced: boolean;
    isPublic: boolean;
    isDefault: boolean;
    totalGroups: number;
    groups: Group[];
    usersToRemoveCount: number;
    usersToRemove: Dictionary<UserProfile>;
    usersToAdd: Dictionary<UserProfile>;
    rolesToUpdate: {
        [userId: string]: {
            schemeUser: boolean;
            schemeAdmin: boolean;
        };
    };
    saveNeeded: boolean;
    serverError: JSX.Element | null;
    previousServerError: JSX.Element | null;
    isPrivacyChanging: boolean;
    saving: boolean;
    showConvertConfirmModal: boolean;
    showRemoveConfirmModal: boolean;
    showConvertAndRemoveConfirmModal: boolean;
    channelPermissions?: Array<ChannelPermissions>;
    teamScheme?: Scheme;
    isLocalArchived: boolean;
    showArchiveConfirmModal: boolean;
}

export default class ChannelDetails extends React.PureComponent<ChannelDetailsProps, ChannelDetailsState> {
    constructor(props: ChannelDetailsProps) {
        super(props);
        this.state = {
            isSynced: Boolean(props.channel.group_constrained),
            isPublic: props.channel.type === Constants.OPEN_CHANNEL,
            isDefault: props.channel.name === Constants.DEFAULT_CHANNEL,
            isPrivacyChanging: false,
            saving: false,
            totalGroups: props.totalGroups,
            showConvertConfirmModal: false,
            showRemoveConfirmModal: false,
            showConvertAndRemoveConfirmModal: false,
            usersToRemoveCount: 0,
            usersToRemove: {},
            usersToAdd: {},
            rolesToUpdate: {},
            groups: props.groups,
            saveNeeded: false,
            serverError: null,
            previousServerError: null,
            channelPermissions: props.channelPermissions,
            teamScheme: props.teamScheme,
            isLocalArchived: props.channel.delete_at > 0,
            showArchiveConfirmModal: false,
        };
    }

    componentDidUpdate(prevProps: ChannelDetailsProps) {
        const {channel, totalGroups, actions} = this.props;
        if (channel.id !== prevProps.channel.id || totalGroups !== prevProps.totalGroups) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                totalGroups,
                isSynced: Boolean(channel.group_constrained),
                isPublic: channel.type === Constants.OPEN_CHANNEL,
                isDefault: channel.name === Constants.DEFAULT_CHANNEL,
                isLocalArchived: channel.delete_at > 0,
            });
        }

        // If we don't have the team and channel on mount, we need to request the team after we load the channel
        if (!prevProps.team.id && !prevProps.channel.team_id && channel.team_id) {
            actions.getTeam(channel.team_id).
                then(async (data: any) => {
                    if (data.data && data.data.scheme_id) {
                        await actions.loadScheme(data.data.scheme_id);
                    }
                }).
                then(() => this.setState({teamScheme: this.props.teamScheme}));
        }
    }

    async componentDidMount() {
        const {channelID, channel, actions} = this.props;
        const actionsToAwait = [];
        if (channelID) {
            actionsToAwait.push(actions.getGroups(channelID).
                then(() => actions.getChannel(channelID)).
                then(() => this.setState({groups: this.props.groups})),
            );
            actionsToAwait.push(actions.getChannelModerations(channelID).then(() => this.restrictChannelMentions()));
        }

        if (channel.team_id) {
            actionsToAwait.push(actions.getTeam(channel.team_id).
                then(async (data: any) => {
                    if (data.data && data.data.scheme_id) {
                        await actions.loadScheme(data.data.scheme_id);
                    }
                }).
                then(() => this.setState({teamScheme: this.props.teamScheme})),
            );
        }

        await Promise.all(actionsToAwait);
    }

    private restrictChannelMentions() {
        // Disabling use_channel_mentions on every role that create_post is either disabled or has a value of false
        let channelPermissions = this.props.channelPermissions;
        const currentCreatePostRoles: any = channelPermissions!.find((element) => element.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST)?.roles;
        for (const channelRole of Object.keys(currentCreatePostRoles)) {
            channelPermissions = channelPermissions!.map((permission) => {
                if (permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS && (!currentCreatePostRoles[channelRole].value || !currentCreatePostRoles[channelRole].enabled)) {
                    return {
                        name: permission.name,
                        roles: {
                            ...permission.roles,
                            [channelRole]: {
                                value: false,
                                enabled: false,
                            },
                        },
                    };
                }
                return permission;
            });
        }
        this.setState({channelPermissions});
    }

    private setToggles = (isSynced: boolean, isPublic: boolean) => {
        const {channel} = this.props;
        const isOriginallyPublic = channel.type === Constants.OPEN_CHANNEL;
        this.setState(
            {
                saveNeeded: true,
                isSynced,
                isPublic,
                isPrivacyChanging: isPublic !== isOriginallyPublic,
            },
            () => this.processGroupsChange(this.state.groups),
        );
        this.props.actions.setNavigationBlocked(true);
    };

    async processGroupsChange(groups: Group[]) {
        const {actions, channelID} = this.props;
        actions.setNavigationBlocked(true);
        let serverError = null;
        let usersToRemoveCount = 0;
        if (this.state.isSynced) {
            try {
                if (groups.length === 0) {
                    serverError = (
                        <NeedGroupsError
                            warning={true}
                            isChannel={true}
                        />
                    );
                } else {
                    if (!channelID) {
                        return;
                    }

                    const result = await actions.membersMinusGroupMembers(channelID, groups.map((g) => g.id));
                    if ('data' in result) {
                        usersToRemoveCount = result.data.total_count;
                        if (usersToRemoveCount > 0) {
                            serverError = (
                                <UsersWillBeRemovedError
                                    total={usersToRemoveCount}
                                    users={result.data.users}
                                    scope='channel'
                                    scopeId={this.props.channelID}
                                />
                            );
                        }
                    }
                }
            } catch (ex) {
                serverError = ex;
            }
        }
        this.setState({groups, usersToRemoveCount, saveNeeded: true, serverError});
    }

    private handleGroupRemoved = (gid: string) => {
        const groups = this.state.groups.filter((g) => g.id !== gid);
        this.setState({totalGroups: this.state.totalGroups - 1});
        this.processGroupsChange(groups);
    };

    private setNewGroupRole = (gid: string) => {
        const groups = cloneDeep(this.state.groups).map((g) => {
            if (g.id === gid) {
                g.scheme_admin = !g.scheme_admin;
            }
            return g;
        });
        this.processGroupsChange(groups);
    }

    private channelPermissionsChanged = (name: string, channelRole: ChannelModerationRoles) => {
        const currentValueIndex = this.state.channelPermissions!.findIndex((element) => element.name === name);
        const currentValue = this.state.channelPermissions![currentValueIndex].roles[channelRole]!.value;
        const newValue = !currentValue;
        let channelPermissions = [...this.state.channelPermissions!];

        if (name === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST) {
            const originalObj = this.props.channelPermissions!.find((element) => element.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS)?.roles![channelRole];
            channelPermissions = channelPermissions.map((permission) => {
                if (permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS && !newValue) {
                    return {
                        name: permission.name,
                        roles: {
                            ...permission.roles,
                            [channelRole]: {
                                value: false,
                                enabled: false,
                            },
                        },
                    };
                } else if (permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS) {
                    return {
                        name: permission.name,
                        roles: {
                            ...permission.roles,
                            [channelRole]: {
                                value: originalObj?.value,
                                enabled: originalObj?.enabled,
                            },
                        },
                    };
                }
                return permission;
            });
        }
        channelPermissions[currentValueIndex] = {
            ...channelPermissions![currentValueIndex],
            roles: {
                ...channelPermissions![currentValueIndex].roles,
                [channelRole]: {
                    ...channelPermissions![currentValueIndex].roles[channelRole],
                    value: newValue,
                },
            },
        };
        this.setState({channelPermissions, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    private handleGroupChange = (groupIDs: string[]) => {
        const groups = [...this.state.groups, ...groupIDs.map((gid: string) => this.props.allGroups[gid])];
        this.setState({totalGroups: this.state.totalGroups + groupIDs.length});
        this.processGroupsChange(groups);
    };

    private hideConvertConfirmModal = () => {
        this.setState({showConvertConfirmModal: false});
    };

    private hideRemoveConfirmModal = () => {
        this.setState({showRemoveConfirmModal: false});
    };

    private hideConvertAndRemoveConfirmModal = () => {
        this.setState({showConvertAndRemoveConfirmModal: false});
    };

    private hideArchiveConfirmModal = () => {
        this.setState({showArchiveConfirmModal: false});
    };

    private onSave = () => {
        const {channel} = this.props;
        const {isSynced, usersToRemoveCount, serverError} = this.state;
        let {isPublic, isPrivacyChanging} = this.state;
        if (this.channelToBeArchived()) {
            this.setState({showArchiveConfirmModal: true});
            return;
        }
        const isOriginallyPublic = channel.type === Constants.OPEN_CHANNEL;
        if (isSynced) {
            isPublic = false;
            isPrivacyChanging = isOriginallyPublic;
            this.setState({
                isPublic,
                isPrivacyChanging,
            });
        }
        if (isPrivacyChanging && usersToRemoveCount > 0) {
            this.setState({showConvertAndRemoveConfirmModal: true});
            return;
        }
        if (isPrivacyChanging && usersToRemoveCount === 0 && serverError === null) {
            this.setState({showConvertConfirmModal: true});
            return;
        }
        if (!isPrivacyChanging && usersToRemoveCount > 0) {
            this.setState({showRemoveConfirmModal: true});
            return;
        }
        this.handleSubmit();
    };

    private handleSubmit = async () => {
        this.setState({showConvertConfirmModal: false, showRemoveConfirmModal: false, showConvertAndRemoveConfirmModal: false, showArchiveConfirmModal: false, saving: true});
        const {groups, isSynced, isPublic, isPrivacyChanging, channelPermissions, usersToAdd, usersToRemove, rolesToUpdate} = this.state;
        let serverError: JSX.Element | null = null;
        let saveNeeded = false;
        const {groups: origGroups, channelID, actions, channel} = this.props;

        if (this.channelToBeArchived()) {
            const result = await actions.deleteChannel(channel.id);
            if ('error' in result) {
                serverError = <FormError error={result.error.message}/>;
                saveNeeded = true;
            } else {
                trackEvent('admin_channel_config_page', 'channel_archived', {channel_id: channelID});
            }
            this.setState({serverError, saving: false, saveNeeded, isPrivacyChanging: false, usersToRemoveCount: 0, rolesToUpdate: {}, usersToAdd: {}, usersToRemove: {}}, () => {
                actions.setNavigationBlocked(saveNeeded);
                if (!saveNeeded) {
                    browserHistory.push('/admin_console/user_management/channels');
                }
            });
            return;
        } else if (this.channelToBeRestored() && this.state.serverError === null) {
            const result = await actions.unarchiveChannel(channel.id);
            if ('error' in result) {
                serverError = <FormError error={result.error.message}/>;
            } else {
                trackEvent('admin_channel_config_page', 'channel_unarchived', {channel_id: channelID});
            }
            this.setState({serverError, previousServerError: null});
        }

        if (this.state.groups.length === 0 && isSynced) {
            serverError = <NeedGroupsError isChannel={true}/>;
            saveNeeded = true;
            this.setState({serverError, saving: false, saveNeeded});
            actions.setNavigationBlocked(saveNeeded);
            return;
        }

        const promises = [];
        if (isPrivacyChanging) {
            const convert = actions.updateChannelPrivacy(channel.id, isPublic ? Constants.OPEN_CHANNEL : Constants.PRIVATE_CHANNEL);
            promises.push(
                convert.then((res) => {
                    if ('error' in res) {
                        return res;
                    }
                    return actions.patchChannel(channel.id, {
                        ...channel,
                        group_constrained: isSynced,
                    });
                }),
            );
        } else {
            promises.push(
                actions.patchChannel(channel.id, {
                    ...channel,
                    group_constrained: isSynced,
                }),
            );
        }

        const patchChannelSyncable = groups.
            filter((g) => {
                return origGroups.some((group) => group.id === g.id && group.scheme_admin !== g.scheme_admin);
            }).
            map((g) => actions.patchGroupSyncable(g.id, channelID, Groups.SYNCABLE_TYPE_CHANNEL, {scheme_admin: g.scheme_admin}));

        const unlink = origGroups.
            filter((g) => {
                return !groups.some((group) => group.id === g.id);
            }).
            map((g) => actions.unlinkGroupSyncable(g.id, channelID, Groups.SYNCABLE_TYPE_CHANNEL));

        const link = groups.
            filter((g) => {
                return !origGroups.some((group) => group.id === g.id);
            }).
            map((g) => actions.linkGroupSyncable(g.id, channelID, Groups.SYNCABLE_TYPE_CHANNEL, {auto_add: true, scheme_admin: g.scheme_admin}));

        const groupActions = [...promises, ...patchChannelSyncable, ...unlink, ...link];
        if (groupActions.length > 0) {
            const result = await Promise.all(groupActions);
            const resultWithError = result.find((r) => 'error' in r);
            if (resultWithError && 'error' in resultWithError) {
                serverError = <FormError error={resultWithError.error.message}/>;
            } else {
                if (unlink.length > 0) {
                    trackEvent('admin_channel_config_page', 'groups_removed_from_channel', {count: unlink.length, channel_id: channelID});
                }
                if (link.length > 0) {
                    trackEvent('admin_channel_config_page', 'groups_added_to_channel', {count: link.length, channel_id: channelID});
                }

                const actionsToAwait: any[] = [actions.getGroups(channelID)];
                if (isPrivacyChanging) {
                    // If the privacy is changing update the manage_members value for the channel moderation widget
                    actionsToAwait.push(
                        actions.getChannelModerations(channelID).then(() => {
                            const manageMembersIndex = channelPermissions!.findIndex((element) => element.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_MEMBERS);
                            if (channelPermissions) {
                                const updatedManageMembers = this.props.channelPermissions!.find((element) => element.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_MEMBERS);
                                channelPermissions[manageMembersIndex] = updatedManageMembers || channelPermissions[manageMembersIndex];
                            }
                            this.setState({channelPermissions});
                        }),
                    );
                }
                await Promise.all(actionsToAwait);
            }
        }

        const patchChannelPermissionsArray: Array<ChannelModerationPatch> = channelPermissions!.map((p) => {
            return {
                name: p.name,
                roles: {
                    ...(p.roles.members && p.roles.members.enabled && {members: p.roles.members!.value}),
                    ...(p.roles.guests && p.roles.guests.enabled && {guests: p.roles.guests!.value}),
                },
            };
        });

        const patchChannelModerationsResult = await actions.patchChannelModerations(channelID, patchChannelPermissionsArray);
        if (patchChannelModerationsResult.error) {
            serverError = <FormError error={patchChannelModerationsResult.error.message}/>;
        }
        this.restrictChannelMentions();

        let privacyChanging = isPrivacyChanging;
        if (serverError == null) {
            privacyChanging = false;
        }

        const usersToAddList = Object.values(usersToAdd);
        const usersToRemoveList = Object.values(usersToRemove);
        const userRolesToUpdate = Object.keys(rolesToUpdate);
        const usersToUpdate = usersToAddList.length > 0 || usersToRemoveList.length > 0 || userRolesToUpdate.length > 0;
        if (usersToUpdate && !isSynced) {
            const addUserActions: any[] = [];
            const removeUserActions: any[] = [];
            const {addChannelMember, removeChannelMember, updateChannelMemberSchemeRoles} = this.props.actions;
            usersToAddList.forEach((user) => {
                addUserActions.push(addChannelMember(channelID, user.id));
            });
            usersToRemoveList.forEach((user) => {
                removeUserActions.push(removeChannelMember(channelID, user.id));
            });

            if (addUserActions.length > 0) {
                const result = await Promise.all(addUserActions);
                const resultWithError = result.find((r) => 'error' in r);
                const count = result.filter((r) => 'data' in r).length;
                if (resultWithError && 'error' in resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_channel_config_page', 'members_added_to_channel', {count, channel_id: channelID});
                }
            }

            if (removeUserActions.length > 0) {
                const result = await Promise.all(removeUserActions);
                const resultWithError = result.find((r) => 'error' in r);
                const count = result.filter((r) => 'data' in r).length;
                if (resultWithError && 'error' in resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_channel_config_page', 'members_removed_from_channel', {count, channel_id: channelID});
                }
            }

            const rolesToPromote: any[] = [];
            const rolesToDemote: any[] = [];
            userRolesToUpdate.forEach((userId) => {
                const {schemeUser, schemeAdmin} = rolesToUpdate[userId];
                if (schemeAdmin) {
                    rolesToPromote.push(updateChannelMemberSchemeRoles(channelID, userId, schemeUser, schemeAdmin));
                } else {
                    rolesToDemote.push(updateChannelMemberSchemeRoles(channelID, userId, schemeUser, schemeAdmin));
                }
            });

            if (rolesToPromote.length > 0) {
                const result = await Promise.all(rolesToPromote);
                const resultWithError = result.find((r) => 'error' in r);
                const count = result.filter((r) => 'data' in r).length;
                if (resultWithError && 'error' in resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_channel_config_page', 'members_elevated_to_channel_admin', {count, channel_id: channelID});
                }
            }

            if (rolesToDemote.length > 0) {
                const result = await Promise.all(rolesToDemote);
                const resultWithError = result.find((r) => 'error' in r);
                const count = result.filter((r) => 'data' in r).length;
                if (resultWithError && 'error' in resultWithError) {
                    serverError = <FormError error={resultWithError.error.message}/>;
                }
                if (count > 0) {
                    trackEvent('admin_channel_config_page', 'admins_demoted_to_channel_member', {count, channel_id: channelID});
                }
            }
        }

        this.setState({serverError, saving: false, saveNeeded, isPrivacyChanging: privacyChanging, usersToRemoveCount: 0, rolesToUpdate: {}, usersToAdd: {}, usersToRemove: {}}, () => {
            actions.setNavigationBlocked(saveNeeded);
            if (!saveNeeded && serverError === null) {
                browserHistory.push('/admin_console/user_management/channels');
            }
        });
    };

    private channelToBeArchived = (): boolean => {
        const {isLocalArchived} = this.state;
        const isServerArchived = this.props.channel.delete_at !== 0;
        return isLocalArchived && !isServerArchived;
    }

    private channelToBeRestored = (): boolean => {
        const {isLocalArchived} = this.state;
        const isServerArchived = this.props.channel.delete_at !== 0;
        return !isLocalArchived && isServerArchived;
    }

    private addRolesToUpdate = (userId: string, schemeUser: boolean, schemeAdmin: boolean) => {
        const {rolesToUpdate} = this.state;
        rolesToUpdate[userId] = {schemeUser, schemeAdmin};
        this.setState({rolesToUpdate: {...rolesToUpdate}, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    private addUserToRemove = (user: UserProfile) => {
        let {usersToRemoveCount} = this.state;
        const {usersToAdd, usersToRemove, rolesToUpdate} = this.state;
        if (usersToAdd[user.id]?.id === user.id) {
            delete usersToAdd[user.id];
        } else if (usersToRemove[user.id]?.id !== user.id) {
            usersToRemoveCount += 1;
            usersToRemove[user.id] = user;
        }
        delete rolesToUpdate[user.id];
        this.setState({usersToRemove: {...usersToRemove}, usersToAdd: {...usersToAdd}, rolesToUpdate: {...rolesToUpdate}, usersToRemoveCount, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    private addUsersToAdd = (users: UserProfile[]) => {
        let {usersToRemoveCount} = this.state;
        const {usersToAdd, usersToRemove} = this.state;
        users.forEach((user) => {
            if (usersToRemove[user.id]?.id === user.id) {
                delete usersToRemove[user.id];
                usersToRemoveCount -= 1;
            } else {
                usersToAdd[user.id] = user;
            }
        });
        this.setState({usersToAdd: {...usersToAdd}, usersToRemove: {...usersToRemove}, usersToRemoveCount, saveNeeded: true});
        this.props.actions.setNavigationBlocked(true);
    }

    private onToggleArchive = () => {
        const {isLocalArchived, serverError, previousServerError} = this.state;
        const {isDisabled} = this.props;
        if (isDisabled) {
            return;
        }
        const newState: any = {
            saveNeeded: true,
            isLocalArchived: !isLocalArchived,
        };

        if (newState.isLocalArchived) {
            // if the channel is being archived then clear the other server
            // errors, they're no longer relevant.
            newState.previousServerError = serverError;
            newState.serverError = null;
        } else {
            // if the channel is being unarchived (maybe the user had toggled
            // and untoggled) the button, so reinstate any server errors that
            // were present.
            newState.serverError = previousServerError;
            newState.previousServerError = null;
        }
        this.props.actions.setNavigationBlocked(true);
        this.setState(newState);
    };

    public render = (): JSX.Element => {
        const {
            totalGroups,
            saving,
            saveNeeded,
            serverError,
            isSynced,
            isPublic,
            isDefault,
            groups,
            showConvertConfirmModal,
            showRemoveConfirmModal,
            showConvertAndRemoveConfirmModal,
            usersToRemoveCount,
            channelPermissions,
            teamScheme,
            usersToRemove,
            usersToAdd,
            isLocalArchived,
            showArchiveConfirmModal,
        } = this.state;
        const {channel, team} = this.props;
        const missingGroup = (og: {id: string}) => !groups.find((g: Group) => g.id === og.id);
        const removedGroups = this.props.groups.filter(missingGroup);
        const nonArchivedContent = (
            <>
                <ConvertConfirmModal
                    show={showConvertConfirmModal}
                    onCancel={this.hideConvertConfirmModal}
                    onConfirm={this.handleSubmit}
                    displayName={channel.display_name || ''}
                    toPublic={isPublic}
                />

                <ChannelModeration
                    channelPermissions={channelPermissions}
                    onChannelPermissionsChanged={this.channelPermissionsChanged}
                    teamSchemeID={teamScheme?.id}
                    teamSchemeDisplayName={teamScheme?.['display_name']}
                    guestAccountsEnabled={this.props.guestAccountsEnabled}
                    isPublic={this.props.channel.type === Constants.OPEN_CHANNEL}
                    readOnly={this.props.isDisabled}
                />

                <RemoveConfirmModal
                    show={showRemoveConfirmModal}
                    onCancel={this.hideRemoveConfirmModal}
                    onConfirm={this.handleSubmit}
                    inChannel={true}
                    amount={usersToRemoveCount}
                />

                <ConvertAndRemoveConfirmModal
                    show={showConvertAndRemoveConfirmModal}
                    onCancel={this.hideConvertAndRemoveConfirmModal}
                    onConfirm={this.handleSubmit}
                    displayName={channel.display_name || ''}
                    toPublic={isPublic}
                    removeAmount={usersToRemoveCount}
                />

                <ChannelModes
                    isPublic={isPublic}
                    isSynced={isSynced}
                    isDefault={isDefault}
                    onToggle={this.setToggles}
                    isDisabled={this.props.isDisabled}
                />

                <ChannelGroups
                    synced={isSynced}
                    channel={channel}
                    totalGroups={totalGroups}
                    groups={groups}
                    removedGroups={removedGroups}
                    onAddCallback={this.handleGroupChange}
                    onGroupRemoved={this.handleGroupRemoved}
                    setNewGroupRole={this.setNewGroupRole}
                    isDisabled={this.props.isDisabled}
                />

                {!isSynced &&
                    <ChannelMembers
                        onRemoveCallback={this.addUserToRemove}
                        onAddCallback={this.addUsersToAdd}
                        usersToRemove={usersToRemove}
                        usersToAdd={usersToAdd}
                        updateRole={this.addRolesToUpdate}
                        channelId={this.props.channelID}
                        isDisabled={this.props.isDisabled}
                    />
                }
            </>
        );
        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/channels'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.channel_settings.channel_detail.channel_configuration'
                            defaultMessage='Channel Configuration'
                        />
                    </div>
                </div>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <ChannelProfile
                            channel={channel}
                            team={team}
                            onToggleArchive={this.onToggleArchive}
                            isArchived={isLocalArchived}
                            isDisabled={this.props.isDisabled}
                        />
                        <ConfirmModal
                            show={showArchiveConfirmModal}
                            title={
                                <FormattedMessage
                                    id='admin.channel_settings.channel_detail.archive_confirm.title'
                                    defaultMessage='Save and Archive Channel'
                                />
                            }
                            message={
                                <FormattedMessage
                                    id='admin.channel_settings.channel_detail.archive_confirm.message'
                                    defaultMessage='Saving will archive the channel from the team and make its contents inaccessible for all users. Are you sure you wish to save and archive this channel?'
                                />
                            }
                            confirmButtonText={
                                <FormattedMessage
                                    id='admin.channel_settings.channel_detail.archive_confirm.button'
                                    defaultMessage='Save and Archive Channel'
                                />
                            }
                            onConfirm={this.handleSubmit}
                            onCancel={this.hideArchiveConfirmModal}
                        />
                        {!isLocalArchived && nonArchivedContent}
                    </div>
                </div>

                <SaveChangesPanel
                    saving={saving}
                    saveNeeded={saveNeeded}
                    onClick={this.onSave}
                    serverError={serverError}
                    cancelLink='/admin_console/user_management/channels'
                    isDisabled={this.props.isDisabled}
                />
            </div>
        );
    };
}
