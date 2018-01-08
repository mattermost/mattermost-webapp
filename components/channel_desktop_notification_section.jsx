// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

export default class ChannelDesktopNotificationSection extends React.PureComponent {
    static propTypes = {

        /**
         * Expand if true, else collapse the section
         */
        expand: PropTypes.bool.isRequired,

        /**
         * Current member's desktop notification level
         */
        memberNotificationLevel: PropTypes.string.isRequired,

        /**
         * Current user's global notification level
         */
        globalNotificationLevel: PropTypes.string.isRequired,

        /**
         * onChange handles update of desktop notification level
         */
        onChange: PropTypes.func.isRequired,

        /**
         * Submit function to save notification level
         */
        onSubmit: PropTypes.func.isRequired,

        /**
         * Update function to to expand or collapse a section
         */
        onUpdateSection: PropTypes.func.isRequired,

        /**
         * Error string from the server
         */
        serverError: PropTypes.string
    }

    handleOnChange = (e) => {
        this.props.onChange(e.target.value);
    }

    handleExpandSection = (e) => {
        e.preventDefault();
        this.props.onUpdateSection(NotificationSections.DESKTOP);
    }

    handleCollapseSection = (e) => {
        e.preventDefault();
        this.props.onUpdateSection();
    }

    getGlobalNotifyLevelName(level) {
        let levelName;

        switch (level) {
        case NotificationLevels.ALL:
            levelName = (
                <FormattedMessage
                    id='channel_notifications.allActivity'
                    defaultMessage='For all activity'
                />
            );
            break;
        case NotificationLevels.MENTION:
            levelName = (
                <FormattedMessage
                    id='channel_notifications.onlyMentions'
                    defaultMessage='Only for mentions'
                />
            );
            break;
        default:
            levelName = (
                <FormattedMessage
                    id='channel_notifications.never'
                    defaultMessage='Never'
                />
            );
        }

        return levelName;
    }

    getDescribe(globalNotifyLevelName) {
        let describe;

        switch (this.props.memberNotificationLevel) {
        case NotificationLevels.DEFAULT:
            describe = (
                <FormattedMessage
                    id='channel_notifications.globalDefault'
                    values={{
                        notifyLevel: (globalNotifyLevelName)
                    }}
                />
            );
            break;
        case NotificationLevels.MENTION:
            describe = (<FormattedMessage id='channel_notifications.onlyMentions'/>);
            break;
        case NotificationLevels.ALL:
            describe = (<FormattedMessage id='channel_notifications.allActivity'/>);
            break;
        default:
            describe = (<FormattedMessage id='channel_notifications.never'/>);
        }

        return describe;
    }

    render() {
        const globalNotifyLevelName = this.getGlobalNotifyLevelName(this.props.globalNotificationLevel);

        const sendDesktop = (
            <FormattedMessage
                id='channel_notifications.sendDesktop'
                defaultMessage='Send desktop notifications'
            />
        );

        if (this.props.expand) {
            const inputs = [(
                <div key='channel-notification-level-radio'>
                    <div className='radio'>
                        <label>
                            <input
                                id='channelNotificationGlobalDefault'
                                type='radio'
                                name='desktopNotificationLevel'
                                value={NotificationLevels.DEFAULT}
                                checked={this.props.memberNotificationLevel === NotificationLevels.DEFAULT}
                                onChange={this.handleOnChange}
                            />
                            <FormattedMessage
                                id='channel_notifications.globalDefault'
                                defaultMessage='Global default ({notifyLevel})'
                                values={{
                                    notifyLevel: (globalNotifyLevelName)
                                }}
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='channelNotificationAllActivity'
                                type='radio'
                                name='desktopNotificationLevel'
                                value={NotificationLevels.ALL}
                                checked={this.props.memberNotificationLevel === NotificationLevels.ALL}
                                onChange={this.handleOnChange}
                            />
                            <FormattedMessage id='channel_notifications.allActivity'/>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='channelNotificationMentions'
                                type='radio'
                                name='desktopNotificationLevel'
                                value={NotificationLevels.MENTION}
                                checked={this.props.memberNotificationLevel === NotificationLevels.MENTION}
                                onChange={this.handleOnChange}
                            />
                            <FormattedMessage id='channel_notifications.onlyMentions'/>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='channelNotificationNever'
                                type='radio'
                                name='desktopNotificationLevel'
                                value={NotificationLevels.NONE}
                                checked={this.props.memberNotificationLevel === NotificationLevels.NONE}
                                onChange={this.handleOnChange}
                            />
                            <FormattedMessage id='channel_notifications.never'/>
                        </label>
                    </div>
                </div>
            )];

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='channel_notifications.override'
                        defaultMessage='Selecting an option other than "Default" will override the global notification settings. Desktop notifications are available on Firefox, Safari, and Chrome.'
                    />
                </span>
            );

            return (
                <SettingItemMax
                    title={sendDesktop}
                    inputs={inputs}
                    submit={this.props.onSubmit}
                    server_error={this.props.serverError}
                    updateSection={this.handleCollapseSection}
                    extraInfo={extraInfo}
                />
            );
        }

        const describe = this.getDescribe(globalNotifyLevelName);

        return (
            <SettingItemMin
                title={sendDesktop}
                describe={describe}
                updateSection={this.handleExpandSection}
            />
        );
    }
}
