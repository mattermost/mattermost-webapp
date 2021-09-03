// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import TutorialTip from './tutorial_tip';

type Props = {
    toggleFunc?: React.MouseEventHandler<HTMLDivElement>;
    onBottom: boolean;
    inHeading?: boolean;
}

const MenuTutorialTip = ({inHeading, toggleFunc, onBottom}: Props) => {
    const screens = [];

    screens.push(
        <div>
            <h4>
                <FormattedMessage
                    id='sidebar_header.tutorial.title'
                    defaultMessage='Invite people'
                />
            </h4>
            <p>
                <FormattedMarkdownMessage
                    id='sidebar_header.tutorial.body1'
                    defaultMessage='Use this menu to **Invite People** to your team and access **Team Settings** if you’re an Admin.'
                />
            </p>
        </div>,
    );

    let placement = 'right';
    let arrow = 'left';
    let headerClass = '';

    if (inHeading && !onBottom) {
        headerClass = ' tip-overlay--header--heading';
    }

    if (onBottom) {
        placement = 'bottom';
        arrow = 'up';
    }

    return (
        <div
            onClick={toggleFunc}
        >
            <TutorialTip
                placement={placement}
                screens={screens}
                overlayClass={'tip-overlay--header--' + arrow + headerClass}
                telemetryTag='tutorial_tip_3_main_menu'
            />
        </div>
    );
};

export default MenuTutorialTip;
