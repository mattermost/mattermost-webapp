// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React, {createRef, ElementType, ReactElement, ReactNode} from 'react';

import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import QuickInput from 'components/quick_input';
import UserList from 'components/user_list.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n';
import {UserProfile} from 'mattermost-redux/types/users';

const NEXT_BUTTON_TIMEOUT = 500;

 type Props = {
     users: UserProfile[];
     usersPerPage: number;
     total: number;
     extraInfo?: Record<string, ReactNode>;
     nextPage: (page?: number) => Promise<void>;
     previousPage: (page?: number) => Promise<void>;
     search: (term: string) => void;
     actions?: ReactElement[];
     actionProps?: Record<string, unknown>;
     actionUserProps?: Record<string, unknown>;
     focusOnMount?: boolean;
     renderCount?: (count: number, total: number, startCount: number, endCount: number, isSearch: boolean) => ReactNode;
     filter?: string;
     renderFilterRow?: (func: {(e: React.FormEvent<HTMLInputElement>): void}) => ReactNode;
     page: number;
     term: string;
     onTermChange: (term: string) => void;
     intl: IntlShape;
     isDisabled?: boolean;

     // the type of user list row to render
     rowComponentType?: ElementType;
 }

 type State = { nextDisabled: boolean }

class SearchableUserList extends React.PureComponent<Props, State> {
    static defaultProps = {
        users: [],
        usersPerPage: 50,
        extraInfo: {},
        actions: [],
        actionProps: {},
        actionUserProps: {},
        showTeamToggle: false,
        focusOnMount: false,
    };

    private userList: React.RefObject<UserList>;
    private nextTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.state = {
            nextDisabled: false,
        };

        this.nextTimeoutId = 0;
        this.userList = createRef();
    }

    componentDidMount() {
        this.focusSearchBar();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.page !== prevProps.page || this.props.term !== prevProps.term) {
            this.userList.current?.scrollToTop();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.nextTimeoutId);
    }

    nextPage = () => {
        this.setState({nextDisabled: true});
        setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT);

        this.props.nextPage();
        this.userList.current?.scrollToTop();
    }

    previousPage = () => {
        this.props.previousPage();
        this.userList.current?.scrollToTop();
    }

    focusSearchBar = () => {
        if (this.props.focusOnMount) {
            document.getElementById('searchUsersInput')?.focus();
        }
    }

    handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        this.props.onTermChange(e.currentTarget.value);
        this.props.search(e.currentTarget.value);
    }

    renderCount = (users: UserProfile[]) => {
        if (!users) {
            return null;
        }

        if (this.props.filter) {
            return null;
        }

        const count = users.length;
        const total = this.props.total;
        const isSearch = Boolean(this.props.term);

        let startCount;
        let endCount;
        if (isSearch) {
            startCount = -1;
            endCount = -1;
        } else {
            startCount = this.props.page * this.props.usersPerPage;
            endCount = Math.min(startCount + this.props.usersPerPage, total);
            if (this.props.users.length < endCount) {
                endCount = this.props.users.length;
            }
        }

        if (this.props.renderCount) {
            return this.props.renderCount(count, this.props.total, startCount, endCount, isSearch);
        }

        if (this.props.total) {
            if (isSearch) {
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

            return (
                <FormattedMessage
                    id='filtered_user_list.countTotalPage'
                    defaultMessage='{startCount, number} - {endCount, number} {count, plural, one {member} other {members}} of {total, number} total'
                    values={{
                        count,
                        startCount: startCount + 1,
                        endCount,
                        total,
                    }}
                />
            );
        }

        return null;
    }

    render() {
        let nextButton;
        let previousButton;
        let usersToDisplay: UserProfile[];
        const formatMessage = this.props.intl;

        if (this.props.term || !this.props.users) {
            usersToDisplay = this.props.users;
        } else if (!this.props.term) {
            const pageStart = this.props.page * this.props.usersPerPage;
            let pageEnd = pageStart + this.props.usersPerPage;
            if (this.props.users.length < pageEnd) {
                pageEnd = this.props.users.length;
            }

            usersToDisplay = this.props.users.slice(pageStart, pageEnd);

            if (pageEnd < this.props.total) {
                nextButton = (
                    <button
                        id='searchableUserListNextBtn'
                        className='btn btn-link filter-control filter-control__next'
                        onClick={this.nextPage}
                        disabled={this.state.nextDisabled}
                    >
                        <FormattedMessage
                            id='filtered_user_list.next'
                            defaultMessage='Next'
                        />
                    </button>
                );
            }

            if (this.props.page > 0) {
                previousButton = (
                    <button
                        id='searchableUserListPrevBtn'
                        className='btn btn-link filter-control filter-control__prev'
                        onClick={this.previousPage}
                    >
                        <FormattedMessage
                            id='filtered_user_list.prev'
                            defaultMessage='Previous'
                        />
                    </button>
                );
            }
        }

        let filterRow;
        if (this.props.renderFilterRow) {
            filterRow = this.props.renderFilterRow(this.handleInput);
        } else {
            const searchUsersPlaceholder = {id: t('filtered_user_list.search'), defaultMessage: 'Search users'};
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
                        placeholder={searchUsersPlaceholder}
                        inputComponent={LocalizedInput}
                        value={this.props.term}
                        onInput={this.handleInput}
                        aria-label={formatMessage(searchUsersPlaceholder).toLowerCase()}
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
                        users={usersToDisplay}
                        extraInfo={this.props.extraInfo}
                        actions={this.props.actions}
                        actionProps={this.props.actionProps}
                        actionUserProps={this.props.actionUserProps}
                        rowComponentType={this.props.rowComponentType}
                        isDisabled={this.props.isDisabled}
                    />
                </div>
                <div className='filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}

export default injectIntl(SearchableUserList);
/* eslint-enable react/no-string-refs */
