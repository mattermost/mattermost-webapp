// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import * as Utils from 'utils/utils.jsx';
import {showNotification} from 'utils/notifications';
import {t} from 'utils/i18n';

import {StepComponentProps} from '../../steps';

import TextCardWithAction from '../text_card_with_action/text_card_with_action';

export default function EnableNotificationsStep(props: StepComponentProps) {
    useEffect(() => {
        if (props.expanded) {
            pageVisited(getAnalyticsCategory(props.isAdmin), 'pageview_enable_notifications');
        }
    }, [props.expanded]);

    const onFinish = async () => {
        trackEvent(getAnalyticsCategory(props.isAdmin), 'click_enable_notifications');
        try {
            await showNotification({
                title: Utils.localizeMessage(
                    'next_steps_view.notificationSetup.notficationsEnabledTitle',
                    'Notifications Enabled!',
                ),
                body: Utils.localizeMessage(
                    'next_steps_view.notificationSetup.notficationsEnabledBody',
                    'This is how notifications from Mattermost will appear',
                ),
                requireInteraction: false,
                silent: false,
                onClick: () => { },
            });
        } catch (err) {
            // If the user Clicks "Block" when prompted to enable notifications, we throw an exception
            // This blank catch allows us to continue
        }
        props.onFinish(props.id);
    };

    const notificationsDisabled = () => {
        if (!('Notification' in window)) {
            return true;
        }

        if (Notification.permission === 'denied') {
            return true;
        }

        return false;
    };

    if (notificationsDisabled()) {
        return (
            <div>
                <TextCardWithAction
                    cardBodyMessageId={t('next_steps_view.notificationSetupNotificationsDisabled')}
                    cardBodyDefaultMessage={
                        'Notifications were previously disabled or you may be browsing in private mode. You\'ll need to open your browser settings or turn off private mode to enable notifications.'
                    }
                    buttonMessageId={
                        t('next_steps_view.notificationSetup.skipThisStep')
                    }
                    buttonDefaultMessage={'Skip this step'}
                    onClick={onFinish}
                />
            </div>
        );
    }

    let buttonMessageId = props.completeStepButtonText.id;
    let buttonDefaultMessage = props.completeStepButtonText.defaultMessage;

    if (props.isLastStep) {
        buttonMessageId = t('next_steps_view.invite_members_step.finish');
        buttonDefaultMessage = 'Finish';
    }
    return (
        <TextCardWithAction
            cardBodyMessageId={t('next_steps_view.notificationSetup')}
            cardBodyDefaultMessage={
                'We recommend enabling desktop notifications so you don’t miss any important communications.'
            }
            buttonMessageId={buttonMessageId as string}
            buttonDefaultMessage={buttonDefaultMessage as string}
            onClick={onFinish}
        />
    );
}
