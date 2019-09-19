// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import GroupRow from 'components/admin_console/group_settings/group_row.jsx';
import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';
import SearchIcon from 'components/widgets/icons/search_icon';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon.jsx';

import {Constants} from 'utils/constants';

const LDAP_GROUPS_PAGE_SIZE = 200;

const FILTER_STATE_SEARCH_KEY_MAPPING = {
    filterIsConfigured: {filter: 'is:configured', option: {is_configured: true}},
    filterIsUnconfigured: {filter: 'is:notconfigured', option: {is_configured: false}},
    filterIsLinked: {filter: 'is:linked', option: {is_linked: true}},
    filterIsUnlinked: {filter: 'is:notlinked', option: {is_linked: false}},
};

export default class GroupsList extends React.PureComponent {
    static propTypes = {
        groups: PropTypes.arrayOf(PropTypes.object),
        total: PropTypes.number,
        actions: PropTypes.shape({
            getLdapGroups: PropTypes.func.isRequired,
            link: PropTypes.func.isRequired,
            unlink: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        groups: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            checked: {},
            loading: true,
            page: 0,
            showFilters: false,
            searchString: '',
        };
        Object.entries(FILTER_STATE_SEARCH_KEY_MAPPING).forEach(([key]) => {
            this.state[key] = false;
        });
    }

    closeFilters = () => {
        this.setState({showFilters: false});
    }

    componentDidMount() {
        this.props.actions.getLdapGroups(this.state.page, LDAP_GROUPS_PAGE_SIZE).then(() => {
            this.setState({loading: false});
        });
    }

    previousPage = async (e) => {
        e.preventDefault();
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({checked: {}, page, loading: true});
        this.searchGroups(page);
    }

    nextPage = async (e) => {
        e.preventDefault();
        const page = this.state.page + 1;
        this.setState({checked: {}, page, loading: true});
        this.searchGroups(page);
    }

    onCheckToggle = (key) => {
        const newChecked = {...this.state.checked};
        newChecked[key] = !newChecked[key];
        this.setState({checked: newChecked});
    }

    linkSelectedGroups = () => {
        for (const group of this.props.groups) {
            if (this.state.checked[group.primary_key] && !group.mattermost_group_id) {
                this.props.actions.link(group.primary_key);
            }
        }
    }

    unlinkSelectedGroups = () => {
        for (const group of this.props.groups) {
            if (this.state.checked[group.primary_key] && group.mattermost_group_id) {
                this.props.actions.unlink(group.primary_key);
            }
        }
    }

    selectionActionButtonType = () => {
        let hasSelectedLinked = false;
        for (const group of this.props.groups) {
            if (this.state.checked[group.primary_key]) {
                if (!group.mattermost_group_id) {
                    return 'link';
                }
                hasSelectedLinked = true;
            }
        }
        if (hasSelectedLinked) {
            return 'unlink';
        }

        return 'disabled';
    }

    renderSelectionActionButton = () => {
        switch (this.selectionActionButtonType()) {
        case 'link':
            return (
                <button
                    className='btn btn-primary'
                    onClick={this.linkSelectedGroups}
                >
                    <i className='icon fa fa-link'/>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.link_selected'
                        defaultMessage='Link Selected Groups'
                    />
                </button>
            );
        case 'unlink':
            return (
                <button
                    className='btn btn-primary'
                    onClick={this.unlinkSelectedGroups}
                >
                    <i className='icon fa fa-unlink'/>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.unlink_selected'
                        defaultMessage='Unlink Selected Groups'
                    />
                </button>
            );
        default:
            return (
                <button
                    className='btn btn-inactive disabled'
                >
                    <i className='icon fa fa-link'/>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.link_selected'
                        defaultMessage='Link Selected Groups'
                    />
                </button>
            );
        }
    }

    renderRows = () => {
        if (this.state.loading) {
            return (
                <div className='groups-list-loading'>
                    <i className='fa fa-spinner fa-pulse fa-2x'/>
                </div>
            );
        }
        if (this.props.groups.length === 0) {
            return (
                <div className='groups-list-empty'>
                    <FormattedMessage
                        id='admin.group_settings.groups_list.no_groups_found'
                        defaultMessage='No groups found'
                    />
                </div>
            );
        }
        return this.props.groups.map((item) => {
            return (
                <GroupRow
                    key={item.primary_key}
                    primary_key={item.primary_key}
                    name={item.name}
                    mattermost_group_id={item.mattermost_group_id}
                    has_syncables={item.has_syncables}
                    failed={item.failed}
                    checked={Boolean(this.state.checked[item.primary_key])}
                    onCheckToggle={this.onCheckToggle}
                    actions={{
                        link: this.props.actions.link,
                        unlink: this.props.actions.unlink,
                    }}
                />
            );
        });
    }

    regex = (str) => {
        return new RegExp(`(${str})`, 'i');
    }

    searchGroups = (page) => {
        let {searchString} = this.state;

        const newState = {...this.state};
        delete newState.page;
        delete newState.checked;

        let q = searchString;
        let opts = {q: ''};

        Object.entries(FILTER_STATE_SEARCH_KEY_MAPPING).forEach(([key, value]) => {
            const re = this.regex(value.filter);
            if (re.test(searchString)) {
                newState[key] = true;
                q = q.replace(re, '');
                opts = Object.assign(opts, value.option);
            } else if (this.state[key]) {
                searchString += ' ' + value.filter;
            }
        });

        opts.q = q.trim();

        newState.searchString = searchString;
        newState.showFilters = false;
        newState.loading = true;
        newState.showFilters = false;
        this.setState(newState);

        this.props.actions.getLdapGroups(page, LDAP_GROUPS_PAGE_SIZE, opts).then(() => {
            this.setState({loading: false});
        });
    }

    handleGroupSearchKeyUp = (e) => {
        const {key} = e;
        const {searchString} = this.state;
        if (key === Constants.KeyCodes.ENTER[0]) {
            this.setState({page: 0});
            this.searchGroups();
        }
        const newState = {};
        Object.entries(FILTER_STATE_SEARCH_KEY_MAPPING).forEach(([k, value]) => {
            if (!this.regex(value.filter).test(searchString)) {
                newState[k] = false;
            }
        });
        this.setState(newState);
    }

    newSearchString = (searchString, stateKey, checked) => {
        let newSearchString = searchString;
        const {filter} = FILTER_STATE_SEARCH_KEY_MAPPING[stateKey];
        const re = this.regex(filter);
        const stringFilterPresent = re.test(searchString);

        if (stringFilterPresent && !checked) {
            newSearchString = searchString.replace(re, '').trim();
        }

        if (!stringFilterPresent && checked) {
            newSearchString += ' ' + filter;
        }

        return newSearchString.replace(/\s{2,}/g, ' ');
    }

    handleFilterCheck = (updates) => {
        let {searchString} = this.state;
        updates.forEach((item) => {
            searchString = this.newSearchString(searchString, item[0], item[1]);
            this.setState({[item[0]]: item[1]});
        });
        this.setState({searchString});
    }

    renderSearchFilters = () => {
        return (
            <div
                id='group-filters'
                className='group-search-filters'
                onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation();
                }}
            >
                <div className='filter-row'>
                    <span
                        className={'filter-check ' + (this.state.filterIsLinked ? 'checked' : '')}
                        onClick={() => this.handleFilterCheck([['filterIsLinked', !this.state.filterIsLinked], ['filterIsUnlinked', false]])}
                    >
                        {this.state.filterIsLinked && <CheckboxCheckedIcon/>}
                    </span>
                    <span>
                        <FormattedMessage
                            id='admin.group_settings.filters.isLinked'
                            defaultMessage='Is Linked'
                        />
                    </span>
                </div>
                <div className='filter-row'>
                    <span
                        className={'filter-check ' + (this.state.filterIsUnlinked ? 'checked' : '')}
                        onClick={() => this.handleFilterCheck([['filterIsUnlinked', !this.state.filterIsUnlinked], ['filterIsLinked', false]])}
                    >
                        {this.state.filterIsUnlinked && <CheckboxCheckedIcon/>}
                    </span>
                    <span>
                        <FormattedMessage
                            id='admin.group_settings.filters.isUnlinked'
                            defaultMessage='Is Not Linked'
                        />
                    </span>
                </div>
                <div className='filter-row'>
                    <span
                        className={'filter-check ' + (this.state.filterIsConfigured ? 'checked' : '')}
                        onClick={() => this.handleFilterCheck([['filterIsConfigured', !this.state.filterIsConfigured], ['filterIsUnconfigured', false]])}
                    >
                        {this.state.filterIsConfigured && <CheckboxCheckedIcon/>}
                    </span>
                    <span>
                        <FormattedMessage
                            id='admin.group_settings.filters.isConfigured'
                            defaultMessage='Is Configured'
                        />
                    </span>
                </div>
                <div className='filter-row'>
                    <span
                        className={'filter-check ' + (this.state.filterIsUnconfigured ? 'checked' : '')}
                        onClick={() => this.handleFilterCheck([['filterIsUnconfigured', !this.state.filterIsUnconfigured], ['filterIsConfigured', false]])}
                    >
                        {this.state.filterIsUnconfigured && <CheckboxCheckedIcon/>}
                    </span>
                    <span>
                        <FormattedMessage
                            id='admin.group_settings.filters.isUnconfigured'
                            defaultMessage='Is Not Configured'
                        />
                    </span>
                </div>
                <a
                    onClick={() => {
                        this.setState({page: 0});
                        this.searchGroups(0);
                    }}
                    className='btn btn-primary search-groups-btn'
                >
                    <FormattedMessage
                        id='search_bar.search'
                        defaultMessage='Search'
                    />
                </a>
            </div>
        );
    }

    resetFiltersAndSearch = () => {
        const newState = {
            showFilters: false,
            searchString: '',
            loading: true,
            page: 0,
        };
        Object.entries(FILTER_STATE_SEARCH_KEY_MAPPING).forEach(([key]) => {
            newState[key] = false;
        });
        this.setState(newState);
        this.props.actions.getLdapGroups(this.state.page, LDAP_GROUPS_PAGE_SIZE, {q: ''}).then(() => {
            this.setState({loading: false});
        });
    };

    render = () => {
        const startCount = (this.state.page * LDAP_GROUPS_PAGE_SIZE) + 1;
        let endCount = (this.state.page * LDAP_GROUPS_PAGE_SIZE) + LDAP_GROUPS_PAGE_SIZE;
        const total = this.props.total;
        if (endCount > total) {
            endCount = total;
        }
        const lastPage = endCount === total;
        const firstPage = this.state.page === 0;
        return (
            <div className='groups-list'>
                <div className='groups-list--global-actions'>
                    <div className='group-list-search'>
                        <input
                            type='text'
                            placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                            onKeyUp={this.handleGroupSearchKeyUp}
                            onChange={(e) => this.setState({searchString: e.target.value})}
                            value={this.state.searchString}
                        />
                        <SearchIcon
                            id='searchIcon'
                            className='search__icon'
                            aria-hidden='true'
                        />
                        <i
                            className={'fa fa-times-circle group-filter-action ' + (this.state.searchString.length ? '' : 'hidden')}
                            onClick={this.resetFiltersAndSearch}
                        />
                        <i
                            className={'fa fa-caret-down group-filter-action ' + (this.state.showFilters ? 'hidden' : '')}
                            onClick={() => {
                                document.addEventListener('click', this.closeFilters, {once: true});
                                this.setState({showFilters: true});
                            }}
                        />
                    </div>
                    {this.state.showFilters && this.renderSearchFilters()}
                    <div className='group-list-link-unlink'>
                        {this.renderSelectionActionButton()}
                    </div>
                </div>
                <div className='groups-list--header'>
                    <div className='group-name'>
                        <FormattedMessage
                            id='admin.group_settings.groups_list.nameHeader'
                            defaultMessage='Name'
                        />
                    </div>
                    <div className='group-description'>
                        <FormattedMessage
                            id='admin.group_settings.groups_list.mappingHeader'
                            defaultMessage='Mattermost Linking'
                        />
                    </div>
                    <div className='group-actions'/>
                </div>
                <div className='groups-list--body'>
                    {this.renderRows()}
                </div>
                <div className='groups-list--footer'>
                    <div className='counter'>
                        <FormattedMessage
                            id='admin.group_settings.groups_list.paginatorCount'
                            defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                            values={{
                                startCount,
                                endCount,
                                total,
                            }}
                        />
                    </div>
                    <button
                        className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                        onClick={firstPage ? null : this.previousPage}
                        disabled={firstPage}
                    >
                        <PreviousIcon/>
                    </button>
                    <button
                        className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                        onClick={lastPage ? null : this.nextPage}
                        disabled={lastPage}
                    >
                        <NextIcon/>
                    </button>
                </div>
            </div>
        );
    }
}

