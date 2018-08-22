// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getRedirectLocation} from 'mattermost-redux/actions/general';

import PostBodyAdditionalContent from './post_body_additional_content.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enableLinkPreviews = config.EnableLinkPreviews === 'true';
    const hasImageProxy = config.HasImageProxy === 'true';

    return {
        enableLinkPreviews,
        hasImageProxy,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getRedirectLocation,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostBodyAdditionalContent);
