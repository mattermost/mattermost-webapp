// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import OnboardingWorkTemplateTourTip from './worktemplate_explore_tour_tip';

interface PlaybooksTourTipProps {
    singleTip: boolean;
    playbookCount?: string;
}

export const PlaybooksTourTip = ({singleTip, playbookCount}: PlaybooksTourTipProps) => {
    const {formatMessage} = useIntl();
    const title = (
        <FormattedMessage
            id='pluggable_rhs.tourtip.playbooks.title'
            defaultMessage={'Access your {count} linked playbook run'}
            values={{count: playbookCount === '0' ? undefined : playbookCount}}
        />
    );

    const screen = (
        <ul>
            <li>
                {formatMessage({
                    id: 'pluggable_rhs.tourtip.playbooks.access',
                    defaultMessage: 'Access your linked playbooks from the Playbooks icon on the right hand App bar.',
                })}
            </li>
            <li>
                {formatMessage({
                    id: 'pluggable_rhs.tourtip.playbooks.click',
                    defaultMessage: 'Click into playbooks from this right panel.',
                })}
            </li>
            <li>
                {formatMessage({
                    id: 'pluggable_rhs.tourtip.playbooks.review',
                    defaultMessage: 'Review playbook updates from your channels.',
                })}
            </li>
        </ul>
    );

    return (
        <OnboardingWorkTemplateTourTip
            pulsatingDotPlacement={'left'}
            pulsatingDotTranslate={{x: 10, y: -140}}
            title={title}
            screen={screen}
            singleTip={singleTip}
            overlayPunchOut={null}
            placement='left-start'
            hideBackdrop={true}
            tippyBlueStyle={true}
            showOptOut={false}
        />
    );
};

