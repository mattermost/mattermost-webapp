// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';

import {debounce} from 'mattermost-redux/actions/helpers';

import * as Utils from 'utils/utils.jsx';

import SearchResultsHeader from 'components/search_results_header';
import SearchResultsItem from 'components/search_results_item';
import SearchHint from 'components/search_hint/search_hint';
import FlagPostSearchHint from 'components/search_hint/flag_post_search_hint';
import NoResultSearchHint from 'components/search_hint/no_result_search_hint';
import PinPostSearchHint from 'components/search_hint/pin_post_search_hint';
import LoadingSpinner from 'components/widgets/loading/loading_wrapper.jsx';

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

export default class SearchResults extends React.PureComponent {
    static propTypes = {
        results: PropTypes.array,
        matches: PropTypes.object,
        currentUser: PropTypes.object,
        searchTerms: PropTypes.string,
        isSearchingTerm: PropTypes.bool,
        isSearchingFlaggedPost: PropTypes.bool,
        isSearchingPinnedPost: PropTypes.bool,
        isSearchGettingMore: PropTypes.bool,
        isSearchAtEnd: PropTypes.bool,
        compactDisplay: PropTypes.bool,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        isPinnedPosts: PropTypes.bool,
        channelDisplayName: PropTypes.string.isRequired,
        dataRetentionEnableMessageDeletion: PropTypes.bool.isRequired,
        dataRetentionMessageRetentionDays: PropTypes.string,
        actions: PropTypes.shape({
            getMorePostsForSearch: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        matches: {},
        currentUser: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
        };
    }

    componentDidMount() {
        this.scrollToTop();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
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
        this.refs.scrollbars.scrollToTop();
    }

    handleScroll = () => {
        if (!this.props.isFlaggedPosts && !this.props.isPinnedPosts && !this.props.isSearchingTerm && !this.props.isSearchGettingMore) {
            const scrollHeight = this.refs.scrollbars.getScrollHeight();
            const scrollTop = this.refs.scrollbars.getScrollTop();
            const clientHeight = this.refs.scrollbars.getClientHeight();
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

        let ctls = null;

        if (
            this.props.isSearchingTerm ||
            this.props.isSearchingFlaggedPost ||
            this.props.isSearchingPinnedPost
        ) {
            ctls = (
                <div className='sidebar--right__subheader'>
                    <div className='sidebar--right__loading'>
                        <LoadingSpinner text={Utils.localizeMessage('search_header.loading', 'Searching')}/>
                    </div>
                </div>
            );
        } else if (this.props.isFlaggedPosts && noResults) {
            ctls = (
                <div className='sidebar--right__subheader'>
                    <FlagPostSearchHint
                        dataRetentionEnableMessageDeletion={this.props.dataRetentionEnableMessageDeletion}
                        dataRetentionMessageRetentionDays={this.props.dataRetentionMessageRetentionDays}
                    />
                </div>
            );
        } else if (this.props.isPinnedPosts && noResults) {
            ctls = (
                <div className='sidebar--right__subheader'>
                    <PinPostSearchHint
                        dataRetentionEnableMessageDeletion={this.props.dataRetentionEnableMessageDeletion}
                        dataRetentionMessageRetentionDays={this.props.dataRetentionMessageRetentionDays}
                    />
                </div>
            );
        } else if (!searchTerms && noResults) {
            ctls = (
                <div className='sidebar--right__subheader'>
                    <SearchHint/>
                </div>
            );
        } else if (noResults) {
            ctls = (
                <div className='sidebar--right__subheader'>
                    <NoResultSearchHint
                        dataRetentionEnableMessageDeletion={this.props.dataRetentionEnableMessageDeletion}
                        dataRetentionMessageRetentionDays={this.props.dataRetentionMessageRetentionDays}
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

            ctls = sortedResults.map((post) => {
                return (
                    <SearchResultsItem
                        key={post.id}
                        compactDisplay={this.props.compactDisplay}
                        post={post}
                        matches={this.props.matches[post.id]}
                        term={(!this.props.isFlaggedPosts && !this.props.isPinnedPosts && !this.props.isMentionSearch) ? searchTerms : ''}
                        isMentionSearch={this.props.isMentionSearch}
                    />
                );
            }, this);
        }

        let loadingScreen = null;
        if (!this.props.isSearchAtEnd) {
            loadingScreen = (
                <div className='loading-screen'>
                    <div className='loading__content'>
                        <div className='round round-1'/>
                        <div className='round round-2'/>
                        <div className='round round-3'/>
                    </div>
                </div>
            );
        }

        return (
            <div className='sidebar-right__body'>
                <SearchResultsHeader
                    isMentionSearch={this.props.isMentionSearch}
                    isFlaggedPosts={this.props.isFlaggedPosts}
                    isPinnedPosts={this.props.isPinnedPosts}
                    channelDisplayName={this.props.channelDisplayName}
                    isLoading={this.props.isSearchingTerm}
                />
                <Scrollbars
                    ref='scrollbars'
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
                        className='search-items-container'
                    >
                        {ctls}
                        {loadingScreen}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
