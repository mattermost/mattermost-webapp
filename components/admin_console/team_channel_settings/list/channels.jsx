// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {getAllChannels as getData} from 'mattermost-redux/actions/channels';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';

import {t} from 'utils/i18n';

import List from './channel_list.jsx';

const getSortedListOfChannels = createSelector(
    getAllChannels,
    (teams) => Object.values(teams).sort((a, b) => a.name.localeCompare(b.name))
);

function mapStateToProps(state) {
    return {
        data: getSortedListOfChannels(state),
        emptyListTextId: t('admin.team_settings.channel_list.no_channels_found'),
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
