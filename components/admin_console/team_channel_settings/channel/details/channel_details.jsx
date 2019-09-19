// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Groups} from 'mattermost-redux/constants';

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

export default class ChannelDetails extends React.Component {
    static propTypes = {
        channelID: PropTypes.string.isRequired,
        channel: PropTypes.object.isRequired,
        team: PropTypes.object.isRequired,
        groups: PropTypes.arrayOf(PropTypes.object).isRequired,
        totalGroups: PropTypes.number.isRequired,
        allGroups: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroups: PropTypes.func.isRequired,
            linkGroupSyncable: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            membersMinusGroupMembers: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
            getChannel: PropTypes.func.isRequired,
            getTeam: PropTypes.func.isRequired,
            patchChannel: PropTypes.func.isRequired,
            updateChannelPrivacy: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        channel: {display_name: '', id: ''},
    };

    constructor(props) {
        super(props);
        this.state = {
            isSynced: Boolean(props.channel.group_constrained),
            isPublic: props.channel.type === Constants.OPEN_CHANNEL,
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
        };
    }

    componentDidUpdate(prevProps) {
        const {channel, totalGroups} = this.props;
        if (channel.id !== prevProps.channel.id) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                totalGroups,
                isSynced: Boolean(channel.group_constrained),
                isPublic: channel.type === Constants.OPEN_CHANNEL,
            });
        }

        // If we don't have the team and channel on mount, we need to request the team after we load the channel
        if (!prevProps.team.id && !prevProps.channel.team_id && channel.team_id) {
            this.props.actions.getTeam(channel.team_id);
        }
    }

    async componentDidMount() {
        const {channelID, channel, team, actions} = this.props;
        actions.getGroups(channelID).
            then(() => actions.getChannel(channelID)).
            then(() => this.setState({groups: this.props.groups}));

        if (!team.id && channel.team_id) {
            actions.getTeam(channel.team_id);
        }
    }

    setToggles = (isSynced, isPublic) => {
        const {channel} = this.props;
        const isOriginallyPublic = (channel.type === Constants.OPEN_CHANNEL);
        this.setState({
            saveNeeded: true,
            isSynced,
            isPublic,
            isPrivacyChanging: isPublic !== isOriginallyPublic,
        }, () => this.processGroupsChange(this.state.groups));
        this.props.actions.setNavigationBlocked(true);
    }

    async processGroupsChange(groups) {
        const {actions, channelID} = this.props;
        actions.setNavigationBlocked(true);

        let serverError = null;
        let usersToRemove = 0;
        if (this.state.isSynced) {
            try {
                if (groups.length === 0) {
                    serverError = <NeedGroupsError/>;
                } else {
                    const result = await actions.membersMinusGroupMembers(channelID, groups.map((g) => g.id));

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
            } catch (ex) {
                serverError = ex;
            }
        }
        this.setState({groups, usersToRemove, saveNeeded: true, serverError});
    }

    handleGroupRemoved = (gid) => {
        const groups = this.state.groups.filter((g) => g.id !== gid);
        this.setState({totalGroups: this.state.totalGroups - 1});

        this.processGroupsChange(groups);
    }

    handleGroupChange = (groupIDs) => {
        const groups = [...this.state.groups, ...groupIDs.map((gid) => this.props.allGroups[gid])];
        this.setState({totalGroups: this.state.totalGroups + groupIDs.length});

        this.processGroupsChange(groups);
    }

    hideConvertConfirmModal = () => {
        this.setState({showConvertConfirmModal: false});
    }

    hideRemoveConfirmModal = () => {
        this.setState({showRemoveConfirmModal: false});
    }

    hideConvertAndRemoveConfirmModal = () => {
        this.setState({showConvertAndRemoveConfirmModal: false});
    }

    onSave = () => {
        const {channel} = this.props;
        const {isSynced, usersToRemove} = this.state;
        let {isPublic, isPrivacyChanging} = this.state;
        const isOriginallyPublic = (channel.type === Constants.OPEN_CHANNEL);

        if (isSynced) {
            isPublic = false;
            isPrivacyChanging = isOriginallyPublic;
            this.setState({
                isPublic,
                isPrivacyChanging,
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
    }

    handleSubmit = async () => {
        this.setState({showConvertConfirmModal: false, showRemoveConfirmModal: false, showConvertAndRemoveConfirmModal: false, saving: true});
        const {groups, isSynced, isPublic, isPrivacyChanging} = this.state;

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
                promises.push(convert.then((res) => {
                    if (res && res.error) {
                        return res;
                    }
                    return actions.patchChannel(channel.id, {
                        ...channel,
                        group_constrained: isSynced,
                    });
                }));
            } else {
                promises.push(actions.patchChannel(channel.id, {
                    ...channel,
                    group_constrained: isSynced,
                }));
            }

            const unlink = origGroups.filter((g) => !groups.includes(g)).map((g) => actions.unlinkGroupSyncable(g.id, channelID, Groups.SYNCABLE_TYPE_CHANNEL));
            const link = groups.filter((g) => !origGroups.includes(g)).map((g) => actions.linkGroupSyncable(g.id, channelID, Groups.SYNCABLE_TYPE_CHANNEL, {auto_add: true}));
            const result = await Promise.all([...promises, ...unlink, ...link]);
            const resultWithError = result.find((r) => r.error);
            if (resultWithError) {
                serverError = <FormError error={resultWithError.error.message}/>;
            } else {
                await actions.getGroups(channelID);
            }
        }

        this.setState({serverError, saving: false, saveNeeded});
        actions.setNavigationBlocked(saveNeeded);
    }

    render = () => {
        const {totalGroups, saving, saveNeeded, serverError, isSynced, isPublic, groups, showConvertConfirmModal, showRemoveConfirmModal, showConvertAndRemoveConfirmModal, usersToRemove} = this.state;
        const {channel, team} = this.props;
        const missingGroup = (og) => !groups.find((g) => g.id === og.id);
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
                            onToggle={this.setToggles}
                        />

                        <ChannelGroups
                            synced={isSynced}
                            channel={channel}
                            totalGroups={totalGroups}
                            groups={groups}
                            removedGroups={removedGroups}
                            onAddCallback={this.handleGroupChange}
                            onGroupRemoved={this.handleGroupRemoved}
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
