// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getCurrentLocale} from 'selectors/i18n';

import Constants from 'utils/constants';
import {isFeatureEnabled} from 'utils/utils';

import TextboxLinks from './textbox_links';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

type Props = {
    isMarkdownPreviewEnabled?: boolean;
}

function mapStateToProps(state: GlobalState, props: Props) {
    let isMarkdownPreviewEnabled;
    if (props.isMarkdownPreviewEnabled === undefined) {
        isMarkdownPreviewEnabled = isFeatureEnabled(PreReleaseFeatures.MARKDOWN_PREVIEW, state);
    } else {
        isMarkdownPreviewEnabled = isFeatureEnabled(PreReleaseFeatures.MARKDOWN_PREVIEW, state) && props.isMarkdownPreviewEnabled;
    }

    return ({
        isMarkdownPreviewEnabled,
        currentLocale: getCurrentLocale(state),
    });
};

export default connect(mapStateToProps)(TextboxLinks);
