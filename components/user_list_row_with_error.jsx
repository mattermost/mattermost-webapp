// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import UserStore from 'stores/user_store.jsx';

import * as Utils from 'utils/utils.jsx';

import ProfilePicture from 'components/profile_picture.jsx';

export default class UserListRowWithError extends React.Component {

    static propTypes = {
        user: PropTypes.object.isRequired,
        extraInfo: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,
        userCount: PropTypes.number
    };

    static defaultProps = {
        extraInfo: [],
        actions: [],
        actionProps: {},
        actionUserProps: {}
    };

    constructor(props) {
        super(props);
        this.state = {};

        this.onError = this.onError.bind(this);
    }

    onError(errorObj) {
        this.setState({
            error: errorObj
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
        if (this.props.extraInfo && this.props.extraInfo.length > 0) {
            email = (
                <FormattedHTMLMessage
                    id='admin.user_item.emailTitle'
                    defaultMessage='<strong>Email:</strong> {email}'
                    values={{
                        email: this.props.user.email
                    }}
                />
            );
            emailStyle = '';
        } else if (this.props.user.status) {
            status = this.props.user.status;
        } else {
            status = UserStore.getStatus(this.props.user.id);
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
                    width='32'
                    height='32'
                />
                <div className='more-modal__right'>
                    <div className='more-modal__top'>
                        <div className='more-modal__details'>
                            <div
                                id={userCountID}
                                className='more-modal__name'
                            >
                                {Utils.displayEntireNameForUser(this.props.user)}
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
