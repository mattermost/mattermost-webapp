// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import TutorialTip from 'components/tutorial/tutorial_tip';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class SidebarTutorialTip extends React.PureComponent {
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

        let townSquareDisplayName = Constants.DEFAULT_CHANNEL_UI_NAME;
        if (this.props.townSquareDisplayName) {
            townSquareDisplayName = this.props.townSquareDisplayName;
        }

        let offTopicDisplayName = Constants.OFFTOPIC_CHANNEL_UI_NAME;
        if (this.props.offTopicDisplayName) {
            offTopicDisplayName = this.props.offTopicDisplayName;
        }

        screens.push(
            <div>
                <h4>
                    <FormattedMessage
                        id='sidebar.tutorialScreen1.title'
                        defaultMessage='Channels'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialScreen1.body'
                        defaultMessage={'**Channels** organize conversations across different topics. They\'re open to everyone on your team. To send private communications use **Direct Messages** for a single person or **Private Channels** for multiple people.'}
                    />
                </p>
            </div>,
        );

        screens.push(
            <div>
                <h4>
                    <FormattedMessage
                        id='sidebar.tutorialScreen2.title'
                        defaultMessage='"{townsquare}" and "{offtopic}" channels'
                        values={{
                            townsquare: townSquareDisplayName,
                            offtopic: offTopicDisplayName,
                        }}
                    />
                </h4>
                <p>
                    <FormattedMessage
                        id='sidebar.tutorialScreen2.body1'
                        defaultMessage='Here are two public channels to start:'
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialScreen2.body2'
                        defaultMessage='**{townsquare}** is a place for team-wide communication. Everyone in your team is a member of this channel.'
                        values={{
                            townsquare: townSquareDisplayName,
                        }}
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialScreen2.body3'
                        defaultMessage='**{offtopic}** is a place for fun and humor outside of work-related channels. You and your team can decide what other channels to create.'
                        values={{
                            offtopic: offTopicDisplayName,
                        }}
                    />
                </p>
            </div>,
        );

        screens.push(
            <div>
                <h4>
                    <FormattedMessage
                        id='sidebar.tutorialScreen3.title'
                        defaultMessage='Creating and Joining Channels'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialScreen3.body1'
                        defaultMessage='Click **"More..."** to create a new channel or join an existing one.'
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='sidebar.tutorialScreen3.body2'
                        defaultMessage='You can also create a new channel by clicking the **"+" symbol** next to the public or private channel header.'
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

