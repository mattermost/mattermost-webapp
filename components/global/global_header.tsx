// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@mattermost/compass-components/components/icon-button';
import Text from '@mattermost/compass-components/components/text/Text';
import Shape from '@mattermost/compass-components/foundations/shape';
import Grid from '@mattermost/compass-components/utilities/grid/Grid';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Popover from '@mattermost/compass-components/utilities/popover/Popover';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import ThemeProvider, {darkTheme} from '@mattermost/compass-components/utilities/theme';
import React, {useRef, useState} from 'react';
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
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const menuRef = useRef(null);

    const handleClick = () => setSwitcherOpen(!switcherOpen);

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
                >
                    <Grid
                        element={'div'}
                        placeItems={{alignItems: 'center'}}
                    >
                        <IconButton
                            icon={'view-grid-outline'}
                            onClick={handleClick}
                            ref={menuRef}
                            size={'sm'}
                            toggled={switcherOpen}
                        />
                        <Popover
                            anchorReference={menuRef}
                            isVisible={switcherOpen}
                            onClickAway={() => setSwitcherOpen(false)}
                            placement={'bottom-start'}
                            offset={[25, 25]}
                        >
                            <Shape
                                elevation={1}
                                elevationOnHover={6}
                                width={200}
                            >
                                <Flex
                                    padding={Spacing.all(50)}
                                >
                                    <Text
                                        margin={'none'}
                                        color={'primary'}
                                    >
                                        {'POPOVER MENU'}
                                    </Text>
                                </Flex>
                            </Shape>
                        </Popover>
                    </Grid>
                </Shape>
            </ThemeProvider>
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
        </>
    );
};

export default GlobalHeader;
