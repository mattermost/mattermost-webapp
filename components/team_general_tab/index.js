// Copyright (c) 2018 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import TeamGeneralTab from './team_general_tab.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const maxFileSize = parseInt(config.MaxFileSize, 10);

    return {
        ...ownProps,
        maxFileSize,
    };
}

export default connect(mapStateToProps)(TeamGeneralTab);