// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, ReactNode, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {localizeMessage} from 'utils/utils';

import LoadingScreen from 'components/loading_screen';
import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';
import SearchIcon from 'components/widgets/icons/fa_search_icon';

import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list';

type Props = {
    children?: ReactNode | ((filter: string) => void);
    header: ReactNode;
    addLink?: string;
    addText?: ReactNode;
    addButtonId?: string;
    emptyText?: ReactNode;
    emptyTextSearch?: JSX.Element;
    helpText?: ReactNode;
    loading: boolean;
    searchPlaceholder?: string;
    page?: number;
    nextPage?: () => void;
    previousPage?: () => void;
};

const BackstageList = ({searchPlaceholder = localizeMessage('backstage_list.search', 'Search'), ...remainingProps}: Props) => {
    const [filter, setFilter] = useState('');

    const updateFilter = (e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value);

    const getPaginationProps = (total: number) => {
        const page = remainingProps.page || 0;
        const startCount = (page * PAGE_SIZE) + 1;
        let endCount = 0;
        endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;
        return {startCount, endCount};
    }

    const filterLowered = filter.toLowerCase();

    let children;
    let length;
    if (remainingProps.loading) {
        children = <LoadingScreen/>;
    } else {
        children = remainingProps.children;
        let hasChildren = true;
        if (typeof children === 'function') {
            [children, hasChildren] = children(filterLowered);
        }
        children = React.Children.map(children, (child) => {
            return React.cloneElement(child, {filterLowered});
        });
        length = children.length;
        if(remainingProps.page) {
            const {startCount, endCount} = getPaginationProps(length); 
            children = children.slice(startCount - 1, endCount);    
        }
        if (length === 0 || !hasChildren) {
            if (!filterLowered) {
                if (remainingProps.emptyText) {
                    children = (
                        <div className='backstage-list__item backstage-list__empty'>
                            {remainingProps.emptyText}
                        </div>
                    );
                }
            } else if (remainingProps.emptyTextSearch) {
                children = (
                    <div
                        className='backstage-list__item backstage-list__empty'
                        id='emptySearchResultsMessage'
                    >
                        {React.cloneElement(remainingProps.emptyTextSearch, {values: {searchTerm: filterLowered}})}
                    </div>
                );
            }
        }
    }

    let addLink = null;

    if (remainingProps.addLink && remainingProps.addText) {
        addLink = (
            <Link
                className='add-link'
                to={remainingProps.addLink}
            >
                <button
                    type='button'
                    className='btn btn-primary'
                    id={remainingProps.addButtonId}
                >
                    <span>
                        {remainingProps.addText}
                    </span>
                </button>
            </Link>
        );
    }

    let footer = null;
    const page = remainingProps.page;
    if (typeof page != 'undefined' && remainingProps.page && length) {
        const {startCount, endCount} = getPaginationProps(length)
        const firstPage = startCount <= 1;
        const lastPage = endCount >= length;

        footer = (  
            <div className='backstage-list__paging'>
                <FormattedMessage
                    id='backstage-list.paginatorCount'
                    defaultMessage={startCount + ' - ' + endCount + ' of ' + length}
                />

                <button
                    type='button'
                    className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                    onClick={firstPage ? void {} : remainingProps.previousPage}
                    disabled={firstPage}
                >
                    <PreviousIcon/>
                </button>
                <button
                    type='button'
                    className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                    onClick={lastPage ? void {} : remainingProps.nextPage}
                    disabled={lastPage}
                >
                    <NextIcon/>
                </button>
            </div>
        );
    }
    return (
        <div className='backstage-content'>
            <div className='backstage-header'>
                <h1>
                    {remainingProps.header}
                </h1>
                {addLink}
            </div>
            <div className='backstage-filters'>
                <div className='backstage-filter__search'>
                    <SearchIcon/>
                    <input
                        type='search'
                        className='form-control'
                        placeholder={searchPlaceholder}
                        value={filter}
                        onChange={updateFilter}
                        style={style.search}
                        id='searchInput'
                    />
                </div>
            </div>
            <span className='backstage-list__help'>
                {remainingProps.helpText}
            </span>
            <div className='backstage-list'>
                {children}
            </div>
            <div className='backstage-footer'>
                {footer}
            </div>
        </div>
    );
};

const style = {
    search: {flexGrow: 0, flexShrink: 0},
};

export default BackstageList;
