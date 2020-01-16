// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {canManageMembers} from 'utils/channel_utils.jsx';
import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import OverlayTrigger from 'components/overlay_trigger';
import MemberIcon from 'components/widgets/icons/member_icon';
import Popover from 'components/widgets/popover';
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
            openModal: PropTypes.func.isRequired,
            loadProfilesAndStatusesInChannel: PropTypes.func.isRequired,
            openDirectChannelToUserId: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.membersList = React.createRef();

        this.state = {
            showPopover: false,
            showTeamMembersModal: false,
            showChannelMembersModal: false,
            showChannelInviteModal: false,
            users: props.users,
            statuses: props.statuses,
            sortedUsers: this.sortUsers(props.users, props.statuses),
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.users !== prevState.users || nextProps.statuses !== prevState.statuses) {
            return {
                users: nextProps.users,
                statuses: nextProps.statuses,
                sortedUsers: Utils.sortUsersByStatusAndDisplayName(nextProps.users, nextProps.statuses),
            };
        }
        return null;
    }

    sortUsers = (users, statuses) => {
        return Utils.sortUsersByStatusAndDisplayName(users, statuses);
    };

    handleShowDirectChannel = (user) => {
        const {actions} = this.props;
        const teammateId = user.id;

        if (teammateId) {
            actions.openDirectChannelToUserId(teammateId).then(({data}) => {
                if (data) {
                    browserHistory.push(this.props.teamUrl + '/channels/' + data.name);
                }
                this.closePopover();
            });
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
        this.props.actions.loadProfilesAndStatusesInChannel(this.props.channel.id, 0, undefined, 'status'); // eslint-disable-line no-undefined
    };

    getTargetPopover = () => {
        this.membersList.current.focus();
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
                        data-testid='membersModal'
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
                    onHide={this.hideChannelMembersModal}
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

        const ariaLabel = `${Utils.localizeMessage('channel_header.channelMembers', 'Members')}`.toLowerCase();

        return (
            <div id='channelMember'>
                <button
                    id='member_popover'
                    aria-label={ariaLabel}
                    className={'style--none member-popover__trigger channel-header__icon wide ' + (this.state.showPopover ? 'active' : '')}
                    ref='member_popover_target'
                    onClick={this.handleGetProfilesInChannel}
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='bottom'
                        overlay={channelMembersTooltip}
                    >
                        <div>
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
                </button>
                <Overlay
                    rootClose={true}
                    onHide={this.closePopover}
                    show={this.state.showPopover}
                    target={this.getTargetPopover}
                    placement='bottom'
                >
                    <Popover
                        className='member-list__popover'
                        id='member-list-popover'
                    >
                        <div
                            className='more-modal__header'
                        >
                            {title}
                            {this.props.channel.group_constrained && <div className='subhead'>
                                <FormattedMessage
                                    id='channel_header.groupConstrained'
                                    defaultMessage='Members managed by linked groups.'
                                />
                            </div>}
                        </div>
                        <div className='more-modal__body'>
                            <div
                                tabIndex='-1'
                                role='presentation'
                                ref={this.membersList}
                                className='more-modal__list'
                            >
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
