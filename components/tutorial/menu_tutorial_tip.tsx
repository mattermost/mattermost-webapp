// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {getAnnouncementBarCount} from 'selectors/views/announcement_bar';
import Constants from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import TutorialTip from './tutorial_tip';
import {useMeasurePunchouts} from './tutorial_tip/hooks';

const TutorialSteps = Constants.TutorialSteps;

type Props = {
    toggleFunc?: React.MouseEventHandler<HTMLDivElement>;
    onBottom: boolean;
    inHeading?: boolean;
    stopPropagation?: boolean;
}

const MenuTutorialTip = ({inHeading, toggleFunc, onBottom, stopPropagation}: Props) => {
    const screens = [
        <div key='screen-one'>
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
    ];

    const isAnnouncementBarOpen = useSelector(getAnnouncementBarCount) > 0;

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
                step={TutorialSteps.MENU_POPOVER}
                stopPropagation={stopPropagation}
                placement={placement}
                screens={screens}
                overlayClass={'tip-overlay--header--' + arrow + headerClass}
                telemetryTag='tutorial_tip_3_main_menu'
                punchOut={useMeasurePunchouts(['lhsNavigator', 'sidebar-header-container'], [isAnnouncementBarOpen])}
            />
        </div>
    );
};

export default MenuTutorialTip;
