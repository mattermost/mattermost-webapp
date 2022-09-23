// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {useHistory} from 'react-router-dom';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';

import {getMyTeams, getTeam, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getPreviousTeamId} from 'selectors/local_storage';

import {GlobalState} from 'types/store';

import {UserProfile} from '@mattermost/types/users';

const SendMessage = styled.button`
    display: inline-flex;
    border: 0;
    border-radius: 4px;
    place-items: center;

    .icon {
        margin-right: 3px;
        color: var(--center-channel-bg);
        font-size: 14.4px;
    }
`;

type SendMessageProps = {
    user: UserProfile;
    children?: React.ReactNode;
}

const SendMessageButton = ({user, children}: SendMessageProps) => {
    const openDirectMessage = useOpenDM(user);

    return (
        <SendMessage
            className='btn style--none btn-primary'
            onClick={() => openDirectMessage()}
        >
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='left'
                overlay={
                    <Tooltip>
                        <FormattedMessage
                            id='channel_members_rhs.member.send_message'
                            defaultMessage='Send message'
                        />
                    </Tooltip>
                }
            >
                <>
                    <i className='icon icon-send'/>
                    {children}
                </>
            </OverlayTrigger>
        </SendMessage>
    );
};

const useOpenDM = (user: UserProfile) => {
    const history = useHistory();

    const team = useSelector((state: GlobalState) => {
        const prevTeamId = getPreviousTeamId(state);
        return getCurrentTeam(state) ?? (prevTeamId && getTeam(state, prevTeamId)) ?? getMyTeams(state)?.[0];
    });

    return () => {
        history.push(`/${team.name}/messages/@${user.username}`);
    };
};

export default SendMessageButton;
