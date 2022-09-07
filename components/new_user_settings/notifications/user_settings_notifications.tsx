// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC, useEffect, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect, {ValueType} from 'react-select';

import './user_settings_notifications.scss';
import {useDispatch, useSelector} from 'react-redux';

import Constants, {NotificationLevels, Preferences} from 'utils/constants';
import GenericSectionCreator1 from '../generic_section_creator';
import * as Utils from 'utils/utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {updateMe} from 'mattermost-redux/actions/users';
import {UserNotifyProps} from '@mattermost/types/users';
import {localizeMessage} from 'utils/utils';

import SaveChangesPanel from '../../user_settings/generic/save_changes_panel';

import {NOTIFICATION_CONSTANTS} from './constants';
import ChipComponent from './chip_component';

type SelectedOption = {
    value: string;
    label: string;
};

const UserSettingsNotifications: FC = () => {
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const user = useSelector(getCurrentUser);
    const dispatch = useDispatch();
    const desktopThreadRef = useRef<any>();
    const enableEmailRef = useRef<any>();
    const checkboxRef = useRef<any>();
    const autoRepliesRef = useRef<any>();
    const firstNameKeyRef = useRef<any>();

    const getNotificationsStateFromProps = () => {
        let desktop = NotificationLevels.MENTION as
            | 'default'
            | 'all'
            | 'mention'
            | 'none';
        let desktopThreads = NotificationLevels.ALL as
            | 'default'
            | 'all'
            | 'mention'
            | 'none';
        let pushThreads = NotificationLevels.ALL;
        let emailThreads = NotificationLevels.ALL;
        let markUnread = NotificationLevels.ALL as 'all' | 'mention';
        let sound = 'true';
        let desktopNotificationSound = 'Bing';
        let comments = 'never' as 'never' | 'root' | 'any';
        let enableEmail = 'true' as 'true' | 'false';
        let pushActivity = NotificationLevels.MENTION as
            | 'default'
            | 'all'
            | 'mention'
            | 'none';
        let pushStatus = Constants.UserStatuses.AWAY as
            | 'ooo'
            | 'offline'
            | 'away'
            | 'online'
            | 'dnd';
        let autoResponderActive = false;
        let autoResponderMessage = Utils.localizeMessage(
            'user.settings.notifications.autoResponderDefault',
            'Hello, I am out of office and unable to respond to messages.',
        );
        let sendEmailNotifications = 60 * 60;

        if (user.notify_props) {
            if (user.notify_props.desktop) {
                desktop = user.notify_props.desktop;
            }
            if (user.notify_props.desktop_threads) {
                desktopThreads = user.notify_props.desktop_threads;
            }
            if (user.notify_props.push_threads) {
                pushThreads = user.notify_props.push_threads;
            }
            if (user.notify_props.email_threads) {
                emailThreads = user.notify_props.email_threads;
            }
            if (user.notify_props.desktop_sound) {
                sound = user.notify_props.desktop_sound;
            }
            if (user.notify_props.desktop_notification_sound) {
                desktopNotificationSound =
                    user.notify_props.desktop_notification_sound;
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

            if (user.notify_props.auto_responder_active) {
                autoResponderActive =
                    user.notify_props.auto_responder_active === 'true';
            }

            if (user.notify_props.auto_responder_message) {
                autoResponderMessage = user.notify_props.auto_responder_message;
            }

            if (user.notify_props.mark_unread) {
                markUnread = user.notify_props.mark_unread;
            }

            if (user.notify_props.sendEmailNotifications) {
                sendEmailNotifications =
                    user.notify_props.sendEmailNotifications;
            }
        }

        let usernameKey = false;
        let customKeys = '';
        let firstNameKey = 'false' as 'true' | 'false';
        let channelKey = 'false' as 'true' | 'false';
        let useSameAsDesktop = 'true' as 'true' | 'false';

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
                firstNameKey =
                    user.notify_props.first_name === 'true' ? 'true' : 'false';
            }

            if (user.notify_props.channel) {
                channelKey =
                    user.notify_props.channel === 'true' ? 'true' : 'false';
            }
            if (user.notify_props.mobileNotificationsSameAsDesktop) {
                useSameAsDesktop =
                    user.notify_props.mobileNotificationsSameAsDesktop;
            }
        }

        return {
            desktopActivity: desktop,
            desktopThreads,
            pushThreads,
            emailThreads,
            enableEmail,
            pushActivity,
            pushStatus,
            desktopSound: sound,
            desktopNotificationSound,
            usernameKey,
            customKeys,
            customKeysChecked: customKeys.length > 0,
            firstNameKey,
            channelKey,
            autoResponderActive,
            autoResponderMessage,
            notifyCommentsLevel: comments,
            isSaving: false,
            useSameAsDesktop,
            keywords: '',
            submit: false,
            markUnread,
            sendEmailNotifications,
        };
    };

    const {
        desktopActivity,
        desktopThreads,
        pushThreads,
        emailThreads,
        enableEmail,
        pushActivity,
        pushStatus,
        desktopSound,
        desktopNotificationSound,
        usernameKey,
        channelKey,
        autoResponderActive,
        autoResponderMessage,
        notifyCommentsLevel,
        useSameAsDesktop,
        keywords,
        markUnread,
        sendEmailNotifications,
        customKeys,
        firstNameKey,
    } = getNotificationsStateFromProps();

    const [DesktopActivity, setDesktopActivity] = useState(desktopActivity);
    const [DesktopThreads, setDesktopThreads] = useState(desktopThreads);
    const [PushThreads, setPushThreads] = useState(pushThreads);
    const [EmailThreads, setEmailThreads] = useState(emailThreads);
    const [EnableEmail, setEnableEmail] = useState(enableEmail);
    const [PushActivity, setPushActivity] = useState(pushActivity);
    const [PushStatus, setPushStatus] = useState(pushStatus);
    const [DesktopSound, setDesktopSound] = useState(desktopSound);
    const [DesktopNotificationSound, setDesktopNotificationSound] =
        useState<any>({
            label: desktopNotificationSound,
            value: desktopNotificationSound,
        });
    const [UsernameKey, setUsernameKey] = useState(usernameKey);
    const [ChannelKey, setChannelKey] = useState(channelKey);
    const [AutoResponderActive, setAutoResponderActive] =
        useState(autoResponderActive);
    const [AutoResponderMessage, setAutoResponderMessage] =
        useState(autoResponderMessage);
    const [NotifyCommentsLevel, setNotifyCommentsLevel] =
        useState(notifyCommentsLevel);
    const [UseSameAsDesktop, setUseSameAsDesktop] = useState(useSameAsDesktop);
    const [Keywords, setKeywords] = useState(keywords);
    const [MarkUnread, setMarkUnread] = useState(markUnread);
    const [SendEmailNotifications, setSendEmailNotifications] = useState(
        sendEmailNotifications,
    );
    const [CustomKeys, setCustomKeys] = useState(customKeys);
    const [FirstNameKey, setFirstNameKey] = useState(firstNameKey);
    console.log(CustomKeys);

    const handleCancel = () => {

    };

    const handleSubmit = () => {
        const data: UserNotifyProps = {
            email: EnableEmail,
            desktop_sound: DesktopSound,
            mobileNotificationsSameAsDesktop: UseSameAsDesktop,

            // if (!isDesktopApp() || (window.desktop && semver.gte(window.desktop.version, '4.6.0'))) {
            //     desktop_notification_sound = this.state.desktopNotificationSound;
            // }
            desktop: DesktopActivity,
            desktop_threads: DesktopThreads,
            desktop_notification_sound: DesktopNotificationSound,
            email_threads: EmailThreads,
            push_threads: PushThreads,
            push: PushActivity,
            push_status: PushStatus,
            comments: NotifyCommentsLevel,
            auto_responder_active: AutoResponderActive.toString(),
            auto_responder_message: AutoResponderMessage,
            mark_unread: MarkUnread,

            first_name: FirstNameKey,
            channel: ChannelKey,
            sendEmailNotifications: SendEmailNotifications as any,
            mention_keys: '',

            // this.setState({isSaving: true});
        };
        if (
            !data.auto_responder_message ||
            data.auto_responder_message === ''
        ) {
            data.auto_responder_message = Utils.localizeMessage(
                'user.settings.notifications.autoResponderDefault',
                'Hello, I am out of office and unable to respond to messages.',
            );
        }

        const mentionKeys = [];
        if (UsernameKey) {
            mentionKeys.push(user.username);
        }

        let stringKeys = mentionKeys.join(',');
        if (CustomKeys.length > 0) {
            stringKeys += ',' + CustomKeys;
        }
        data.mention_keys = stringKeys;

        dispatch(updateMe({...user, notify_props: data}));
    };

    useEffect(() => {
        getNotificationsStateFromProps();
        console.log(DesktopActivity);
    }, [DesktopActivity]);

    useEffect(() => {
        if (CustomKeys === ',') {
            setCustomKeys('');
        }
    }, [CustomKeys]);

    const handleDesktopActivityChange = (e: string) => {
        setUnsavedChanges(true);
        if (e === NOTIFICATION_CONSTANTS.ALL_NEW_MESSAGES) {
            setDesktopActivity('all');
        } else if (e === NOTIFICATION_CONSTANTS.MENTION) {
            setDesktopActivity('mention');
        } else if (e === NOTIFICATION_CONSTANTS.NONE) {
            setDesktopActivity('none');
        }
    };

    const handleMobileActivityChange = (e: string) => {
        setUnsavedChanges(true);
        if (e === NOTIFICATION_CONSTANTS.ALL_NEW_MESSAGES) {
            setPushActivity('all');
        } else if (e === NOTIFICATION_CONSTANTS.MENTION) {
            setPushActivity('mention');
        } else if (e === NOTIFICATION_CONSTANTS.NONE) {
            setPushActivity('none');
        }
    };

    const handleDesktopThreadsChange = (e: any) => {
        setUnsavedChanges(true);
        const checked = desktopThreadRef.current.checked;
        checked ? setDesktopThreads('all') : setDesktopThreads('none');
    };

    const handleEnableSoundNotificationChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setUnsavedChanges(true);
        const checked = e.target.checked;
        setDesktopSound(checked.toString());
    };

    const sounds = Array.from(Utils.notificationSounds.keys());
    const options = sounds.map((sound) => {
        return {value: sound, label: sound};
    });

    const handleDesktopSoundsChange = (
        selectedOption: ValueType<SelectedOption>,
    ) => {
        setUnsavedChanges(true);
        setDesktopNotificationSound(selectedOption);
    };

    const handleUseSameAsDesktopChange = () => {
        setUnsavedChanges(true);
        const checked = checkboxRef.current.checked;
        checked ? setUseSameAsDesktop('true') : setUseSameAsDesktop('false');
    };

    const handleMobileStatusSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setUnsavedChanges(true);
        if (e.target.value === NOTIFICATION_CONSTANTS.ONLINE) {
            setPushStatus(Constants.UserStatuses.ONLINE as any);
        } else if (e.target.value === NOTIFICATION_CONSTANTS.AWAY) {
            setPushStatus(Constants.UserStatuses.AWAY as any);
        } else if (e.target.value === NOTIFICATION_CONSTANTS.OFFLINE) {
            setPushStatus(Constants.UserStatuses.OFFLINE as any);
        }
    };

    const handleEnableEmailChange = () => {
        setUnsavedChanges(true);
        const checked = enableEmailRef.current.checked;
        setEnableEmail(checked.toString());
    };

    const handleEmailNotificationsChange = (e: any) => {
        console.log(e);
        setUnsavedChanges(true);
        if (e === NOTIFICATION_CONSTANTS.IMMEDIATELY) {
            setSendEmailNotifications(Preferences.INTERVAL_IMMEDIATE as any);
        } else if (e === NOTIFICATION_CONSTANTS.FIFTEEN_MINUTES) {
            setSendEmailNotifications(
                Preferences.INTERVAL_FIFTEEN_MINUTES as any,
            );
        } else if (e === NOTIFICATION_CONSTANTS.EVERY_HOUR) {
            setSendEmailNotifications(Preferences.INTERVAL_HOUR as any);
        }
    };

    const hadleMobileThreadsChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setUnsavedChanges(true);
        setPushThreads(
            e.target.checked ? NotificationLevels.ALL : NotificationLevels.NONE,
        );
    };

    const handleAutoRepliesChange = () => {
        // setSomethingChanged(true);
        const checked = autoRepliesRef.current.checked;
        setAutoResponderActive(checked);
    };
    console.log(CustomKeys);

    const handleAutoResponderMessageChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setUnsavedChanges(true);
        setAutoResponderMessage(e.target.value);
    };

    const handleChannelKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnsavedChanges(true);
        setChannelKey(e.target.checked ? 'true' : 'false');
    };

    const handleUserNameKeyChange = (e: any) => {
        setUnsavedChanges(true);
        const checked = firstNameKeyRef.current.checked;
        setUsernameKey(checked);
    };

    const sameAsDesktop = UseSameAsDesktop === 'true';
    return (
        <>
            {GenericSectionCreator1({
                title: {
                    id: 'user.settings.notifications.DesktopAndWebNotifications',
                    message: 'Desktop & web notifications',
                    titleClassname: 'font-16-weight-600 Pb-8',
                },
                description: {
                    id: 'user.settings.notifications.availableOnOptions',
                    message:
                        'Available on Chrome, Edge, Firefox, and the Mattermost Desktop App.',
                    descriptionClassname:
                        'section-description font-12-weight-400 Pb-24',
                },
                subSection: {
                    radio: [
                        [
                            {
                                title: {
                                    id: 'user.settings.notifications.Notify',
                                    message: 'Notify me about…',
                                    radioTitleClassname:
                                        'font-12-weight-600 Pb-6',
                                },
                                id: 'user.settings.notifications.allnewMessages',
                                message: 'All new messages',
                                checked:
                                    DesktopActivity === NotificationLevels.ALL,
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.notifications.mention&directMessages',
                                message:
                                    'Mentions, direct messages, and keywords only',
                                checked:
                                    DesktopActivity ===
                                    NotificationLevels.MENTION,
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.notifications.nothing',
                                message: 'Nothing',
                                checked:
                                    DesktopActivity === NotificationLevels.NONE,
                                radioContentClassname: 'Pb-14',
                            },
                        ],
                    ],
                    checkbox: [
                        {
                            title: {
                                id: 'user.settings.notifications.threads.desktop',
                                message: 'Thread reply notifications',
                                checkboxTitleClassname:
                                    'font-12-weight-600 Pb-6',
                            },
                            id: 'user.settings.notifications.threadsFollowing',
                            message:
                                'Notify me about replies to threads I’m following',
                            checked: DesktopThreads === NotificationLevels.ALL,
                            ref: desktopThreadRef,
                            checkBoxContentClassname: 'Pb-14',
                        },
                    ],
                },
                onRadioChange: handleDesktopActivityChange,
                onCheckBoxChange: handleDesktopThreadsChange,
                xtraInfo: (
                    <div>
                        <div className='font-12-weight-600 Pb-3'>
                            <FormattedMessage
                                id='user.settings.notifications.sounds'
                                defaultMessage='Sounds'
                            />
                        </div>
                        <div
                            className={`checkbox Inline-block ${
                                DesktopSound === 'true' ? '' : 'Pb-12 Pt-4'
                            }`}
                        >
                            <label>
                                <input
                                    type='checkbox'
                                    checked={DesktopSound === 'true'}
                                    onChange={
                                        handleEnableSoundNotificationChange
                                    }
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.enableNotification'
                                    defaultMessage='Enable notification sounds'
                                />
                            </label>
                        </div>
                        {DesktopSound === 'true' && (
                            <div className='Inline-block'>
                                <ReactSelect
                                    className='notification-sound-dropdown'
                                    classNamePrefix='react-select'
                                    id='displaySoundNotification'
                                    options={options}
                                    clearable={false}
                                    onChange={handleDesktopSoundsChange}
                                    value={DesktopNotificationSound}
                                    isSearchable={false}
                                />
                            </div>
                        )}
                    </div>
                ),
            })}
            {GenericSectionCreator1({
                title: {
                    id: 'user.settings.notifications.mobileNotifications',
                    message: 'Mobile notifications',
                    titleClassname: 'Pb-24 Pt-24 font-16-weight-600 Pb-8',
                },
                description: {
                    id: 'user.settings.notifications.pushAlerts',
                    message:
                        'Notification alerts are pushed to your mobile device when there is activity in Mattermost.',
                    descriptionClassname:
                        'section-description font-12-weight-400 Pb-14',
                },
                subSection: {
                    checkBoxBeforeRadio: true,
                    checkbox: [
                        {
                            id: 'user.settings.notifications.sameAsDesktop',
                            message:
                                'Use the same notification settings as desktop',
                            checked: UseSameAsDesktop === 'true',
                            ref: checkboxRef,
                        },
                    ],
                    radio: [
                        [
                            {
                                title: {
                                    id: 'user.settings.notifications.Notify',
                                    message: 'Notify me about…',
                                    radioTitleClassname:
                                        'font-12-weight-600 Pb-6 Pt-14',
                                },
                                id: 'user.settings.notifications.allnewMessages',
                                message: 'All new messages',
                                checked:
                                    UseSameAsDesktop === 'true' ? DesktopActivity ===
                                          NotificationLevels.ALL : PushActivity ===
                                          NotificationLevels.ALL,
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.notifications.mention&directMessages',
                                message:
                                    'Mentions, direct messages, and keywords only',
                                checked:
                                    UseSameAsDesktop === 'true' ? DesktopActivity ===
                                          NotificationLevels.MENTION : PushActivity ===
                                          NotificationLevels.MENTION,
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.notifications.nothing',
                                message: 'Nothing',
                                checked:
                                    UseSameAsDesktop === 'true' ? DesktopActivity ===
                                          NotificationLevels.NONE : PushActivity ===
                                          NotificationLevels.NONE,
                                radioContentClassname: 'Pb-14',
                            },
                        ],
                    ],
                },
                onCheckBoxChange: handleUseSameAsDesktopChange,
                onRadioChange: handleMobileActivityChange,
                showRadioSection: !sameAsDesktop,
                xtraInfo: (
                    <div className='Pb-24'>
                        {UseSameAsDesktop === 'false' && (
                            <div>
                                <div className='font-12-weight-600 Pb-6'>
                                    <FormattedMessage
                                        id='user.settings.notifications.threads.desktop'
                                        defaultMessage='Thread reply notifications'
                                    />
                                </div>
                                <div className='checkbox'>
                                    <label>
                                        <input
                                            id={name + 'C'}
                                            type='checkbox'

                                            // name={name}
                                            checked={
                                                sameAsDesktop ? DesktopThreads ===
                                                      NotificationLevels.ALL : PushThreads ===
                                                      NotificationLevels.ALL
                                            }
                                            onChange={hadleMobileThreadsChange}
                                        />
                                        <FormattedMessage
                                            id='user.settings.notifications.threadsFollowing'
                                            defaultMessage='Notify me about replies to threads I’m following'
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                        <div className='font-12-weight-600 Pt-14 Pb-14'>
                            <FormattedMessage
                                id='user.settings.notifications.triggerMobileNotifications'
                                defaultMessage='Only trigger mobile notifications when I am…'
                            />
                        </div>
                        <select
                            value={
                                PushStatus === Constants.UserStatuses.ONLINE ? NOTIFICATION_CONSTANTS.ONLINE : PushStatus ===
                                      Constants.UserStatuses.OFFLINE ? NOTIFICATION_CONSTANTS.OFFLINE : NOTIFICATION_CONSTANTS.AWAY
                            }
                            onChange={handleMobileStatusSelectChange}
                            className='pushNotificationStatusSelect'
                            name='pushNotificationStatus'
                            id='pushNotificationStatus'
                        >
                            <option
                                className='font14-weight-600'

                                // value={Constants.UserStatuses.ONLINE}
                            >
                                Online, away or offline
                            </option>
                            <option
                                className='font14-weight-600'

                                // value={Constants.UserStatuses.AWAY}
                            >
                                Away or offline
                            </option>
                            <option
                                className='font14-weight-600'

                                // value={Constants.UserStatuses.OFFLINE}
                            >
                                Offline
                            </option>
                        </select>
                    </div>
                ),
            })}
            {GenericSectionCreator1({
                title: {
                    id: 'user.settings.notifications.emailNotification',
                    message: 'Email Notifications',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-8',
                },
                description: {
                    id: 'user.settings.notifications.emailInfo',
                    message:
                        'Email notifications are sent for mentions and direct messages when you are offline or away for more than 5 minutes.',

                    descriptionClassname:
                        'section-description Pb-14 font-12-weight-400',
                },
                subSection: {
                    checkBoxBeforeRadio: true,
                    checkbox: [
                        {
                            id: 'admin.environment.notifications.enable.label',
                            message: 'Enable email notifications',
                            checked: EnableEmail === 'true',
                            ref: enableEmailRef,
                            checkBoxContentClassname: 'Pb-14',
                        },
                    ],
                    radio: [
                        [
                            {
                                title: {
                                    id: 'user.settings.notifications.email.send',
                                    message: 'Send email notifications',
                                    radioTitleClassname: 'font-12-weight-600',
                                },
                                id: 'user.settings.notifications.email.immediately',
                                message: 'Immediately',
                                checked: SendEmailNotifications === 30,
                                radioContentClassname: 'Mt-8',
                            },
                            {
                                id: 'user.settings.notifications.email.every15Min',
                                message: 'Once every 15 minutes',
                                checked: SendEmailNotifications === 15 * 60,
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.notifications.email.everyHour',
                                message: 'Once every hour',
                                checked: SendEmailNotifications === 60 * 60,
                                radioContentClassname: 'Pb-14',
                            },
                        ],
                    ],
                },
                onCheckBoxChange: handleEnableEmailChange,
                onRadioChange: handleEmailNotificationsChange,
            })}
            {GenericSectionCreator1({
                title: {
                    id: 'user.settings.notifications.keyWords',
                    message: 'Keywords that trigger mentions',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-8',
                },
                description: {
                    id: 'user.settings.notifications.Mentions',
                    message:
                        'Mentions trigger notifications when someone sends a message that includes your username (@matthew.birtch), or any of the options selected below.',
                    descriptionClassname:
                        'section-description font-12-weight-400 Pb-14',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.notifications.caseSensitiveFirstname',
                            message: `Your non case sensitive first name "${user.username}"`,
                            checked: UsernameKey,
                            checkBoxContentClassname: 'Pb-2',
                            ref: firstNameKeyRef,
                        },
                    ],
                },
                onCheckBoxChange: handleUserNameKeyChange,
                xtraInfo: (
                    <div>
                        <div className='checkbox Pb-2'>
                            <label>
                                <input
                                    id={name + 'C'}
                                    type='checkbox'

                                    // name={name}
                                    checked={
                                        ChannelKey === 'true'
                                    }
                                    onChange={handleChannelKeyChange}
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.sensitiveNames'
                                    defaultMessage='Channel-wide mentions "@channel", "@all", "@here"'
                                />
                            </label>
                        </div>
                        <ChipComponent
                            removeOne={(t) => setCustomKeys(t)}
                            setCustom={(t) => {
                                setCustomKeys(`${CustomKeys},${t}`);
                            }}
                            values={CustomKeys.split(',')}
                        />
                        <div className='section-description font-12-weight-400 Mt-8 Pb-24'>
                            <FormattedMessage
                                id='user.settings.notifications.nonCaseSensitiveKeywords'
                                defaultMessage='Keywords are not case sensitive. Separate keywords with commas.'
                            />
                        </div>
                    </div>
                ),
            })}
            {GenericSectionCreator1({
                title: {
                    id: 'user.settings.notifications.autoReplies',
                    message: 'Automatic replies for direct messages',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-8',
                },
                description: {
                    id: 'user.settings.notifications.setCustomMessage',
                    message:
                        'Set a custom message that is automatically sent in response to direct messages, such as an out of office or vacation reply. Enabling this setting changes your status to Offline and disables notifications.',
                    descriptionClassname:
                        'section-description font-12-weight-400 Pb-14',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.notifications.enableAutoReplies',
                            message:
                                'Enable automatic replies for direct messages',
                            checked: AutoResponderActive,
                            ref: autoRepliesRef,
                            checkBoxContentClassname: 'Pb-2',
                        },
                    ],
                },
                onCheckBoxChange: handleAutoRepliesChange,
                xtraInfo: AutoResponderActive === true && (
                    <div className='pt-4'>
                        <textarea
                            style={{resize: 'none'}}
                            id='autoResponderMessageInput'
                            className='auto-responder-input'
                            rows={5}
                            placeholder={localizeMessage(
                                'user.settings.notifications.autoResponderPlaceholders',
                                'Enter a message...',
                            )}
                            value={AutoResponderMessage}

                            // maxLength={MESSAGE_MAX_LENGTH}
                            onChange={handleAutoResponderMessageChange}
                        />
                        {/* {serverError} */}
                    </div>
                ),
            })}
            {unsavedChanges && (
                <SaveChangesPanel
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                />
            )}
        </>
    );
};

export default UserSettingsNotifications;
