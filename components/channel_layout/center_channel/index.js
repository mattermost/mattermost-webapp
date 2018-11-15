// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getIsRhsOpen, getIsRhsMenuOpen} from 'selectors/rhs';
import {getIsLhsOpen} from 'selectors/lhs';
import {getLastViewedChannelNameByTeamName} from 'selectors/local_storage';

import CenterChannel from './center_channel';

const mapStateToProps = (state, ownProps) => ({
    lastChannelPath: `${ownProps.match.url}/channels/${getLastViewedChannelNameByTeamName(state, ownProps.match.params.team)}`,
    lhsOpen: getIsLhsOpen(state),
    rhsOpen: getIsRhsOpen(state),
    rhsMenuOpen: getIsRhsMenuOpen(state),
});

export default connect(mapStateToProps)(CenterChannel);
