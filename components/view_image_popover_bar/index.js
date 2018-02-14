// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import ViewImagePopoverBar from './view_image_popover_bar.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const enablePublicLink = config.EnablePublicLink === 'true';

    return {
        ...ownProps,
        enablePublicLink
    };
}

export default connect(mapStateToProps)(ViewImagePopoverBar);
