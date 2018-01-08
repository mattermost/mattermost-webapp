// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

export default class ChannelMarkUnreadNotificationSection extends React.PureComponent {
    static propTypes = {

        /**
         * Expand if true, else collapse the section
         */
        expand: PropTypes.bool.isRequired,

        /**
         * Current member's mark unread notification level
         */
        notificationLevel: PropTypes.string.isRequired,

        /**
         * onChange handles update of mark unread notification level
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

    static defaultProps = {
        notificationLevel: NotificationLevels.ALL
    }

    handleOnChange = (e) => {
        this.props.onChange(e.target.value);
    }

    handleExpandSection = (e) => {
        e.preventDefault();
        this.props.onUpdateSection(NotificationSections.MARK_UNREAD);
    }

    handleCollapseSection = (e) => {
        e.preventDefault();
        this.props.onUpdateSection();
    }

    getDescribe() {
        let describe;

        if (this.props.notificationLevel === NotificationLevels.ALL) {
            describe = (
                <FormattedMessage
                    id='channel_notifications.allUnread'
                    defaultMessage='For all unread messages'
                />
            );
        } else {
            describe = (<FormattedMessage id='channel_notifications.onlyMentions'/>);
        }

        return describe;
    }

    render() {
        const markUnread = (
            <FormattedMessage
                id='channel_notifications.markUnread'
                defaultMessage='Mark Channel Unread'
            />
        );

        if (this.props.expand) {
            const inputs = [(
                <div key='channel-notification-unread-radio'>
                    <div className='radio'>
                        <label>
                            <input
                                id='channelUnreadAll'
                                type='radio'
                                name='markUnreadLevel'
                                value={NotificationLevels.ALL}
                                checked={this.props.notificationLevel === NotificationLevels.ALL}
                                onChange={this.handleOnChange}
                            />
                            <FormattedMessage
                                id='channel_notifications.allUnread'
                                defaultMessage='For all unread messages'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='channelUnreadMentions'
                                type='radio'
                                name='markUnreadLevel'
                                value={NotificationLevels.MENTION}
                                checked={this.props.notificationLevel === NotificationLevels.MENTION}
                                onChange={this.handleOnChange}
                            />
                            <FormattedMessage id='channel_notifications.onlyMentions'/>
                        </label>
                        <br/>
                    </div>
                </div>
            )];

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='channel_notifications.unreadInfo'
                        defaultMessage='The channel name is bolded in the sidebar when there are unread messages. Selecting "Only for mentions" will bold the channel only when you are mentioned.'
                    />
                </span>
            );

            return (
                <SettingItemMax
                    title={markUnread}
                    inputs={inputs}
                    submit={this.props.onSubmit}
                    server_error={this.props.serverError}
                    updateSection={this.handleCollapseSection}
                    extraInfo={extraInfo}
                />
            );
        }

        const describe = this.getDescribe();

        return (
            <SettingItemMin
                title={markUnread}
                describe={describe}
                updateSection={this.handleExpandSection}
            />
        );
    }
}
