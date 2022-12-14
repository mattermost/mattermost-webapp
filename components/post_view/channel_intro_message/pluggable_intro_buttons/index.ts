// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getChannelIntroPluginButtons} from 'selectors/plugins';

import {GlobalState} from 'types/store';

import PluggableIntroButtons from './pluggable_intro_buttons';

function mapStateToProps(state: GlobalState) {
    return {
        pluginButtons: getChannelIntroPluginButtons(state),
    };
}

export default connect(mapStateToProps)(PluggableIntroButtons);
