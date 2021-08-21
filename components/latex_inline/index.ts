// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'mattermost-redux/types/store';

import LatexInline from './latex_inline';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    return {
        enableInlineLatex: true,
    };
}

export default connect(mapStateToProps)(LatexInline);
