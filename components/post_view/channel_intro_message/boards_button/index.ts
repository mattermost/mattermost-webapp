// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getChannelIntroPluginComponents} from 'selectors/plugins';
import {GlobalState} from 'types/store';

import BoardsButton from './boards_button';

function mapStateToProps(state: GlobalState) {
    const boardComponent = getChannelIntroPluginComponents(state).find((c) => c.pluginId === 'focalboard');
    return {
        boardComponent,
    };
}

export default connect(mapStateToProps)(BoardsButton);
