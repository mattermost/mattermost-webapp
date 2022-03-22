// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import {AddMembersToChanneltreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {ModalData} from 'types/actions';

import ChannelMembersModal from 'components/channel_members_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Popover from 'components/widgets/popover';
import PopoverListMembersItem from 'components/popover_list_members/popover_list_members_item';

export type Props = {
    channel: Channel;
    statuses: RelationOneToOne<UserProfile, string>;
    memberCount: number;
    currentUserId: string;
    manageMembers: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        loadProfilesAndStatusesInChannel: (channelId: string, page?: number, perPage?: number, sort?: string, options?: { active: boolean }) => void;
        openDirectChannelToUserId: (userId: string) => Promise<{ data: Channel }>;
    };
    sortedUsers: UserProfile[];
    addMembersABTest?: string;
    teamUrl?: string;
}

export default function PopoverListMembers(props: Props) {
    const membersListRef: React.RefObject<HTMLDivElement> = React.createRef();
    const targetRef: React.RefObject<HTMLButtonElement> = React.createRef();

    const [showPopover, setShowPopover] = useState(false);

    const handleShowDirectChannel = (user: UserProfile) => {
        const {actions} = props;
        const teammateId = user.id;

        if (teammateId) {
            actions.openDirectChannelToUserId(teammateId).then(({data}) => {
                if (data) {
                    browserHistory.push(props.teamUrl + '/channels/' + data.name);
                }
                closePopover();
            });
        }
    };

    const closePopover = () => setShowPopover(false);

    const showMembersModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        const {actions} = props;
        e.preventDefault();
        closePopover();

        const modalData = {
            modalId: ModalIdentifiers.CHANNEL_MEMBERS,
            dialogProps: props,
            dialogType: ChannelMembersModal,
        };
        actions.openModal(modalData);
    };

    const getOnAddNewMembersButton = (placement: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        const {channel, actions} = props;
        trackEvent('add_members_from_channel_popover', placement);
        e.preventDefault();
        closePopover();

        const modalData = {
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogProps: {channel},
            dialogType: ChannelInviteModal,
        };
        actions.openModal(modalData);
    };

    const handleGetProfilesInChannel = () => {
        setShowPopover(!showPopover);
        props.actions.loadProfilesAndStatusesInChannel(props.channel.id, 0, undefined, 'status', {active: true});
    };

    const getTargetPopover = () => {
        membersListRef.current?.focus();
        return targetRef.current;
    };

    const isDirectChannel = props.channel.type === Constants.DM_CHANNEL;
    const items = props.sortedUsers.map((user: UserProfile) => (
        <PopoverListMembersItem
            key={user.id}
            onItemClick={handleShowDirectChannel}
            showMessageIcon={props.currentUserId !== user.id && !isDirectChannel}
            status={props.statuses[user.id]}
            user={user}
        />
    ));

    const channelIsArchived = props.channel.delete_at !== 0;
    const isDefaultChannel = props.channel.name === Constants.DEFAULT_CHANNEL;
    const shouldRenderButtons = props.channel.type !== Constants.GM_CHANNEL && !channelIsArchived;
    const renderHeaderButton = () => {
        if (!(shouldRenderButtons && props.manageMembers)) {
            return null;
        }
        return props.addMembersABTest === AddMembersToChanneltreatments.TOP ? (
            <button
                className='btn btn-link'
                id='addBtn'
                onClick={getOnAddNewMembersButton(AddMembersToChanneltreatments.TOP)}
            >
                <i className='icon icon-account-plus-outline'/>
                <FormattedMessage
                    id='members_popover.add'
                    defaultMessage='Add'
                />
            </button>
        ) : (
            <button
                className='btn btn-link'
                id='editBtn'
                onClick={showMembersModal}
            >
                <i className='icon icon-pencil-outline'/>
                <FormattedMessage
                    id='members_popover.editBtn'
                    defaultMessage='Edit'
                />
            </button>
        );
    };
    const renderFooterButton = () => {
        if (!shouldRenderButtons) {
            return null;
        }
        let label = null;
        switch (true) {
        case (props.manageMembers && props.addMembersABTest === AddMembersToChanneltreatments.BOTTOM):
            label = (
                <FormattedMessage
                    id='members_popover.addMembers'
                    defaultMessage='Add Members'
                />
            );
            break;
        case isDefaultChannel || !props.manageMembers:
            label = (
                <FormattedMessage
                    id='members_popover.viewMembers'
                    defaultMessage='View Members'
                />
            );
            break;
        default:
            label = (
                <FormattedMessage
                    id='members_popover.manageMembers'
                    defaultMessage='Manage Members'
                />
            );
        }
        const handleButtonOnClick = (props.manageMembers && props.addMembersABTest === AddMembersToChanneltreatments.BOTTOM) ? getOnAddNewMembersButton(AddMembersToChanneltreatments.BOTTOM) : showMembersModal;
        return (
            <div
                className='more-modal__button'
                key={'popover-member-more'}
            >
                <button
                    className='btn btn-link'
                    data-testid='membersModal'
                    onClick={handleButtonOnClick}
                >
                    {label}
                </button>
            </div>
        );
    };

    const countText = props.memberCount > 0 ? props.memberCount.toString() : '-';

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

    const ariaLabel = `${localizeMessage('channel_header.channelMembers', 'Members')}`.toLowerCase();

    return (
        <div
            id='channelMember'
            className='channel-members-popver'
        >
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                disabled={showPopover}
                overlay={channelMembersTooltip}
            >
                <button
                    id='member_popover'
                    aria-label={ariaLabel}
                    className={'member-popover__trigger channel-header__icon channel-header__icon--left channel-header__icon--wide ' + (showPopover ? 'channel-header__icon--active' : '')}
                    ref={targetRef}
                    onClick={handleGetProfilesInChannel}
                >
                    <div className='d-flex align-items-center'>
                        <i
                            aria-hidden='true'
                            className='icon icon-account-outline channel-header__members'
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
                onHide={closePopover}
                show={showPopover}
                target={getTargetPopover}
                placement='bottom'
            >
                <Popover
                    id='member-list-popover'
                    className='a11y__popup member-list__popover'
                >
                    <div
                        className='more-modal__header'
                    >
                        {title}
                        {renderHeaderButton()}
                        {props.channel.group_constrained && <div className='subhead'>
                            <FormattedMessage
                                id='channel_header.groupConstrained'
                                defaultMessage='Members managed by linked groups.'
                            />
                        </div>}
                    </div>
                    <div className='more-modal__body'>
                        <div
                            tabIndex={-1}
                            role='presentation'
                            ref={membersListRef}
                            className='more-modal__list'
                        >
                            {items}
                        </div>
                    </div>
                    {renderFooterButton()}
                </Popover>
            </Overlay>
        </div>
    );
}
