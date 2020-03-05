// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import Constants from 'utils/constants';
import {isFeatureEnabled} from 'utils/utils';

import TextboxLinks from './textbox_links.jsx';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

const mapStateToProps = (state) => {
    return ({
        isMarkdownPreviewEnabled: isFeatureEnabled(PreReleaseFeatures.MARKDOWN_PREVIEW, state),
    });
};

export default connect(mapStateToProps)(TextboxLinks);
