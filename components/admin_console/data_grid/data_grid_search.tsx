// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

import * as Utils from 'utils/utils.jsx';
import SearchIcon from 'components/widgets/icons/search_icon';

import './data_grid.scss';

type Props = {
    onSearch: (term: string) => void;
    placeholder: string;
}

type State = {
    term: string;
    searchTimeout?: NodeJS.Timeout;
}

class DataGridSearch extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            term: '',
        };
    }

    handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        if (this.state.searchTimeout) {
            clearTimeout(this.state.searchTimeout);
        }
        const searchTimeout = setTimeout(() => this.props.onSearch(this.state.term), 250);
        this.setState({term, searchTimeout});
    }

    render() {
        let {placeholder} = this.props;
        if (!placeholder) {
            placeholder = Utils.localizeMessage('search_bar.search', 'Search');
        }
        return (
            <div className='dg-search'>
                <div className='search-bar'>
                    <SearchIcon
                        className='search__icon'
                        aria-hidden='true'
                    />
                    <input
                        type='text'
                        placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                        onChange={this.handleSearch}
                        value={this.state.term}
                    />
                </div>
            </div>
        );
    }
}

export default DataGridSearch;
