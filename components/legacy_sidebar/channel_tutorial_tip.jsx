// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class ChannelTutorialTip extends React.PureComponent {
    static propTypes = {
        townSquareDisplayName: PropTypes.string,
        offTopicDisplayName: PropTypes.string,
        openLhs: PropTypes.func,
    }

    componentDidMount() {
        if (this.props.townSquareDisplayName || this.props.offTopicDisplayName) {
            this.props.openLhs();
        }
    }

    render = () => {
        const screens = [];

        screens.push(
            <div>
                <h4>
                    <FormattedMessage
                        id='sidebar.tutorialChannelTypes.title'
                        defaultMessage='Channels'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.public'
                        defaultMessage={'Channels organize conversations across different topics. **Public channels** are open to everyone on your team.'}
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.private'
                        defaultMessage={'**Private channels** are for sensitive conversations between selected members.'}
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialChannelTypes.direct'
                        defaultMessage={'**Direct messages** are for private conversations between a small group of up to seven people.'}
                    />
                </p>
            </div>,
        );

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

