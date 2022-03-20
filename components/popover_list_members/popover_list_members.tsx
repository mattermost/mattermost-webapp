// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import {AddMembersToChanneltreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {ModalData} from 'types/actions';

import ChannelMembersModal from 'components/channel_members_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Popover from 'components/widgets/popover';
import PopoverListMembersItem from 'components/popover_list_members/popover_list_members_item';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

export type Props = {
    channel: Channel;
    statuses: RelationOneToOne<UserProfile, string>;
    users: UserProfile[];
    memberCount: number;
    currentUserId: string;
    manageMembers: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        loadProfilesAndStatusesInChannel: (channelId: string, page?: number, perPage?: number, sort?: string, options?: {active: boolean}) => void;
        openDirectChannelToUserId: (userId: string) => Promise<{data: Channel}>;
    };
    sortedUsers: UserProfile[];
    addMembersABTest?: string;
    teamUrl?: string;
}

export default function PopoverListMembers(props: Props) {
    const membersListRef: React.RefObject<HTMLDivElement> = React.createRef();
    const targetRef: React.RefObject<HTMLButtonElement> = React.createRef();

    const [showPopover, setShowPopover] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>(props.users);
    const [statuses, setStatuses] = useState<RelationOneToOne<UserProfile, string>>(props.statuses);

    useEffect(() => {
        setUsers(props.users);
        setStatuses(props.statuses);
    }, [props.users, props.statuses]);

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

    const closePopover = () => {
        setShowPopover(false);
    };

    const showMembersModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        closePopover();

        const modalData = {
            modalId: ModalIdentifiers.CHANNEL_MEMBERS,
            dialogProps: props,
            dialogType: ChannelMembersModal,
        };

        props.actions.openModal(modalData);
    };

    const onAddNewMembersButton = (placement: string) => {
        const {channel, actions} = props;
        trackEvent('add_members_from_channel_popover', placement);

        actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });

        closePopover();
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
    let popoverButton;
    let handleButtonOnClick = showMembersModal;
    let editButton = null;
    if (props.channel.type !== Constants.GM_CHANNEL && !channelIsArchived) {
        let membersName = (
            <FormattedMessage
                id='members_popover.manageMembers'
                defaultMessage='Manage Members'
            />
        );

        const isDefaultChannel = props.channel.name === Constants.DEFAULT_CHANNEL;

        if (isDefaultChannel || !props.manageMembers) {
            membersName = (
                <FormattedMessage
                    id='members_popover.viewMembers'
                    defaultMessage='View Members'
                />
            );
        }

        if (props.addMembersABTest === AddMembersToChanneltreatments.BOTTOM && props.manageMembers) {
            handleButtonOnClick = () => onAddNewMembersButton(AddMembersToChanneltreatments.BOTTOM);
            membersName = (
                <FormattedMessage
                    id='members_popover.addMembers'
                    defaultMessage='Add Members'
                />
            );
            editButton = (
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
        } else if (props.addMembersABTest === AddMembersToChanneltreatments.TOP && props.manageMembers) {
            editButton = (
                <button
                    className='btn btn-link'
                    id='addBtn'
                    onClick={() => onAddNewMembersButton(AddMembersToChanneltreatments.TOP)}
                >
                    <i className='icon icon-account-plus-outline'/>
                    <FormattedMessage
                        id='members_popover.add'
                        defaultMessage='Add'
                    />
                </button>
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
                    onClick={handleButtonOnClick}
                >
                    {membersName}
                </button>
            </div>
        );
    }
    const count = props.memberCount;
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
                        {editButton}
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
                    {popoverButton}
                </Popover>
            </Overlay>
        </div>
    );
}
