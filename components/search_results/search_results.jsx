// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';

import {debounce} from 'mattermost-redux/actions/helpers';

import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import SearchResultsHeader from 'components/search_results_header';
import SearchResultsItem from 'components/search_results_item';
import SearchHint from 'components/search_hint/search_hint';
import FlagPostSearchHint from 'components/search_hint/flag_post_search_hint';
import NoResultSearchHint from 'components/search_hint/no_result_search_hint';
import PinPostSearchHint from 'components/search_hint/pin_post_search_hint';

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
        channels: PropTypes.object,
        searchTerms: PropTypes.string,
        isFlaggedByPostId: PropTypes.object,
        isSearchingTerm: PropTypes.bool,
        isSearchingFlaggedPost: PropTypes.bool,
        isSearchingPinnedPost: PropTypes.bool,
        isSearchGettingMore: PropTypes.bool,
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
    };

    constructor(props) {
        super(props);

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
            profiles: JSON.parse(JSON.stringify(UserStore.getProfiles())),
            isBusy: WebrtcStore.isBusy(),
            statuses: Object.assign({}, UserStore.getStatuses()),
        };
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onUserChange);
        UserStore.addStatusesChangeListener(this.onStatusChange);
        WebrtcStore.addBusyListener(this.onBusy);

        this.scrollToTop();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onUserChange);
        UserStore.removeStatusesChangeListener(this.onStatusChange);
        WebrtcStore.removeBusyListener(this.onBusy);

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

    onUserChange = () => {
        this.setState({profiles: JSON.parse(JSON.stringify(UserStore.getProfiles()))});
    }

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    onStatusChange = () => {
        this.setState({statuses: Object.assign({}, UserStore.getStatuses())});
    }

    scrollToTop = () => {
        this.refs.scrollbars.scrollToTop();
    }

    handleScroll = () => {
        if (!this.props.isFlaggedPosts && !this.props.isPinnedPosts) {
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
        const profiles = this.state.profiles || {};

        let ctls = null;

        if (
            this.props.isSearchingTerm ||
            this.props.isSearchingFlaggedPost ||
            this.props.isSearchingPinnedPost
        ) {
            ctls = (
                <div className='sidebar--right__subheader'>
                    <div className='sidebar--right__loading'>
                        <i
                            className='fa fa-spinner fa-spin'
                            title={Utils.localizeMessage('generic_icons.searching', 'Searching Icon')}
                        />
                        <FormattedMessage
                            id='search_header.loading'
                            defaultMessage='Searching...'
                        />
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

            ctls = sortedResults.map((post, idx, arr) => {
                let profile;
                if (UserStore.getCurrentId() === post.user_id) {
                    profile = UserStore.getCurrentUser();
                } else {
                    profile = profiles[post.user_id];
                }

                let status = 'offline';
                if (this.state.statuses) {
                    status = this.state.statuses[post.user_id] || 'offline';
                }

                let isFlagged = false;
                if (this.props.isFlaggedByPostId) {
                    isFlagged = this.props.isFlaggedByPostId.get(post.id) || false;
                }

                const reverseCount = arr.length - idx - 1;

                return (
                    <SearchResultsItem
                        key={post.id}
                        channel={this.props.channels.get(post.channel_id)}
                        compactDisplay={this.props.compactDisplay}
                        post={post}
                        matches={this.props.matches[post.id]}
                        lastPostCount={(reverseCount >= 0 && reverseCount < Constants.TEST_ID_COUNT) ? reverseCount : -1}
                        user={profile}
                        term={(!this.props.isFlaggedPosts && !this.props.isPinnedPosts && !this.props.isMentionSearch) ? searchTerms : ''}
                        isMentionSearch={this.props.isMentionSearch}
                        isFlagged={isFlagged}
                        isBusy={this.state.isBusy}
                        status={status}
                    />
                );
            }, this);
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
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
