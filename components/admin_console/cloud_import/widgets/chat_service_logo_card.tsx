// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';
import './chat_service_logo_card.scss';

import SlackLogoSvg from '../slack_logo.svg';
import CardContainer from 'components/common/card_container';

type ChatServiceLogoProps = {
    chatService: string;
}

const ChatServiceLogo = (props: ChatServiceLogoProps) => {
    let logo: React.ReactNode = null;
    switch (props.chatService) {
    case 'slack':
        logo = (<SlackLogoSvg/>);
        break;
    default:
        logo = (<SlackLogoSvg/>);
    }
    return (
        <CardContainer className='ChatServiceLogo'>
            <div className={`logoImg ${props.chatService}`}>
                {logo}
            </div>
        </CardContainer>
    );
};

export default memo(ChatServiceLogo);
