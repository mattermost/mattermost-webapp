// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {showNotification} from 'utils/notifications';

export default function EnableNotificationsStep(props: {
    id: string;
    onSkip: () => void;
    onFinish: (id: string) => void;
}) {
    const onFinish = () => {
        props.onFinish(props.id);
    };

    return (
        <div>
            <div
                style={{

                    // TODO temp for textbox demo
                    margin: '24px',
                }}
            >
                <FormattedMessage
                    id='next_steps_view.preferenceSetup'
                    defaultMessage='We recommend enabling desktop notifications so you don’t miss any important communications.'
                />
            </div>
            <div className='NextStepsView__wizardButtons'>
                <button
                    className='NextStepsView__button NextStepsView__finishButton primary'
                    onClick={() => {
                        showNotification({
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
                        onFinish();
                    }}
                >
                    <FormattedMessage
                        id='next_steps_view.notificationSetup.enableNotifications'
                        defaultMessage='Enable notifications'
                    />
                </button>
            </div>
        </div>
    );
}
