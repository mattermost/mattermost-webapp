// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import ReactSelect from 'react-select';

import semver from 'semver';

import {NotificationLevels, NotificationSections} from 'utils/constants';
import {isDesktopApp} from '../../../utils/user_agent';

import * as Utils from 'utils/utils';
import RepeatIcon from '../../widgets/icons/fa_repeat_icon';

import SettingItemMax from '../../setting_item_max';

import Describe from './describe';

import SectionTitle from './section_title';
import ExtraInfo from './extra_info';

const isNotifyLevel = (level, memberLevel, globalLevel) => memberLevel === level || (memberLevel === NotificationLevels.DEFAULT && globalLevel === level);

export default function DesktopNotificationSection({onChange, onSubmit, serverError, onCollapseSection,
    memberNotifyLevel, globalNotifyLevel, memberDesktopSound, globalDesktopSound, memberDesktopNotificationSound,
    globalDesktopNotificationSound, handleUpdateDesktopSound, handleUpdateDesktopNotificationSound}) {
    const section = NotificationSections.DESKTOP;

    let sectionView = null;
    let actionButton = null;

    const desktopSound = memberDesktopSound || globalDesktopSound;
    const desktopNotificationSound = memberDesktopNotificationSound || globalDesktopNotificationSound;

    let soundSection;
    let notificationSelection;
    if (isNotifyLevel(NotificationLevels.ALL, memberNotifyLevel, globalNotifyLevel) || isNotifyLevel(NotificationLevels.MENTION, memberNotifyLevel, globalNotifyLevel)) {
        if (desktopSound === 'true') {
            const sounds = Array.from(Utils.notificationSounds.keys());
            const options = sounds.map((sound) => {
                return {value: sound, label: sound};
            });

            if (!isDesktopApp() || (window.desktop && semver.gte(window.desktop.version, '4.6.0'))) {
                notificationSelection = (<div className='pt-2'>
                    <ReactSelect
                        className='react-select notification-sound-dropdown'
                        classNamePrefix='react-select'
                        id='displaySoundNotification'
                        options={options}
                        clearable={false}
                        onChange={(e) => handleUpdateDesktopNotificationSound(e.value)}
                        value={{value: desktopNotificationSound, label: desktopNotificationSound}}
                        isSearchable={false}
                    /></div>);
            }
        }

        if (Utils.hasSoundOptions()) {
            soundSection = (
                <fieldset>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='channel.user.settings.notifications.desktop.sound'
                            defaultMessage='Notification sound'
                        />
                    </legend>
                    <div className='radio'>
                        <label>
                            <input
                                id='soundOn'
                                type='radio'
                                name='notificationSounds'
                                checked={desktopSound === 'true'}
                                onChange={() => handleUpdateDesktopSound('true')}
                            />
                            <FormattedMessage
                                id='channel.user.settings.notifications.on'
                                defaultMessage='On'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='soundOff'
                                type='radio'
                                name='notificationSounds'
                                checked={desktopSound === 'false'}
                                onChange={() => handleUpdateDesktopSound('false')}
                            />
                            <FormattedMessage
                                id='channel.user.settings.notifications.off'
                                defaultMessage='Off'
                            />
                        </label>
                        <br/>
                    </div>
                    {notificationSelection}
                    <div className='mt-5'>
                        <FormattedMessage
                            id='channel.user.settings.notifications.sounds_info'
                            defaultMessage='Notification sounds are available on Firefox, Edge, Safari, Chrome and Mattermost Desktop Apps.'
                        />
                    </div>
                </fieldset>
            );
        } else {
            soundSection = (
                <fieldset>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='channel.user.settings.notifications.desktop.sound'
                            defaultMessage='Notification sound'
                        />
                    </legend>
                    <br/>
                    <FormattedMessage
                        id='channel.user.settings.notifications.soundConfig'
                        defaultMessage='Please configure notification sounds in your browser settings'
                    />
                </fieldset>
            );
        }
    }
    sectionView = (
        <>
            <legend className='form-legend'>
                <FormattedMessage
                    id='channel.user.settings.notifications.desktop'
                    defaultMessage='Send desktop notifications'
                />
            </legend>
            <fieldset>
                <div className='radio'>
                    <label className=''>
                        <input
                            id='channelNotificationAllActivity'
                            name='channelDesktopNotifications'
                            type='radio'
                            value={NotificationLevels.ALL}
                            checked={isNotifyLevel(NotificationLevels.ALL, memberNotifyLevel, globalNotifyLevel)}
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
                            checked={isNotifyLevel(NotificationLevels.MENTION, memberNotifyLevel, globalNotifyLevel)}
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
                            checked={isNotifyLevel(NotificationLevels.NONE, memberNotifyLevel, globalNotifyLevel)}
                            onChange={onChange}
                        />
                        <Describe
                            section={section}
                            memberNotifyLevel={NotificationLevels.NONE}
                        />
                    </label>
                </div>
                <div className='mt-5'>
                    <FormattedMessage
                        id='channel.user.settings.notifications.info'
                        defaultMessage='Desktop notifications are available on Firefox, Safari and Chrome.'
                    />
                </div>
            </fieldset>
            <hr/>
            {soundSection}
        </>
    );

    if ((memberNotifyLevel !== globalNotifyLevel && memberNotifyLevel !== NotificationLevels.DEFAULT) ||
        desktopSound !== globalDesktopSound ||
        desktopNotificationSound !== globalDesktopNotificationSound) {
        const actionClicked = () => {
            handleUpdateDesktopSound(null);
            handleUpdateDesktopNotificationSound(null);
            onChange({target: {value: NotificationLevels.DEFAULT}});
        };

        if (Utils.isMobile()) {
            actionButton = (
                <button
                    id={section + 'Action'}
                    className='color--link cursor--pointer style--none'
                    onClick={actionClicked}
                    aria-labelledby={section + 'Title ' + section + 'Action'}
                >
                    <RepeatIcon/>
                </button>
            );
        } else {
            actionButton = (
                <button
                    id={section + 'Action'}
                    className='color--link cursor--pointer style--none text-left'
                    onClick={actionClicked}
                    aria-labelledby={section + 'Title ' + section + 'Action'}
                >
                    <RepeatIcon/>
                    <FormattedMessage
                        id='channel.user.settings.reset_defaults'
                        defaultMessage='Reset to defaults'
                    />
                </button>
            );
        }
    }
    const inputs = [(
        <div key='channel-notification-level-radio'>
            {sectionView}
        </div>
    )];

    return (
        <SettingItemMax
            title={<SectionTitle section={section}/>}
            inputs={inputs}
            submit={onSubmit}
            server_error={serverError}
            updateSection={onCollapseSection}
            actionButton={actionButton}
            extraInfo={<ExtraInfo section={section}/>}
        />
    );
}

DesktopNotificationSection.propTypes = {
    onChange: PropTypes.func.isRequired,
    onCollapseSection: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    globalNotifyLevel: PropTypes.string,
    memberNotifyLevel: PropTypes.string.isRequired,
    memberDesktopSound: PropTypes.string,
    globalDesktopSound: PropTypes.string,
    memberDesktopNotificationSound: PropTypes.string,
    globalDesktopNotificationSound: PropTypes.string,
    handleUpdateDesktopSound: PropTypes.func.isRequired,
    handleUpdateDesktopNotificationSound: PropTypes.func.isRequired,
    serverError: PropTypes.string,
};
