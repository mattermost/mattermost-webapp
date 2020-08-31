// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import {FormattedMessage} from 'react-intl';

import semver from 'semver';

import {NotificationLevels} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';
import {isDesktopApp} from 'utils/user_agent';

export default class DesktopNotificationSettings extends React.PureComponent {
    constructor(props) {
        super(props);
        const selectedOption = {value: props.selectedSound, label: props.selectedSound};
        this.state = {
            selectedOption,
            blurDropdown: false,
        };
        this.dropdownSoundRef = React.createRef();
    }

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

    setDesktopNotificationSound = (selectedOption) => {
        this.props.setParentState('desktopNotificationSound', selectedOption.value);
        this.setState({selectedOption});
        Utils.tryNotificationSound(selectedOption.value);
    }

    blurDropdown() {
        if (!this.state.blurDropdown) {
            this.setState({blurDropdown: true});
            if (this.dropdownSoundRef.current) {
                this.dropdownSoundRef.current.blur();
            }
        }
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
        let notificationSelection;
        if (this.props.activity !== NotificationLevels.NONE) {
            const soundRadio = [false, false];
            if (this.props.sound === 'false') {
                soundRadio[1] = true;
            } else {
                soundRadio[0] = true;
            }

            if (this.props.sound === 'true') {
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
                            onChange={this.setDesktopNotificationSound}
                            value={this.state.selectedOption}
                            isSearchable={false}
                            ref={this.dropdownSoundRef}
                        /></div>);
                }
            }

            if (Utils.hasSoundOptions()) {
                soundSection = (
                    <fieldset>
                        <legend className='form-legend'>
                            <FormattedMessage
                                id='user.settings.notifications.desktop.sound'
                                defaultMessage='Notification sound'
                            />
                        </legend>
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
                        {notificationSelection}
                        <div className='mt-5'>
                            <FormattedMessage
                                id='user.settings.notifications.sounds_info'
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
                                id='user.settings.notifications.desktop.sound'
                                defaultMessage='Notification sound'
                            />
                        </legend>
                        <br/>
                        <FormattedMessage
                            id='user.settings.notifications.soundConfig'
                            defaultMessage='Please configure notification sounds in your browser settings'
                        />
                    </fieldset>
                );
            }
        }

        inputs.push(
            <div key='userNotificationLevelOption'>
                <fieldset>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='user.settings.notifications.desktop'
                            defaultMessage='Send desktop notifications'
                        />
                    </legend>
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
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.notifications.info'
                            defaultMessage='Desktop notifications are available on Edge, Firefox, Safari, Chrome and Mattermost Desktop Apps.'
                        />
                    </div>
                </fieldset>
                <hr/>
                {soundSection}
            </div>,
        );

        return (
            <SettingItemMax
                title={Utils.localizeMessage('user.settings.notifications.desktop.title', 'Desktop Notifications')}
                inputs={inputs}
                submit={this.props.submit}
                saving={this.props.saving}
                server_error={this.props.error}
                updateSection={this.handleMaxUpdateSection}
            />
        );
    }

    buildMinimizedSetting = () => {
        let formattedMessageProps;
        const hasSoundOption = Utils.hasSoundOptions();
        if (this.props.activity === NotificationLevels.MENTION) {
            if (hasSoundOption && this.props.sound !== 'false') {
                formattedMessageProps = {
                    id: t('user.settings.notifications.desktop.mentionsSound'),
                    defaultMessage: 'For mentions and direct messages, with sound',
                };
            } else if (hasSoundOption && this.props.sound === 'false') {
                formattedMessageProps = {
                    id: t('user.settings.notifications.desktop.mentionsNoSound'),
                    defaultMessage: 'For mentions and direct messages, without sound',
                };
            } else {
                formattedMessageProps = {
                    id: t('user.settings.notifications.desktop.mentionsSoundHidden'),
                    defaultMessage: 'For mentions and direct messages',
                };
            }
        } else if (this.props.activity === NotificationLevels.NONE) {
            formattedMessageProps = {
                id: t('user.settings.notifications.off'),
                defaultMessage: 'Off',
            };
        } else {
            if (hasSoundOption && this.props.sound !== 'false') { //eslint-disable-line no-lonely-if
                formattedMessageProps = {
                    id: t('user.settings.notifications.desktop.allSound'),
                    defaultMessage: 'For all activity, with sound',
                };
            } else if (hasSoundOption && this.props.sound === 'false') {
                formattedMessageProps = {
                    id: t('user.settings.notifications.desktop.allNoSound'),
                    defaultMessage: 'For all activity, without sound',
                };
            } else {
                formattedMessageProps = {
                    id: t('user.settings.notifications.desktop.allSoundHidden'),
                    defaultMessage: 'For all activity',
                };
            }
        }

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.notifications.desktop.title', 'Desktop Notifications')}
                describe={<FormattedMessage {...formattedMessageProps}/>}
                focused={this.props.focused}
                section={'desktop'}
                updateSection={this.handleMinUpdateSection}
            />
        );
    }

    componentDidUpdate() {
        this.blurDropdown();
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
    selectedSound: PropTypes.string,
};
