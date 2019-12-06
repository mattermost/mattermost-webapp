// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';

import LinkingLandingPage from './linking_landing_page';

function mapStateToProps(state: GlobalState) {
    const defaultTheme = getTheme(state);

    return {
        backgroundColor: defaultTheme.sidebarBg,
    };
}

export default connect(mapStateToProps)(LinkingLandingPage);
