// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import PostTime from './post_time';

function mapStateToProps(state: GlobalState) {
    return {
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(PostTime);
