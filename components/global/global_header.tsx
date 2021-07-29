// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';
import React from 'react';
import {useSelector} from 'react-redux';

import styled from 'styled-components';

import {getGlobalHeaderEnabled} from 'selectors/global_header';
import StatusDropdown from 'components/status_dropdown';

import Pluggable from 'plugins/pluggable';

import ProductSwitcher from './product_switcher';
import {useCurrentProductId, useProducts} from './hooks';

const HeaderContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    background: var(--sidebar-teambar-bg);
    color: var(--sidebar-text);
`;

const AppSpectificContent = styled.div`
    flex-grow: 1;
`;

const ProfileWrapper = styled.div`
    margin-right: 20px;
`;

const GlobalHeader = (): JSX.Element | null => {
    const enabled = useSelector(getGlobalHeaderEnabled);
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);

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
                <AppSpectificContent>
                    {currentProductID !== null &&
                        <Pluggable
                            pluggableName={'Product'}
                            subComponentName={'headerComponent'}
                            pluggableId={currentProductID}
                        />
                    }
                    {/*currentProductID === null &&
                       This is where the header content for the webapp will go
                    */}
                </AppSpectificContent>
                <ProfileWrapper>
                    <StatusDropdown
                        globalHeader={true}
                    />
                </ProfileWrapper>
            </HeaderContainer>
        </ThemeProvider>
    );
};

export default GlobalHeader;
