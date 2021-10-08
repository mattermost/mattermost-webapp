// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {useDispatch} from 'react-redux';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import {t} from 'utils/i18n';
import {ModalIdentifiers} from 'utils/constants';
import UserSettingsModal from '../../../user_settings/modal';
import {StepComponentProps} from '../../steps';
import TextCardWithAction from '../text_card_with_action/text_card_with_action';
import {openModal} from 'actions/views/modals';

export default function SetupPreferencesStep(props: StepComponentProps) {
    useEffect(() => {
        if (props.expanded) {
            pageVisited(getAnalyticsCategory(props.isAdmin), 'pageview_enable_notifications');
        }
    }, [props.expanded]);

    const dispatch = useDispatch();

    const onFinish = () => {
        props.onFinish(props.id);
    };

    const onClick = () => {
        trackEvent(getAnalyticsCategory(props.isAdmin), 'click_set_preferences');
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {
                onExit: onFinish,
                dialogProps: {isContentProductSettings: true},
            },
        }));
    };

    return (
        <>
            <TextCardWithAction
                cardBodyMessageId={t('next_steps_view.preferenceSetup')}
                cardBodyDefaultMessage={'You can update your profile and manage security settings from Account Settings by selecting your Avatar. Select Settings to change how you receive notifications, customize your display settings, and more.'}
                buttonMessageId={t('next_steps_view.preferenceSetup.setPreferences')}
                buttonDefaultMessage={'Set Preferences'}
                onClick={onClick}
            />
        </>
    );
}

