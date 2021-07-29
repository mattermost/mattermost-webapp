// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Shape from '@mattermost/compass-components/foundations/shape';
import PShape from '@mattermost/compass-components/foundations/shape/Shape.props';
import Grid from '@mattermost/compass-components/utilities/grid/Grid';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import ThemeProvider, {darkTheme} from '@mattermost/compass-components/utilities/theme';
import React from 'react';
import {useSelector} from 'react-redux';

import {getGlobalHeaderEnabled} from 'selectors/global_header';
import GlobalSearchNav from './global_search_nav';
import GlobalIconsWrapper from './global_icons_wrapper';
import StatusDropdown from 'components/status_dropdown';

import Pluggable from 'plugins/pluggable';

import ProductSwitcher from './product_switcher';
import {useCurrentProductId, useProducts} from './hooks';

const GlobalHeader = (): JSX.Element | null => {
    const enabled = useSelector(getGlobalHeaderEnabled);
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);

    if (!enabled) {
        return null;
    }

    const theme = {
        ...darkTheme,
        background: {
            ...darkTheme.background,
            shape: 'var(--sidebar-teambar-bg)',
        },
    };

    // adding the dark theme for now to test how the colors "perform"
    return (
        <>
            <ThemeProvider theme={theme}>
                <Grid<PShape>
                    element={Shape}
                    columnsTemplate={'auto 1fr auto'}
                    placeItems={{alignItems: 'center'}}
                    padding={Spacing.trbl({top: 75, right: 200, bottom: 75, left: 100})}
                    width={'100%'}
                    height={40}
                    radius={0}
                >
                    <ProductSwitcher/>
                    <Flex row justify={'center'} alignment={'center'}>
                        {currentProductID !== null &&
                        <Pluggable
                            pluggableName={'Product'}
                            subComponentName={'headerComponent'}
                            pluggableId={currentProductID}
                        />
                        }
                        {currentProductID === null && 
                        <>
                            <GlobalSearchNav/>
                            <GlobalIconsWrapper/>
                        </>}
                        </Flex>
                        <StatusDropdown
                        globalHeader={true}
                        />                
                    </Grid>
            </ThemeProvider>
        </>
    );
};

export default GlobalHeader;
