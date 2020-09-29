// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture';
import UserProfile from 'components/user_profile';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Nbsp from 'components/html_entities/nbsp';

export default class UserListRow extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object.isRequired,
        status: PropTypes.string,
        extraInfo: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,
        index: PropTypes.number,
        totalUsers: PropTypes.number,
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
                        index={this.props.index}
                        totalUsers={this.props.totalUsers}
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

        if (this.props.user.is_bot) {
            status = null;
            email = null;
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
                    size='md'
                    userId={this.props.user.id}
                    hasMention={true}
                    username={this.props.user.username}
                />
                <div
                    className='more-modal__details'
                    data-testid='userListItemDetails'
                >
                    <div
                        id={userCountID}
                        className='more-modal__name'
                    >
                        <UserProfile
                            userId={this.props.user.id}
                            hasMention={true}
                            displayUsername={true}
                        />
                        <Nbsp/>
                        {
                            this.props.user.first_name || this.props.user.last_name || this.props.user.nickname ?
                                '-' : null
                        }
                        <Nbsp/>
                        {Utils.displayFullAndNicknameForUser(this.props.user)}
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
                    data-testid='userListItemActions'
                    className='more-modal__actions'
                >
                    {buttons}
                </div>
            </div>
        );
    }
}
