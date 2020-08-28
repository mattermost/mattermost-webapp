// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useDispatch} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import UserSettingsModal from '../../../user_settings/modal';
import {StepComponentProps} from '../../steps';
import TextCardWithAction from '../text_card_with_action/text_card_with_action';
import {openModal} from 'actions/views/modals';

export default function SetupPreferencesStep(props: StepComponentProps) {
    const dispatch = useDispatch();

    const onFinish = () => {
        props.onFinish(props.id);
    };

    const onClick = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {
                onExit: onFinish,
            }
        }));
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
        </>
    );
}

