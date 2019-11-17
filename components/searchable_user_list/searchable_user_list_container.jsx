// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SearchableUserList from './searchable_user_list.jsx';

export default class SearchableUserListContainer extends React.Component {
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
            pageLoading: false,
        };
    }

    handleTermChange = (term) => {
        this.setState({term});
    }

    nextPage = async () => {
        if (this.state.pageLoading) {
            return;
        }

        this.setState({pageLoading: true});
        await this.props.nextPage(this.state.page);
        this.setState({page: this.state.page + 1, pageLoading: false});
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
                search={this.search}
                page={this.state.page}
                term={this.state.term}
                onTermChange={this.handleTermChange}
            />
        );
    }
}
