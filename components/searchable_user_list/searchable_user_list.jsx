// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import QuickInput from 'components/quick_input';
import UserList from 'components/user_list.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n';

export default class SearchableUserList extends React.Component {
    static propTypes = {
        users: PropTypes.arrayOf(PropTypes.object),
        usersPerPage: PropTypes.number,
        total: PropTypes.number,
        extraInfo: PropTypes.object,
        nextPage: PropTypes.func.isRequired,
        pageLoading: PropTypes.bool,
        search: PropTypes.func.isRequired,
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,
        focusOnMount: PropTypes.bool,
        renderCount: PropTypes.func,
        filter: PropTypes.string,
        renderFilterRow: PropTypes.func,

        page: PropTypes.number.isRequired,
        term: PropTypes.string.isRequired,
        onTermChange: PropTypes.func.isRequired,

        // the type of user list row to render
        rowComponentType: PropTypes.func,
    };

    static defaultProps = {
        users: [],
        usersPerPage: 50, // eslint-disable-line no-magic-numbers
        extraInfo: {},
        actions: [],
        actionProps: {},
        actionUserProps: {},
        showTeamToggle: false,
        focusOnMount: false,
    };

    constructor(props) {
        super(props);

        this.nextTimeoutId = 0;

        this.state = {
            nextDisabled: false,
        };
    }

    componentDidMount() {
        this.focusSearchBar();
    }

    componentWillUnmount() {
        clearTimeout(this.nextTimeoutId);
    }

    nextPage = () => {
        this.props.nextPage();
    }

    focusSearchBar = () => {
        if (this.props.focusOnMount) {
            this.refs.filter.focus();
        }
    }

    handleInput = (e) => {
        this.props.onTermChange(e.target.value);
        this.props.search(e.target.value);
    }

    renderCount = (users) => {
        if (!users) {
            return null;
        }

        if (this.props.filter) {
            return null;
        }

        const count = users.length;
        const total = this.props.total;

        if (this.props.renderCount) {
            return this.props.renderCount(count, this.props.total);
        }

        if (this.props.total) {
            return (
                <FormattedMessage
                    id='filtered_user_list.countTotal'
                    defaultMessage='{count, number} {count, plural, one {member} other {members}} of {total, number} total'
                    values={{
                        count,
                        total,
                    }}
                />
            );
        }

        return null;
    }

    render() {
        let usersToDisplay;
        let hasMore;

        if (this.props.term || !this.props.users) {
            usersToDisplay = this.props.users;
        } else {
            usersToDisplay = this.props.users.slice(0, (this.props.page + 1) * this.props.usersPerPage);
            hasMore = usersToDisplay.length < this.props.total;
        }

        let filterRow;
        if (this.props.renderFilterRow) {
            filterRow = this.props.renderFilterRow(this.handleInput);
        } else {
            filterRow = (
                <div className='col-xs-12'>
                    <label
                        className='hidden-label'
                        htmlFor='searchUsersInput'
                    >
                        <FormattedMessage
                            id='filtered_user_list.search'
                            defaultMessage='Search users'
                        />
                    </label>
                    <QuickInput
                        id='searchUsersInput'
                        ref='filter'
                        className='form-control filter-textbox'
                        placeholder={{id: t('filtered_user_list.search'), defaultMessage: 'Search users'}}
                        inputComponent={LocalizedInput}
                        value={this.props.term}
                        onInput={this.handleInput}
                    />
                </div>
            );
        }

        return (
            <div className='filtered-user-list'>
                <div className='filter-row'>
                    {filterRow}
                    <div className='col-sm-12'>
                        <span
                            id='searchableUserListTotal'
                            className='member-count pull-left'
                            aria-live='polite'
                        >
                            {this.renderCount(usersToDisplay)}
                        </span>
                    </div>
                </div>
                <div className='more-modal__list'>
                    <UserList
                        ref='userList'
                        hasMore={hasMore}
                        loadMore={this.nextPage}
                        pageLoading={this.props.pageLoading}
                        users={usersToDisplay}
                        extraInfo={this.props.extraInfo}
                        actions={this.props.actions}
                        actionProps={this.props.actionProps}
                        actionUserProps={this.props.actionUserProps}
                        rowComponentType={this.props.rowComponentType}
                    />
                </div>
            </div>
        );
    }
}
