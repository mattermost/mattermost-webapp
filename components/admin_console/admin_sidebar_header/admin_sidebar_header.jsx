// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import MenuIcon from 'components/svg/menu_icon';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import AdminNavbarDropdown from 'components/admin_console/admin_navbar_dropdown';

export default class SidebarHeader extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object,
    }

    render() {
        const me = this.props.currentUser;
        let profilePicture = null;

        if (!me) {
            return null;
        }

        if (me.last_picture_update) {
            profilePicture = (
                <img
                    alt={''}
                    className='user__picture'
                    src={Client4.getProfilePictureUrl(me.id, me.last_picture_update)}
                />
            );
        }

        return (
            <MenuWrapper className='AdminSidebarHeader'>
                <div>
                    {profilePicture}
                    <div className='header__info'>
                        <div className='team__name'>
                            <FormattedMessage
                                id='admin.sidebarHeader.systemConsole'
                                defaultMessage='System Console'
                            />
                        </div>
                        <div className='user__name'>{'@' + me.username}</div>
                    </div>
                    <MenuIcon className='menu-icon'/>
                </div>
                <AdminNavbarDropdown/>
            </MenuWrapper>
        );
    }
}
