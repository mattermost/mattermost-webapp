// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {TutorialSteps} from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import TutorialTip from 'components/tutorial/tutorial_tip';
import {useMeasurePunchouts} from 'components/tutorial/tutorial_tip/hooks';

import PrewrittenChips from './prewritten_chips';

type Props = {
    prefillMessage: (msg: string, shouldFocus: boolean) => void;
    currentChannel: Channel;
    currentUserId: string;
    currentChannelTeammateUsername?: string;
}

function CreatePostTip(props: Props) {
    const chips = (
        <PrewrittenChips
            prefillMessage={props.prefillMessage}
            currentChannel={props.currentChannel}
            currentUserId={props.currentUserId}
            currentChannelTeammateUsername={props.currentChannelTeammateUsername}
        />
    );
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
            step={TutorialSteps.POST_POPOVER}
            placement='top'
            screens={screens}
            overlayClass='tip-overlay--chat'
            telemetryTag='tutorial_tip_1_sending_messages'
            punchOut={useMeasurePunchouts(['post-create'], [], {y: -11, height: 11, x: 0, width: 0})}
        />
    );
}
export default CreatePostTip;
