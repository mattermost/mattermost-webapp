// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getSearchMatches, getSearchResults} from 'mattermost-redux/selectors/entities/posts';
import {getSearchFilesResults} from 'mattermost-redux/selectors/entities/files';
import * as PreferenceSelectors from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentSearchForCurrentTeam} from 'mattermost-redux/selectors/entities/search';
import {Post} from 'mattermost-redux/types/posts';
import {FileSearchResultItem} from 'mattermost-redux/types/files';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {
    getSearchResultsTerms,
    getIsSearchingTerm,
    getIsSearchingFlaggedPost,
    getIsSearchingPinnedPost,
    getIsSearchGettingMore,
} from 'selectors/rhs';
import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants.jsx';

import SearchResults from './search_results';
import {StateProps, OwnProps} from './types';

function makeMapStateToProps() {
    let results: Post[];
    let fileResults: FileSearchResultItem[];
    let files: FileSearchResultItem[] = [];
    let posts: Post[];

    return function mapStateToProps(state: GlobalState) {
        const config = getConfig(state);

        const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

        const newResults = getSearchResults(state);

        // Cache posts and channels
        if (newResults && newResults !== results) {
            results = newResults;

            posts = [];
            results.forEach((post) => {
                if (!post) {
                    return;
                }

                posts.push(post);
            });
        }

        const newFilesResults = getSearchFilesResults(state);

        // Cache files and channels
        if (newFilesResults && newFilesResults !== fileResults) {
            fileResults = newFilesResults;

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

        // this is basically a hack to make ts compiler happy
        // add correct type when it is known what exactly is returned from the function
        const currentSearch = getCurrentSearchForCurrentTeam(state) as unknown as Record<string, any> || {};

        return {
            results: posts,
            fileResults: files,
            matches: getSearchMatches(state),
            searchTerms: getSearchResultsTerms(state),
            isSearchingTerm: getIsSearchingTerm(state),
            isSearchingFlaggedPost: getIsSearchingFlaggedPost(state),
            isSearchingPinnedPost: getIsSearchingPinnedPost(state),
            isSearchGettingMore: getIsSearchGettingMore(state),
            isSearchAtEnd: currentSearch.isEnd,
            isSearchFilesAtEnd: currentSearch.isFilesEnd,
            searchPage: currentSearch.params?.page,
            compactDisplay: PreferenceSelectors.get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT,
            currentTeamName: getCurrentTeam(state).name,
        };
    };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default connect<StateProps, {}, OwnProps, GlobalState>(makeMapStateToProps)(SearchResults);
