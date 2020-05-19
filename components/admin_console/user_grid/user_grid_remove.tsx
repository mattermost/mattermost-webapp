// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {FormattedMessage} from 'react-intl';

type Props = {
    user: UserProfile;
    removeUser: (user: UserProfile) => void;
}

export default class UserGridRemove extends React.Component<Props> {
    public render = (): JSX.Element => {
        const {user} = this.props;
        return (
            <div className='UserGrid_removeRow'>
                <a
                    onClick={() => this.props.removeUser(user)}
                    href='#'
                    role='button'
                >
                    <FormattedMessage
                        id='admin.user_grid.remove'
                        defaultMessage='Remove'
                    />
                </a>
            </div>
        );
    }
}
