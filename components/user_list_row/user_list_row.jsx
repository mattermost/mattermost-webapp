// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Client4} from 'mattermost-redux/client';

import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class UserListRow extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        status: PropTypes.string,
        extraInfo: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,
        userCount: PropTypes.number,
    };

    static defaultProps = {
        extraInfo: [],
        actions: [],
        actionProps: {},
        actionUserProps: {},
    };

    render() {
        let buttons = null;
        if (this.props.actions) {
            buttons = this.props.actions.map((Action, index) => {
                return (
                    <Action
                        key={index.toString()}
                        user={this.props.user}
                        {...this.props.actionProps}
                        {...this.props.actionUserProps}
                    />
                );
            });
        }

        // QUICK HACK, NEEDS A PROP FOR TOGGLING STATUS
        let email = this.props.user.email;
        let emailStyle = 'more-modal__description';
        let status;
        if (this.props.extraInfo && this.props.extraInfo.length > 0) {
            email = (
                <FormattedMarkdownMessage
                    id='admin.user_item.emailTitle'
                    defaultMessage='**Email:** {email}'
                    values={{
                        email: this.props.user.email,
                    }}
                />
            );
            emailStyle = '';
        } else if (this.props.user.status) {
            status = this.props.user.status;
        } else {
            status = this.props.status;
        }

        let tag = null;
        if (this.props.user.is_bot) {
            status = null;
            tag = (
                <div className='bot-indicator bot-indicator__popoverlist'>
                    <FormattedMessage
                        id='post_info.bot'
                        defaultMessage='BOT'
                    />
                </div>
            );
        }

        let userCountID = null;
        let userCountEmail = null;
        if (this.props.userCount >= 0) {
            userCountID = Utils.createSafeId('userListRowName' + this.props.userCount);
            userCountEmail = Utils.createSafeId('userListRowEmail' + this.props.userCount);
        }

        return (
            <div
                key={this.props.user.id}
                className='more-modal__row'
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(this.props.user.id, this.props.user.last_picture_update)}
                    status={status}
                    width='32'
                    height='32'
                />
                <div
                    className='more-modal__details'
                >
                    <div
                        id={userCountID}
                        className='more-modal__name'
                    >
                        {Utils.displayEntireNameForUser(this.props.user)}
                        {tag}
                    </div>
                    <div
                        id={userCountEmail}
                        className={emailStyle}
                    >
                        {email}
                    </div>
                    {this.props.extraInfo}
                </div>
                <div
                    className='more-modal__actions'
                >
                    {buttons}
                </div>
            </div>
        );
    }
}
