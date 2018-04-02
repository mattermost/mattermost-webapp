// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getSearchResults} from 'mattermost-redux/selectors/entities/posts';
import * as PreferenceSelectors from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {selectPostFromRightHandSideSearch} from 'actions/views/rhs';
import {
    getSearchResultsTerms,
    getIsSearchingTerm,
    getIsSearchingFlaggedPost,
    getIsSearchingPinnedPost,
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
        const newResults = getSearchResults(state);

        // Cache posts and channels
        if (newResults && newResults !== results) {
            results = newResults;

            posts = results.filter((post) => Boolean(post));

            channels = new Map();

            const channelIds = posts.map((post) => post.channel_id);

            for (const id of channelIds) {
                if (channels.has(id)) {
                    continue;
                }

                channels.set(id, getChannel(state, id));
            }
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

        const config = getConfig(state);

        const dataRetentionEnableMessageDeletion = config.DataRetentionEnableMessageDeletion === 'true';
        const dataRetentionMessageRetentionDays = config.DataRetentionMessageRetentionDays;

        return {
            results: posts,
            channels,
            searchTerms: getSearchResultsTerms(state),
            isFlaggedByPostId,
            isSearchingTerm: getIsSearchingTerm(state),
            isSearchingFlaggedPost: getIsSearchingFlaggedPost(state),
            isSearchingPinnedPost: getIsSearchingPinnedPost(state),
            compactDisplay: PreferenceSelectors.get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            dataRetentionEnableMessageDeletion,
            dataRetentionMessageRetentionDays,
        };
    };
}

const mapDispatchToProps = {
    selectPost: selectPostFromRightHandSideSearch,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(SearchResults);
