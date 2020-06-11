// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent} from 'react';

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
