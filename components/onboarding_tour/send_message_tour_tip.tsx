// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {Channel} from 'mattermost-redux/types/channels';
import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import TutorialTourTip from 'components/tutorial_tour_tip/tutorial_tour_tip';
import {
    OnBoardingTourSteps,
    TutorialTourCategories,
} from 'components/tutorial_tour_tip/constant';
import {setOnBoardingTaskList} from '../../actions/views/onboarding_task_list';
import PrewrittenChips from '../create_post/prewritten_chips';
import {isFirstAdmin} from '../next_steps_view/steps';
import {useMeasurePunchouts} from '../tutorial_tour_tip/hooks';

type Props = {
    prefillMessage: (msg: string, shouldFocus: boolean) => void;
    currentChannel: Channel;
    currentUserId: string;
    currentChannelTeammateUsername?: string;
}

const SendMessageTour = ({
    prefillMessage,
    currentChannel,
    currentUserId,
    currentChannelTeammateUsername,
}: Props) => {
    const dispatch = useDispatch();
    const isUserFirstAdmin = useSelector(isFirstAdmin);
    const chips = (
        <PrewrittenChips
            prefillMessage={prefillMessage}
            currentChannel={currentChannel}
            currentUserId={currentUserId}
            currentChannelTeammateUsername={currentChannelTeammateUsername}
        />
    );
    const telemetryTagText = `tutorial_tip_${OnBoardingTourSteps.SEND_MESSAGE}_Send_Message`;

    const title = (
        <FormattedMessage
            id='onBoardingTour.sendMessage.title'
            defaultMessage={'Send messages'}
        />
    );

    const onPrevNavigateTo = () => {
        dispatch(setAddChannelDropdown(true));
    };
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

    const onDismiss = () => {
        if (isUserFirstAdmin) {
            dispatch(setOnBoardingTaskList(true));
        }
    };

    const punchOut = useMeasurePunchouts(['post-create'], [], {y: -11, height: 11, x: 0, width: 0}) || null;

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            tutorialCategory={TutorialTourCategories.ON_BOARDING}
            step={OnBoardingTourSteps.SEND_MESSAGE}
            placement='top-start'
            pulsatingDotPlacement='top-start'
            pulsatingDotTranslate={{x: -6, y: -6}}
            telemetryTag={telemetryTagText}
            width={400}
            autoTour={true}
            punchOut={punchOut}
            onPrevNavigateTo={onPrevNavigateTo}
            onDismiss={onDismiss}
        />
    );
};

export default SendMessageTour;

