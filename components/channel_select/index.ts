// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserLocale} from 'mattermost-redux/selectors/entities/i18n';
import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import {GlobalState} from 'mattermost-redux/types/store';

import ChannelSelect from './channel_select';

const getMyChannelsSorted = createSelector(
    getMyChannels,
    getCurrentUserLocale,
    (channels, locale) => {
        return [...channels].sort(sortChannelsByTypeAndDisplayName.bind(null, locale));
    },
);

function mapStateToProps(state: GlobalState) {
    return {
        channels: getMyChannelsSorted(state),
    };
}

export default connect(mapStateToProps)(ChannelSelect);
