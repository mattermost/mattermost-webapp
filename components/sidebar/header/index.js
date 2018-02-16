// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import SidebarHeader from './sidebar_header.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;

    const enableTutorial = config.EnableTutorial === 'true';

    return {
        enableTutorial
    };
}

export default connect(mapStateToProps)(SidebarHeader);
