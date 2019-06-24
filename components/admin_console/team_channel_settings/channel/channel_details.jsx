// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getAllGroups, getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {getChannel as fetchChannel, membersMinusGroupMembers} from 'mattermost-redux/actions/channels';
import {getGroupsAssociatedToChannel as fetchAssociatedGroups, linkGroupSyncable, unlinkGroupSyncable} from 'mattermost-redux/actions/groups';
import {connect} from 'react-redux';

import {t} from 'utils/i18n';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import SaveButton from 'components/save_button';
import {localizeMessage} from 'utils/utils';

import {setNavigationBlocked} from 'actions/admin_actions';
import ToggleModalButton from 'components/toggle_modal_button';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import GroupList from '../group/groups';
import Constants from 'utils/constants';
import {NeedGroupsError, UsersWillBeRemovedError} from '../group/errors';
import LineSwitch from '../line_switch';
import FormError from '../../../form_error';

class ChannelDetails extends React.Component {
    static propTypes = {
        channelID: PropTypes.string.isRequired,
        channel: PropTypes.object.isRequired,
        groups: PropTypes.arrayOf(PropTypes.object).isRequired,
        allGroups: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroups: PropTypes.func.isRequired,
            linkGroupSyncable: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            membersMinusGroupMembers: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
            getChannel: PropTypes.func.isRequired,
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
            saveNeeded: false,
            serverError: null,
        };
    }

    componentDidMount() {
        const {channelID, actions} = this.props;
        actions.getChannel(channelID).
            then(() => actions.getGroups(channelID)).
            then(() => this.setState({groups: this.props.groups}));
    }

    setToggles = (isSynced, isPublic) => {
        this.setState({
            saveNeeded: true,
            isSynced,
            isPublic: !isSynced && isPublic,
        });
        this.props.actions.setNavigationBlocked(true);
    }

    processGroupsChange(groups) {
        this.props.actions.setNavigationBlocked(true);

        const removed = this.props.groups.filter((g) => !groups.includes(g)).map((g) => g.id);
        this.props.actions.membersMinusGroupMembers(this.props.channelID, removed).then((result) => {
            let serverError = null;
            if (result.data.total_count > 0) {
                serverError = (
                    <UsersWillBeRemovedError
                        team={this.props.channel}
                        amount={result.data.total_count}
                    />
                );
            }
            this.setState({groups, saveNeeded: true, serverError});
        });
    }

    handleGroupRemoved = (gid) => {
        const groups = this.state.groups.filter((g) => g.id !== gid);
        this.processGroupsChange(groups);
    }

    handleGroupChange = (groupIDs) => {
        const groups = [...this.state.groups, ...groupIDs.map((gid) => this.props.allGroups[gid])];
        this.processGroupsChange(groups);
    }

    handleSubmit = async () => {
        this.setState({saving: true});
        const {groups, isSynced, isPublic} = this.state;

        let serverError = null;
        let saveNeeded = false;

        const {channelID, actions, channel} = this.props;
        if (this.state.groups.length === 0) {
            serverError = <NeedGroupsError/>;
            saveNeeded = true;
        } else {
            // TODO: add confirm dialog
            try {
                await actions.patchChannel({
                    ...channel,
                    group_constrained: isSynced,
                    type: isPublic ? Constants.OPEN_CHANNEL : Constants.PRIVATE_CHANNEL,
                });
                const unlink = this.props.groups.filter((g) => !groups.includes(g)).map((g) => actions.unlinkGroupSyncable(g.id, channelID));
                const link = groups.filter((g) => !this.props.groups.includes(g)).map((g) => actions.linkGroupSyncable(g.id, channelID));
                await Promise.all([...unlink, ...link]);
            } catch (ex) {
                serverError = <FormError error={ex}/>;
            }
        }

        this.setState({serverError, saving: false, saveNeeded});
        actions.setNavigationBlocked(saveNeeded);
    }
    render = () => {
        const {isSynced, isPublic, groups} = this.state;
        const channel = this.props.channel;

        const SyncGroupsToggle = () => (
            <LineSwitch
                toggled={isSynced}
                onToggle={() => this.setToggles(!isSynced, isPublic)}
                title={(
                    <FormattedMessage
                        id='admin.channel_settings.channel_details.syncGroupMembers'
                        defaultMessage='Sync Group Members'
                    />
                )}
                subTitle={(
                    <FormattedMarkdownMessage
                        id='admin.channel_settings.channel_details.syncGroupMembersDescr'
                        defaultMessage='When enabled, adding and removing users from groups will add or remove them from this channel. The only way of inviting members to this channel is by adding the groups they belong to. [Learn More](www.mattermost.com/pl/default-ldap-group-constrained-team-channel.html)'
                    />
                )}
            />);

        const AllowAllToggle = () =>
            !isSynced && (
                <LineSwitch
                    toggled={isPublic}
                    onToggle={() => this.setToggles(isSynced, !isPublic)}
                    title={(
                        <FormattedMessage
                            id='admin.channel_settings.channel_details.isPublic'
                            defaultMessage='Public channel or private channel'
                        />
                    )}
                    subTitle={(
                        <FormattedMessage
                            id='admin.channel_settings.channel_details.isPublicDescr'
                            defaultMessage='If `public` the channel is discoverable and any user can join, or if `private` invitations are required.'
                        />
                    )}
                />);

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

                        <AdminPanel
                            id='channel_profile'
                            titleId={t('admin.channel_settings.channel_detail.profileTitle')}
                            titleDefault='Channel Profile'
                            subtitleId={t('admin.channel_settings.channel_detail.profileDescription')}
                            subtitleDefault='Summary of the channel, including the channel name.'
                        >

                            <div className='group-teams-and-channels'>

                                <div className='group-teams-and-channels--body'>
                                    <FormattedMarkdownMessage
                                        id='admin.channel_settings.channel_detail.channelName'
                                        defaultMessage='**Name**'
                                    />
                                    <br/>
                                    {channel.name}
                                </div>
                            </div>

                        </AdminPanel>

                        <AdminPanel
                            id='channel_manage'
                            titleId={t('admin.channel_settings.channel_detail.manageTitle')}
                            titleDefault='Channel Management'
                            subtitleId={t('admin.channel_settings.channel_detail.manageDescription')}
                            subtitleDefault='Choose between inviting members manually or syncing members automatically from groups.'
                        >
                            <div className='group-teams-and-channels'>
                                <div className='group-teams-and-channels--body'>
                                    <SyncGroupsToggle/>
                                    <AllowAllToggle/>
                                </div>
                            </div>
                        </AdminPanel>

                        <AdminPanel
                            id='channel_groups'
                            titleId={isSynced ? t('admin.channel_settings.channel_detail.syncedGroupsTitle') : t('admin.channel_settings.channel_detail.groupsTitle')}
                            titleDefault={isSynced ? 'Synced Groups' : 'Groups'}
                            subtitleId={isSynced ? t('admin.channel_settings.channel_detail.syncedGroupsDescription') : t('admin.channel_settings.channel_detail.groupsDescription')}
                            subtitleDefault={isSynced ? 'Add and remove team members based on their group membership..' : 'Group members will be added to the team.'}
                            button={
                                <ToggleModalButton
                                    className='btn btn-primary'
                                    dialogType={AddGroupsToChannelModal}
                                    dialogProps={{channel, onAddCallback: this.handleGroupChange, skipCommit: true, excludeGroups: groups}}
                                >
                                    <FormattedMessage
                                        id='admin.channel_settings.channel_details.add_group'
                                        defaultMessage='Add Group'
                                    />
                                </ToggleModalButton>}
                        >
                            {channel.id && (
                                <GroupList
                                    channel={channel}
                                    groups={groups}
                                    onGroupRemoved={this.handleGroupRemoved}
                                    isModeSync={isSynced}
                                />
                            )}

                        </AdminPanel>
                    </div>
                </div>
                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={!this.state.saveNeeded}
                        onClick={this.handleSubmit}
                        savingMessage={localizeMessage('admin.channel_settings.channel_detail.saving', 'Saving Config...')}
                    />
                    <BlockableLink
                        className='cancel-button'
                        to='/admin_console/user_management/channels'
                    >
                        <FormattedMessage
                            id='admin.channel_settings.channel_detail.cancel'
                            defaultMessage='Cancel'
                        />
                    </BlockableLink>

                    <div className='error-message'>
                        {this.state.serverError}
                    </div>
                </div>
            </div>
        );
    };
}

function mapStateToProps(state, props) {
    const channelID = props.match.params.channel_id;
    const channel = getChannel(state, channelID) || {};
    const groups = getGroupsAssociatedToChannel(state, channelID);
    const allGroups = getAllGroups(state, channel.team_id);

    return {
        channel,
        allGroups,
        groups,
        channelID,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannel: fetchChannel,
            getGroups: fetchAssociatedGroups,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetails);
