// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';

import VersionBar from './version_bar';

function mapStateToProps(state:GlobalState) {
    return {
        serverVersion: state.entities.general.serverVersion,
    };
}

export default connect(mapStateToProps)(VersionBar);
