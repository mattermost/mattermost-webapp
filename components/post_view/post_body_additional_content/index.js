// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import PostBodyAdditionalContent from './post_body_additional_content.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const enableLinkPreviews = config.EnableLinkPreviews === 'true';

    return {
        ...ownProps,
        enableLinkPreviews
    };
}

export default connect(mapStateToProps)(PostBodyAdditionalContent);
