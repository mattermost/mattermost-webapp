// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserProfile, UserNotifyProps} from 'mattermost-redux/types/users';

import {updateMe} from 'mattermost-redux/actions/users';

import Constants, {NotificationLevels} from 'utils/constants';
import * as Utils from 'utils/utils';
import SettingItemMax from 'components/setting_item_max';
import SettingItemMin from 'components/setting_item_min';

import DesktopNotificationSettings from './desktop_notification_settings';
import EmailNotificationSetting from './email_notification_setting';
import ManageAutoResponder from './manage_auto_responder';

export interface Props {
    user: UserProfile & {
        notify_props: UserProfile['notify_props'] & {
            auto_responder_active?: 'true' | 'false';
            auto_responder_message?: string;
        };
    };
    updateSection: (section: string) => void;
    activeSection: string;
    closeModal: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    collapseModal: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    sendPushNotifications: boolean;
    enableAutoResponder: boolean;
    actions: {
        updateMe: typeof updateMe;
    };
}

interface State {
    enableEmail: UserNotifyProps['email'];
    desktopSound: UserNotifyProps['desktop_sound'];
    desktopActivity: UserNotifyProps['desktop'];
    pushActivity: UserNotifyProps['push'];
    pushStatus: UserNotifyProps['push_status'];
    notifyCommentsLevel: UserNotifyProps['comments'];
    markUnread: UserNotifyProps['mark_unread'];
    autoResponderActive: boolean;
    autoResponderMessage: ReturnType<typeof Utils.localizeMessage>;
    usernameKey: boolean;
    customKeys: string;
    customKeysChecked: boolean;
    firstNameKey: boolean;
    channelKey: boolean;
    serverError?: any;
    isSaving: boolean;
    customcheckChecked: boolean;
}

function getNotificationsStateFromProps(props: Props): State {
    const user = props.user;

    let desktop: State['desktopActivity'] = NotificationLevels.MENTION;
    let sound: State['desktopSound'] = 'true';
    let comments: State['notifyCommentsLevel'] = 'never';
    let enableEmail: State['enableEmail'] = 'true';
    let pushActivity: State['pushActivity'] = NotificationLevels.MENTION;
    let pushStatus: State['pushStatus'] = Constants.UserStatuses.AWAY;
    let markUnread: State['markUnread'] = NotificationLevels.MENTION;

    let autoResponderActive = false;
    let autoResponderMessage: State['autoResponderMessage'] = Utils.localizeMessage(
        'user.settings.notifications.autoResponderDefault',
        'Hello, I am out of office and unable to respond to messages.'
    );

    if (user.notify_props) {
        if (user.notify_props.desktop) {
            desktop = user.notify_props.desktop;
        }
        if (user.notify_props.desktop_sound) {
            sound = user.notify_props.desktop_sound;
        }
        if (user.notify_props.comments) {
            comments = user.notify_props.comments;
        }
        if (user.notify_props.email) {
            enableEmail = user.notify_props.email;
        }
        if (user.notify_props.push) {
            pushActivity = user.notify_props.push;
        }
        if (user.notify_props.push_status) {
            pushStatus = user.notify_props.push_status;
        }

        if (user.notify_props.mark_unread) {
            markUnread = user.notify_props.mark_unread;
        }

        if (user.notify_props.auto_responder_active) {
            autoResponderActive = user.notify_props.auto_responder_active === 'true';
        }

        if (user.notify_props.auto_responder_message) {
            autoResponderMessage = user.notify_props.auto_responder_message;
        }
    }

    let usernameKey: State['usernameKey'] = false;
    let customKeys: State['customKeys'] = '';
    let firstNameKey: State['firstNameKey'] = false;
    let channelKey: State['channelKey'] = false;

    if (user.notify_props) {
        if (user.notify_props.mention_keys) {
            const keys = user.notify_props.mention_keys.split(',');

            if (keys.indexOf(user.username) === -1) {
                usernameKey = false;
            } else {
                usernameKey = true;
                keys.splice(keys.indexOf(user.username), 1);
                if (keys.indexOf(`@${user.username}`) !== -1) {
                    keys.splice(keys.indexOf(`@${user.username}`), 1);
                }
            }

            customKeys = keys.join(',');
        }

        if (user.notify_props.first_name) {
            firstNameKey = user.notify_props.first_name === 'true';
        }

        if (user.notify_props.channel) {
            channelKey = user.notify_props.channel === 'true';
        }
    }

    return {
        desktopActivity: desktop,
        enableEmail,
        pushActivity,
        pushStatus,
        desktopSound: sound,
        usernameKey,
        customKeys,
        customKeysChecked: customKeys.length > 0,
        firstNameKey,
        channelKey,
        autoResponderActive,
        autoResponderMessage,
        notifyCommentsLevel: comments,
        isSaving: false,
        markUnread,
        customcheckChecked: false,
    };
}

export default class NotificationsTab extends React.PureComponent<Props, State> {
    private custommentions: React.RefObject<HTMLInputElement>;
    constructor({activeSection = '', ...restProps}: Props) {
        super({activeSection, ...restProps});

        this.state = getNotificationsStateFromProps({activeSection, ...restProps});
        this.custommentions = React.createRef();
    }

    handleSubmit = (): void => {
        const mentionKeys = [];
        if (this.state.usernameKey) {
            mentionKeys.push(this.props.user.username);
        }

        let stringKeys = mentionKeys.join(',');
        if (this.state.customKeys.length > 0 && this.state.customKeysChecked) {
            stringKeys += ',' + this.state.customKeys;
        }

        const data: any = {
            email: this.state.enableEmail,
            desktop_sound: this.state.desktopSound,
            desktop: this.state.desktopActivity,
            push: this.state.pushActivity,
            push_status: this.state.pushStatus,
            comments: this.state.notifyCommentsLevel,
            mark_unread: this.state.markUnread,
            first_name: this.state.firstNameKey ? 'true' : 'false',
            channel: this.state.channelKey ? 'true' : 'false',
            mention_keys: stringKeys,
        };

        if (!data.auto_responder_message || data.auto_responder_message === '') {
            data.auto_responder_message = Utils.localizeMessage(
                'user.settings.notifications.autoResponderDefault',
                'Hello, I am out of office and unable to respond to messages.'
            );
        }

        this.setState({isSaving: true});

        const updateProgress = this.props.actions.updateMe({notify_props: data} as any);
        Promise.resolve(updateProgress).then(({data: result, error: err}: any) => {
            if (result) {
                this.handleUpdateSection('');
                this.setState(getNotificationsStateFromProps(this.props));
            } else if (err) {
                this.setState({serverError: err.message, isSaving: false});
            }
        });
    }

    handleCancel = (e?: React.SyntheticEvent<HTMLElement>): void => {
        if (e) {
            e.preventDefault();
        }
        this.setState(getNotificationsStateFromProps(this.props));
    }

    handleUpdateSection = (section: string): void => {
        if (section) {
            this.props.updateSection(section);
        } else {
            this.props.updateSection('');
        }
        this.setState({isSaving: false});
        this.handleCancel();
    };

    setStateValue = (key: string | null, value: string | boolean | null): void => {
        if (key) {
            const data: any = {};
            data[key] = value;
            this.setState(data);
        }
    }

    handleNotifyCommentsRadio(notifyCommentsLevel: State['notifyCommentsLevel']): void {
        this.setState({notifyCommentsLevel});
    }

    handlePushRadio(pushActivity: State['pushActivity']): void {
        this.setState({pushActivity});
    }

    handlePushStatusRadio(pushStatus: State['pushStatus']): void {
        this.setState({pushStatus});
    }

    handleEmailRadio = (enableEmail: State['enableEmail']): void => {
        this.setState({enableEmail});
    }

    updateUsernameKey = (val: State['usernameKey']): void => {
        this.setState({usernameKey: val});
    }

    updateFirstNameKey = (val: State['firstNameKey']): void => {
        this.setState({firstNameKey: val});
    }

    updateChannelKey = (val: State['channelKey']): void => {
        this.setState({channelKey: val});
    }

    updateCustomMentionKeys = (): void => {
        const checked = this.state.customcheckChecked;

        if (checked && this.custommentions.current) {
            const text = this.custommentions.current.value;

            // remove all spaces and split string into individual keys
            this.setState({customKeys: text.replace(/ /g, ''), customKeysChecked: true});
        } else {
            this.setState({customKeys: '', customKeysChecked: false});
        }
    }

    onCustomChange = (): void => {
        this.setState({customcheckChecked: true});
        this.updateCustomMentionKeys();
    }

    createPushNotificationSection = (): JSX.Element => {
        if (this.props.activeSection === 'push') {
            const inputs: JSX.Element[] = [];
            let extraInfo: JSX.Element = <></>;
            const submit = this.handleSubmit;

            if (this.props.sendPushNotifications) {
                const pushActivityRadio = [false, false, false];
                if (this.state.pushActivity === NotificationLevels.ALL) {
                    pushActivityRadio[0] = true;
                } else if (this.state.pushActivity === NotificationLevels.NONE) {
                    pushActivityRadio[2] = true;
                } else {
                    pushActivityRadio[1] = true;
                }

                const pushStatusRadio = [false, false, false];
                if (this.state.pushStatus === Constants.UserStatuses.ONLINE) {
                    pushStatusRadio[0] = true;
                } else if (this.state.pushStatus === Constants.UserStatuses.AWAY) {
                    pushStatusRadio[1] = true;
                } else {
                    pushStatusRadio[2] = true;
                }

                let pushStatusSettings: JSX.Element = <></>;
                if (this.state.pushActivity !== NotificationLevels.NONE) {
                    pushStatusSettings = (
                        <fieldset>
                            <legend className='form-legend'>
                                <FormattedMessage
                                    id='user.settings.notifications.push_notification.status'
                                    defaultMessage='Trigger push notifications when'
                                />
                            </legend>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='pushNotificationOnline'
                                        type='radio'
                                        name='pushNotificationStatus'
                                        checked={pushStatusRadio[0]}
                                        onChange={this.handlePushStatusRadio.bind(this, Constants.UserStatuses.ONLINE)}
                                    />
                                    <FormattedMessage
                                        id='user.settings.push_notification.online'
                                        defaultMessage='Online, away or offline'
                                    />
                                </label>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='pushNotificationAway'
                                        type='radio'
                                        name='pushNotificationStatus'
                                        checked={pushStatusRadio[1]}
                                        onChange={this.handlePushStatusRadio.bind(this, Constants.UserStatuses.AWAY)}
                                    />
                                    <FormattedMessage
                                        id='user.settings.push_notification.away'
                                        defaultMessage='Away or offline'
                                    />
                                </label>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='pushNotificationOffline'
                                        type='radio'
                                        name='pushNotificationStatus'
                                        checked={pushStatusRadio[2]}
                                        onChange={this.handlePushStatusRadio.bind(this, Constants.UserStatuses.OFFLINE)}
                                    />
                                    <FormattedMessage
                                        id='user.settings.push_notification.offline'
                                        defaultMessage='Offline'
                                    />
                                </label>
                            </div>
                        </fieldset>
                    );

                    extraInfo = (
                        <span>
                            <FormattedMessage
                                id='user.settings.push_notification.status_info'
                                defaultMessage='Notification alerts are only pushed to your mobile device when your online status matches the selection above.'
                            />
                        </span>
                    );
                }

                inputs.push(
                    <div>
                        <fieldset key='userNotificationLevelOption'>
                            <legend className='form-legend'>
                                <FormattedMessage
                                    id='user.settings.push_notification.send'
                                    defaultMessage='Send mobile push notifications'
                                />
                            </legend>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='pushNotificationAllActivity'
                                        type='radio'
                                        name='pushNotificationLevel'
                                        checked={pushActivityRadio[0]}
                                        onChange={this.handlePushRadio.bind(this, NotificationLevels.ALL)}
                                    />
                                    <FormattedMessage
                                        id='user.settings.push_notification.allActivity'
                                        defaultMessage='For all activity'
                                    />
                                </label>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='pushNotificationMentions'
                                        type='radio'
                                        name='pushNotificationLevel'
                                        checked={pushActivityRadio[1]}
                                        onChange={this.handlePushRadio.bind(this, NotificationLevels.MENTION)}
                                    />
                                    <FormattedMessage
                                        id='user.settings.push_notification.onlyMentions'
                                        defaultMessage='For mentions and direct messages'
                                    />
                                </label>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='pushNotificationNever'
                                        type='radio'
                                        name='pushNotificationLevel'
                                        checked={pushActivityRadio[2]}
                                        onChange={this.handlePushRadio.bind(this, NotificationLevels.NONE)}
                                    />
                                    <FormattedMessage
                                        id='user.settings.notifications.never'
                                        defaultMessage='Never'
                                    />
                                </label>
                            </div>
                            <div className='mt-5'>
                                <FormattedMessage
                                    id='user.settings.push_notification.info'
                                    defaultMessage='Notification alerts are pushed to your mobile device when there is activity in Mattermost.'
                                />
                            </div>
                        </fieldset>
                        <hr/>
                        {pushStatusSettings}
                    </div>
                );
            } else {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='pt-2'
                    >
                        <FormattedMessage
                            id='user.settings.push_notification.disabled_long'
                            defaultMessage='Push notifications have not been enabled by your System Administrator.'
                        />
                    </div>
                );
            }

            return (
                <SettingItemMax
                    title={Utils.localizeMessage('user.settings.notifications.push', 'Mobile Push Notifications')}
                    extraInfo={extraInfo}
                    inputs={inputs}
                    submit={submit}
                    server_error={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let describe: string | JSX.Element = '';
        if (this.state.pushActivity === NotificationLevels.ALL) {
            if (this.state.pushStatus === Constants.UserStatuses.AWAY) {
                describe = (
                    <FormattedMessage
                        id='user.settings.push_notification.allActivityAway'
                        defaultMessage='For all activity when away or offline'
                    />
                );
            } else if (this.state.pushStatus === Constants.UserStatuses.OFFLINE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.push_notification.allActivityOffline'
                        defaultMessage='For all activity when offline'
                    />
                );
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.push_notification.allActivityOnline'
                        defaultMessage='For all activity when online, away or offline'
                    />
                );
            }
        } else if (this.state.pushActivity === NotificationLevels.NONE) {
            describe = (
                <FormattedMessage
                    id='user.settings.notifications.never'
                    defaultMessage='Never'
                />
            );
        } else if (this.props.sendPushNotifications) {
            if (this.state.pushStatus === Constants.UserStatuses.AWAY) { //eslint-disable-line no-lonely-if
                describe = (
                    <FormattedMessage
                        id='user.settings.push_notification.onlyMentionsAway'
                        defaultMessage='For mentions and direct messages when away or offline'
                    />
                );
            } else if (this.state.pushStatus === Constants.UserStatuses.OFFLINE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.push_notification.onlyMentionsOffline'
                        defaultMessage='For mentions and direct messages when offline'
                    />
                );
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.push_notification.onlyMentionsOnline'
                        defaultMessage='For mentions and direct messages when online, away or offline'
                    />
                );
            }
        } else {
            describe = (
                <FormattedMessage
                    id='user.settings.push_notification.disabled'
                    defaultMessage='Push notifications are not enabled'
                />
            );
        }

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.notifications.push', 'Mobile Push Notifications')}
                describe={describe}
                section={'push'}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    render(): JSX.Element {
        const serverError = this.state.serverError;
        const user = this.props.user;

        let keysSection: JSX.Element = <></>;
        if (this.props.activeSection === 'keys') {
            const inputs = [];

            if (user.first_name) {
                const handleUpdateFirstNameKey = (e: React.ChangeEvent<HTMLInputElement>) => {
                    this.updateFirstNameKey(e.target.checked);
                };
                inputs.push(
                    <div key='userNotificationFirstNameOption'>
                        <div className='checkbox'>
                            <label>
                                <input
                                    id='notificationTriggerFirst'
                                    type='checkbox'
                                    checked={this.state.firstNameKey}
                                    onChange={handleUpdateFirstNameKey}
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.sensitiveName'
                                    defaultMessage='Your case sensitive first name "{first_name}"'
                                    values={{
                                        first_name: user.first_name,
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                );
            }

            const handleUpdateUsernameKey = (e: React.ChangeEvent<HTMLInputElement>) => {
                this.updateUsernameKey(e.target.checked);
            };
            inputs.push(
                <div key='userNotificationUsernameOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='notificationTriggerUsername'
                                type='checkbox'
                                checked={this.state.usernameKey}
                                onChange={handleUpdateUsernameKey}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.sensitiveUsername'
                                defaultMessage='Your non-case sensitive username "{username}"'
                                values={{
                                    username: user.username,
                                }}
                            />
                        </label>
                    </div>
                </div>
            );

            const handleUpdateChannelKey = (e: React.ChangeEvent<HTMLInputElement>) => {
                this.updateChannelKey(e.target.checked);
            };
            inputs.push(
                <div key='userNotificationChannelOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='notificationTriggerShouts'
                                type='checkbox'
                                checked={this.state.channelKey}
                                onChange={handleUpdateChannelKey}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.channelWide'
                                defaultMessage='Channel-wide mentions "@channel", "@all", "@here"'
                            />
                        </label>
                    </div>
                </div>
            );

            inputs.push(
                <div key='userNotificationCustomOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='notificationTriggerCustom'
                                ref='customcheck'
                                type='checkbox'
                                checked={this.state.customKeysChecked}
                                onChange={this.updateCustomMentionKeys}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.sensitiveWords'
                                defaultMessage='Other non-case sensitive words, separated by commas:'
                            />
                        </label>
                    </div>
                    <input
                        id='notificationTriggerCustomText'
                        autoFocus={this.state.customKeysChecked}
                        ref={this.custommentions}
                        className='form-control mentions-input'
                        type='text'
                        defaultValue={this.state.customKeys}
                        onChange={this.onCustomChange}
                        onFocus={Utils.moveCursorToEnd}
                        aria-labelledby='notificationTriggerCustom'
                    />
                </div>
            );

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='user.settings.notifications.mentionsInfo'
                        defaultMessage='Mentions trigger when someone sends a message that includes your username (@{username}) or any of the options selected above.'
                        values={{
                            username: user.username,
                        }}
                    />
                </span>
            );

            keysSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('user.settings.notifications.wordsTrigger', 'Words That Trigger Mentions')}
                    inputs={inputs}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={serverError}
                    updateSection={this.handleUpdateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            let keys = ['@' + user.username];
            if (this.state.firstNameKey) {
                keys.push(user.first_name);
            }
            if (this.state.usernameKey) {
                keys.push(user.username);
            }

            if (this.state.channelKey) {
                keys.push('@channel');
                keys.push('@all');
                keys.push('@here');
            }
            if (this.state.customKeys.length > 0) {
                keys = keys.concat(this.state.customKeys.split(','));
            }

            let describe: string | JSX.Element = '';
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] !== '') {
                    describe += '"' + keys[i] + '", ';
                }
            }

            if (describe.length > 0) {
                describe = describe.substring(0, describe.length - 2);
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.noWords'
                        defaultMessage='No words configured'
                    />
                );
            }

            keysSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('user.settings.notifications.wordsTrigger', 'Words That Trigger Mentions')}
                    describe={describe}
                    section={'keys'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let commentsSection: JSX.Element = <></>;
        if (this.props.activeSection === 'comments') {
            const commentsActive = [false, false, false];
            if (this.state.notifyCommentsLevel === 'never') {
                commentsActive[2] = true;
            } else if (this.state.notifyCommentsLevel === 'root') {
                commentsActive[1] = true;
            } else {
                commentsActive[0] = true;
            }

            const inputs = [];

            inputs.push(
                <fieldset key='userNotificationLevelOption'>
                    <legend className='form-legend hidden-label'>
                        {Utils.localizeMessage('user.settings.notifications.comments', 'Reply notifications')}
                    </legend>
                    <div className='radio'>
                        <label>
                            <input
                                id='notificationCommentsAny'
                                type='radio'
                                name='commentsNotificationLevel'
                                checked={commentsActive[0]}
                                onChange={this.handleNotifyCommentsRadio.bind(this, 'any')}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.commentsAny'
                                defaultMessage='Trigger notifications on messages in reply threads that I start or participate in'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='notificationCommentsRoot'
                                type='radio'
                                name='commentsNotificationLevel'
                                checked={commentsActive[1]}
                                onChange={this.handleNotifyCommentsRadio.bind(this, 'root')}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.commentsRoot'
                                defaultMessage='Trigger notifications on messages in threads that I start'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='notificationCommentsNever'
                                type='radio'
                                name='commentsNotificationLevel'
                                checked={commentsActive[2]}
                                onChange={this.handleNotifyCommentsRadio.bind(this, 'never')}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.commentsNever'
                                defaultMessage="Do not trigger notifications on messages in reply threads unless I'm mentioned"
                            />
                        </label>
                    </div>
                </fieldset>
            );

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='user.settings.notifications.commentsInfo'
                        defaultMessage="In addition to notifications for when you're mentioned, select if you would like to receive notifications on reply threads."
                    />
                </span>
            );

            commentsSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('user.settings.notifications.comments', 'Reply notifications')}
                    extraInfo={extraInfo}
                    inputs={inputs}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        } else {
            let describe: string | JSX.Element = '';
            if (this.state.notifyCommentsLevel === 'never') {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.commentsNever'
                        defaultMessage="Do not trigger notifications on messages in reply threads unless I'm mentioned"
                    />
                );
            } else if (this.state.notifyCommentsLevel === 'root') {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.commentsRoot'
                        defaultMessage='Trigger notifications on messages in threads that I start'
                    />
                );
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.notifications.commentsAny'
                        defaultMessage='Trigger notifications on messages in reply threads that I start or participate in'
                    />
                );
            }

            commentsSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('user.settings.notifications.comments', 'Reply notifications')}
                    describe={describe}
                    section={'comments'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let autoResponderSection: JSX.Element = <></>;
        if (this.props.enableAutoResponder) {
            if (this.props.activeSection === 'auto-responder') {
                autoResponderSection = (
                    <div>
                        <ManageAutoResponder
                            autoResponderActive={this.state.autoResponderActive}
                            autoResponderMessage={this.state.autoResponderMessage}
                            updateSection={this.handleUpdateSection}
                            setParentState={this.setStateValue}
                            submit={this.handleSubmit}
                            error={this.state.serverError}
                            saving={this.state.isSaving}
                        />
                        <div className='divider-dark'/>
                    </div>
                );
            } else {
                const describe = this.state.autoResponderActive ? (
                    <FormattedMessage
                        id='user.settings.notifications.autoResponderEnabled'
                        defaultMessage='Enabled'
                    />
                ) : (
                    <FormattedMessage
                        id='user.settings.notifications.autoResponderDisabled'
                        defaultMessage='Disabled'
                    />
                );

                autoResponderSection = (
                    <SettingItemMin
                        title={
                            <FormattedMessage
                                id='user.settings.notifications.autoResponder'
                                defaultMessage='Automatic Direct Message Replies'
                            />
                        }
                        describe={describe}
                        section={'auto-responder'}
                        updateSection={this.handleUpdateSection}
                    />
                );
            }
        }

        const pushNotificationSection = this.createPushNotificationSection();

        return (
            <div id='notificationSettings'>
                <div className='modal-header'>
                    <button
                        id='closeButton'
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <FormattedMessage
                                id='generic_icons.collapse'
                                defaultMessage='Collapse Icon'
                            >
                                {(title) => (
                                    <i
                                        className='fa fa-angle-left'
                                        title={title ? title.toString() : ''}
                                        onClick={this.props.collapseModal}
                                    />
                                )}
                            </FormattedMessage>
                        </div>
                        <FormattedMessage
                            id='user.settings.notifications.title'
                            defaultMessage='Notification Settings'
                        />
                    </h4>
                </div>
                <div
                    ref='wrapper'
                    className='user-settings'
                >
                    <h3
                        id='notificationSettingsTitle'
                        className='tab-header'
                    >
                        <FormattedMessage
                            id='user.settings.notifications.header'
                            defaultMessage='Notifications'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    <DesktopNotificationSettings
                        activity={this.state.desktopActivity}
                        sound={this.state.desktopSound}
                        updateSection={this.handleUpdateSection}
                        setParentState={this.setStateValue}
                        submit={this.handleSubmit}
                        saving={this.state.isSaving}
                        cancel={this.handleCancel}
                        error={this.state.serverError}
                        active={this.props.activeSection === 'desktop'}
                    />
                    <div className='divider-light'/>
                    <EmailNotificationSetting
                        activeSection={this.props.activeSection}
                        updateSection={this.handleUpdateSection}
                        enableEmail={this.state.enableEmail === 'true'}
                        onSubmit={this.handleSubmit}
                        onCancel={this.handleCancel}
                        onChange={this.handleEmailRadio}
                        saving={this.state.isSaving}
                        serverError={this.state.serverError}
                    />
                    <div className='divider-light'/>
                    {pushNotificationSection}
                    <div className='divider-light'/>
                    {keysSection}
                    <div className='divider-light'/>
                    {commentsSection}
                    <div className='divider-light'/>
                    {autoResponderSection}
                    <div className='divider-dark'/>
                </div>
            </div>

        );
    }
}
