// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import classNames from 'classnames';

import ModalHeader from 'components/widgets/modals/generic/modal_header';

import {BellOffOutlineIcon, CheckIcon} from '@mattermost/compass-icons/components';

import {Channel, ChannelNotifyProps} from '@mattermost/types/channels';
import {UserNotifyProps, UserProfile} from '@mattermost/types/users';

import SectionCreator from '../widgets/modals/generic/section_creator';

import CheckboxItemCreator from '../widgets/modals/generic/checkbox-item-creator';

import {IgnoreChannelMentions, NotificationLevels} from '../../utils/constants';

import RadioItemCreator from '../widgets/modals/generic/radio-item-creator';

import {
    desktopNotificationInputFieldData,
    DesktopNotificationsSectionDesc,
    DesktopNotificationsSectionTitle,
    IgnoreMentionsDesc,
    IgnoreMentionsInputFieldData,
    MobileNotificationInputFieldData,
    MobileNotificationsSectionDesc,
    MobileNotificationsSectionTitle,
    MuteAndIgnoreSectionTitle,
    MuteChannelDesc,
    MuteChannelInputFieldData,
    ChannelMemberNotifyProps,
    NotifyMeTitle,
    DesktopReplyThreadsInputFieldData,
    ThreadsReplyTitle,
    MobileReplyThreadsInputFieldData,
    AutoFollowThreadsTitle,
    AutoFollowThreadsDesc,
    AutoFollowThreadsInputFieldData,
    sameMobileSettingsDesktopInputFieldData,
} from './utils';

import type {PropsFromRedux} from './index';

import './channel_notifications_modal.scss';
import AlertBanner from '../alert_banner';

type Props = PropsFromRedux & {

    /**
     * Function that is called when the modal has been hidden and should be removed
     */
    onExited: () => void;

    /**
     * Object with info about current channel
     */
    channel: Channel;

    /**
     * Object with info about current user
     */
    currentUser: UserProfile;
};

function getStateFromNotifyProps(currentUserNotifyProps: UserNotifyProps, channelMemberNotifyProps?: ChannelMemberNotifyProps) {
    let ignoreChannelMentionsDefault: ChannelNotifyProps['ignore_channel_mentions'] = IgnoreChannelMentions.OFF;

    if (channelMemberNotifyProps?.mark_unread === NotificationLevels.MENTION || (currentUserNotifyProps.channel && currentUserNotifyProps.channel === 'false')) {
        ignoreChannelMentionsDefault = IgnoreChannelMentions.ON;
    }

    let ignoreChannelMentions = channelMemberNotifyProps?.ignore_channel_mentions;
    if (!ignoreChannelMentions || ignoreChannelMentions === IgnoreChannelMentions.DEFAULT) {
        ignoreChannelMentions = ignoreChannelMentionsDefault;
    }

    const desktop = channelMemberNotifyProps?.desktop === NotificationLevels.DEFAULT ? currentUserNotifyProps.desktop : (channelMemberNotifyProps?.desktop || currentUserNotifyProps.desktop);
    const push = channelMemberNotifyProps?.push === NotificationLevels.DEFAULT ? currentUserNotifyProps.desktop : (channelMemberNotifyProps?.push || currentUserNotifyProps.push);
    let mobile_settings_same_as_desktop = channelMemberNotifyProps?.mobile_settings_same_as_desktop || 'true';
    if (channelMemberNotifyProps?.mobile_settings_same_as_desktop === undefined) {
        mobile_settings_same_as_desktop = currentUserNotifyProps.desktop === channelMemberNotifyProps?.desktop &&
        currentUserNotifyProps.desktop === channelMemberNotifyProps?.push ? 'true' : 'false';
    }
    console.log('channelMemberNotifyProps', channelMemberNotifyProps);

    return {
        desktop,
        desktop_threads: channelMemberNotifyProps?.desktop_threads || NotificationLevels.ALL,
        mark_unread: channelMemberNotifyProps?.mark_unread || NotificationLevels.ALL,
        push,
        push_threads: channelMemberNotifyProps?.push_threads || NotificationLevels.ALL,
        ignore_channel_mentions: ignoreChannelMentions,
        channel_auto_follow_threads: channelMemberNotifyProps?.channel_auto_follow_threads || 'false',
        mobile_settings_same_as_desktop,
    };
}

type SettingsType = {
    desktop: ChannelNotifyProps['desktop'];
    channel_auto_follow_threads: 'true' | 'false';
    desktop_threads: ChannelNotifyProps['desktop_threads'];
    mark_unread: ChannelNotifyProps['mark_unread'];
    push: ChannelNotifyProps['push'];
    push_threads: ChannelNotifyProps['push_threads'];
    ignore_channel_mentions: ChannelNotifyProps['ignore_channel_mentions'];
    mobile_settings_same_as_desktop: 'true' | 'false';
};

export default function ChannelNotificationsModal(props: Props) {
    const {formatMessage} = useIntl();
    const [show, setShow] = useState(true);
    const [serverError, setServerError] = useState('');
    const [haveChanges, setHaveChanges] = useState(false);
    const [channelNotifyProps] = useState(props.channelMember && props.channelMember.notify_props);

    const [settings, setSettings] = useState<SettingsType>(getStateFromNotifyProps(props.currentUser.notify_props, channelNotifyProps));

    function handleHide() {
        setShow(false);
    }

    function handleExit() {
        props.onExited();
    }

    const handleChange = useCallback((values: Record<string, string>) => {
        setSettings({...settings, ...values});
        setHaveChanges(true);
    }, [settings]);

    const MuteIgnoreSectionContent = (
        <>
            <CheckboxItemCreator
                description={MuteChannelDesc}
                inputFieldValue={settings.mark_unread === 'mention'}
                inputFieldData={MuteChannelInputFieldData}
                handleChange={(e) => handleChange({mark_unread: e ? 'mention' : 'all'})}
            />
            <CheckboxItemCreator
                description={IgnoreMentionsDesc}
                inputFieldValue={settings.ignore_channel_mentions === 'on'}
                inputFieldData={IgnoreMentionsInputFieldData}
                handleChange={(e) => handleChange({ignore_channel_mentions: e ? 'on' : 'off'})}
            />
        </>
    );

    const DesktopNotificationsSectionContent = (
        <>
            <RadioItemCreator
                title={NotifyMeTitle}
                inputFieldValue={settings.desktop}
                inputFieldData={desktopNotificationInputFieldData(props.currentUser.notify_props.desktop)}
                handleChange={(e) => handleChange({desktop: e.target.value})}
            />
            {settings.desktop === 'mention' &&
                <CheckboxItemCreator
                    title={ThreadsReplyTitle}
                    inputFieldValue={settings.desktop_threads === 'all'}
                    inputFieldData={DesktopReplyThreadsInputFieldData}
                    handleChange={(e) => handleChange({desktop_threads: e ? 'all' : 'mention'})}
                />}
        </>
    );

    const MobileNotificationsSectionContent = (
        <>
            <CheckboxItemCreator
                inputFieldValue={settings.mobile_settings_same_as_desktop === 'true'}
                inputFieldData={sameMobileSettingsDesktopInputFieldData}
                handleChange={(e) => handleChange({mobile_settings_same_as_desktop: e ? 'true' : 'false'})}
            />
            {settings.mobile_settings_same_as_desktop === 'false' && (
                <>
                    <RadioItemCreator
                        title={NotifyMeTitle}
                        inputFieldValue={settings.push}
                        inputFieldData={MobileNotificationInputFieldData(props.currentUser.notify_props.push)}
                        handleChange={(e) => handleChange({push: e.target.value})}
                    />
                    {settings.push === 'mention' &&
                    <CheckboxItemCreator
                        title={ThreadsReplyTitle}
                        inputFieldValue={settings.push_threads === 'all'}
                        inputFieldData={MobileReplyThreadsInputFieldData}
                        handleChange={(e) => handleChange({push_threads: e ? 'all' : 'mention'})}
                    />}
                </>
            )}
        </>
    );

    const AutoFollowThreadsSectionContent = (
        <>
            <CheckboxItemCreator
                inputFieldValue={settings.channel_auto_follow_threads === 'true'}
                inputFieldData={AutoFollowThreadsInputFieldData}
                handleChange={(e) => handleChange({channel_auto_follow_threads: e ? 'true' : 'false'})}
            />
        </>
    );

    async function handleSave() {
        const {error} = await props.actions.updateChannelNotifyProps(props.currentUser.id, props.channel.id, settings);
        handleHide();
        if (error) {
            setServerError(error.message);
        }
    }

    const settingsAndAlertBanner = settings.mark_unread === 'all' ? (
        <>
            <div className='channel-notifications-settings-modal__divider'/>
            <SectionCreator
                title={DesktopNotificationsSectionTitle}
                description={DesktopNotificationsSectionDesc}
                content={DesktopNotificationsSectionContent}
            />
            <div className='channel-notifications-settings-modal__divider'/>
            <SectionCreator
                title={MobileNotificationsSectionTitle}
                description={MobileNotificationsSectionDesc}
                content={MobileNotificationsSectionContent}
            />

            <div className='channel-notifications-settings-modal__divider'/>
            <SectionCreator
                title={AutoFollowThreadsTitle}
                description={AutoFollowThreadsDesc}
                content={AutoFollowThreadsSectionContent}
            />
        </>
    ) : (
        <AlertBanner
            mode='info'
            customIcon={
                <BellOffOutlineIcon
                    size={24}
                    color={'currentColor'}
                />
            }
            title={
                <FormattedMessage
                    id='channel_notifications.alertBanner.title'
                    defaultMessage='This channel is muted'
                />
            }
            message={
                <FormattedMessage
                    id='channel_notifications.alertBanner.description'
                    defaultMessage='All other notification preferences for this channel are disabled'
                />
            }
        />
    );

    return (
        <Modal
            dialogClassName='a11y__modal channel-notifications-settings-modal'
            show={show}
            onHide={handleHide}
            onExited={handleExit}
            role='dialog'
            aria-labelledby='channelNotificationModalLabel'
        >
            <ModalHeader
                id={'channelNotificationModalLabel'}
                title={formatMessage({
                    id: 'channel_notifications.preferences',
                    defaultMessage: 'Notification Preferences',
                })}
                subtitle={props.channel.display_name}
                handleClose={handleHide}
            />
            <main className='channel-notifications-settings-modal__body'>
                <div className='channel-notifications-settings-modal__content'>
                    <SectionCreator
                        title={MuteAndIgnoreSectionTitle}
                        content={MuteIgnoreSectionContent}
                    />
                    {settingsAndAlertBanner}
                </div>
            </main>
            <footer className='channel-notifications-settings-modal__footer'>
                {serverError &&
                    <div>
                        {serverError}
                    </div>
                }
                <button
                    onClick={handleHide}
                    className='channel-notifications-settings-modal__cancel-btn'
                >
                    <FormattedMessage
                        id='generic_btn.cancel'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    className={classNames('channel-notifications-settings-modal__save-btn', {disabled: haveChanges})}
                    onClick={handleSave}
                >
                    <FormattedMessage
                        id='generic_btn.save'
                        defaultMessage='Save'
                    />
                </button>
            </footer>
        </Modal>
    );
}
