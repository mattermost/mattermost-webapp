// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';

import {injectIntl} from 'react-intl';
import classNames from 'classnames';

import {debounce} from 'mattermost-redux/actions/helpers';

import {intlShape} from 'utils/react_intl';
import * as Utils from 'utils/utils.jsx';
import {searchHintOptions} from 'utils/constants';

import SearchResultsHeader from 'components/search_results_header';
import SearchResultsItem from 'components/search_results_item';
import SearchHint from 'components/search_hint/search_hint';
import LoadingSpinner from 'components/widgets/loading/loading_wrapper';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator.tsx';
import FlagIcon from 'components/widgets/icons/flag_icon';

import {NoResultsVariant} from 'components/no_results_indicator/types';

const GET_MORE_BUFFER = 30;

export function renderView(props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

export function shouldRenderFromPropsAndState(props, nextProps, state, nextState) {
    // Shallow compare for all props except 'results'
    for (const key in nextProps) {
        if (!nextProps.hasOwnProperty(key) || key === 'results') {
            continue;
        }

        if (nextProps[key] !== props[key]) {
            return true;
        }
    }

    // Shallow compare state
    for (const key in nextState) {
        if (!nextState.hasOwnProperty(key)) {
            continue;
        }

        if (nextState[key] !== state[key]) {
            return true;
        }
    }

    // Here we do a slightly deeper compare on 'results' because it is frequently a new
    // array but without any actual changes
    const results = props.results;
    const nextResults = nextProps.results;

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
}
class SearchResults extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        matches: PropTypes.object,
        searchTerms: PropTypes.string,
        isSearchingTerm: PropTypes.bool,
        isSearchingFlaggedPost: PropTypes.bool,
        isSearchingPinnedPost: PropTypes.bool,
        isSearchGettingMore: PropTypes.bool,
        isSearchAtEnd: PropTypes.bool,
        searchPage: PropTypes.number,
        compactDisplay: PropTypes.bool,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        isPinnedPosts: PropTypes.bool,
        isCard: PropTypes.bool,
        channelDisplayName: PropTypes.string.isRequired,
        isOpened: PropTypes.bool,
        updateSearchTerms: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            getMorePostsForSearch: PropTypes.func.isRequired,
        }),
        intl: intlShape.isRequired,
        isSideBarExpanded: PropTypes.bool,
    };

    static defaultProps = {
        matches: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        };
        this.scrollbars = React.createRef();
    }

    componentDidMount() {
        this.scrollToTop();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shouldRenderFromPropsAndState(this.props, nextProps, this.state, nextState);
    }

    componentDidUpdate(prevProps) {
        if (this.props.searchTerms !== prevProps.searchTerms) {
            this.scrollToTop();
        }
    }

    handleResize = () => {
        this.setState({
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        });
    }

    scrollToTop = () => {
        this.scrollbars.current.scrollToTop();
    }

    handleScroll = () => {
        if (!this.props.isFlaggedPosts && !this.props.isPinnedPosts && !this.props.isSearchingTerm && !this.props.isSearchGettingMore) {
            const scrollHeight = this.scrollbars.current.getScrollHeight();
            const scrollTop = this.scrollbars.current.getScrollTop();
            const clientHeight = this.scrollbars.current.getClientHeight();
            if ((scrollTop + clientHeight + GET_MORE_BUFFER) >= scrollHeight) {
                this.loadMorePosts();
            }
        }
    }

    loadMorePosts = debounce(() => {
        this.props.actions.getMorePostsForSearch();
    }, 100);

    render() {
        const results = this.props.results;
        const noResults = (!results || results.length === 0);
        const searchTerms = this.props.searchTerms;

        // to avoid loading icon showing infinitely, if the first page
        // has results but no scroll, trigger the second page search
        // to mark search as ended
        if (this.props.searchPage === 0 && !noResults && !this.props.isSearchAtEnd) {
            this.loadMorePosts();
        }

        let ctls = null;
        let loadingMorePostsComponent = null;

        if (
            this.props.isSearchingTerm ||
            this.props.isSearchingFlaggedPost ||
            this.props.isSearchingPinnedPost ||
            !this.props.isOpened
        ) {
            ctls = (
                <div className='sidebar--right__subheader a11y__section'>
                    <div className='sidebar--right__loading'>
                        <LoadingSpinner text={Utils.localizeMessage('search_header.loading', 'Searching')}/>
                    </div>
                </div>
            );
        } else if (this.props.isFlaggedPosts && noResults) {
            ctls = (
                <div
                    className={classNames(['sidebar--right__subheader a11y__section',
                        {'sidebar-expanded': this.props.isSideBarExpanded && noResults}])}
                >
                    <NoResultsIndicator
                        variant={NoResultsVariant.FlaggedPosts}
                        subtitleValues={{icon: <FlagIcon className='icon  no-results__mini_icon'/>}}
                    />
                </div>
            );
        } else if (this.props.isPinnedPosts && noResults) {
            ctls = (
                <div
                    className={classNames(['sidebar--right__subheader a11y__section',
                        {'sidebar-expanded': this.props.isSideBarExpanded && noResults}])}
                >
                    <NoResultsIndicator
                        variant={NoResultsVariant.PinnedPosts}
                        subtitleValues={{text: <strong>{'Pin to Channel'}</strong>}}
                    />
                </div>
            );
        } else if (!searchTerms && noResults && !this.props.isMentionSearch) {
            ctls = (
                <div className='sidebar--right__subheader search__hints a11y__section'>
                    <SearchHint
                        onOptionSelected={this.props.updateSearchTerms}
                        options={searchHintOptions}
                    />
                </div>
            );
        } else if (this.props.isMentionSearch && noResults) {
            ctls = (
                <div
                    className={classNames(['sidebar--right__subheader a11y__section',
                        {'sidebar-expanded': this.props.isSideBarExpanded && noResults}])}
                >
                    <NoResultsIndicator
                        variant={NoResultsVariant.Mentions}
                    />
                </div>
            );
        } else if (noResults) {
            ctls = (
                <div
                    className={classNames(['sidebar--right__subheader a11y__section',
                        {'sidebar-expanded': this.props.isSideBarExpanded && noResults}])}
                >
                    <NoResultsIndicator
                        variant={NoResultsVariant.ChannelSearch}
                        titleValues={{channelName: `"${this.props.searchTerms}"`}}
                    />
                </div>
            );
        } else {
            let sortedResults;
            if (this.props.isPinnedPosts) {
                sortedResults = [...results];
                sortedResults.sort((postA, postB) => postB.create_at - postA.create_at);
            } else {
                sortedResults = results;
            }

            ctls = sortedResults.map((post, index) => {
                return (
                    <SearchResultsItem
                        key={post.id}
                        compactDisplay={this.props.compactDisplay}
                        post={post}
                        matches={this.props.matches[post.id]}
                        term={(!this.props.isFlaggedPosts && !this.props.isPinnedPosts && !this.props.isMentionSearch) ? searchTerms : ''}
                        isMentionSearch={this.props.isMentionSearch}
                        a11yIndex={index}
                        isFlaggedPosts={this.props.isFlaggedPosts}
                        isPinnedPosts={this.props.isPinnedPosts}
                    />
                );
            }, this);

            if (!this.props.isSearchAtEnd && !this.props.isFlaggedPosts && !this.props.isPinnedPosts) {
                loadingMorePostsComponent = (
                    <div className='loading-screen'>
                        <div className='loading__content'>
                            <div className='round round-1'/>
                            <div className='round round-2'/>
                            <div className='round round-3'/>
                        </div>
                    </div>
                );
            }
        }

        var formattedTitle = this.props.intl.formatMessage({
            id: 'search_header.results',
            defaultMessage: 'Search Results',
        });

        const channelName = this.props.channelDisplayName;

        if (this.props.isMentionSearch) {
            formattedTitle = this.props.intl.formatMessage({
                id: 'search_header.title2',
                defaultMessage: 'Recent Mentions',
            });
        } else if (this.props.isFlaggedPosts) {
            formattedTitle = this.props.intl.formatMessage({
                id: 'search_header.title3',
                defaultMessage: 'Saved Posts',
            });
        } else if (this.props.isPinnedPosts) {
            formattedTitle = this.props.intl.formatMessage({
                id: 'channel_header.pinnedPosts',
                defaultMessage: 'Pinned Posts',
            });
        } else if (this.props.isCard) {
            formattedTitle = this.props.intl.formatMessage({
                id: 'search_header.title5',
                defaultMessage: 'Extra information',
            });
        } else if (!searchTerms && noResults) {
            formattedTitle = this.props.intl.formatMessage({
                id: 'search_bar.search',
                defaultMessage: 'Search',
            });
        }

        return (
            <div
                id='searchContainer'
                className='sidebar-right__body'
            >
                <SearchResultsHeader>
                    {formattedTitle}
                    {channelName && <div className='sidebar--right__title__channel'>{channelName}</div>}
                </SearchResultsHeader>
                <Scrollbars
                    ref={this.scrollbars}
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    onScroll={this.handleScroll}
                >
                    <div
                        id='search-items-container'
                        role='application'
                        className={classNames(['search-items-container post-list__table a11y__region', {'no-results': noResults}])}
                        data-a11y-sort-order='3'
                        data-a11y-focus-child={true}
                        data-a11y-loop-navigation={false}
                        aria-label={this.props.intl.formatMessage({
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
    }
}

export default injectIntl(SearchResults);
/* eslint-enable react/no-string-refs */
