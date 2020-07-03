// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import FaSearchIcon from 'components/widgets/icons/fa_search_icon';

import * as Utils from 'utils/utils.jsx';

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

    resetSearch = () => {
        this.props.onSearch('');
    }

    render() {
        let {placeholder} = this.props;
        if (!placeholder) {
            placeholder = Utils.localizeMessage('search_bar.search', 'Search');
        }
        return (
            <div className='DataGrid_search'>
                <div className='DataGrid_searchBar'>
                    <span
                        className='DataGrid_searchIcon'
                        aria-hidden='true'
                    >
                        <FaSearchIcon/>
                    </span>

                    <input
                        type='text'
                        placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                        onChange={this.handleSearch}
                        value={this.props.term}
                    />
                    <i
                        className={'DataGrid_clearButton fa fa-times-circle ' + (this.props.term.length ? '' : 'hidden')}
                        onClick={this.resetSearch}
                        data-testid='clear-search'
                    />
                </div>
            </div>
        );
    }
}

export default DataGridSearch;
