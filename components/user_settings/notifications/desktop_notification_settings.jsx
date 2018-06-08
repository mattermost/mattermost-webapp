// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants, {NotificationLevels} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

export default class DesktopNotificationSettings extends React.Component {
    handleMinUpdateSection = (section) => {
        this.props.updateSection(section);

        this.props.cancel();
    }

    handleMaxUpdateSection = (section) => {
        this.props.updateSection(section);
    }

    handleOnChange = (e) => {
        const key = e.currentTarget.getAttribute('data-key');
        const value = e.currentTarget.getAttribute('data-value');
        this.props.setParentState(key, value);
    }

    buildMaximizedSetting = () => {
        const inputs = [];

        const activityRadio = [false, false, false];
        if (this.props.activity === NotificationLevels.MENTION) {
            activityRadio[1] = true;
        } else if (this.props.activity === NotificationLevels.NONE) {
            activityRadio[2] = true;
        } else {
            activityRadio[0] = true;
        }

        let soundSection;
        if (this.props.activity !== NotificationLevels.NONE) {
            const soundRadio = [false, false];
            if (this.props.sound === 'false') {
                soundRadio[1] = true;
            } else {
                soundRadio[0] = true;
            }

            if (Utils.hasSoundOptions()) {
                soundSection = (
                    <div>
                        <hr/>
                        <label>
                            <FormattedMessage
                                id='user.settings.notifications.desktop.sound'
                                defaultMessage='Notification sound'
                            />
                        </label>
                        <br/>
                        <div className='radio'>
                            <label>
                                <input
                                    id='soundOn'
                                    type='radio'
                                    name='notificationSounds'
                                    checked={soundRadio[0]}
                                    data-key={'desktopSound'}
                                    data-value={'true'}
                                    onChange={this.handleOnChange}
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.on'
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
                                    checked={soundRadio[1]}
                                    data-key={'desktopSound'}
                                    data-value={'false'}
                                    onChange={this.handleOnChange}
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.off'
                                    defaultMessage='Off'
                                />
                            </label>
                            <br/>
                        </div>
                        <br/>
                        <span>
                            <FormattedMessage
                                id='user.settings.notifications.sounds_info'
                                defaultMessage='Notification sounds are available on IE11, Safari, Chrome and Mattermost Desktop Apps.'
                            />
                        </span>
                    </div>
                );
            } else {
                soundSection = (
                    <div>
                        <hr/>
                        <label>
                            <FormattedMessage
                                id='user.settings.notifications.desktop.sound'
                                defaultMessage='Notification sound'
                            />
                        </label>
                        <br/>
                        <FormattedMessage
                            id='user.settings.notifications.soundConfig'
                            defaultMessage='Please configure notification sounds in your browser settings'
                        />
                    </div>
                );
            }
        }

        inputs.push(
            <div key='userNotificationLevelOption'>
                <label>
                    <FormattedMessage
                        id='user.settings.notifications.desktop'
                        defaultMessage='Send desktop notifications'
                    />
                </label>
                <br/>
                <div className='radio'>
                    <label>
                        <input
                            id='desktopNotificationAllActivity'
                            type='radio'
                            name='desktopNotificationLevel'
                            checked={activityRadio[0]}
                            data-key={'desktopActivity'}
                            data-value={NotificationLevels.ALL}
                            onChange={this.handleOnChange}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.allActivity'
                            defaultMessage='For all activity'
                        />
                    </label>
                    <br/>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='desktopNotificationMentions'
                            type='radio'
                            name='desktopNotificationLevel'
                            checked={activityRadio[1]}
                            data-key={'desktopActivity'}
                            data-value={NotificationLevels.MENTION}
                            onChange={this.handleOnChange}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.onlyMentions'
                            defaultMessage='Only for mentions and direct messages'
                        />
                    </label>
                    <br/>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='desktopNotificationNever'
                            type='radio'
                            name='desktopNotificationLevel'
                            checked={activityRadio[2]}
                            data-key={'desktopActivity'}
                            data-value={NotificationLevels.NONE}
                            onChange={this.handleOnChange}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.never'
                            defaultMessage='Never'
                        />
                    </label>
                </div>
                <br/>
                <span>
                    <FormattedMessage
                        id='user.settings.notifications.info'
                        defaultMessage='Desktop notifications are available on Edge, Firefox, Safari, Chrome and Mattermost Desktop Apps.'
                    />
                </span>
                {soundSection}
            </div>
        );

        return (
            <SettingItemMax
                title={Utils.localizeMessage('user.settings.notifications.desktop.title', 'Desktop notifications')}
                inputs={inputs}
                submit={this.props.submit}
                saving={this.props.saving}
                server_error={this.props.error}
                updateSection={this.handleMaxUpdateSection}
            />
        );
    }

    buildMinimizedSetting = () => {
        let describe = '';
        if (this.props.activity === NotificationLevels.MENTION) {
            if (Utils.hasSoundOptions() && this.props.sound !== 'false') {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.desktop.mentionsSoundTimed'
                        defaultMessage='For mentions and direct messages, with sound, shown for {seconds} seconds'
                        values={{
                            seconds: Constants.DEFAULT_NOTIFICATION_DURATION / 1000,
                        }}
                    />
                );
            } else if (Utils.hasSoundOptions() && this.props.sound === 'false') {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.desktop.mentionsNoSoundTimed'
                        defaultMessage='For mentions and direct messages, without sound, shown for {seconds} seconds'
                        values={{
                            seconds: Constants.DEFAULT_NOTIFICATION_DURATION / 1000,
                        }}
                    />
                );
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.desktop.mentionsSoundHiddenTimed'
                        defaultMessage='For mentions and direct messages, shown for {seconds} seconds'
                        values={{
                            seconds: Constants.DEFAULT_NOTIFICATION_DURATION / 1000,
                        }}
                    />
                );
            }
        } else if (this.props.activity === NotificationLevels.NONE) {
            describe = (
                <FormattedMessage
                    id='user.settings.notifications.off'
                    defaultMessage='Off'
                />
            );
        } else {
            if (Utils.hasSoundOptions() && this.props.sound !== 'false') { //eslint-disable-line no-lonely-if
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.desktop.allSoundTimed'
                        defaultMessage='For all activity, with sound, shown for {seconds} seconds'
                        values={{
                            seconds: Constants.DEFAULT_NOTIFICATION_DURATION / 1000,
                        }}
                    />
                );
            } else if (Utils.hasSoundOptions() && this.props.sound === 'false') {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.desktop.allNoSoundTimed'
                        defaultMessage='For all activity, without sound, shown for {seconds} seconds'
                        values={{
                            seconds: Constants.DEFAULT_NOTIFICATION_DURATION / 1000,
                        }}
                    />
                );
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.desktop.allSoundHiddenTimed'
                        defaultMessage='For all activity, shown for {seconds} seconds'
                        values={{
                            seconds: Constants.DEFAULT_NOTIFICATION_DURATION / 1000,
                        }}
                    />
                );
            }
        }

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.notifications.desktop.title', 'Desktop notifications')}
                describe={describe}
                focused={this.props.focused}
                section={'desktop'}
                updateSection={this.handleMinUpdateSection}
            />
        );
    }

    render() {
        if (this.props.active) {
            return this.buildMaximizedSetting();
        }

        return this.buildMinimizedSetting();
    }
}

DesktopNotificationSettings.propTypes = {
    activity: PropTypes.string.isRequired,
    sound: PropTypes.string.isRequired,
    updateSection: PropTypes.func,
    setParentState: PropTypes.func,
    submit: PropTypes.func,
    cancel: PropTypes.func,
    error: PropTypes.string,
    active: PropTypes.bool,
    saving: PropTypes.bool,
    focused: PropTypes.bool,
};
