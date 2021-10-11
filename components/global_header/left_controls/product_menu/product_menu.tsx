// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import styled from 'styled-components';

import IconButton from '@mattermost/compass-components/components/icon-button';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {useClickOutsideRef, useCurrentProductId, useProducts} from '../../hooks';

import ProductBranding from './product_branding';
import ProductMenuItem from './product_menu_item';
import ProductMenuList from './product_menu_list';
import ProductMenuTip from './product_menu_tip';

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
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentProductID = useCurrentProductId(products);

    const handleClick = () => setSwitcherOpen(!switcherOpen);

    useClickOutsideRef(menuRef, () => {
        setSwitcherOpen(false);
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
                    <ProductMenuTip/>
                    <ProductBranding/>
                </ProductMenuContainer>
                <Menu
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
                        id='ProductMenuList'
                        isMessaging={currentProductID === null}
                        onClick={handleClick}
                    />
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export default ProductMenu;
