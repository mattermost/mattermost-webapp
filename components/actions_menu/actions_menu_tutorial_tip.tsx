// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';

export default class ActionsTutorialTip extends React.PureComponent {
    render = () => {
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
                    <FormattedMessage
                        id='post_info.actions.tutorialTip'
                        defaultMessage='Message actions that are provided through apps, integrations or plugins have moved to this menu item.'
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
