// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay, OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router';

import {Client4} from 'mattermost-redux/client';

import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import {canManageMembers} from 'utils/channel_utils.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import ProfilePicture from 'components/profile_picture.jsx';
import MemberIcon from 'components/svg/member_icon';
import MessageIcon from 'components/svg/message_icon';
import TeamMembersModal from 'components/team_members_modal';

export default class PopoverListMembers extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        members: PropTypes.array.isRequired,
        memberCount: PropTypes.number,
        currentUserId: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getProfilesInChannel: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.showMembersModal = this.showMembersModal.bind(this);

        this.handleShowDirectChannel = this.handleShowDirectChannel.bind(this);
        this.closePopover = this.closePopover.bind(this);

        this.state = {
            showPopover: false,
            showTeamMembersModal: false,
            showChannelMembersModal: false,
            showChannelInviteModal: false,
            teamMembers: UserStore.getProfilesUsernameMap(),
            isSystemAdmin: UserStore.isSystemAdminForCurrentUser(),
            isTeamAdmin: TeamStore.isTeamAdminForCurrentTeam(),
            isChannelAdmin: ChannelStore.isChannelAdminForCurrentChannel(),
            sortedMembers: []
        };
    }

    componentDidUpdate() {
        $('.member-list__popover .popover-content .more-modal__body').perfectScrollbar();
    }

    componentWillReceiveProps(nextProps) {
        if (!Utils.areObjectsEqual(this.props.members, nextProps.members)) {
            const sortedMembers = this.sortMembers(nextProps.members);
            const teamMembers = UserStore.getProfilesUsernameMap();

            this.setState({sortedMembers, teamMembers});
        }
    }

    sortMembers(members = []) {
        return members.map((member) => {
            const status = UserStore.getStatus(member.id);
            return {...member, status};
        }).sort(Utils.sortUsersByStatusAndDisplayName);
    }

    handleShowDirectChannel(e) {
        e.preventDefault();
        const teammate = e.currentTarget.getAttribute('data-member');

        openDirectChannelToUser(
            teammate.id,
            (channel, channelAlreadyExisted) => {
                browserHistory.push(TeamStore.getCurrentTeamRelativeUrl() + '/channels/' + channel.name);
                if (channelAlreadyExisted) {
                    this.closePopover();
                }
            },
            () => {
                this.closePopover();
            }
        );
    }

    closePopover() {
        this.setState({showPopover: false});
    }

    showMembersModal(e) {
        e.preventDefault();

        this.setState({
            showPopover: false,
            showChannelMembersModal: true
        });
    }

    hideChannelMembersModal = () => {
        this.setState({showChannelMembersModal: false});
    }

    showChannelInviteModal = () => {
        this.setState({showChannelInviteModal: true});
    }

    hideChannelInviteModal = () => {
        this.setState({showChannelInviteModal: false});
    }

    hideTeamMembersModal = () => {
        this.setState({showTeamMembersModal: false});
    }

    handleGetProfilesInChannel = (e) => {
        this.setState({popoverTarget: e.target, showPopover: !this.state.showPopover});
        this.props.actions.getProfilesInChannel(this.props.channel.id, 0);
    }

    getTargetPopover = () => {
        return this.state.popoverTarget;
    }

    render() {
        let popoverButton;
        const popoverHtml = [];

        const {
            sortedMembers,
            teamMembers,
            isSystemAdmin,
            isTeamAdmin,
            isChannelAdmin
        } = this.state;

        if (this.props.members && teamMembers) {
            sortedMembers.forEach((m, i) => {
                let messageIcon;
                if (this.props.currentUserId !== m.id && this.props.channel.type !== Constants.DM_CHANNEl) {
                    messageIcon = (
                        <MessageIcon
                            className='icon icon__message'
                            aria-hidden='true'
                        />
                    );
                }

                let name = '';
                if (teamMembers[m.username]) {
                    name = Utils.displayUsernameForUser(teamMembers[m.username]);
                }

                if (name) {
                    popoverHtml.push(
                        <div
                            data-member={m}
                            className='more-modal__row'
                            onClick={this.handleShowDirectChannel}
                            key={'popover-member-' + i}
                        >
                            <ProfilePicture
                                src={Client4.getProfilePictureUrl(m.id, m.last_picture_update)}
                                status={m.status}
                                width='32'
                                height='32'
                            />
                            <div className='more-modal__details'>
                                <div
                                    className='more-modal__name'
                                >
                                    {name}
                                </div>
                            </div>
                            <div
                                className='more-modal__actions'
                            >
                                {messageIcon}
                            </div>
                        </div>
                    );
                }
            });

            if (this.props.channel.type !== Constants.GM_CHANNEL) {
                let membersName = (
                    <FormattedMessage
                        id='members_popover.manageMembers'
                        defaultMessage='Manage Members'
                    />
                );

                const manageMembers = canManageMembers(this.props.channel, isChannelAdmin, isTeamAdmin, isSystemAdmin);
                const isDefaultChannel = ChannelStore.isDefault(this.props.channel);

                if ((manageMembers === false && isDefaultChannel === false) || isDefaultChannel) {
                    membersName = (
                        <FormattedMessage
                            id='members_popover.viewMembers'
                            defaultMessage='View Members'
                        />
                    );
                }

                popoverButton = (
                    <div
                        className='more-modal__button'
                        key={'popover-member-more'}
                    >
                        <button
                            className='btn btn-link'
                            onClick={this.showMembersModal}
                        >
                            {membersName}
                        </button>
                    </div>
                );
            }
        }

        const count = this.props.memberCount;
        let countText = '-';
        if (count > 0) {
            countText = count.toString();
        }

        const title = (
            <FormattedMessage
                id='members_popover.title'
                defaultMessage='Channel Members'
            />
        );

        let channelMembersModal;
        if (this.state.showChannelMembersModal) {
            channelMembersModal = (
                <ChannelMembersModal
                    onModalDismissed={this.hideChannelMembersModal}
                    showInviteModal={this.showChannelInviteModal}
                    channel={this.props.channel}
                />
            );
        }

        let teamMembersModal;
        if (this.state.showTeamMembersModal) {
            teamMembersModal = (
                <TeamMembersModal
                    onHide={this.hideTeamMembersModal}
                    isAdmin={isTeamAdmin || isSystemAdmin}
                />
            );
        }

        let channelInviteModal;
        if (this.state.showChannelInviteModal) {
            channelInviteModal = (
                <ChannelInviteModal
                    onHide={this.hideChannelInviteModal}
                    channel={this.props.channel}
                />
            );
        }

        const channelMembersTooltip = (
            <Tooltip id='channelMembersTooltip'>
                <FormattedMessage
                    id='channel_header.channelMembers'
                    defaultMessage='Members'
                />
            </Tooltip>
        );

        return (
            <div
                id='channelMember'
                className={'channel-header__icon wide ' + (this.state.showPopover ? 'active' : '')}
            >
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={channelMembersTooltip}
                >
                    <div
                        id='member_popover'
                        className='member-popover__trigger'
                        ref='member_popover_target'
                        onClick={this.handleGetProfilesInChannel}
                    >
                        <span
                            id='channelMemberCountText'
                            className='icon__text'
                        >
                            {countText}
                        </span>
                        <MemberIcon
                            id='channelMemberIcon'
                            className='icon icon__members'
                            aria-hidden='true'
                        />
                    </div>
                </OverlayTrigger>
                <Overlay
                    rootClose={true}
                    onHide={this.closePopover}
                    show={this.state.showPopover}
                    target={this.getTargetPopover}
                    placement='bottom'
                >
                    <Popover
                        ref='memebersPopover'
                        className='member-list__popover'
                        id='member-list-popover'
                    >
                        <div className='more-modal__header'>
                            {title}
                        </div>
                        <div className='more-modal__body'>
                            <div className='more-modal__list'>{popoverHtml}</div>
                        </div>
                        {popoverButton}
                    </Popover>
                </Overlay>
                {channelMembersModal}
                {teamMembersModal}
                {channelInviteModal}
            </div>
        );
    }
}
