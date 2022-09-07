// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import SectionCreator from '../../generic/section_creator';

import {t} from 'utils/i18n';

import type {PropsFromRedux} from './index';

type Props = PropsFromRedux & {
    onUpdateSection: (section: string, value: string) => void;
};

const performanceDebuggingTitle = {
    id: t('user.settings.advance.performance.title'),
    defaultMessage: 'Performance Debugging',
};
const performanceDebuggingDesc = {
    id: t('user.settings.advance.performance.info1'),
    defaultMessage: "You may enable these settings temporarily to help isolate performance issues while debugging. We don't recommend leaving these settings enabled for an extended period of time as they can negatively impact your user experience.",
};
export default function PerformanceDebuggingSection({
    currentUserId,
    onUpdateSection,
    savePreferences,
    ...props}: Props) {
    // if (!performanceDebuggingEnabled) {
    //     return null;
    // }

    const [disableClientPlugins, setDisableClientPlugins] = useState(props.disableClientPlugins);
    const [disableTelemetry, setDisableTelemetry] = useState(props.disableTelemetry);
    const [disableTypingMessages, setDisableTypingMessages] = useState(props.disableTypingMessages);

    const handleSubmit = useCallback(() => {
        const preferences = [];

        if (disableClientPlugins !== props.disableClientPlugins) {
            preferences.push({
                user_id: currentUserId,
                category: Preferences.CATEGORY_PERFORMANCE_DEBUGGING,
                name: Preferences.NAME_DISABLE_CLIENT_PLUGINS,
                value: disableClientPlugins.toString(),
            });
        }
        if (disableTelemetry !== props.disableTelemetry) {
            preferences.push({
                user_id: currentUserId,
                category: Preferences.CATEGORY_PERFORMANCE_DEBUGGING,
                name: Preferences.NAME_DISABLE_TELEMETRY,
                value: disableTelemetry.toString(),
            });
        }
        if (disableTypingMessages !== props.disableTypingMessages) {
            preferences.push({
                user_id: currentUserId,
                category: Preferences.CATEGORY_PERFORMANCE_DEBUGGING,
                name: Preferences.NAME_DISABLE_TYPING_MESSAGES,
                value: disableTypingMessages.toString(),
            });
        }

        if (preferences.length !== 0) {
            savePreferences(currentUserId, preferences);
        }

        onUpdateSection('', '');
    }, [
        currentUserId,
        onUpdateSection,
        savePreferences,
        disableClientPlugins,
        disableTelemetry,
        disableTypingMessages,
    ]);

    const content = (
        <>
            <fieldset key='settings'>
                <div className='checkbox'>
                    <label>
                        <input
                            type='checkbox'
                            checked={disableClientPlugins}
                            onChange={(e) => {
                                setDisableClientPlugins(e.target.checked);
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.performance.disableClientPlugins'
                            defaultMessage='Disable Client-side Plugins'
                        />
                    </label>
                </div>
                <div className='checkbox'>
                    <label>
                        <input
                            type='checkbox'
                            checked={disableTelemetry}
                            onChange={(e) => {
                                setDisableTelemetry(e.target.checked);
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.performance.disableTelemetry'
                            defaultMessage='Disable telemetry events sent from the client'
                        />
                    </label>
                </div>
                <div className='checkbox'>
                    <label>
                        <input
                            type='checkbox'
                            checked={disableTypingMessages}
                            onChange={(e) => {
                                setDisableTypingMessages(e.target.checked);
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.performance.disableTypingMessages'
                            defaultMessage='Disable "User is typing..." messages'
                        />
                    </label>
                </div>
                <div className='mt-5'>
                    <FormattedMessage
                        id='user.settings.advance.performance.info2'
                        defaultMessage='You may need to refresh the page before these settings take effect.'
                    />
                </div>
            </fieldset>
        </>
    );

    return (
        <SectionCreator
            title={performanceDebuggingTitle}
            description={performanceDebuggingDesc}
            content={content}
        />
    );
}

