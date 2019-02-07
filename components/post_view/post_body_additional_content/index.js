// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getRedirectLocation} from 'mattermost-redux/actions/general';

import {toggleEmbedVisibility} from 'actions/post_actions';

import {extractFirstLink} from 'utils/utils.jsx';

import PostBodyAdditionalContent from './post_body_additional_content.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const enableLinkPreviews = config.EnableLinkPreviews === 'true';
    const hasImageProxy = config.HasImageProxy === 'true';
    const link = extractFirstLink(ownProps.post.message);

    return {
        enableLinkPreviews,
        hasImageProxy,
        link,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getRedirectLocation,
            toggleEmbedVisibility,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostBodyAdditionalContent);
