// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import UserSettingsModal from '../../user_settings/modal';

export default function SetupPreferencesStep(props: { id: string; onSkip: () => void; onFinish: (id: string) => void }) {
    const [shouldShowSettings, showSettings] = useState(false);
    const onFinish = () => {
        props.onFinish(props.id);
    };

    return (
        <div>
            <div
                style={{
                    margin: '24px',
                }}
            >
                <FormattedMessage
                    id='next_steps_view.preferenceSetup'
                    defaultMessage='You can change how you receive notifications, update your profile, customize display settings and more. Preferences can be accessed through the Main Menu.'
                />
            </div>
            <div className='NextStepsView__wizardButtons'>
                <button
                    className='NextStepsView__button NextStepsView__finishButton primary'
                    onClick={() => {
                        showSettings(true);
                    }}
                >
                    <FormattedMessage
                        id='next_steps_view.preferenceSetup.setPreferences'
                        defaultMessage='Set Preferences'
                    />
                    {shouldShowSettings && <UserSettingsModal onHide={onFinish}/>}
                </button>
            </div>
        </div>
    );
}

