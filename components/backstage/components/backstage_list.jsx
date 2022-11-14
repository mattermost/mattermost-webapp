// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as Utils from 'utils/utils';
import LoadingScreen from 'components/loading_screen';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';
import SearchIcon from 'components/widgets/icons/fa_search_icon';

import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list';

export default class BackstageList extends React.PureComponent {
    static propTypes = {
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        header: PropTypes.node.isRequired,
        addLink: PropTypes.string,
        addText: PropTypes.node,
        addButtonId: PropTypes.string,
        emptyText: PropTypes.node,
        emptyTextSearch: PropTypes.node,
        helpText: PropTypes.node,
        loading: PropTypes.bool.isRequired,
        searchPlaceholder: PropTypes.string,
        nextPage: PropTypes.func,
        previousPage: PropTypes.func,
        page: PropTypes.number,
    }

    static defaultProps = {
        searchPlaceholder: Utils.localizeMessage('backstage_list.search', 'Search'),
    }

    constructor(props) {
        super(props);

        this.state = {
            filter: '',
        };
    }

    updateFilter = (e) => {
        this.setState({
            filter: e.target.value,
        });
    }

    getPaginationProps(total) {
        const page = this.props.page;
        const startCount = (page * PAGE_SIZE) + 1;
        let endCount = 0;
        endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;
        return {startCount, endCount};
    }

    nextPage = () => {
        if (!this.props.loading) {
            this.props.nextPage();
        }
    }

    previousPage = () => {
        if (!this.props.loading) {
            this.props.previousPage();
        }
    }

    renderFooter = (total) => {
        const page = this.props.page;
        if (typeof page == 'undefined') {
            return null;
        }
        let footer = null;
        if (total) {
            const {startCount, endCount} = this.getPaginationProps(total)
            const firstPage = startCount <= 1;
            const lastPage = endCount >= total;

            let prevPageFn = this.previousPage;
            if (firstPage) {
                prevPageFn = () => {};
            }

            let nextPageFn = this.nextPage;
            if (lastPage) {
                nextPageFn = () => {};
            }
            
            footer = (  
                <div className='backstage-list__paging'>
                    <FormattedMessage
                        id='backstage-list.paginatorCount'
                        defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                        values={{
                            startCount,
                            endCount,
                            total,
                        }}
                    />

                    <button
                        type='button'
                        className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                        onClick={prevPageFn}
                        disabled={firstPage}
                    >
                        <PreviousIcon/>
                    </button>
                    <button
                        type='button'
                        className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                        onClick={nextPageFn}
                        disabled={lastPage}
                    >
                        <NextIcon/>
                    </button>
                </div>
            );
        }
        return footer;
    }
    
    render() {
        const filter = this.state.filter.toLowerCase();
        let total = 0;
        let children;
        if (this.props.loading) {
            children = <LoadingScreen/>;
        } else {
            children = this.props.children;
            let hasChildren = true;
            if (typeof children === 'function') {
                [children, hasChildren] = children(filter);
            }
            children = React.Children.map(children, (child) => {
                return React.cloneElement(child, {filter});
            });
            total = children.length;
            const {startCount, endCount} = this.getPaginationProps(total); 
            children = children.slice(startCount - 1, endCount);
            if (children.length === 0 || !hasChildren) {
                if (!filter) {
                    if (this.props.emptyText) {
                        children = (
                            <div className='backstage-list__item backstage-list__empty'>
                                {this.props.emptyText}
                            </div>
                        );
                    }
                } else if (this.props.emptyTextSearch) {
                    children = (
                        <div
                            className='backstage-list__item backstage-list__empty'
                            id='emptySearchResultsMessage'
                        >
                            {React.cloneElement(this.props.emptyTextSearch, {values: {searchTerm: filter}})}
                        </div>
                    );
                }
            }
        }

        let addLink = null;

        if (this.props.addLink && this.props.addText) {
            addLink = (
                <Link
                    className='add-link'
                    to={this.props.addLink}
                >
                    <button
                        type='button'
                        className='btn btn-primary'
                        id={this.props.addButtonId}
                    >
                        <span>
                            {this.props.addText}
                        </span>
                    </button>
                </Link>
            );
        }

        return (
            <div className='backstage-content'>
                <div className='backstage-header'>
                    <h1>
                        {this.props.header}
                    </h1>
                    {addLink}
                </div>
                <div className='backstage-filters'>
                    <div className='backstage-filter__search'>
                        <SearchIcon/>
                        <input
                            type='search'
                            className='form-control'
                            placeholder={this.props.searchPlaceholder}
                            value={this.state.filter}
                            onChange={this.updateFilter}
                            style={style.search}
                            id='searchInput'
                        />
                    </div>
                </div>
                <span className='backstage-list__help'>
                    {this.props.helpText}
                </span>
                <div className='backstage-list'>
                    {children}
                </div>
                <div className='backstage-list__footer'>
                    {this.renderFooter(total)}
                </div>
            </div>
        );
    }
}

const style = {
    search: {flexGrow: 0, flexShrink: 0},
};
