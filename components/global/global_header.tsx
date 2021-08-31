// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import StatusDropdown from 'components/status_dropdown';
import {TutorialSteps} from 'utils/constants';
import Pluggable from 'plugins/pluggable';
import {isDesktopApp} from 'utils/user_agent';

import GlobalSearchNav from './global_search_nav/global_search_nav';
import ProductSwitcher from './product_switcher';
import ProductBranding from './product_branding';
import HistoryButtons from './history_buttons';
import UserGuideDropdown from './user_guide_dropdown';
import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';
import SettingsTip from './settings_tip';

import {useCurrentProductId, useProducts, useShowTutorialStep} from './hooks';

import './global_header.scss';

const GlobalHeaderContainer = styled.header`
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    background: var(--global-header-background);
    border-bottom: solid 1px rgba(var(--center-channel-color-rgb), 0.08);
    color: rgba(var(--global-header-text-rgb), 0.64);
    padding: 0 12px;

    > * + * {
        margin-left: 12px;
    }
`;

const LeftControls = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;

    > * + * {
        margin-left: 12px;
    }
`;

const CenterControls = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    justify-content: center;
    flex-grow: 1;

    > * + * {
        margin-left: 8px;
    }
`;

const RightControls = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;

    > * + * {
        margin-left: 8px;
    }
`;

const GlobalHeader = (): JSX.Element | null => {
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);
    const showSettingsTip = useShowTutorialStep(TutorialSteps.SETTINGS);
    const root = document.querySelector('#root');
    root?.classList.add('feature-global-header');

    return (
        <GlobalHeaderContainer>
            <LeftControls>
                <ProductSwitcher/>
                <ProductBranding/>
                {isDesktopApp() && <HistoryButtons/>}
            </LeftControls>
            <CenterControls>
                {currentProductID !== null &&
                    <Pluggable
                        pluggableName={'Product'}
                        subComponentName={'headerCentreComponent'}
                        pluggableId={currentProductID}
                    />
                }
                {currentProductID === null &&
                    <>
                        <GlobalSearchNav/>
                        <UserGuideDropdown/>
                    </>
                }
            </CenterControls>
            <RightControls>
                {currentProductID !== null &&
                    <Pluggable
                        pluggableName={'Product'}
                        subComponentName={'headerRightComponent'}
                        pluggableId={currentProductID}
                    />
                }
                {currentProductID === null &&
                    <>
                        <AtMentionsButton/>
                        <SavedPostsButton/>
                        <SettingsButton/>
                        {showSettingsTip && <SettingsTip/>}
                    </>
                }
                <StatusDropdown globalHeader={true}/>
            </RightControls>
        </GlobalHeaderContainer>
    );
};

export default GlobalHeader;
