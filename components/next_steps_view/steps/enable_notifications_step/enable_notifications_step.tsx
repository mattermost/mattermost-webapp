// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as Utils from 'utils/utils.jsx';
import {showNotification} from 'utils/notifications';
import {StepComponentProps} from '../../steps';

import TextCardWithAction from '../text_card_with_action/text_card_with_action';

export default function EnableNotificationsStep(props: StepComponentProps) {
    const onFinish = async () => {
        await showNotification({
            title: Utils.localizeMessage(
                'next_steps_view.notificationSetup.notficationsEnabledTitle',
                'Notifications Enabled!'
            ),
            body: Utils.localizeMessage(
                'next_steps_view.notificationSetup.notficationsEnabledBody',
                'This is how notifications from Mattermost will appear'
            ),
            requireInteraction: false,
            silent: false,
            onClick: () => {},
        });
        props.onFinish(props.id);
    };

    return (
        <TextCardWithAction
            cardBodyMessageId={'next_steps_view.notificationSetup'}
            cardBodyDefaultMessage={
                'We recommend enabling desktop notifications so you don’t miss any important communications.'
            }
            buttonMessageId={
                'next_steps_view.notificationSetup.enableNotifications'
            }
            buttonDefaultMessage={'Enable notifications'}
            onClick={onFinish}
        />
    );
}
