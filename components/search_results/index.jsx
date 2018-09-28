// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getSearchMatches, getSearchResults} from 'mattermost-redux/selectors/entities/posts';
import * as PreferenceSelectors from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getMorePostsForSearch} from 'mattermost-redux/actions/search';

import {
    getSearchResultsTerms,
    getIsSearchingTerm,
    getIsSearchingFlaggedPost,
    getIsSearchingPinnedPost,
    getIsSearchGettingMore,
} from 'selectors/rhs';
import {Preferences} from 'utils/constants.jsx';

import SearchResults from './search_results.jsx';

const getCategory = PreferenceSelectors.makeGetCategory();

function makeMapStateToProps() {
    let results;
    let posts;
    let channels;
    let flaggedPosts;
    let isFlaggedByPostId;

    return function mapStateToProps(state) {
        const config = getConfig(state);

        const dataRetentionEnableMessageDeletion = config.DataRetentionEnableMessageDeletion === 'true';
        const dataRetentionMessageRetentionDays = config.DataRetentionMessageRetentionDays;
        const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

        const newResults = getSearchResults(state);

        // Cache posts and channels
        if (newResults && newResults !== results) {
            results = newResults;

            channels = new Map();

            posts = [];
            results.forEach((post) => {
                if (!post) {
                    return;
                }

                let channel;
                if (channels.has(post.channel_id)) {
                    channel = channels.get(post.channel_id);
                } else {
                    channel = getChannel(state, post.channel_id);
                    channels.set(post.channel_id, channel);
                }

                if (channel && channel.delete_at !== 0 && !viewArchivedChannels) {
                    return;
                }

                posts.push(post);
            });
        }

        const newFlaggedPosts = getCategory(state, Preferences.CATEGORY_FLAGGED_POST);

        // Cache flagged posts map
        if (newFlaggedPosts !== flaggedPosts) {
            flaggedPosts = newFlaggedPosts;

            isFlaggedByPostId = new Map();

            for (const pref of flaggedPosts) {
                isFlaggedByPostId.set(pref.name, true);
            }
        }

        return {
            results: posts,
            matches: getSearchMatches(state),
            channels,
            searchTerms: getSearchResultsTerms(state),
            isFlaggedByPostId,
            isSearchingTerm: getIsSearchingTerm(state),
            isSearchingFlaggedPost: getIsSearchingFlaggedPost(state),
            isSearchingPinnedPost: getIsSearchingPinnedPost(state),
            isSearchGettingMore: getIsSearchGettingMore(state),
            compactDisplay: PreferenceSelectors.get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            dataRetentionEnableMessageDeletion,
            dataRetentionMessageRetentionDays,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMorePostsForSearch,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SearchResults);
