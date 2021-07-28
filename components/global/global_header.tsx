// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Shape from '@mattermost/compass-components/foundations/shape';
import PShape from '@mattermost/compass-components/foundations/shape/Shape.props';
import Grid from '@mattermost/compass-components/utilities/grid/Grid';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';
import React from 'react';
import {useSelector} from 'react-redux';

import {getGlobalHeaderEnabled} from 'selectors/global_header';
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
        ...lightTheme,
        noStyleReset: true,
        noFontFaces: true,
        noDefaultStyle: true,
        background: {
            ...lightTheme.background,
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
                    <div>
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
                    </div>
                    <StatusDropdown
                        globalHeader={true}
                    />
                </Grid>
            </ThemeProvider>
        </>
    );
};

export default GlobalHeader;
