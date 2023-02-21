// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getWorkTemplatesLinkedProducts} from 'mattermost-redux/selectors/entities/general';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {getActiveRhsComponent} from 'selectors/rhs';
import {suitePluginIds} from 'utils/constants';
import {TutorialTourName, WorkTemplateTourSteps} from '../constant';

import {GlobalState} from 'types/store';

export const useShowShowTourTip = () => {
    const activeRhsComponent = useSelector((state: GlobalState) => getActiveRhsComponent(state));
    const pluginId = activeRhsComponent?.pluginId || '';

    const currentUserId = useSelector((state: GlobalState) => getCurrentUserId(state));
    const enableTutorial = useSelector((state: GlobalState) => state.entities.general.config.EnableTutorial === 'true');

    const tutorialStep = useSelector((state: GlobalState) => getInt(state, TutorialTourName.WORK_TEMPLATE_TUTORIAL, currentUserId, 0));

    const workTemplateTourTipShown = tutorialStep === WorkTemplateTourSteps.FINISHED;
    const showProductTour = !workTemplateTourTipShown && enableTutorial;

    const channelLinkedItems = useSelector((state: GlobalState) => getWorkTemplatesLinkedProducts(state));

    const boardsCount = channelLinkedItems?.boards || 0;
    const playbooksCount = channelLinkedItems?.playbooks || 0;

    const showBoardsTour = showProductTour && pluginId === suitePluginIds.boards && boardsCount > 0;
    const showPlaybooksTour = showProductTour && pluginId === suitePluginIds.playbooks && playbooksCount > 0;

    return {
        showBoardsTour,
        showPlaybooksTour,
        boardsCount,
        playbooksCount,
    };
};
