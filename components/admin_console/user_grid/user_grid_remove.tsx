// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';

type Props = {
    user: UserProfile;
    removeUser: (user: UserProfile) => void;
}

export default class UserGridName extends React.Component<Props> {
    render() {
        const {user} = this.props;
        return (
            <div className='ug-remove-row'>
                <a
                    onClick={() => this.props.removeUser(user)}
                    href='#'
                >
                    <span>{'Remove'}</span>
                </a>
            </div>
        );
    }
}
