// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import Flex from '@mattermost/compass-components/utilities/layout';

import styled from 'styled-components';

import {getGlobalHeaderEnabled} from 'selectors/global_header';
import GlobalSearchNav from './global_search_nav';
import GlobalIconsWrapper from './global_icons_wrapper';
import StatusDropdown from 'components/status_dropdown';

import Pluggable from 'plugins/pluggable';

import ProductSwitcher from './product_switcher';
import {useCurrentProductId, useProducts} from './hooks';

const HeaderContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    background: var(--sidebar-teambar-bg);
    color: var(--sidebar-text);
`;

const GlobalHeader = (): JSX.Element | null => {
    const enabled = useSelector(getGlobalHeaderEnabled);
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);

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

    if (!enabled) {
        return null;
    }

    // temporary, theming will be connected to the webapp in a separate pr
    const theme = {
        ...lightTheme,
        noStyleReset: true,
        noFontFaces: true,
        noDefaultStyle: true,
        background: {
            ...lightTheme.background,
            shape: 'var(--sidebar-teambar-bg)',
        },
    };

    return (
        <ThemeProvider theme={theme}>
            <HeaderContainer>
                <ProductSwitcher/>
                    {/* {currentProductID !== null &&
                        <Pluggable
                            pluggableName={'Product'}
                            subComponentName={'headerComponent'}
                            pluggableId={currentProductID}
                        />
                    } */}
                {currentProductID === null &&
                <GlobalSearchNav/>}
                <Flex row alignment="center">
                    <GlobalIconsWrapper/>
                    <StatusDropdown
                        globalHeader={true}
                    />
                </Flex>
            </HeaderContainer>
        </ThemeProvider>
    );
};

export default GlobalHeader;
