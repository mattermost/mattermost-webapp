// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Client4} from 'mattermost-redux/client';

import ProfilePicture from 'components/profile_picture';
import * as Utils from 'utils/utils.jsx';

import './admin_user_card.scss';

const Bullet = (props) => {
    if ((props.user.first_name || props.user.last_name) && props.user.nickname) {
        return (<span>{' • '}</span>);
    }
    return null;
};

const AdminUserCard = (props) => (
    <div className='AdminUserCard'>
        <div className='AdminUserCard__header'>
            <ProfilePicture
                src={Client4.getProfilePictureUrl(props.user.id, props.user.last_picture_update)}
                size='xxl'
                wrapperClass='admin-user-card'
                userId={props.user.id}
            />
            <div className='AdminUserCard__user-info'>
                <span>{props.user.first_name} {props.user.last_name}</span>
                <Bullet user={props.user}/>
                <span className='AdminUserCard__user-nickname'>{props.user.nickname}</span>
            </div>
            <div className='AdminUserCard__user-id'>
                {Utils.localizeMessage('admin.userManagement.userDetail.userId', 'User ID:')} {props.user.id}
            </div>
        </div>
        <div className='AdminUserCard__body'>
            {props.body}
        </div>
        <div className='AdminUserCard__footer'>
            {props.footer}
        </div>
    </div>
);

Bullet.propTypes = {
    user: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        nickname: PropTypes.string,
        last_picture_update: PropTypes.number,
    }),
};

AdminUserCard.propTypes = {
    user: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        nickname: PropTypes.string,
        last_picture_update: PropTypes.number,
        id: PropTypes.string,
    }),
    body: PropTypes.element,
    footer: PropTypes.element,
};

export default AdminUserCard;
