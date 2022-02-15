// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import PrewrittenChips from 'components/create_post/prewritten_chips';
import {useMeasurePunchouts} from 'components/widgets/tour_tip';

import OnBoardingTourTip from './onboarding_tour_tip';

type Props = {
    prefillMessage: (msg: string, shouldFocus: boolean) => void;
    currentChannel: Channel;
    currentUserId: string;
    currentChannelTeammateUsername?: string;
}

export const SendMessageTour = ({
    prefillMessage,
    currentChannel,
    currentUserId,
    currentChannelTeammateUsername,
}: Props) => {
    const chips = (
        <PrewrittenChips
            prefillMessage={prefillMessage}
            currentChannel={currentChannel}
            currentUserId={currentUserId}
            currentChannelTeammateUsername={currentChannelTeammateUsername}
        />
    );

    const title = (
        <FormattedMessage
            id='onBoardingTour.sendMessage.title'
            defaultMessage={'Send messages'}
        />
    );

    const screen = (
        <>
            <p>
                <FormattedMessage
                    id='onBoardingTour.sendMessage.Description'
                    defaultMessage={'Start collaborating with others by typing or selecting one of the messages below. You can also drag and drop attachments into the text field or upload them using the paperclip icon.'}
                />
            </p>
            <div>
                {chips}
            </div>
        </>
    );
    const overlayPunchOut = useMeasurePunchouts(['post-create'], [], {y: -11, height: 11, x: 0, width: 0});

    return (
        <OnBoardingTourTip
            title={title}
            screen={screen}
            placement='top-start'
            pulsatingDotPlacement='top-start'
            pulsatingDotTranslate={{x: -6, y: -6}}
            width={400}
            overlayPunchOut={overlayPunchOut}
        />
    );
};

