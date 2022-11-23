// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import ReactSelect, {ValueType} from 'react-select';

import semver from 'semver';

import * as Utils from 'utils/utils';

import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {DesktopSound, IgnoreChannelMentions, NotificationLevels, NotificationSections} from 'utils/constants';

import SettingItemMax from 'components/setting_item_max';

import {isDesktopApp} from 'utils/user_agent';

import Describe from './describe';
import ExtraInfo from './extra_info';
import SectionTitle from './section_title';

type SelectedOption = {
    label: string;
    value: string;
};

type Props = {
    ignoreChannelMentions?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangeThreads?: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangeDesktopSound?: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangeNotificationSound?: (selectedOption: ValueType<SelectedOption>) => void;
    onCollapseSection: (section: string) => void;
    onReset: () => void;
    onSubmit: (setting?: string) => void;
    isNotificationsSettingSameAsGlobal?: boolean;
    globalNotifyLevel?: string;
    memberNotifyLevel: string;
    memberThreadsNotifyLevel?: string;
    memberDesktopSound?: string;
    memberDesktopNotificationSound?: string;
    section: string;
    serverError?: string;
}

const sounds = Array.from(Utils.notificationSounds.keys());
const options = sounds.map((sound) => {
    return {value: sound, label: sound};
});

const makeReactSelectValue = (option: string) => {
    return {value: option, label: option};
};

export default function ExpandView({
    section,
    memberNotifyLevel,
    memberThreadsNotifyLevel,
    memberDesktopSound,
    memberDesktopNotificationSound,
    globalNotifyLevel,
    isNotificationsSettingSameAsGlobal,
    onChange,
    onChangeThreads,
    onChangeDesktopSound,
    onChangeNotificationSound,
    onReset,
    onSubmit,
    serverError,
    onCollapseSection,
    ignoreChannelMentions,
}: Props) {
    const isCRTEnabled = useSelector(isCollapsedThreadsEnabled);

    const dropdownSoundRef = useRef<ReactSelect>(null);

    const inputs = [(
        <div key='channel-notification-level-radio'>
            {(section === NotificationSections.DESKTOP || section === NotificationSections.PUSH) &&
            <fieldset>
                <legend className='form-legend'>
                    <FormattedMessage
                        id='channel_notifications.sendDesktop'
                        defaultMessage='Send desktop notifications'
                    />
                </legend>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationAllActivity'
                            name='channelDesktopNotifications'
                            type='radio'
                            value={NotificationLevels.ALL}
                            checked={memberNotifyLevel === NotificationLevels.ALL}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.ALL}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationMentions'
                            name='channelDesktopNotifications'
                            type='radio'
                            value={NotificationLevels.MENTION}
                            checked={memberNotifyLevel === NotificationLevels.MENTION}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.MENTION}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='channelNotificationNever'
                            name='channelDesktopNotifications'
                            type='radio'
                            value={NotificationLevels.NONE}
                            checked={memberNotifyLevel === NotificationLevels.NONE}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.NONE}
                        />
                    </label>
                </div>
            </fieldset>
            }
            {section === NotificationSections.IGNORE_CHANNEL_MENTIONS &&
                <fieldset>
                    <div className='radio'>
                        <label>
                            <input
                                id='ignoreChannelMentionsOn'
                                name='ignoreChannelMentions'
                                type='radio'
                                value={IgnoreChannelMentions.ON}
                                checked={ignoreChannelMentions === IgnoreChannelMentions.ON}
                                onChange={onChange}
                            />
                            <Describe
                                section={section}
                                ignoreChannelMentions={IgnoreChannelMentions.ON}
                                memberNotifyLevel={memberNotifyLevel}
                                globalNotifyLevel={globalNotifyLevel}
                            />
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='ignoreChannelMentionsOff'
                                name='ignoreChannelMentions'
                                type='radio'
                                value={IgnoreChannelMentions.OFF}
                                checked={ignoreChannelMentions === IgnoreChannelMentions.OFF}
                                onChange={onChange}
                            />
                            <Describe
                                section={section}
                                ignoreChannelMentions={IgnoreChannelMentions.OFF}
                                memberNotifyLevel={memberNotifyLevel}
                                globalNotifyLevel={globalNotifyLevel}
                            />
                        </label>
                    </div>
                </fieldset>
            }
            {section === NotificationSections.MARK_UNREAD &&
            <fieldset>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationUnmute'
                            name='channelNotificationMute'
                            type='radio'
                            value={NotificationLevels.MENTION}
                            checked={memberNotifyLevel === NotificationLevels.MENTION}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.MENTION}
                        />
                    </label>
                </div>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationMute'
                            name='channelNotificationMute'
                            type='radio'
                            value={NotificationLevels.ALL}
                            checked={memberNotifyLevel === NotificationLevels.ALL}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.ALL}
                        />
                    </label>
                </div>
            </fieldset>
            }
            <div className='mt-5'>
                <ExtraInfo section={section}/>
            </div>

            {isCRTEnabled &&
            section === NotificationSections.DESKTOP &&
            memberNotifyLevel === NotificationLevels.MENTION &&
            <>
                <hr/>
                <fieldset>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='user.settings.notifications.threads.desktop'
                            defaultMessage='Thread reply notifications'
                        />
                    </legend>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='desktopThreadsNotificationAllActivity'
                                type='checkbox'
                                name='desktopThreadsNotificationLevel'
                                checked={memberThreadsNotifyLevel === NotificationLevels.ALL}
                                onChange={onChangeThreads}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.threads.allActivity'
                                defaultMessage={'Notify me about threads I\'m following'}
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.notifications.threads'
                            defaultMessage={'When enabled, any reply to a thread you\'re following will send a desktop notification.'}
                        />
                    </div>
                </fieldset>
            </>
            }
            {(section === NotificationSections.DESKTOP) && memberNotifyLevel !== NotificationLevels.NONE &&

                <>
                    <hr/>
                    <fieldset>
                        <legend className='form-legend'>
                            <FormattedMessage
                                id='channel_notifications.sound'
                                defaultMessage='Notification sound'
                            />
                        </legend>
                        <div className='radio'>
                            <label className=''>
                                <input
                                    id='channelDesktopSoundOn'
                                    name='channelDesktopSound'
                                    type='radio'
                                    value={DesktopSound.ON}
                                    checked={memberDesktopSound === DesktopSound.ON}
                                    onChange={onChangeDesktopSound}
                                />
                                <FormattedMessage
                                    id='channel_notifications.sound.on.title'
                                    defaultMessage='On'
                                />
                            </label>
                        </div>
                        <div className='radio'>
                            <label>
                                <input
                                    id='channelDesktopSoundOff'
                                    name='channelDesktopSound'
                                    type='radio'
                                    value={DesktopSound.OFF}
                                    checked={memberDesktopSound === DesktopSound.OFF}
                                    onChange={onChangeDesktopSound}
                                />
                                <FormattedMessage
                                    id='channel_notifications.sound.off.title'
                                    defaultMessage='Off'
                                />
                            </label>
                        </div>
                        {memberDesktopSound === DesktopSound.ON && (!isDesktopApp() || (window.desktop && semver.gte(window.desktop.version || '', '4.6.0'))) &&
                        <div className='pt-2'>
                            <ReactSelect
                                className='react-select notification-sound-dropdown'
                                classNamePrefix='react-select'
                                id='channelSoundNotification'
                                options={options}
                                clearable={false}
                                onChange={onChangeNotificationSound}
                                value={makeReactSelectValue(memberDesktopNotificationSound ?? '')}
                                isSearchable={false}
                                ref={dropdownSoundRef}
                            />
                        </div>}
                        <div className='mt-5'>
                            <FormattedMessage
                                id='channel_notifications.sound_info'
                                defaultMessage='Notification sounds are available on Firefox, Edge, Safari, Chrome and Mattermost Desktop Apps.'
                            />
                        </div>
                    </fieldset>
                </>
            }
            {isCRTEnabled &&
            section === NotificationSections.PUSH &&
            memberNotifyLevel === NotificationLevels.MENTION &&
            <>
                <hr/>
                <fieldset>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='user.settings.notifications.threads.push'
                            defaultMessage='Thread reply notifications'
                        />
                    </legend>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='pushThreadsNotificationAllActivity'
                                type='checkbox'
                                name='pushThreadsNotificationLevel'
                                checked={memberThreadsNotifyLevel === NotificationLevels.ALL}
                                onChange={onChangeThreads}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.push_threads.allActivity'
                                defaultMessage={'Notify me about threads I\'m following'}
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.notifications.push_threads'
                            defaultMessage={'When enabled, any reply to a thread you\'re following will send a mobile push notification.'}
                        />
                    </div>
                </fieldset>
            </>
            }
        </div>
    )];

    return (
        <SettingItemMax
            title={
                <SectionTitle
                    section={section}
                    isExpanded={true}
                    isNotificationsSettingSameAsGlobal={isNotificationsSettingSameAsGlobal}
                    onClickResetButton={onReset}
                />}
            inputs={inputs}
            submit={onSubmit}
            serverError={serverError}
            updateSection={onCollapseSection}
        />
    );
}
