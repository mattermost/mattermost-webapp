// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {getActiveRhsComponent, getPluggableId} from 'selectors/rhs';
import {TutorialTourName, WorkTemplateTourStep} from 'components/tours';

import RHSPlugin from './rhs_plugin.jsx';

function mapStateToProps(state) {
    const rhsPlugins = state.plugins.components.RightHandSidebarComponent;
    const pluggableId = getPluggableId(state);
    const activeRhsComponent = getActiveRhsComponent(state);
    const pluginId = activeRhsComponent.pluginId;
    const pluginComponent = rhsPlugins.find((element) => element.id === pluggableId);
    const pluginTitle = pluginComponent ? pluginComponent.title : '';
    const currentChannelId = getCurrentChannelId(state);
    const enableTutorial = state.entities.general.config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, TutorialTourName.WORK_TEMPLATE_TUTORIAL, currentChannelId, 0);

    const workTemplatesLinkedProducts = state.entities.worktemplates.linkedProducts;
    const workTemplatesLinkedProductsChannels = Object.keys(workTemplatesLinkedProducts);
    const isWorkTemplateBasedChannel = workTemplatesLinkedProductsChannels.includes(currentChannelId);

    const showProductTour = enableTutorial && isWorkTemplateBasedChannel;

    const showBoardsTour = showProductTour && tutorialStep === WorkTemplateTourStep.BOARDS_TOUR;
    const showPlaybooksTour = showProductTour && tutorialStep === WorkTemplateTourStep.PLAYBOOKS_TOUR;

    const boardsCount = workTemplatesLinkedProductsChannels.length && workTemplatesLinkedProducts[currentChannelId] ? workTemplatesLinkedProducts[currentChannelId].linkedBoardsCount : undefined;
    const playbooksCount = workTemplatesLinkedProductsChannels.length && workTemplatesLinkedProducts[currentChannelId] ? workTemplatesLinkedProducts[currentChannelId].linkedPlaybooksCount : undefined;

    return {
        showPluggable: Boolean(pluginComponent),
        pluggableId,
        boardsCount,
        playbooksCount,
        showBoardsTour,
        showPlaybooksTour,
        pluginId,
        title: pluginTitle,
    };
}

export default connect(mapStateToProps)(RHSPlugin);
