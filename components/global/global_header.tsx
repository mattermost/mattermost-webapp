// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Shape from '@mattermost/compass-components/foundations/shape';
import Grid from '@mattermost/compass-components/utilities/grid/Grid';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import ThemeProvider, {darkTheme} from '@mattermost/compass-components/utilities/theme';
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

const GlobalHeader = () => {
    const enabled = useSelector(getGlobalHeaderEnabled);
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);

    if (!enabled) {
        return null;
    }

    // adding the dark theme for now to test how the colors "perform"
    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Shape
                    width={'100%'}
                    height={40}
                    radius={0}
                    backgroundColor={'var(--sidebar-teambar-bg)'}
                >
                    <Grid
                        element={'div'}
                        placeItems={{alignItems: 'center'}}
                        padding={Spacing.symmetric({horizontal: 50, vertical: 25})}
                    >
                        <ProductSwitcher/>
                    </Grid>
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
                </Shape>
            </ThemeProvider>
        </>
    );
};

export default GlobalHeader;
