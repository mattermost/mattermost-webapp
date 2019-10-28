// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {getAllChannelsWithCount as getData} from 'mattermost-redux/actions/channels';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';

import {t} from 'utils/i18n';

import {Constants} from 'utils/constants';

import List from './channel_list.jsx';

const compareByDisplayName = (a, b) => a.display_name.localeCompare(b.display_name);

const getSortedListOfChannels = createSelector(
    getAllChannels,
    (teams) => Object.values(teams).
        filter((c) => c.type === Constants.OPEN_CHANNEL || c.type === Constants.PRIVATE_CHANNEL).
        sort(compareByDisplayName)
);

function mapStateToProps(state) {
    return {
        data: getSortedListOfChannels(state),
        total: state.entities.channels.totalCount,
        emptyListTextId: t('admin.channel_settings.channel_list.no_channels_found'),
        emptyListTextDefaultMessage: 'No channels found',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getData,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(List);
