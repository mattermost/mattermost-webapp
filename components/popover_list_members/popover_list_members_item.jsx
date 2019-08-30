// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {Client4} from 'mattermost-redux/client';

import ProfilePicture from 'components/profile_picture';
import MessageIcon from 'components/widgets/icons/message_icon';
import {UserStatuses} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import BotBadge from 'components/widgets/badges/bot_badge.jsx';
import GuestBadge from 'components/widgets/badges/guest_badge.jsx';

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
                <MessageIcon aria-hidden='true'/>
            );
        }

        const botClass = this.props.user.is_bot ? ' more-modal__row--bot' : '';

        const status = this.props.user.is_bot ? null : this.props.status;

        return (
            <div
                tabIndex='0'
                aria-label={name.toLowerCase()}
                className={'more-modal__row' + botClass}
                onClick={this.handleClick}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(this.props.user.id, this.props.user.last_picture_update)}
                    status={status}
                    size='md'
                />
                <div className='more-modal__details d-flex whitespace--nowrap'>
                    <div className='more-modal__name'>
                        {name}
                    </div>
                    <BotBadge
                        show={Boolean(this.props.user.is_bot)}
                        className='badge-popoverlist'
                    />
                    <GuestBadge
                        show={Utils.isGuest(this.props.user)}
                        className='badge-popoverlist'
                    />
                </div>
                <div className='more-modal__actions'>
                    {messageIcon}
                </div>
            </div>
        );
    }
}
