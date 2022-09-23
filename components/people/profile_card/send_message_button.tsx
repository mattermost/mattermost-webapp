// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';
import styled from 'styled-components';

import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';

import {UserProfile} from '@mattermost/types/users';

const SendMessage = styled.button`
    display: flex;
    border: 0;
    background-color: transparent;
    padding: 0;
    border-radius: 4px;
    .icon {
        font-size: 14.4px;
        color: var(--center-channel-bg);
        margin-right: 3px;
    };
`;

type SendMessageProps = {
    user: UserProfile;
    buttonText?: string;
}

const SendMessageButton = ({user, buttonText}: SendMessageProps) => {
    const openDirectMessage = (user: UserProfile) => {
        console.log(user);
    };

    return (
        <SendMessage onClick={() => openDirectMessage(user)}>
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
                    {buttonText && <span className='button-text'>
                        {buttonText}
                    </span>}
                </>
            </OverlayTrigger>
        </SendMessage>
    );
};

export default SendMessageButton;
