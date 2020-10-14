// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React, {useEffect, useRef, useState} from 'react';
import Scrollbars from 'react-custom-scrollbars';

import {injectIntl, IntlShape} from 'react-intl';
import classNames from 'classnames';

import {debounce} from 'mattermost-redux/actions/helpers';

import * as Utils from 'utils/utils.jsx';
import {searchHintOptions} from 'utils/constants';

import SearchResultsHeader from 'components/search_results_header';
import SearchResultsItem from 'components/search_results_item';
import SearchHint from 'components/search_hint/search_hint';
import LoadingSpinner from 'components/widgets/loading/loading_wrapper';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';
import FlagIcon from 'components/widgets/icons/flag_icon';

import {NoResultsVariant} from 'components/no_results_indicator/types';
import {Post} from "mattermost-redux/types/posts";

const GET_MORE_BUFFER = 30;

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

const shouldRenderFromProps = (props: Props, nextProps: Props): boolean => {
    // Shallow compare for all props except 'results'
    for (const key in nextProps) {
        // if (!nextProps.hasOwnProperty(key) || key === 'results') {
        if (!Object.prototype.hasOwnProperty.call(nextProps, key) || key === 'results') {
            continue;
        }

        if (nextProps[key] !== props[key]) {
            return true;
        }
    }

    // Here we do a slightly deeper compare on 'results' because it is frequently a new
    // array but without any actual changes
    const {results} = props;
    const {results: nextResults} = nextProps;

    if (results.length !== nextResults.length) {
        return true;
    }

    for (let i = 0; i < results.length; i++) {
        // Only need a shallow compare on each post
        if (results[i] !== nextResults[i]) {
            return true;
        }
    }

    return false;
};

interface NoResultsProps {
    variant: NoResultsVariant,
    titleValues?: Record<string, JSX.Element|string>
    subtitleValues?: Record<string, JSX.Element|string>
}

type Props = {
    [key: string]: unknown,
    children?: React.ReactNode,
    results: Post[],
    matches: Record<string, unknown>,
    channelDisplayName: string,
    searchTerms: string,
    isSearchingTerm: boolean,
    isSearchingFlaggedPost: boolean,
    isSearchingPinnedPost: boolean,
    isSearchGettingMore: boolean,
    isSearchAtEnd: boolean,
    isSideBarExpanded: boolean,
    compactDisplay: boolean,
    isMentionSearch: boolean,
    isFlaggedPosts: boolean,
    isPinnedPosts: boolean,
    isCard: boolean,
    isOpened: boolean,
    updateSearchTerms: (terms: string) => void,
    getMorePostsForSearch: () => void,
    intl: IntlShape,
}

const defaultProps: Partial<Props> = {
    matches: {},
};

const SearchResults: React.FC<Props> = (props: Props): JSX.Element => {
    const scrollbars = useRef<Scrollbars>(null);

    useEffect(() => {
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
        searchTerms,
        isCard,
        isSearchAtEnd,
        isSearchingTerm,
        isFlaggedPosts,
        isSearchingFlaggedPost,
        isPinnedPosts,
        isSearchingPinnedPost,
        isSideBarExpanded,
        isMentionSearch,
        isOpened,
        updateSearchTerms,
    } = props;

    const noResults = (!results || !Array.isArray(results) || results.length === 0);
    const isLoading = isSearchingTerm || isSearchingFlaggedPost || isSearchingPinnedPost || !isOpened;
    const showLoadMore = !isSearchAtEnd && !isFlaggedPosts && !isPinnedPosts;

    let ctls;
    let loadingMorePostsComponent;

    let sortedResults = results;

    const titleDescriptor: Record<string, string> = {};
    const noResultsprops: NoResultsProps = {
        variant: NoResultsVariant.ChannelSearch,
    };

    switch (true) {
    case isMentionSearch:
        noResultsprops.variant = NoResultsVariant.Mentions;

        titleDescriptor.id = 'search_header.title2';
        titleDescriptor.defaultMessage = 'Recent Mentions';
        break;
    case isFlaggedPosts:
        noResultsprops.variant = NoResultsVariant.FlaggedPosts;
        noResultsprops.subtitleValues = {icon: <FlagIcon className='icon  no-results__mini_icon'/>};

        titleDescriptor.id = 'search_header.title3';
        titleDescriptor.defaultMessage = 'Saved Posts';
        break;
    case isPinnedPosts:
        noResultsprops.variant = NoResultsVariant.PinnedPosts;
        noResultsprops.subtitleValues = {text: <strong>{'Pin to Channel'}</strong>};

        sortedResults = [...results];
        sortedResults.sort((postA, postB) => postB.create_at - postA.create_at);

        titleDescriptor.id = 'search_header.pinnedPosts';
        titleDescriptor.defaultMessage = 'Pinned Posts';
        break;
    case isCard:
        titleDescriptor.id = 'search_header.title5';
        titleDescriptor.defaultMessage = 'Extra information';
        break;
    case (!searchTerms && noResults):
        titleDescriptor.id = 'search_header.search';
        titleDescriptor.defaultMessage = 'Search';
        break;
    default:
        noResultsprops.titleValues = {channelName: `"${searchTerms}"`};

        titleDescriptor.id = 'search_header.results';
        titleDescriptor.defaultMessage = 'Search Results';
    }

    const formattedTitle = props.intl.formatMessage(titleDescriptor);

    switch (true) {
    case isLoading:
        ctls = (
            <div className='sidebar--right__subheader a11y__section'>
                <div className='sidebar--right__loading'>
                    <LoadingSpinner text={Utils.localizeMessage('search_header.loading', 'Searching')}/>
                </div>
            </div>
        );
        break;
    case (noResults && !searchTerms && !isMentionSearch):
        ctls = (
            <div className='sidebar--right__subheader search__hints a11y__section'>
                <SearchHint
                    onOptionSelected={updateSearchTerms}
                    options={searchHintOptions}
                />
            </div>
        );
        break;
    case noResults:
        ctls = (
            <div
                className={classNames([
                    'sidebar--right__subheader a11y__section',
                    {'sidebar-expanded': isSideBarExpanded},
                ])}
            >
                <NoResultsIndicator {...noResultsprops}/>
            </div>
        );
        break;
    default:
        ctls = sortedResults.map((post, index) => {
            return (
                <SearchResultsItem
                    key={post.id}
                    compactDisplay={props.compactDisplay}
                    post={post}
                    matches={props.matches[post.id]}
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
            className='sidebar-right__body'
        >
            <SearchResultsHeader>
                {formattedTitle}
                {props.channelDisplayName && <div className='sidebar--right__title__channel'>{props.channelDisplayName}</div>}
            </SearchResultsHeader>
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
                    className={classNames(['search-items-container post-list__table a11y__region', {'no-results': noResults}])}
                    data-a11y-sort-order='3'
                    data-a11y-focus-child={true}
                    data-a11y-loop-navigation={false}
                    aria-label={props.intl.formatMessage({
                        id: 'accessibility.sections.rhs',
                        defaultMessage: '{regionTitle} complimentary region',
                    }, {
                        regionTitle: formattedTitle,
                    })}
                >
                    {ctls}
                    {loadingMorePostsComponent}
                </div>
            </Scrollbars>
        </div>
    );
};

React.memo(SearchResults, shouldRenderFromProps);

SearchResults.defaultProps = defaultProps;

export default injectIntl(SearchResults);
