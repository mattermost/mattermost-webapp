// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getSearchResults} from 'mattermost-redux/selectors/entities/posts';
import * as PreferenceSelectors from 'mattermost-redux/selectors/entities/preferences';

import {selectPostFromRightHandSideSearch} from 'actions/views/rhs';

import {Preferences} from 'utils/constants.jsx';

import SearchResults from './search_results.jsx';

const getCategory = PreferenceSelectors.makeGetCategory();

function mapStateToProps(state) {
    const posts = getSearchResults(state);

    const channels = new Map();

    if (posts) {
        const channelIds = posts.map((post) => post.channel_id);

        for (const id of channelIds) {
            if (channels.has(id)) {
                continue;
            }

            channels.set(id, getChannel(state, id));
        }
    }

    return {
        results: posts,
        channels,
        searchTerm: '',
        flaggedPosts: getCategory(state, Preferences.CATEGORY_FLAGGED_POST),
        loading: false,
        compactDisplay: PreferenceSelectors.get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT) === Preferences.MESSAGE_DISPLAY_COMPACT
    };
}

const mapDispatchToProps = {
    selectPost: selectPostFromRightHandSideSearch
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);