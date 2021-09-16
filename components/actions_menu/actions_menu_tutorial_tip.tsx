// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import TutorialTip from 'components/tutorial/tutorial_tip';

export default class ActionsTutorialTip extends React.PureComponent {
    render = (): JSX.Element => {
        const screens = [];
        screens.push(
            <div>
                <h4>
                    <FormattedMessage
                        id='post_info.actions.tutorialTip.title'
                        defaultMessage='Actions for messages'
                    />
                </h4>
                <p>
                    <FormattedMarkdownMessage
                        id='post_info.actions.tutorialTip'
                        defaultMessage='Message actions that are provided\nthrough apps, integrations or plugins\nhave moved to this menu item.'
                    />
                </p>
            </div>,
        );

        return (
            <TutorialTip
                placement='top'
                screens={screens}
                overlayClass='tip-overlay--actions'
            />
        );
    }
}
