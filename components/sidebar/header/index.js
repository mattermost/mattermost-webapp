// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import SidebarHeader from './sidebar_header.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const enableTutorial = config.EnableTutorial === 'true';

    return {
        enableTutorial,
    };
}

export default connect(mapStateToProps)(SidebarHeader);
