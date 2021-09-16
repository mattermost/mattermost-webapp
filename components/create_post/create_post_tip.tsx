// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {PrewrittenMessagesTreatments} from 'mattermost-redux/constants/config';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip';

import PrewrittenChips from './prewritten_chips';

type Props = {
    prewrittenMessages?: PrewrittenMessagesTreatments;
    prefillMessage: (msg: string, shouldFocus: boolean) => void;
    currentChannel: Channel;
    currentUserId: string;
    currentChannelTeammateUsername?: string;
}

class CreatePostTip extends React.PureComponent<Props> {
    render() {
        let chips;
        if (this.props.prewrittenMessages === PrewrittenMessagesTreatments.TOUR_POINT) {
            chips = (
                <PrewrittenChips
                    prewrittenMessages={this.props.prewrittenMessages}
                    prefillMessage={this.props.prefillMessage}
                    currentChannel={this.props.currentChannel}
                    currentUserId={this.props.currentUserId}
                    currentChannelTeammateUsername={this.props.currentChannelTeammateUsername}
                />
            );
        }
        const screens = [
            <div key='screen'>
                <h4>
                    <FormattedMessage
                        id='create_post.tutorialTip.title'
                        defaultMessage='Send a message'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='create_post.tutorialTip1'
                        defaultMessage='Select or type your first message and select **Enter** to send it.'
                    />
                </p>
                <p>
                    <FormattedMarkdownMessage
                        id='create_post.tutorialTip2'
                        defaultMessage='Use the **Attachments** and **Emoji** buttons to add to your messages.'
                    />
                </p>
                {chips}
            </div>,
        ];

        return (
            <TutorialTip
                placement='top'
                screens={screens}
                overlayClass='tip-overlay--chat'
                telemetryTag='tutorial_tip_1_sending_messages'
            />
        );
    }
}
export default CreatePostTip;
