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

import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';

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

    return (
        <RightControlsContainer
            id={'RightControlsContainer'}
        >
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
            <StatusDropdown/>
        </RightControlsContainer>
    );
};

export default RightControls;
