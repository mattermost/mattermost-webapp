// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import UserStore from 'stores/user_store.jsx';

import AdminNavbarDropdown from './admin_navbar_dropdown';

export default class SidebarHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    toggleDropdown = (e) => {
        e.preventDefault();

        if (this.refs.dropdown.blockToggle) {
            this.refs.dropdown.blockToggle = false;
            return;
        }

        $('.team__header').find('.dropdown-toggle').dropdown('toggle');
    }

    render() {
        var me = UserStore.getCurrentUser();
        var profilePicture = null;

        if (!me) {
            return null;
        }

        if (me.last_picture_update) {
            profilePicture = (
                <img
                    className='user__picture'
                    src={Client4.getProfilePictureUrl(me.id, me.last_picture_update)}
                />
            );
        }

        return (
            <div className='team__header theme'>
                <a
                    href='#'
                    onClick={this.toggleDropdown}
                >
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
                </a>
                <AdminNavbarDropdown ref='dropdown'/>
            </div>
        );
    }
}
