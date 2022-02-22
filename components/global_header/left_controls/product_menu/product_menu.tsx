// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '@mattermost/compass-components/components/icon-button';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {isSwitcherOpen} from 'selectors/views/product_menu';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {
    OnboardingTaskCategory,
    OnboardingTasksName,
    TaskNameMapToSteps,
    useHandleOnBoardingTaskData,
} from 'components/onboarding_tasks';

import {useClickOutsideRef, useCurrentProductId, useProducts} from '../../hooks';

import ProductBranding from './product_branding';
import ProductMenuItem from './product_menu_item';
import ProductMenuList from './product_menu_list';

export const ProductMenuContainer = styled.nav`
    display: flex;
    align-items: center;
    cursor: pointer;

    > * + * {
        margin-left: 12px;
    }
`;

export const ProductMenuButton = styled(IconButton).attrs(() => ({
    icon: 'products',
    size: 'sm',

    // we currently need this, since not passing a onClick handler is disabling the IconButton
    // this is a known issue and is being tracked by UI platform team
    // TODO@UI: remove the onClick, when it is not a mandatory prop anymore
    onClick: () => {},
    inverted: true,
    compact: true,
}))`
    > i::before {
        font-size: 20px;
        letter-spacing: 20px;
    }
`;

const ProductMenu = (): JSX.Element => {
    const products = useProducts();
    const dispatch = useDispatch();
    const switcherOpen = useSelector(isSwitcherOpen);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentProductID = useCurrentProductId(products);

    const handleClick = () => dispatch(setProductMenuSwitcherOpen(!switcherOpen));

    const handleOnBoardingTaskData = useHandleOnBoardingTaskData();
    const taskName = OnboardingTasksName.VISIT_SYSTEM_CONSOLE;
    const handleVisitConsoleClick = () => {
        const steps = TaskNameMapToSteps[taskName];
        handleOnBoardingTaskData(taskName, steps.FINISHED, true, 'finish');
        localStorage.setItem(OnboardingTaskCategory, 'true');
    };

    useClickOutsideRef(menuRef, () => {
        dispatch(setProductMenuSwitcherOpen(false));
    });

    const productItems = products?.map((product) => (
        <ProductMenuItem
            key={product.id}
            destination={product.switcherLinkURL}
            icon={product.switcherIcon}
            text={product.switcherText}
            active={product.id === currentProductID}
            onClick={handleClick}
        />
    ));

    return (
        <div ref={menuRef}>
            <MenuWrapper
                open={switcherOpen}
            >
                <ProductMenuContainer onClick={handleClick}>
                    <ProductMenuButton
                        active={switcherOpen}
                        aria-label='Select to open product switch menu.'
                    />
                    <ProductBranding/>
                </ProductMenuContainer>
                <Menu
                    listId={'product-switcher-menu-dropdown'}
                    className={'product-switcher-menu'}
                    ariaLabel={'switcherOpen'}
                >
                    <ProductMenuItem
                        destination={'/'}
                        icon={'product-channels'}
                        text={'Channels'}
                        active={currentProductID === null}
                        onClick={handleClick}
                    />
                    {productItems}
                    <ProductMenuList
                        isMessaging={currentProductID === null}
                        onClick={handleClick}
                        handleVisitConsoleClick={handleVisitConsoleClick}
                    />
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export default ProductMenu;
