// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import UserGuideDropdown from './user_guide_dropdown';

function mapStateToProps(state: GlobalState) {
    const {HelpLink, ReportAProblemLink, EnableAskCommunityLink} = getConfig(state);
    return {
        helpLink: HelpLink!,
        reportAProblemLink: ReportAProblemLink!,
        enableAskCommunityLink: EnableAskCommunityLink!,
    };
}

export default connect(mapStateToProps)(UserGuideDropdown);
