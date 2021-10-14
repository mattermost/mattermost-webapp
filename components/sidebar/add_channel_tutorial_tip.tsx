// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {Constants} from 'utils/constants';

type Props = {
    townSquareDisplayName?: string;
    offTopicDisplayName?: string;
}

export default class ChannelTutorialTip extends React.PureComponent<Props> {
    render = () => {
        let townSquareDisplayName = Constants.DEFAULT_CHANNEL_UI_NAME;
        if (this.props.townSquareDisplayName) {
            townSquareDisplayName = this.props.townSquareDisplayName;
        }

        let offTopicDisplayName = Constants.OFFTOPIC_CHANNEL_UI_NAME;
        if (this.props.offTopicDisplayName) {
            offTopicDisplayName = this.props.offTopicDisplayName;
        }

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

        return (
            <TutorialTip
                placement='right'
                step={Constants.TutorialSteps.ADD_CHANNEL_POPOVER}
                screens={screens}
                overlayClass='tip-overlay--add-channels'
                telemetryTag='tutorial_tip_add_channels'
            />
        );
    }
}
