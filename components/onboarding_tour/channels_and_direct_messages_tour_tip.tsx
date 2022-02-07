// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import {toTitleCase} from 'utils/utils';
import TutorialTourTip from 'components/tutorial_tour_tip/tutorial_tour_tip';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {
    OnBoardingTourSteps,
    TutorialTourCategories,
} from 'components/tutorial_tour_tip/constant';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';
import {useMeasurePunchouts} from '../tutorial_tour_tip/hooks';
import ChannelsImg from 'images/channels_and_direct_tour_tip.svg';

type Props = {
    firstChannelName?: string;
}

const firstChannel = (firstChannelName: string) => {
    const displayFirstChannelName = firstChannelName.split('-').join(' ').trim();
    return (
        <>
            <FormattedMarkdownMessage
                id='onBoardingTour.ChannelsAndDirectMessagesTour.firstChannel'
                defaultMessage='Hey look, there’s your **{firstChannelName}** channel! '
                values={{firstChannelName: toTitleCase(displayFirstChannelName)}}
            />
            <br/>
        </>
    );
};

const ChannelsAndDirectMessagesTour = ({firstChannelName}: Props) => {
    const dispatch = useDispatch();
    const telemetryTagText = `tutorial_tip_${OnBoardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES}_first_channel`;
    const channelsByName = useSelector((state: GlobalState) => getChannelsNameMapInCurrentTeam(state));
    const townSquareDisplayName = channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || Constants.DEFAULT_CHANNEL_UI_NAME;
    const offTopicDisplayName = channelsByName[Constants.OFFTOPIC_CHANNEL]?.display_name || Constants.OFFTOPIC_CHANNEL_UI_NAME;

    const title = (
        <FormattedMessage
            id='onBoardingTour.ChannelsAndDirectMessagesTour.title'
            defaultMessage={'Channels and direct messages'}
        />
    );
    const screen = (
        <>
            <p>
                {firstChannelName && firstChannel(firstChannelName)}
                <FormattedMarkdownMessage
                    id='onBoardingTour.ChannelsAndDirectMessagesTour.channels'
                    defaultMessage={'Channels are where you can communicate with your team about a topic or project.'}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='onBoardingTour.ChannelsAndDirectMessagesTour.townSquare'
                    defaultMessage={'We’ve also added the **{townSquare}** and **{offTopic}** channels for everyone on your team.'}
                    values={{townSquare: toTitleCase(townSquareDisplayName), offTopic: toTitleCase(offTopicDisplayName)}}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='onBoardingTour.ChannelsAndDirectMessagesTour.directMessages'
                    defaultMessage={'**Direct messages** are for private conversations between individuals or small groups.'}
                />
            </p>
        </>
    );

    const onNextNavigateTo = () => {
        dispatch(setAddChannelDropdown(true));
    };

    const punchOut = useMeasurePunchouts(['sidebar-droppable-categories'], []) || null;

    return (
        <TutorialTourTip
            title={title}
            screen={screen}
            imageURL={ChannelsImg}
            tutorialCategory={TutorialTourCategories.ON_BOARDING}
            step={OnBoardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES}
            placement='right-start'
            pulsatingDotPlacement='right'
            telemetryTag={telemetryTagText}
            width={352}
            autoTour={true}
            punchOut={punchOut}
            onNextNavigateTo={onNextNavigateTo}
        />
    );
};

export default ChannelsAndDirectMessagesTour;
