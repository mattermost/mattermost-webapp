// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as Utils from 'utils/utils.jsx';
import SearchIcon from 'components/widgets/icons/search_icon';

import './data_grid.scss';

type Props = {
    onSearch: (term: string) => void;
    placeholder: string;
    term: string;
}

class DataGridSearch extends React.PureComponent<Props> {
    handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        this.props.onSearch(term);
    }

    render() {
        let {placeholder} = this.props;
        if (!placeholder) {
            placeholder = Utils.localizeMessage('search_bar.search', 'Search');
        }
        return (
            <div className='DataGrid_search'>
                <div className='DataGrid_searchBar'>
                    <SearchIcon
                        className='DataGrid_searchIcon'
                        aria-hidden='true'
                    />
                    <input
                        type='text'
                        placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                        onChange={this.handleSearch}
                        value={this.props.term}
                    />
                </div>
            </div>
        );
    }
}

export default DataGridSearch;
