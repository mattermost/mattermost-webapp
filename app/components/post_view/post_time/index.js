// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import PostTime from './post_time.jsx';

function mapStateToProps(state) {
    return {
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(PostTime);
