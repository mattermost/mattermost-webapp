// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {createSelector} from 'reselect';

import {getAllChannelsWithCount as getData, searchAllChannels} from 'mattermost-redux/actions/channels';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';

import {GlobalState} from 'types/store';
import {Constants} from 'utils/constants';

import List from './channel_list';

type Props = {
    channel: Partial<Channel>;
};

const compareByDisplayName = (a: {display_name: string}, b: {display_name: string}) => a.display_name.localeCompare(b.display_name);

const getSortedListOfChannels = createSelector(
    getAllChannels,
    (teams) => Object.values(teams).
        filter((c) => (c.type === Constants.OPEN_CHANNEL || c.type === Constants.PRIVATE_CHANNEL) && c.delete_at === 0).
        sort(compareByDisplayName),
);

function mapStateToProps(state: GlobalState) {
    return {
        data: getSortedListOfChannels(state),
        total: state.entities.channels.totalCount,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getData,
            searchAllChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(List);
