// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {getAnnouncementBarCount} from 'selectors/views/announcement_bar';
import {AddChannelButtonTreatments} from 'mattermost-redux/constants/config';

import TutorialTip from 'components/tutorial/tutorial_tip';
import {measurePunchouts} from 'components/tutorial/tutorial_tip/hooks';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {Constants} from 'utils/constants';

type Props = {
    townSquareDisplayName?: string;
    offTopicDisplayName?: string;
    addChannelButton?: AddChannelButtonTreatments;
}

export default function ChannelTutorialTip(props: Props) {
    let townSquareDisplayName = Constants.DEFAULT_CHANNEL_UI_NAME;
    if (props.townSquareDisplayName) {
        townSquareDisplayName = props.townSquareDisplayName;
    }

    let offTopicDisplayName = Constants.OFFTOPIC_CHANNEL_UI_NAME;
    if (props.offTopicDisplayName) {
        offTopicDisplayName = props.offTopicDisplayName;
    }

    const isAnnouncementBarOpen = useSelector(getAnnouncementBarCount) > 0;

    const screens = [
        <div key='first-screen'>
            <h4>
                <FormattedMessage
                    id='sidebar.tutorialAddChannel.title'
                    defaultMessage='Create and join channels'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialAddChannel.channelDiscovery'
                    defaultMessage={'Using the **+** button at the top of your sidebar, **create new channels** or **browse channels** to see what your team is already discussing. Organize your channels into custom, collapsible channel **categories**. Learn more about channel organization in our [documentation](!https://docs.mattermost.com/messaging/organizing-your-sidebar.html).'}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialAddChannel.preAdds'
                    defaultMessage={'We’ve added you to two channels:'}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialAddChannel.preAdd.townSquare'
                    defaultMessage={'**{townsquare}** can be used for team-wide communication and includes everyone in your team.'}
                    values={{
                        townsquare: townSquareDisplayName,
                    }}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialAddChannel.preAdd.offTopic'
                    defaultMessage={'**{offtopic}** can be used for fun and humor outside of work-related conversations.'}
                    values={{
                        offtopic: offTopicDisplayName,
                    }}
                />
            </p>
        </div>,
    ];

    let overlayClass = 'tip-overlay--add-channels';
    if (props.addChannelButton === AddChannelButtonTreatments.BY_TEAM_NAME || props.addChannelButton === AddChannelButtonTreatments.INVERTED_SIDEBAR_BG_COLOR) {
        overlayClass += ' tip-overlay--top-row-placement';
    }

    return (
        <TutorialTip
            placement='right'
            step={Constants.TutorialSteps.ADD_CHANNEL_POPOVER}
            screens={screens}
            stopPropagation={true}
            overlayClass={overlayClass}
            punchOut={measurePunchouts(['lhsNavigator', 'sidebar-header-container'], [isAnnouncementBarOpen])}
            telemetryTag='tutorial_tip_add_channels'
        />
    );
}
