// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {Constants, ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import ChannelMembersModal from 'components/channel_members_modal';
import OverlayTrigger from 'components/overlay_trigger';
import MemberIcon from 'components/widgets/icons/member_icon';
import Popover from 'components/widgets/popover';

import PopoverListMembersItem from 'components/popover_list_members/popover_list_members_item';

export default class PopoverListMembers extends React.PureComponent {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        statuses: PropTypes.object.isRequired,
        users: PropTypes.array.isRequired,
        memberCount: PropTypes.number,
        currentUserId: PropTypes.string.isRequired,
        teamUrl: PropTypes.string,
        manageMembers: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
            loadProfilesAndStatusesInChannel: PropTypes.func.isRequired,
            openDirectChannelToUserId: PropTypes.func.isRequired,
        }).isRequired,
        sortedUsers: PropTypes.array,
    };

    constructor(props) {
        super(props);
        this.membersList = React.createRef();

        this.state = {
            showPopover: false,
            users: props.users,
            statuses: props.statuses,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.users !== prevState.users || nextProps.statuses !== prevState.statuses) {
            return {
                users: nextProps.users,
                statuses: nextProps.statuses,
            };
        }
        return null;
    }

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

        this.closePopover();

        const modalData = {
            modalId: ModalIdentifiers.CHANNEL_MEMBERS,
            dialogProps: this.props,
            dialogType: ChannelMembersModal,
        };

        this.props.actions.openModal(modalData);
    };

    handleGetProfilesInChannel = (e) => {
        this.setState({popoverTarget: e.target, showPopover: !this.state.showPopover});
        this.props.actions.loadProfilesAndStatusesInChannel(this.props.channel.id, 0, undefined, 'status', {active: true});
    };

    getTargetPopover = () => {
        this.membersList.current.focus();
        return this.state.popoverTarget;
    };

    render() {
        const isDirectChannel = this.props.channel.type === Constants.DM_CHANNEL;

        const items = this.props.sortedUsers.map((user) => (
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

            const isDefaultChannel = this.props.channel.name === Constants.DEFAULT_CHANNEL;

            if (isDefaultChannel || !this.props.manageMembers) {
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
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    disabled={this.state.showPopover}
                    overlay={channelMembersTooltip}
                >
                    <button
                        id='member_popover'
                        aria-label={ariaLabel}
                        className={'member-popover__trigger channel-header__icon channel-header__icon--wide ' + (this.state.showPopover ? 'channel-header__icon--active' : '')}
                        ref='member_popover_target'
                        onClick={this.handleGetProfilesInChannel}
                    >
                        <div className='d-flex align-items-center'>
                            <MemberIcon
                                id='channelMemberIcon'
                                className='icon icon--standard'
                                aria-hidden='true'
                            />
                            <span
                                id='channelMemberCountText'
                                className='icon__text'
                            >
                                {countText}
                            </span>
                        </div>
                    </button>
                </OverlayTrigger>
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
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
