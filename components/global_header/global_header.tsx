// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import createPalette from '@mui/material/styles/createPalette';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import React from 'react';
import {useSelector} from 'react-redux';

import styled from 'styled-components';

import {useCurrentProductId} from 'utils/products';

import {createPaletteFromLegacyTheme, ThemeProvider} from '@mattermost/compass-ui';

import CenterControls from './center_controls/center_controls';
import LeftControls from './left_controls/left_controls';
import RightControls from './right_controls/right_controls';

import {useIsLoggedIn} from './hooks';

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
    z-index: 99;

    > * + * {
        margin-left: 12px;
    }

    @media screen and (max-width: 768px) {
        display: none;
    }
`;

const GlobalHeader = (): JSX.Element | null => {
    const isLoggedIn = useIsLoggedIn();
    const currentProductID = useCurrentProductId();
    const legacyTheme = useSelector(getTheme);

    if (!isLoggedIn) {
        return null;
    }

    const {palette} = createPaletteFromLegacyTheme(legacyTheme);

    const theme = {
        palette: {
            ...palette,
            ...createPalette({
                primary: {main: '#fff'},
                text: {primary: '#fff'},
            }),
        },
    };

    return (
        <ThemeProvider theme={theme}>
            <GlobalHeaderContainer id='global-header'>
                <LeftControls/>
                <CenterControls productId={currentProductID}/>
                <RightControls productId={currentProductID}/>
            </GlobalHeaderContainer>
        </ThemeProvider>
    );
};

export default GlobalHeader;
