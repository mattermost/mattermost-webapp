// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {Client4} from 'mattermost-redux/client';

import ProfilePicture from 'components/profile_picture';
import MessageIcon from 'components/svg/message_icon';
import {UserStatuses} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

export default class PopoverListMembersItem extends React.PureComponent {
    static propTypes = {
        showMessageIcon: PropTypes.bool.isRequired,
        onItemClick: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        user: PropTypes.object.isRequired,
    };

    static defaultProps = {
        status: UserStatuses.OFFLINE,
    };

    handleClick = () => {
        this.props.onItemClick(this.props.user);
    };

    render() {
        if (!this.props.user) {
            return null;
        }

        const name = Utils.getDisplayNameByUser(this.props.user);
        if (!name) {
            return null;
        }

        let messageIcon;
        if (this.props.showMessageIcon) {
            messageIcon = (
                <MessageIcon
                    className='icon icon__message'
                    aria-hidden='true'
                />
            );
        }

        return (
            <div
                className='more-modal__row'
                onClick={this.handleClick}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(this.props.user.id, this.props.user.last_picture_update)}
                    status={this.props.status}
                    width='32'
                    height='32'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {name}
                    </div>
                </div>
                <div className='more-modal__actions'>
                    {messageIcon}
                </div>
            </div>
        );
    }
}
