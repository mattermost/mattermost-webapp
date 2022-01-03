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

    let finishMessage = (
        <FormattedMessage
            id={props.completeStepButtonText.id}
            defaultMessage={props.completeStepButtonText.defaultMessage}
        />);

    if (props.isLastStep) {
        finishMessage = (
            <FormattedMessage
                id='next_steps_view.invite_members_step.finish'
                defaultMessage='Finish'
            />);
    }

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
                {finishMessage}
            </button>
        </div>
    </>);
}
