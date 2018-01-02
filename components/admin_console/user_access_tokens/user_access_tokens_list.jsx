// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import SearchableItemList from '../../searchable_item_list/searchable_item_list';

export default class UserAccessTokensList extends React.PureComponent {
    static propTypes = {
        tokens: PropTypes.arrayOf(PropTypes.object),
        tokensPerPage: PropTypes.number,
        total: PropTypes.number,
        nextPage: PropTypes.func,
        search: PropTypes.func.isRequired,
        focusOnMount: PropTypes.bool,
        renderFilterRow: PropTypes.func,
        term: PropTypes.string.isRequired,
        onTermChange: PropTypes.func.isRequired
    };

    constructor() {
        super();
        this.state = {
            page: 0,
            showDeleteTokenModal: false,
            token: null
        };
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

    onDeleteToken = (token) => {
        this.setState({
            showDeleteTokenModal: true,
            token
        });
    }

    render() {
        return (
            <SearchableItemList/>
        );
    }
}
