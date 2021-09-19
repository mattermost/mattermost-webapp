// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import styled from 'styled-components';

import StatusDropdown from 'components/status_dropdown';
import {getGlobalHeaderEnabled} from 'selectors/global_header';
import {TutorialSteps} from 'utils/constants';
import Pluggable from 'plugins/pluggable';
import {isDesktopApp} from 'utils/user_agent';

import GlobalSearchNav from './global_search_nav/global_search_nav';
import ProductSwitcher from './product_switcher';
import HistoryButtons from './history_buttons';
import UserGuideDropdown from './user_guide_dropdown';
import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';
import SettingsTip from './settings_tip';

import {useCurrentProductId, useIsLoggedIn, useProducts, useShowTutorialStep} from './hooks';

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
    const enabled = useSelector(getGlobalHeaderEnabled);
    const isLoggedIn = useIsLoggedIn();
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);
    const showSettingsTip = useShowTutorialStep(TutorialSteps.SETTINGS);

    useEffect(() => {
        const root = document.querySelector('#root');
        if (enabled) {
            root?.classList.add('feature-global-header');
        } else {
            root?.classList.remove('feature-global-header');
        }
        return () => {
            root?.classList.remove('feature-global-header');
        };
    }, [enabled]);

    if (!enabled || !isLoggedIn) {
        return null;
    }

    return (
        <GlobalHeaderContainer>
            <LeftControls>
                <ProductSwitcher/>
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
