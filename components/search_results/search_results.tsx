// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React, {useEffect, useRef, useState} from 'react';
import {MessageDescriptor, useIntl} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';

import classNames from 'classnames';

import {debounce} from 'mattermost-redux/actions/helpers';
import {FileSearchResult} from 'mattermost-redux/types/files';
import {Post} from 'mattermost-redux/types/posts';

import * as Utils from 'utils/utils.jsx';
import {searchHintOptions} from 'utils/constants';

import SearchResultsHeader from 'components/search_results_header';
import SearchResultsItem from 'components/search_results_item';
import SearchHint from 'components/search_hint/search_hint';
import LoadingSpinner from 'components/widgets/loading/loading_wrapper';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';
import FlagIcon from 'components/widgets/icons/flag_icon';
import LoadingScreen from 'components/loading_screen';

import {NoResultsVariant} from 'components/no_results_indicator/types';

import MessageOrFileSelector from './messages_or_files_selector';

import './search_results.scss';

import type {Props} from './types';

const GET_MORE_BUFFER = 30;
const FILES_SEARCH_TYPE = 'files';
const MESSAGES_SEARCH_TYPE = 'messages';

const renderView = (props: Record<string, unknown>): JSX.Element => (
    <div
        {...props}
        className='scrollbar--view'
    />
);

const renderThumbHorizontal = (props: Record<string, unknown>): JSX.Element => (
    <div
        {...props}
        className='scrollbar--horizontal'
    />
);

const renderThumbVertical = (props: Record<string, unknown>): JSX.Element => (
    <div
        {...props}
        className='scrollbar--vertical'
    />
);

interface NoResultsProps {
    variant: NoResultsVariant;
    titleValues?: Record<string, React.ReactNode>;
    subtitleValues?: Record<string, React.ReactNode>;
}

const defaultProps: Partial<Props> = {
    isCard: false,
    isOpened: false,
    channelDisplayName: '',
    children: null,
};

const SearchResults: React.FC<Props> = (props: Props): JSX.Element => {
    const scrollbars = useRef<Scrollbars|null>(null);

    const intl = useIntl();

    useEffect(() => {
        if (props.searchFilterType !== 'all') {
            props.setSearchFilterType('all');
        }
        scrollbars.current?.scrollToTop();
    }, [props.searchTerms]);

    const handleScroll = (): void => {
        if (!props.isFlaggedPosts && !props.isPinnedPosts && !props.isSearchingTerm && !props.isSearchGettingMore) {
            const scrollHeight = scrollbars.current?.getScrollHeight() || 0;
            const scrollTop = scrollbars.current?.getScrollTop() || 0;
            const clientHeight = scrollbars.current?.getClientHeight() || 0;
            if ((scrollTop + clientHeight + GET_MORE_BUFFER) >= scrollHeight) {
                loadMorePosts();
            }
        }
    };

    const loadMorePosts = debounce(
        () => {
            props.getMorePostsForSearch();
        },
        100,
        false,
        (): void => {},
    );

    const {
        results,
        fileResults,
        searchTerms,
        isCard,
        isSearchAtEnd,
        isSearchFilesAtEnd,
        isSearchingTerm,
        isFlaggedPosts,
        isSearchingFlaggedPost,
        isPinnedPosts,
        isSearchingPinnedPost,
        isSideBarExpanded,
        isMentionSearch,
        isOpened,
        updateSearchTerms,
        handleSearchHintSelection,
        searchFilterType,
        setSearchFilterType,
        searchType,
        setSearchType,
    } = props;

    const noResults = (!results || !Array.isArray(results) || results.length === 0);
    const noFileResults = (!fileResults || !Array.isArray(fileResults) || fileResults.length === 0);
    const isLoading = isSearchingTerm || isSearchingFlaggedPost || isSearchingPinnedPost || !isOpened;
    const showLoadMore = !isSearchAtEnd && !isFlaggedPosts && !isPinnedPosts;

    let contentItems;
    let loadingMorePostsComponent;

    let sortedResults: any = results;

    const titleDescriptor: MessageDescriptor = {};
    const noResultsProps: NoResultsProps = {
        variant: NoResultsVariant.ChannelSearch,
    };

    if (isMentionSearch) {
        noResultsProps.variant = NoResultsVariant.Mentions;

        titleDescriptor.id = 'search_header.title2';
        titleDescriptor.defaultMessage = 'Recent Mentions';
    } else if (isFlaggedPosts) {
        noResultsProps.variant = NoResultsVariant.FlaggedPosts;
        noResultsProps.subtitleValues = {icon: <FlagIcon className='icon  no-results__mini_icon'/>};

        titleDescriptor.id = 'search_header.title3';
        titleDescriptor.defaultMessage = 'Saved Posts';
    } else if (isPinnedPosts) {
        noResultsProps.variant = NoResultsVariant.PinnedPosts;
        noResultsProps.subtitleValues = {text: <strong>{'Pin to Channel'}</strong>};

        sortedResults = [...results];
        sortedResults.sort((postA: Post|FileSearchResult, postB: Post|FileSearchResult) => postB.create_at - postA.create_at);

        titleDescriptor.id = 'search_header.pinnedPosts';
        titleDescriptor.defaultMessage = 'Pinned Posts';
    } else if (isCard) {
        titleDescriptor.id = 'search_header.title5';
        titleDescriptor.defaultMessage = 'Extra information';
    } else if (!searchTerms && noResults && noFileResults) {
        titleDescriptor.id = 'search_header.search';
        titleDescriptor.defaultMessage = 'Search';
    } else {
        noResultsProps.titleValues = {channelName: `"${searchTerms}"`};

        titleDescriptor.id = 'search_header.results';
        titleDescriptor.defaultMessage = 'Search Results';
    }

    const formattedTitle = intl.formatMessage(titleDescriptor);

    const handleOptionSelection = (term: string): void => {
        handleSearchHintSelection();
        updateSearchTerms(term);
    };

    switch (true) {
    case isLoading:
        contentItems = (
            <div className='sidebar--right__subheader a11y__section'>
                <div className='sidebar--right__loading'>
                    <LoadingSpinner text={Utils.localizeMessage('search_header.loading', 'Searching')}/>
                </div>
            </div>
        );
        break;
    case (noResults && !searchTerms && !isMentionSearch && !isPinnedPosts && !isFlaggedPosts):
        contentItems = (
            <div className='sidebar--right__subheader search__hints a11y__section'>
                <SearchHint
                    onOptionSelected={handleOptionSelection}
                    options={searchHintOptions}
                />
            </div>
        );
        break;
    case noResults && searchType === MESSAGES_SEARCH_TYPE:
        contentItems = (
            <div
                className={classNames([
                    'sidebar--right__subheader a11y__section',
                    {'sidebar-expanded': isSideBarExpanded},
                ])}
            >
                <NoResultsIndicator {...noResultsProps}/>
            </div>
        );
        break;
    case noFileResults && searchType === FILES_SEARCH_TYPE:
        contentItems = (
            <div
                className={classNames([
                    'sidebar--right__subheader a11y__section',
                    {'sidebar-expanded': isSideBarExpanded},
                ])}
            >
                <NoResultsIndicator {...noResultsProps}/>
            </div>
        );
        break;
    default:
        if (searchType === FILES_SEARCH_TYPE) {
            sortedResults = fileResults;
        }

        contentItems = sortedResults.map((item: Post|FileSearchResult, index: number) => {
            return (
                <SearchResultsItem
                    key={item.id}
                    compactDisplay={props.compactDisplay}
                    post={searchType === MESSAGES_SEARCH_TYPE ? item : undefined}
                    fileInfo={searchType === FILES_SEARCH_TYPE ? item : undefined}
                    matches={props.matches[item.id]}
                    term={(!props.isFlaggedPosts && !props.isPinnedPosts && !props.isMentionSearch) ? searchTerms : ''}
                    isMentionSearch={props.isMentionSearch}
                    a11yIndex={index}
                    isFlaggedPosts={props.isFlaggedPosts}
                    isPinnedPosts={props.isPinnedPosts}
                />
            );
        });

        loadingMorePostsComponent = (showLoadMore) ? (
            <div className='loading-screen'>
                <div className='loading__content'>
                    <div className='round round-1'/>
                    <div className='round round-2'/>
                    <div className='round round-3'/>
                </div>
            </div>
        ) : null;
    }

    return (
        <div
            id='searchContainer'
            className='SearchResults sidebar-right__body'
        >
            <SearchResultsHeader>
                {formattedTitle}
                {props.channelDisplayName && <div className='sidebar--right__title__channel'>{props.channelDisplayName}</div>}
            </SearchResultsHeader>
            <MessageOrFileSelector
                selected={searchType}
                selectedFilter={searchFilterType}
                messagesCounter={isSearchAtEnd ? `${results.length}` : `${results.length}+`}
                filesCounter={isSearchFilesAtEnd ? `${fileResults.length}` : `${fileResults.length}+`}
                onChange={setSearchType}
                onFilter={setSearchFilterType}
            />
            <Scrollbars
                ref={scrollbars}
                autoHide={true}
                autoHideTimeout={500}
                autoHideDuration={500}
                renderThumbHorizontal={renderThumbHorizontal}
                renderThumbVertical={renderThumbVertical}
                renderView={renderView}
                onScroll={handleScroll}
            >
                <div
                    id='search-items-container'
                    role='application'
                    className={classNames(['search-items-container post-list__table a11y__region', {'no-results': (noResults && searchType === MESSAGES_SEARCH_TYPE) || (noFileResults && searchType === FILES_SEARCH_TYPE)}])}
                    data-a11y-sort-order='3'
                    data-a11y-focus-child={true}
                    data-a11y-loop-navigation={false}
                    aria-label={intl.formatMessage({
                        id: 'accessibility.sections.rhs',
                        defaultMessage: '{regionTitle} complimentary region',
                    }, {
                        regionTitle: formattedTitle,
                    })}
                >
                    {contentItems}
                    {loadingMorePostsComponent}
                </div>
            </Scrollbars>
        </div>
    );
};

SearchResults.defaultProps = defaultProps;

export const arePropsEqual = (props: Props, nextProps: Props): boolean => {
    // Shallow compare for all props except 'results' and 'fileResults'
    for (const key in nextProps) {
        if (!Object.prototype.hasOwnProperty.call(nextProps, key) || key === 'results') {
            continue;
        }

        if (!Object.prototype.hasOwnProperty.call(nextProps, key) || key === 'fileResults') {
            continue;
        }

        if (nextProps[key] !== props[key]) {
            return false;
        }
    }

    // Here we do a slightly deeper compare on 'results' because it is frequently a new
    // array but without any actual changes
    const {results} = props;
    const {results: nextResults} = nextProps;

    if (results.length !== nextResults.length) {
        return false;
    }

    for (let i = 0; i < results.length; i++) {
        // Only need a shallow compare on each post
        if (results[i] !== nextResults[i]) {
            return false;
        }
    }

    // Here we do a slightly deeper compare on 'fileResults' because it is frequently a new
    // array but without any actual changes
    const {fileResults} = props;
    const {fileResults: nextFileResults} = nextProps;

    if (fileResults.length !== nextFileResults.length) {
        return false;
    }

    for (let i = 0; i < fileResults.length; i++) {
        // Only need a shallow compare on each file
        if (fileResults[i] !== nextFileResults[i]) {
            return true;
        }
    }

    return true;
};

export default React.memo(SearchResults, arePropsEqual);
