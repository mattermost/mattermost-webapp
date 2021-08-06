// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TutorialTip from 'components/tutorial/tutorial_tip';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default function ProductSwitcherTip() {
    const screens = [
        <div key='first-screen'>
            <h4>
                <FormattedMessage
                    id='sidebar.tutorialProductSwitcher.title'
                    defaultMessage='Try Boards and Playbooks'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialProductSwitcher.switchProducts'
                    defaultMessage={'Launch other Mattermost products from here, including **Boards** and **Playbooks**.'}
                />
            </p>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar.tutorialProductSwitcher.admin'
                    defaultMessage={'System Admins can also configure and customize Mattermost using the **System Console** and install Mattermost Apps from the **Marketplace**.'}
                />
            </p>
        </div>,
    ];

    return (
        <TutorialTip
            placement='right'
            screens={screens}
            overlayClass='tip-overlay--product-switcher'
            telemetryTag='tutorial_tip_product_switcher'
        />
    );
}
