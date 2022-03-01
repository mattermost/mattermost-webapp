// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';

import SettingItemMax from 'components/setting_item_max';
import SettingItemMin from 'components/setting_item_min';

import {AdvancedSections} from 'utils/constants';

import type {PropsFromRedux} from './index';

type Props = PropsFromRedux & {
    activeSection?: string;
    onUpdateSection: (section?: string) => void;
};

export default function PerformanceDebuggingSection(props: Props) {
    if (!props.performanceDebuggingEnabled) {
        return null;
    }

    let settings;
    if (props.activeSection === AdvancedSections.PERFORMANCE_DEBUGGING) {
        settings = <PerformanceDebuggingSectionExpanded {...props}/>;
    } else {
        settings = <PerformanceDebuggingSectionCollapsed {...props}/>;
    }

    return (
        <>
            {settings}
            <div className='divider-light'/>
        </>
    );
}

function PerformanceDebuggingSectionCollapsed(props: Props) {
    let settingsEnabled = 0;

    if (props.disableClientPlugins) {
        settingsEnabled += 1;
    }

    let description;
    if (settingsEnabled === 0) {
        description = (
            <FormattedMessage
                id='user.settings.advance.performance.noneEnabled'
                defaultMessage='No settings enabled'
            />
        );
    } else {
        description = (
            <FormattedMessage
                id='user.settings.advance.performance.settingsEnabled'
                defaultMessage='{count, number} {count, plural, one {setting} other {settings}} enabled'
                values={{count: settingsEnabled}}
            />
        );
    }

    return (
        <SettingItemMin
            title={
                <FormattedMessage
                    id='user.settings.advance.performance.title'
                    defaultMessage='Performance Debugging'
                />
            }
            describe={description}
            section={AdvancedSections.PERFORMANCE_DEBUGGING}
            updateSection={props.onUpdateSection}
        />
    );
}

function PerformanceDebuggingSectionExpanded(props: Props) {
    const [disableClientPlugins, setDisableClientPlugins] = useState(props.disableClientPlugins);

    const handleSubmit = useCallback(() => {
        const preferences = [];

        if (disableClientPlugins !== props.disableClientPlugins) {
            preferences.push({
                user_id: props.currentUserId,
                category: Preferences.CATEGORY_PERFORMANCE_DEBUGGING,
                name: Preferences.NAME_DISABLE_CLIENT_PLUGINS,
                value: disableClientPlugins.toString(),
            });
        }

        if (preferences.length !== 0) {
            props.savePreferences(props.currentUserId, preferences);
        }

        props.onUpdateSection('');
    }, [props.currentUserId, props.onUpdateSection, props.savePreferences, disableClientPlugins]);

    return (
        <SettingItemMax
            title={
                <FormattedMessage
                    id='user.settings.advance.performance.title'
                    defaultMessage='Performance Debugging'
                />
            }
            inputs={[
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
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.advance.performance.info1'
                            defaultMessage="You may enable these settings temporarily to help isolate performance issues while debugging. We don't recommend leaving these settings enabled for an extended period of time as they can negatively impact your user experience."
                        />
                        <br/>
                        <br/>
                        <FormattedMessage
                            id='user.settings.advance.performance.info2'
                            defaultMessage='You may need to refresh the page before these settings take effect.'
                        />
                    </div>
                </fieldset>,
            ]}
            submit={handleSubmit}
            updateSection={props.onUpdateSection}
        />
    );
}
