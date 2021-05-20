// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {Channel} from 'mattermost-redux/types/channels';
import {getDirectTeammate} from 'utils/utils';
import {GlobalState} from 'types/store';

import SearchChannelSuggestion from './search_channel_suggestion';

type OwnProps = {
    item: Channel;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    return {
        teammate: getDirectTeammate(state, ownProps.item.id),
        currentUser: getCurrentUserId(state),
    };
};

export default connect(mapStateToProps, null, null, {forwardRef: true})(SearchChannelSuggestion);
