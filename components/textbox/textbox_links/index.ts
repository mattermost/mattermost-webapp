// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getCurrentLocale} from 'selectors/i18n';

import Constants from 'utils/constants';
import {isFeatureEnabled} from 'utils/utils';

import TextboxLinks from './textbox_links';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

const mapStateToProps = (state: GlobalState) => {
    return ({
        isMarkdownPreviewEnabled: isFeatureEnabled(PreReleaseFeatures.MARKDOWN_PREVIEW, state),
        currentLocale: getCurrentLocale(state),
    });
};

export default connect(mapStateToProps)(TextboxLinks);
