// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import IconButton from '@mattermost/compass-components/components/icon-button';
import Icon, {TIconGlyph} from '@mattermost/compass-components/foundations/icon';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {useClickOutsideRef, useCurrentProductId, useProducts} from './hooks';
import ProductSwitcherMenu from './product_switcher_menu';
import ProductSwitcherTip from './product_switcher_tip';

interface SwitcherNavEntryProps {
    destination: string;
    icon: TIconGlyph;
    text: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

const ProductSwitcherContainer = styled.nav`
    display: flex;
    align-items: center;

    > * + * {
        margin-left: 12px;
    }
`;

const SwitcherMenuDescriptiveText = styled.div`
    height: 32px;
    padding-left: 20px;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

const MenuItem = styled(Link)`
    && {
        text-decoration: none;
        color: inherit;
    }

    height: 40px;
    width: 273px;
    padding-left: 16px;
    padding-right: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        text-decoration: none;
        color: inherit;
    }

    button {
        padding: 0 6px;
    }
`;

const StyledIcon = styled(Icon)`
    color: var(--sidebar-bg);
`;

const MenuItemTextContainer = styled.div`
    margin-left: 8px;
    flex-grow: 1;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

const SwitcherNavEntry = ({icon, destination, text, active, onClick}: SwitcherNavEntryProps) => {
    return (
        <MenuItem
            to={destination}
            onClick={onClick}
        >
            <StyledIcon glyph={icon || 'none'}/>
            <MenuItemTextContainer>
                {text}
            </MenuItemTextContainer>
            {active &&
                <Icon
                    size={16}
                    glyph='check'
                />
            }
        </MenuItem>
    );
};

const ProductSwitcher = (): JSX.Element => {
    const products = useProducts();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentProductID = useCurrentProductId(products);

    const handleClick = () => setSwitcherOpen(!switcherOpen);

    useClickOutsideRef(menuRef, () => {
        setSwitcherOpen(false);
    });

    const productItems = products?.map((product) => {
        return (
            <SwitcherNavEntry
                key={product.id}
                destination={product.switcherLinkURL}
                icon={product.switcherIcon}
                text={product.switcherText}
                active={product.id === currentProductID}
                onClick={handleClick}
            />
        );
    });

    return (
        <div ref={menuRef}>
            <MenuWrapper
                open={switcherOpen}
            >
                <ProductSwitcherContainer>
                    <IconButton
                        icon={'products'}
                        onClick={handleClick}
                        size={'sm'}
                        compact={true}
                        toggled={switcherOpen}
                        inverted={true}
                        aria-label='Select to open product switch menu.'
                    />
                    <ProductSwitcherTip/>
                </ProductSwitcherContainer>
                <Menu
                    ariaLabel={'switcherOpen'}
                >
                    <SwitcherMenuDescriptiveText>
                        <FormattedMessage
                            defaultMessage='Open...'
                            id='global_header.open'
                        />
                    </SwitcherMenuDescriptiveText>
                    <SwitcherNavEntry
                        destination={'/'}
                        icon={'product-channels'}
                        text={'Channels'}
                        active={currentProductID === null}
                        onClick={handleClick}
                    />
                    {productItems}
                    <ProductSwitcherMenu
                        id='ProductSwitcherMenu'
                        onClick={handleClick}
                    />
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export default ProductSwitcher;
