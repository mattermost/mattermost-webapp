// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import UserSettingsModal from '../../../user_settings/modal';

import {StepComponentProps} from '../../steps';

import TextCardWithAction from '../text_card_with_action/text_card_with_action';

export default function SetupPreferencesStep(props: StepComponentProps) {
    const [shouldShowSettings, showSettings] = useState(false);
    const onFinish = () => {
        props.onFinish(props.id);
    };
    const onClick = () => {
        showSettings(true);
    };

    return (
        <>
            <TextCardWithAction
                cardBodyMessageId={'next_steps_view.preferenceSetup'}
                cardBodyDefaultMessage={'You can change how you receive notifications, update your profile, customize display settings and more. Preferences can be accessed through the Main Menu.'}
                buttonMessageId={'next_steps_view.preferenceSetup.setPreferences'}
                buttonDefaultMessage={'Set Preferences'}
                onClick={onClick}
            />
            {shouldShowSettings && <UserSettingsModal onHide={onFinish}/>}
        </>
    );
}

