// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SearchableUserList from './searchable_user_list.jsx';

export default class SearchableUserListContainer extends React.PureComponent {
    static propTypes = {
        users: PropTypes.arrayOf(PropTypes.object),
        usersPerPage: PropTypes.number,
        total: PropTypes.number,
        extraInfo: PropTypes.object,
        nextPage: PropTypes.func.isRequired,
        search: PropTypes.func.isRequired,
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,
        focusOnMount: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {
            term: '',
            page: 0,
        };
    }

    handleTermChange = (term) => {
        this.setState({term});
    }

    nextPage = () => {
        this.setState({page: this.state.page + 1});

        this.props.nextPage(this.state.page + 1);
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    search = (term) => {
        this.props.search(term);

        if (term !== '') {
            this.setState({page: 0});
        }
    }

    render() {
        return (
            <SearchableUserList
                {...this.props}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                search={this.search}
                page={this.state.page}
                term={this.state.term}
                onTermChange={this.handleTermChange}
            />
        );
    }
}
