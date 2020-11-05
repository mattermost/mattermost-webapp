// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMorePostsForSearch, getMoreFilesForSearch} from 'mattermost-redux/actions/search';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getSearchMatches, getSearchResults} from 'mattermost-redux/selectors/entities/posts';
import {getSearchFilesResults} from 'mattermost-redux/selectors/entities/files';
import * as PreferenceSelectors from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentSearchForCurrentTeam} from 'mattermost-redux/selectors/entities/search';

import {
    getSearchResultsTerms,
    getInitialSearchType,
    getIsSearchingTerm,
    getIsSearchingFlaggedPost,
    getIsSearchingPinnedPost,
    getIsSearchGettingMore,
} from 'selectors/rhs';
import {filterFilesSearchByExt, showSearchResults} from 'actions/views/rhs';
import {Preferences} from 'utils/constants.jsx';

import SearchResults from './search_results.jsx';

function makeMapStateToProps() {
    let results;
    let fileResults;
    let posts;
    let files;

    return function mapStateToProps(state) {
        const config = getConfig(state);

        const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

        const newResults = getSearchResults(state);
        const newFileResults = getSearchFilesResults(state);

        // Cache posts and channels
        if (newResults && newResults !== results) {
            results = newResults;

            posts = [];
            results.forEach((post) => {
                if (!post) {
                    return;
                }

                const channel = getChannel(state, post.channel_id);
                if (channel && channel.delete_at !== 0 && !viewArchivedChannels) {
                    return;
                }

                posts.push(post);
            });
        }

        // Cache files and channels
        if (newFileResults && newFileResults !== fileResults) {
            fileResults = newFileResults;

            files = [];
            fileResults.forEach((file) => {
                if (!file) {
                    return;
                }

                const channel = getChannel(state, file.channel_id);
                if (channel && channel.delete_at !== 0 && !viewArchivedChannels) {
                    return;
                }

                files.push(file);
            });
        }

        const currentSearch = getCurrentSearchForCurrentTeam(state) || {};

        return {
            results: posts,
            fileResults: files,
            matches: getSearchMatches(state),
            searchTerms: getSearchResultsTerms(state),
            initialSearchType: getInitialSearchType(state),
            isSearchingTerm: getIsSearchingTerm(state),
            isSearchingFlaggedPost: getIsSearchingFlaggedPost(state),
            isSearchingPinnedPost: getIsSearchingPinnedPost(state),
            isSearchGettingMore: getIsSearchGettingMore(state),
            isSearchAtEnd: currentSearch.isEnd,
            isSearchFilesAtEnd: currentSearch.isFilesEnd,
            searchPage: currentSearch.params?.page,
            compactDisplay: PreferenceSelectors.get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMorePostsForSearch,
            getMoreFilesForSearch,
            filterFilesSearchByExt,
            showSearchResults,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SearchResults);
