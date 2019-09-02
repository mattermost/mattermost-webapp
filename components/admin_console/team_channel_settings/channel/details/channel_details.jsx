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
import RemoveConfirmModal from '../../remove_confirm_modal';
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
            convertChannelToPrivate: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            membersMinusGroupMembers: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
            getChannel: PropTypes.func.isRequired,
            patchChannel: PropTypes.func.isRequired,
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
            saving: false,
            totalGroups: props.totalGroups,
            showRemoveConfirmation: false,
            usersToRemove: 0,
            groups: props.groups,
            saveNeeded: false,
            serverError: null,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.channel.id !== prevProps.channel.id) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                totalGroups: this.props.totalGroups,
                isSynced: Boolean(this.props.channel.group_constrained),
                isPublic: this.props.channel.type === Constants.OPEN_CHANNEL,
            });
        }
    }

    async componentDidMount() {
        const {channelID, actions} = this.props;
        actions.getGroups(channelID).
            then(() => actions.getChannel(channelID)).
            then(() => this.setState({groups: this.props.groups}));
    }

    setToggles = (isSynced, isPublic) => {
        this.setState({
            saveNeeded: true,
            isSynced,
            isPublic: !isSynced && isPublic,
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

    hideRemoveUsersModal = () => {
        this.setState({showRemoveConfirmation: false});
    }
    showRemoveUsersModal = () => {
        if (this.state.usersToRemove > 0) {
            this.setState({showRemoveConfirmation: true});
        } else {
            this.handleSubmit();
        }
    }

    handleSubmit = async () => {
        this.setState({showRemoveConfirmation: false, saving: true});
        const {groups, isSynced, isPublic} = this.state;

        let serverError = null;
        let saveNeeded = false;

        const {groups: origGroups, channelID, actions, channel} = this.props;
        if (this.state.groups.length === 0 && isSynced) {
            serverError = <NeedGroupsError/>;
            saveNeeded = true;
        } else {
            const promises = [];
            if (!isPublic && channel.type === Constants.OPEN_CHANNEL) {
                promises.push(actions.convertChannelToPrivate(channel.id));
            }
            promises.push(actions.patchChannel(channel.id, {
                ...channel,
                group_constrained: isSynced,
                type: isPublic ? Constants.OPEN_CHANNEL : Constants.PRIVATE_CHANNEL,
            }));
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
        const {totalGroups, saving, saveNeeded, serverError, isSynced, isPublic, groups, showRemoveConfirmation, usersToRemove} = this.state;
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
                        <RemoveConfirmModal
                            amount={usersToRemove}
                            inChannel={false}
                            show={showRemoveConfirmation}
                            onCancel={this.hideRemoveUsersModal}
                            onConfirm={this.handleSubmit}
                        />
                        <ChannelProfile
                            channel={channel}
                            team={team}
                        />

                        <ChannelModes
                            isPublic={isPublic}
                            isSynced={isSynced}
                            isOriginallyPrivate={channel.type === Constants.PRIVATE_CHANNEL}
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
                    onClick={this.showRemoveUsersModal}
                    serverError={serverError}
                    cancelLink='/admin_console/user_management/channels'
                />

            </div>
        );
    };
}
