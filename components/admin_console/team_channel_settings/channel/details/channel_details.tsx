// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {cloneDeep} from 'lodash';

import {Groups, Permissions} from 'mattermost-redux/constants';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {Scheme} from 'mattermost-redux/types/schemes';
import {ChannelModerationRoles} from 'mattermost-redux/types/roles';
import {SyncablePatch, Group} from 'mattermost-redux/types/groups';
import {Channel, ChannelModeration as ChannelPermissions, ChannelModerationPatch} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import BlockableLink from 'components/admin_console/blockable_link';
import FormError from 'components/form_error';
import Constants from 'utils/constants';

import {NeedGroupsError, UsersWillBeRemovedError} from '../../errors';
import ConvertConfirmModal from '../../convert_confirm_modal';
import RemoveConfirmModal from '../../remove_confirm_modal';
import ConvertAndRemoveConfirmModal from '../../convert_and_remove_confirm_modal';
import SaveChangesPanel from '../../save_changes_panel';

import {ChannelModes} from './channel_modes';
import {ChannelGroups} from './channel_groups';
import {ChannelProfile} from './channel_profile';
import ChannelModeration from './channel_moderation';

interface ChannelDetailsProps {
    channelID: string;
    channel: Channel;
    team: Partial<Team>;
    groups: Group[];
    totalGroups: number;
    channelPermissions?: Array<ChannelPermissions>;
    allGroups: {[gid: string]: Group}; // hashmap of groups
    teamScheme?: Scheme;
    guestAccountsEnabled: boolean;
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
    };
}

interface ChannelDetailsState {
    isSynced: boolean;
    isPublic: boolean;
    isDefault: boolean;
    totalGroups: number;
    groups: Group[];
    usersToRemove: number;
    saveNeeded: boolean;
    serverError: JSX.Element | null;
    isPrivacyChanging: boolean;
    saving: boolean;
    showConvertConfirmModal: boolean;
    showRemoveConfirmModal: boolean;
    showConvertAndRemoveConfirmModal: boolean;
    channelPermissions?: Array<ChannelPermissions>;
    teamScheme?: Scheme;
}

export default class ChannelDetails extends React.Component<ChannelDetailsProps, ChannelDetailsState> {
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
            usersToRemove: 0,
            groups: props.groups,
            saveNeeded: false,
            serverError: null,
            channelPermissions: props.channelPermissions,
            teamScheme: props.teamScheme,
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
                isDefault: channel.name === Constants.DEFAULT_CHANNEL
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
                then(() => this.setState({groups: this.props.groups}))
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
                then(() => this.setState({teamScheme: this.props.teamScheme}))
            );
        }

        await Promise.all(actionsToAwait);
    }

    private restrictChannelMentions() {
        // Disabling use_channel_mentions on every role that create_post is either disabled or has a value of false
        let channelPermissions = this.props.channelPermissions;
        const currentCreatePostRoles: any = channelPermissions!.find((element) => element.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST)?.['roles'];
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
                            }
                        }
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
                isPrivacyChanging: isPublic !== isOriginallyPublic
            },
            () => this.processGroupsChange(this.state.groups)
        );
        this.props.actions.setNavigationBlocked(true);
    };

    async processGroupsChange(groups: Group[]) {
        const {actions, channelID} = this.props;
        actions.setNavigationBlocked(true);
        let serverError = null;
        let usersToRemove = 0;
        if (this.state.isSynced) {
            try {
                if (groups.length === 0) {
                    serverError = <NeedGroupsError/>;
                } else {
                    if (!channelID) {
                        return;
                    }

                    const result = await actions.membersMinusGroupMembers(channelID, groups.map((g) => g.id));
                    if ('data' in result) {
                        usersToRemove = result.data.total_count;
                        if (usersToRemove > 0) {
                            serverError = (
                                <UsersWillBeRemovedError
                                    total={usersToRemove}
                                    users={result.data.users}
                                />
                            );
                        }
                    }
                }
            } catch (ex) {
                serverError = ex;
            }
        }
        this.setState({groups, usersToRemove, saveNeeded: true, serverError});
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
            const originalObj = this.props.channelPermissions!.find((element) => element.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS)?.['roles']![channelRole];
            channelPermissions = channelPermissions.map((permission) => {
                if (permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS && !newValue) {
                    return {
                        name: permission.name,
                        roles: {
                            ...permission.roles,
                            [channelRole]: {
                                value: false,
                                enabled: false,
                            }
                        }
                    };
                } else if (permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS) {
                    return {
                        name: permission.name,
                        roles: {
                            ...permission.roles,
                            [channelRole]: {
                                value: originalObj?.['value'],
                                enabled: originalObj?.['enabled'],
                            }
                        }
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
                    value: newValue
                }
            }
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
    private onSave = () => {
        const {channel} = this.props;
        const {isSynced, usersToRemove} = this.state;
        let {isPublic, isPrivacyChanging} = this.state;
        const isOriginallyPublic = channel.type === Constants.OPEN_CHANNEL;
        if (isSynced) {
            isPublic = false;
            isPrivacyChanging = isOriginallyPublic;
            this.setState({
                isPublic,
                isPrivacyChanging
            });
            if (this.state.groups.length === 0) {
                return;
            }
        }
        if (isPrivacyChanging && usersToRemove > 0) {
            this.setState({showConvertAndRemoveConfirmModal: true});
            return;
        }
        if (isPrivacyChanging && usersToRemove === 0) {
            this.setState({showConvertConfirmModal: true});
            return;
        }
        if (!isPrivacyChanging && usersToRemove > 0) {
            this.setState({showRemoveConfirmModal: true});
            return;
        }
        this.handleSubmit();
    };
    private handleSubmit = async () => {
        this.setState({showConvertConfirmModal: false, showRemoveConfirmModal: false, showConvertAndRemoveConfirmModal: false, saving: true});
        const {groups, isSynced, isPublic, isPrivacyChanging, channelPermissions} = this.state;
        let serverError = null;
        let saveNeeded = false;
        const {groups: origGroups, channelID, actions, channel} = this.props;
        if (this.state.groups.length === 0 && isSynced) {
            serverError = <NeedGroupsError/>;
            saveNeeded = true;
        } else {
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
                            group_constrained: isSynced
                        });
                    })
                );
            } else {
                promises.push(
                    actions.patchChannel(channel.id, {
                        ...channel,
                        group_constrained: isSynced
                    })
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
            const result = await Promise.all([...promises, ...patchChannelSyncable, ...unlink, ...link]);
            const resultWithError = result.find((r) => 'error' in r);
            if (resultWithError && 'error' in resultWithError) {
                serverError = <FormError error={resultWithError.error.message}/>;
            } else {
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
                        })
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
                    ...(p.roles.guests && p.roles.guests.enabled && {guests: p.roles.guests!.value})
                }
            };
        });

        const result = await actions.patchChannelModerations(channelID, patchChannelPermissionsArray);
        if (result.error) {
            serverError = <FormError error={result.error.message}/>;
        }
        this.restrictChannelMentions();

        let privacyChanging = isPrivacyChanging;
        if (serverError == null) {
            privacyChanging = false;
        }

        this.setState({serverError, saving: false, saveNeeded, isPrivacyChanging: privacyChanging});

        actions.setNavigationBlocked(saveNeeded);
    };

    render = (): JSX.Element => {
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
            usersToRemove,
            channelPermissions,
            teamScheme
        } = this.state;
        const {channel, team} = this.props;
        const missingGroup = (og: {id: string}) => !groups.find((g: Group) => g.id === og.id);
        const removedGroups = this.props.groups.filter(missingGroup);
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
                        />

                        <ConvertConfirmModal
                            show={showConvertConfirmModal}
                            onCancel={this.hideConvertConfirmModal}
                            onConfirm={this.handleSubmit}
                            displayName={channel.display_name || ''}
                            toPublic={isPublic}
                        />

                        <RemoveConfirmModal
                            show={showRemoveConfirmModal}
                            onCancel={this.hideRemoveConfirmModal}
                            onConfirm={this.handleSubmit}
                            inChannel={true}
                            amount={usersToRemove}
                        />

                        <ConvertAndRemoveConfirmModal
                            show={showConvertAndRemoveConfirmModal}
                            onCancel={this.hideConvertAndRemoveConfirmModal}
                            onConfirm={this.handleSubmit}
                            displayName={channel.display_name || ''}
                            toPublic={isPublic}
                            removeAmount={usersToRemove}
                        />

                        <ChannelModes
                            isPublic={isPublic}
                            isSynced={isSynced}
                            isDefault={isDefault}
                            onToggle={this.setToggles}
                        />

                        <ChannelModeration
                            channelPermissions={channelPermissions}
                            onChannelPermissionsChanged={this.channelPermissionsChanged}
                            teamSchemeID={teamScheme?.['id']}
                            teamSchemeDisplayName={teamScheme?.['display_name']}
                            guestAccountsEnabled={this.props.guestAccountsEnabled}
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
                        />
                    </div>
                </div>

                <SaveChangesPanel
                    saving={saving}
                    saveNeeded={saveNeeded}
                    onClick={this.onSave}
                    serverError={serverError}
                    cancelLink='/admin_console/user_management/channels'
                />
            </div>
        );
    };
}
