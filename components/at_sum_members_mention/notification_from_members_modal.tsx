// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import styled from 'styled-components';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {UserProfile} from '@mattermost/types/users';
import {ChannelMembership} from '@mattermost/types/channels';
import {getUsers, getUserStatuses} from 'mattermost-redux/selectors/entities/users';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {openDirectChannelToUserId} from 'actions/channel_actions';

import {browserHistory} from 'utils/browser_history';
import {mapFeatureIdToTranslation} from 'utils/notify_admin_utils';

import MemberList from '../channel_members_rhs/member_list';
import {ListItemType} from 'components/channel_members_rhs/channel_members_rhs';

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

export interface ListItem {
    type: ListItemType;
    data: ChannelMember | JSX.Element;
}

const MembersContainer = styled.div`
    flex: 1 1 auto;
    padding: 0 4px 16px;
    height: inherit;
`;

const unknownUser: UserProfile = {id: 'unknown', username: 'unknown'} as UserProfile;

function NotificationFromMembersModal(props: Props) {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const channel = useSelector(getCurrentChannel);
    const teamUrl = useSelector(getCurrentRelativeTeamUrl);
    const userProfiles = useSelector(getUsers);
    const userStatuses = useSelector(getUserStatuses);
    const displaySetting = useSelector(getTeammateNameDisplaySetting);

    const members: ListItem[] = props.userIds.map((userId: string) => {
        const user = userProfiles[userId];
        const status = userStatuses[userId];
        const displayName = displayUsername(user, displaySetting);
        return {
            type: ListItemType.Member,
            data: {
                user: user || unknownUser,
                displayName,
                status,
            },
        };
    });

    const openDirectMessage = async (user: UserProfile) => {
        // we first prepare the DM channel...
        await dispatch(openDirectChannelToUserId(user.id));

        // ... and then redirect to it
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
                    {`Members that requested ${mapFeatureIdToTranslation(props.feature, formatMessage)}`}
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
                        members={members}
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
