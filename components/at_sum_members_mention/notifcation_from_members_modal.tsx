// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

import styled from 'styled-components';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {UserProfile} from '@mattermost/types/users';
import {ChannelMembership} from '@mattermost/types/channels';
import {getUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from '@mattermost/types/store';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {openDirectChannelToUserId} from 'actions/channel_actions';

import {browserHistory} from 'utils/browser_history';

import MemberList from '../channel_members_rhs/member_list';

import './notification_from_members_modal.scss';

type Props = {
    show: boolean;
    feature: string;
    userIds: string[];
    onHide: () => void;
}

export interface ChannelMember {
    user: UserProfile;
    membership?: ChannelMembership;
    status?: string;
    displayName: string;
}

export enum ListItemType {
    Member = 'member',
    FirstSeparator = 'first-separator',
    Separator = 'separator',
}

export interface ListItem {
    type: ListItemType;
    data: ChannelMember | JSX.Element;
}

const MembersContainer = styled.div`
    flex: 1 1 auto;
    padding: 0 4px 16px;
    height: inherit;
`;

function NotificationFromMembersModal(props: Props) {
    const dispatch = useDispatch();
    const channel = useSelector(getCurrentChannel);
    const teamUrl = useSelector(getCurrentRelativeTeamUrl);

    const featureNotificationMembers: ChannelMember[] = [];

    props.userIds.forEach((userId) => {
        const profile = useSelector((state: GlobalState) => getUser(state, userId));
        const status = useSelector((state: GlobalState) => getStatusForUserId(state, userId));
        const displaySetting = useSelector(getTeammateNameDisplaySetting);
        const displayName = displayUsername(profile, displaySetting);
        const m = {
            user: profile,
            displayName,
            status,
        };
        featureNotificationMembers.push(m);
    });

    const listcp: ListItem[] = [];
    for (let i = 0; i < featureNotificationMembers.length; i++) {
        const member = featureNotificationMembers[i];
        listcp.push({type: ListItemType.Member, data: member});
    }

    const openDirectMessage = async (user: UserProfile) => {
        // we first prepare the DM channel...
        await dispatch(openDirectChannelToUserId(user.id));

        // ... qnd then redirect to it
        browserHistory.push(teamUrl + '/messages/@' + user.username);
    };

    const loadMore = () => {};

    return (
        <Modal
            id='notificationFromMembersModal'
            dialogClassName='a11y__modal'
            className='NotificationFromMembersModal'
            backdrop={true}
            show={props.show}
            onHide={props.onHide}
            onExited={() => {}}
            role='dialog'
            aria-modal='true'
        >
            <Modal.Header className='NotificationFromMembersModal__header'>
                <h1 id='invitation_modal_title'>
                    {`Members that requested ${props.feature}`}
                </h1>
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={props.onHide}
                />
            </Modal.Header>
            <Modal.Body>
                <MembersContainer>
                    <MemberList
                        channel={channel}
                        members={listcp}
                        searchTerms={''}
                        editing={false}
                        actions={{openDirectMessage, loadMore}}
                        hasNextPage={false}
                        isNextPageLoading={false}
                    />
                </MembersContainer>
            </Modal.Body>
        </Modal>
    );
}

export default NotificationFromMembersModal;
