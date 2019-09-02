// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import UserListRow from './user_list_row';

export default class UserList extends React.Component {
    static propTypes = {
        users: PropTypes.arrayOf(PropTypes.object),
        extraInfo: PropTypes.object,
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,

        // the type of user list row to render
        rowComponentType: PropTypes.func,
    }

    static defaultProps = {
        users: [],
        extraInfo: {},
        actions: [],
        actionProps: {},
        rowComponentType: UserListRow,
    }

    constructor(props) {
        super(props);

        this.scrollToTop = this.scrollToTop.bind(this);
    }

    scrollToTop() {
        if (this.refs.container) {
            this.refs.container.scrollTop = 0;
        }
    }

    render() {
        const users = this.props.users;
        const RowComponentType = this.props.rowComponentType;

        let content;
        if (users == null) {
            return <LoadingScreen/>;
        } else if (users.length > 0) {
            content = users.map((user, index) => {
                return (
                    <RowComponentType
                        key={user.id}
                        user={user}
                        extraInfo={this.props.extraInfo[user.id]}
                        actions={this.props.actions}
                        actionProps={this.props.actionProps}
                        actionUserProps={this.props.actionUserProps[user.id]}
                        index={index}
                        totalUsers={users.length}
                        userCount={(index >= 0 && index < Constants.TEST_ID_COUNT) ? index : -1}
                    />
                );
            });
        } else {
            content = (
                <div
                    key='no-users-found'
                    className='more-modal__placeholder-row'
                >
                    <p>
                        <FormattedMessage
                            id='user_list.notFound'
                            defaultMessage='No users found'
                        />
                    </p>
                </div>
            );
        }

        return (
            <div ref='container'>
                {content}
            </div>
        );
    }
}