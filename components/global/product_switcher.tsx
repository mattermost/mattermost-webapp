// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@mattermost/compass-components/components/icon-button';
import Text from '@mattermost/compass-components/components/text';
import Flex from '@mattermost/compass-components/utilities/layout';
import { TIconGlyph } from '@mattermost/compass-components/foundations/icon';
import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {useClickOutsideRef, useCurrentProductId, useProducts} from './hooks';
import ProductSwitcherMenu from './product_switcher_menu';

interface SwitcherMenuProps {
    open: boolean;
}

interface SwitcherNavEntryProps {
    destination: string;
    icon: TIconGlyph;
    text: React.ReactNode;
    active: boolean;
}

const SwitcherMenu = styled.div<SwitcherMenuProps>`
    visibility: ${(props) => (props.open ? 'visible' : 'hidden')};
    position: absolute;
    top: 35px;
    left: 5px;
    margin-left: 12px;
    z-index: 1000;
    background: var(--center-channel-bg);
    display: flex;
    flex-direction: column;
    width: 273px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    padding-top: 14px;
    padding-bottom: 5px;
    color: var(--center-channel-color);
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
`;

const MenuItemTextContainer = styled.div`
    margin-left: 8px;
    flex-grow: 1;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

const LinkIcon = styled.i`
    width: 14px;
    height: 14px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const SwitcherNavEntry = (props: SwitcherNavEntryProps) => {
    return (
        <MenuItem
            to={props.destination}
        >

            <IconButton icon={props.icon} />
            <MenuItemTextContainer>
                {props.text}
            </MenuItemTextContainer>
            {props.active &&
                <LinkIcon className={'fa fa-check'}/>
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
            />
        );
    });

    return (
        <div ref={menuRef}>
            <Flex row>
                <IconButton
                    icon={'view-grid-outline'}
                    onClick={handleClick}
                    size={'sm'}
                    toggled={switcherOpen}
                    inverted={true}
                />

                <IconButton size={'md'} icon={'mattermost'} />
                <Text>{'Channels'}</Text>
            </Flex>
            <SwitcherMenu
                open={switcherOpen}
            >
                <SwitcherMenuDescriptiveText>
                    <FormattedMessage
                        defaultMessage='Open...'
                        id='global_header.open'
                    />
                </SwitcherMenuDescriptiveText>
                <SwitcherNavEntry
                    destination={'/'}
                    icon={'mattermost'}
                    text={'Channels'}
                    active={currentProductID === null}
                />
                {productItems}
                <ProductSwitcherMenu id='ProductSwitcherMenu'/>
            </SwitcherMenu>
        </div>
    );
};

export default ProductSwitcher;
