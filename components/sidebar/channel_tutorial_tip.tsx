// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

type Props = {
    townSquareDisplayName?: string;
    offTopicDisplayName?: string;
    openLhs: () => void;
}

export default class ChannelTutorialTip extends React.PureComponent<Props> {
    componentDidMount() {
        if (this.props.townSquareDisplayName || this.props.offTopicDisplayName) {
            this.props.openLhs();
        }
    }

    render = () => {
        const screens = [
            <div key='first-screen'>
                <h4>
                    <FormattedMessage
                        id='sidebar.tutorialChannelTypes.title'
                        defaultMessage='Organize conversations in channels'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.channels'
                        defaultMessage={'Channels organize conversations across different topics.'}
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.public'
                        defaultMessage={'**Public channels** are open to everyone on your team.'}
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.private'
                        defaultMessage={'**Private channels** are for sensitive conversations between invited members.'}
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.direct'
                        defaultMessage={'**Direct messages** are for private conversations between individuals or small groups.'}
                    />
                </p>
            </div>,
        ];

        return (
            <TutorialTip
                placement='right'
                screens={screens}
                overlayClass='tip-overlay--sidebar'
                telemetryTag='tutorial_tip_2_channels'
            />
        );
    }
}

