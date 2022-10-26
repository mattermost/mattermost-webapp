// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import Pluggable from 'plugins/pluggable';
import {
    CustomizeYourExperienceTour,
    OnboardingTourSteps,
    useShowOnboardingTutorialStep,
} from 'components/onboarding_tour';
import StatusDropdown from 'components/status_dropdown';

import {GlobalState} from 'types/store';

import {useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';

import {getCurrentProduct} from 'selectors/products';

import UserGuideDropdown from '../center_controls/user_guide_dropdown';

import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';
import PlanUpgradeButton from './plan_upgrade_button';

const RightControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;
    position: relative;

    > * + * {
        margin-left: 8px;
    }
`;

export type Props = {
    productId?: string | null;
}

const RightControls = ({productId = null}: Props): JSX.Element => {
    const showCustomizeTip = useShowOnboardingTutorialStep(OnboardingTourSteps.CUSTOMIZE_EXPERIENCE);
    const {pathname} = useLocation();
    const currentProduct = useSelector((state: GlobalState) => getCurrentProduct(state.plugins.components.Product, pathname));

    return (
        <RightControlsContainer
            id={'RightControlsContainer'}
        >
            <PlanUpgradeButton/>
            {productId === null ? (
                <>
                    <AtMentionsButton/>
                    <SavedPostsButton/>
                    <SettingsButton/>
                    {showCustomizeTip && <CustomizeYourExperienceTour/>}
                </>
            ) : (
                <Pluggable
                    pluggableName={'Product'}
                    subComponentName={'headerRightComponent'}
                    pluggableId={productId}
                />
            )}
            {currentProduct?.pluginId === 'playbooks' ? <UserGuideDropdown/> : ''}
            <StatusDropdown/>
        </RightControlsContainer>
    );
};

export default RightControls;
