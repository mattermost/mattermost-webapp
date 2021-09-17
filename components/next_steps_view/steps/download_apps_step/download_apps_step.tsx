// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {pageVisited} from 'actions/telemetry_actions';

import {getAnalyticsCategory} from '../../step_helpers';

import {StepComponentProps} from '../../steps';
import DownloadSection from '../../download_section';

export default function DownloadAppsStep(props: StepComponentProps) {
    useEffect(() => {
        if (props.expanded) {
            pageVisited(getAnalyticsCategory(props.isAdmin), 'pageview_download_apps');
        }
    }, [props.expanded]);

    return (<>
        <DownloadSection
            isFirstAdmin={props.isAdmin}
            withinNextStep={true}
        />
        <div className='NextStepsView__wizardButtons'>
            <button
                data-testid='DownloadAppsStep__finishDownload'
                className={classNames('NextStepsView__button NextStepsView__finishButton primary')}
                onClick={() => props.onFinish(props.id)}
            >
                <FormattedMessage
                    id='next_steps_view.downloadDesktopAndMobile.primary'
                    defaultMessage='Finish'
                />
            </button>
        </div>
    </>);
}
