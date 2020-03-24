// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';

import LoadingScreen from 'components/loading_screen';
import InfiniteScroll from 'components/gif_picker/components/InfiniteScroll';

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
        hasMore: PropTypes.bool,
        loadMore: PropTypes.func,
        loading: PropTypes.bool,
    }

    static defaultProps = {
        users: [],
        extraInfo: {},
        actions: [],
        actionProps: {},
        rowComponentType: UserListRow,
        loading: true,
    }

    scrollToTop = () => {
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
        } else if (!users.length && !this.props.loading) {
            return (
                <div ref='container'>
                    <div
                        key='no-users-found'
                        className='more-modal__placeholder-row'
                        data-testid='noUsersFound'
                    >
                        <p>
                            <FormattedMessage
                                id='user_list.notFound'
                                defaultMessage='No users found'
                            />
                        </p>
                    </div>
                </div>
            );
        } else {
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
        }

        const loadingMore = (
            <div className='loading-screen row'>
                <div className='loading__content'>
                    <div className='round round-1'/>
                    <div className='round round-2'/>
                    <div className='round round-3'/>
                </div>
            </div>
        );

        return (
            <div ref='container'>
                <InfiniteScroll
                    hasMore={this.props.hasMore}
                    loadMore={this.props.loadMore}
                    initialLoad={false}
                    useWindow={false}
                >
                    {content}

                </InfiniteScroll>
                {this.props.loading && this.props.hasMore && loadingMore}
            </div>
        );
    }
}
