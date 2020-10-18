// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getDirectTeammate} from 'utils/utils';

import SearchChannelSuggestion from './search_channel_suggestion';

const mapStateToProps = (state, ownProps) => {
    return {
        teammate: getDirectTeammate(state, ownProps.item.id),
        currentUser: getCurrentUserId(state),
    };
};

export default connect(mapStateToProps, null, null, {forwardRef: true})(SearchChannelSuggestion);
