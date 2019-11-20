// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants';

import AbstractList, {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import {browserHistory} from 'utils/browser_history';

import SearchIcon from 'components/widgets/icons/search_icon';

import ChannelRow from './channel_row';

export default class ChannelList extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            searchAllChannels: PropTypes.func.isRequired,
            getData: PropTypes.func.isRequired,
        }).isRequired,
        data: PropTypes.array,
        total: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            searchString: '',
            channels: [],
            searchTotalCount: 0,
            pageResetKey: 0,
        };
    }

    searchBar = () => {
        return (
            <div className='groups-list--global-actions'>
                <div className='group-list-search'>
                    <input
                        type='text'
                        placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                        onKeyUp={this.handleChannelSearchKeyUp}
                        onChange={this.searchBarChangeHandler}
                        value={this.state.searchString}
                        data-testid='search-input'
                    />
                    <SearchIcon
                        id='searchIcon'
                        className='search__icon'
                        aria-hidden='true'
                    />
                    <i
                        className={'fa fa-times-circle group-filter-action ' + (this.state.searchString.length ? '' : 'hidden')}
                        onClick={this.resetSearch}
                        data-testid='clear-search'
                    />
                </div>
            </div>
        );
    }

    searchBarChangeHandler = (e) => {
        this.setState({searchString: e.target.value});
    }

    handleChannelSearchKeyUp = async (e) => {
        const {key} = e;
        const {searchString} = this.state;

        if (key === Constants.KeyCodes.ENTER[0]) {
            if (searchString.length > 1) {
                const response = await this.props.actions.searchAllChannels(searchString, '', false, 0, PAGE_SIZE);
                this.setState({searchMode: true, channels: response.data.channels, searchTotalCount: response.data.total_count, pageResetKey: Date.now()});
            }
        }

        if (searchString.length === 0) {
            this.resetSearch();
        }
    }

    getDataBySearch = async (page, perPage) => {
        const response = await this.props.actions.searchAllChannels(this.state.searchString, '', false, page, perPage);
        const channels = new Array(page * perPage); // Pad the array with empty entries because AbstractList expects to slice the results based on the pagination offset.
        return channels.concat(response.data.channels);
    }

    resetSearch = () => {
        this.setState({searchString: '', channels: [], searchMode: false, searchTotalCount: 0, pageResetKey: Date.now()});
    }

    header() {
        return (
            <>
                {this.searchBar()}
                <div className='groups-list--header'>
                    <div className='group-name adjusted'>
                        <FormattedMessage
                            id='admin.channel_settings.channel_list.nameHeader'
                            defaultMessage='Name'
                        />
                    </div>
                    <div className='group-description'>
                        <FormattedMessage
                            id='admin.channel_settings.channel_list.teamHeader'
                            defaultMessage='Team'
                        />
                    </div>
                    <div className='group-description adjusted'>
                        <FormattedMessage
                            id='admin.channel_settings.channel_list.managementHeader'
                            defaultMessage='Management'
                        />
                    </div>
                    <div className='group-actions'/>
                </div>
            </>
        );
    }

    onPageChangedCallback = (pagination, channels) => {
        if (this.state.searchMode) {
            this.setState({channels});
        }
    }

    render() {
        const absProps = {...this.props};
        if (this.state.searchMode) {
            absProps.actions.getData = this.getDataBySearch;
        }
        return (
            <AbstractList
                header={this.header()}
                renderRow={this.renderRow}
                {...absProps}
                key={this.state.pageResetKey}
                onPageChangedCallback={this.onPageChangedCallback}
                data={this.state.searchMode ? this.state.channels : this.props.data}
                total={this.state.searchMode ? this.state.searchTotalCount : this.props.total}
            />);
    }

    renderRow = (item) => {
        return (
            <ChannelRow
                key={item.id}
                channel={item}
                onRowClick={this.onChannelClick}
            />
        );
    }

    onChannelClick = (id) => {
        browserHistory.push(`/admin_console/user_management/channels/${id}`);
    }
}

