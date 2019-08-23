// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';
import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture.jsx';
import BotBadge from 'components/widgets/badges/bot_badge.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class UserListRowWithError extends React.Component {
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

    constructor(props) {
        super(props);
        this.state = {};

        this.onError = this.onError.bind(this);
    }

    onError(errorObj) {
        this.setState({
            error: errorObj,
        });
    }

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
                        onError={this.onError}
                    />
                );
            });
        }

        // QUICK HACK, NEEDS A PROP FOR TOGGLING STATUS
        let email = this.props.user.email;
        let emailStyle = 'more-modal__description';
        let status;
        if (this.props.user.is_bot) {
            email = null;
        } else if (this.props.extraInfo && this.props.extraInfo.length > 0) {
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
        }

        let userCountID = null;
        let userCountEmail = null;
        if (this.props.userCount >= 0) {
            userCountID = Utils.createSafeId('userListRowName' + this.props.userCount);
            userCountEmail = Utils.createSafeId('userListRowEmail' + this.props.userCount);
        }

        let error = null;
        if (this.state.error) {
            error = (
                <div className='has-error'>
                    <label className='has-error control-label'>{this.state.error.message}</label>
                </div>
            );
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
                />
                <div className='more-modal__right'>
                    <div className='more-modal__top'>
                        <div className='more-modal__details'>
                            <div
                                id={userCountID}
                                className='more-modal__name'
                            >
                                <Link to={'/admin_console/user_management/user/' + this.props.user.id}>{Utils.displayEntireNameForUser(this.props.user)}</Link>
                                <BotBadge
                                    className='badge-admin'
                                    show={Boolean(this.props.user.is_bot)}
                                />
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
                    <div
                        className='more-modal__bottom'
                    >
                        {error}
                    </div>
                </div>
            </div>
        );
    }
}
