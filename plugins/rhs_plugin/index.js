// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPluggableId} from 'selectors/rhs';

import {suitePluginIds} from 'utils/constants';

import {shouldShowAutoLinkedBoard} from 'selectors/plugins';

import RHSPlugin from './rhs_plugin.jsx';

function mapStateToProps(state) {
    const rhsPlugins = state.plugins.components.RightHandSidebarComponent;
    const pluggableId = getPluggableId(state);

    const pluginComponent = rhsPlugins.find((element) => element.id === pluggableId);
    const pluginTitle = pluginComponent ? pluginComponent.title : '';

    const isBoards = pluginComponent.pluginId === suitePluginIds.focalboard || pluginComponent.pluginId === suitePluginIds.boards;

    const showAutoLinkedBoardTourTip = isBoards && shouldShowAutoLinkedBoard(state);

    return {
        showPluggable: Boolean(pluginComponent),
        pluggableId,
        showAutoLinkedBoardTourTip,
        title: pluginTitle,
    };
}

export default connect(mapStateToProps)(RHSPlugin);
