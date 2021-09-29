// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import Pluggable from 'plugins/pluggable';
import {TutorialSteps} from '../../../utils/constants';
import StatusDropdown from '../../status_dropdown';
import {useShowTutorialStep} from '../hooks';

import SettingsTip from './settings_tip';
import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';

const RightControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;

    > * + * {
        margin-left: 8px;
    }
`;

export type Props = {
    productId?: string | null;
}

const RightControls = ({productId = null}: Props): JSX.Element => {
    const showSettingsTip = useShowTutorialStep(TutorialSteps.SETTINGS);

    return (
        <RightControlsContainer>
            {productId === null ? (
                <>
                    <AtMentionsButton/>
                    <SavedPostsButton/>
                    <SettingsButton/>
                    {showSettingsTip && <SettingsTip/>}
                </>
            ) : (
                <Pluggable
                    pluggableName={'Product'}
                    subComponentName={'headerRightComponent'}
                    pluggableId={productId}
                />
            )}
            <StatusDropdown globalHeader={true}/>
        </RightControlsContainer>
    );
};

export default RightControls;
