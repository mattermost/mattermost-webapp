// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Overlay, OverlayTrigger, Popover, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import {canManageMembers} from 'utils/channel_utils.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import MemberIcon from 'components/svg/member_icon';
import TeamMembersModal from 'components/team_members_modal';

import PopoverListMembersItem from './popover_list_members_item';

export default class PopoverListMembers extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        statuses: PropTypes.object.isRequired,
        users: PropTypes.array.isRequired,
        memberCount: PropTypes.number,
        currentUserId: PropTypes.string.isRequired,
        teamUrl: PropTypes.string,
        actions: PropTypes.shape({
            getProfilesInChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            showPopover: false,
            showTeamMembersModal: false,
            showChannelMembersModal: false,
            showChannelInviteModal: false,
            sortedUsers: this.sortUsers(props.users, props.statuses),
        };
    }

    componentDidUpdate() {
        $('.member-list__popover .popover-content .more-modal__body').perfectScrollbar();
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.users !== nextProps.users || this.props.statuses !== nextProps.statuses) {
            const sortedUsers = this.sortUsers(nextProps.users, nextProps.statuses);

            this.setState({sortedUsers});
        }
    }

    sortUsers = (users, statuses) => {
        return Utils.sortUsersByStatusAndDisplayName(users, statuses);
    };

    handleShowDirectChannel = (user) => {
        const teammateId = user.id;

        if (teammateId) {
            openDirectChannelToUser(
                teammateId,
                (channel, channelAlreadyExisted) => {
                    browserHistory.push(this.props.teamUrl + '/channels/' + channel.name);
                    if (channelAlreadyExisted) {
                        this.closePopover();
                    }
                },
                () => {
                    this.closePopover();
                }
            );
        }
    };

    closePopover = () => {
        this.setState({showPopover: false});
    };

    showMembersModal = (e) => {
        e.preventDefault();

        this.setState({
            showPopover: false,
            showChannelMembersModal: true,
        });
    };

    hideChannelMembersModal = () => {
        this.setState({showChannelMembersModal: false});
    };

    showChannelInviteModal = () => {
        this.setState({showChannelInviteModal: true});
    };

    hideChannelInviteModal = () => {
        this.setState({showChannelInviteModal: false});
    };

    hideTeamMembersModal = () => {
        this.setState({showTeamMembersModal: false});
    };

    handleGetProfilesInChannel = (e) => {
        this.setState({popoverTarget: e.target, showPopover: !this.state.showPopover});
        this.props.actions.getProfilesInChannel(this.props.channel.id, 0, undefined, 'status'); // eslint-disable-line no-undefined
    };

    getTargetPopover = () => {
        return this.state.popoverTarget;
    };

    render() {
        const isDirectChannel = this.props.channel.type === Constants.DM_CHANNEL;

        const items = this.state.sortedUsers.map((user) => (
            <PopoverListMembersItem
                key={user.id}
                onItemClick={this.handleShowDirectChannel}
                showMessageIcon={this.props.currentUserId !== user.id && !isDirectChannel}
                status={this.props.statuses[user.id]}
                user={user}
            />
        ));

        const channelIsArchived = this.props.channel.delete_at !== 0;
        let popoverButton;
        if (this.props.channel.type !== Constants.GM_CHANNEL && !channelIsArchived) {
            let membersName = (
                <FormattedMessage
                    id='members_popover.manageMembers'
                    defaultMessage='Manage Members'
                />
            );

            const manageMembers = canManageMembers(this.props.channel);
            const isDefaultChannel = this.props.channel.name === Constants.DEFAULT_CHANNEL;

            if (isDefaultChannel || !manageMembers) {
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
                            <div className='more-modal__list'>
                                {items}
                            </div>
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
