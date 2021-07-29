// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@mattermost/compass-components/components/icon-button';
import Text from '@mattermost/compass-components/components/text/Text';
import Shape from '@mattermost/compass-components/foundations/shape';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';
import Popover from '@mattermost/compass-components/utilities/popover/Popover';
import Spacing from '@mattermost/compass-components/utilities/spacing';
import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link, useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';
import ProductSwitcherMenu from './product_switcher_menu'
import {useProducts} from './hooks';

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

interface SwitcherNavEntryProps {
    destination: string;
    icon: React.ReactNode;
    text: React.ReactNode;
}

const SwitcherNavEntry = (props: SwitcherNavEntryProps) => {
    const match = useRouteMatch(props.destination);
    return (
        <MenuItem
            to={props.destination}
            target='_blank'
        >
            {props.icon}
            <MenuItemTextContainer>
                {props.text}
            </MenuItemTextContainer>
            <LinkIcon className={'fa ' + (match ? 'fa-check' : 'fa-external-link')}/>
        </MenuItem>
    );
};

const ProductSwitcher = (): JSX.Element => {
    const products = useProducts();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const menuRef = useRef(null);

    const handleClick = () => setSwitcherOpen(!switcherOpen);

    const productItems = products?.map((product) => {
        return (
            <SwitcherNavEntry
                key={product.id}
                destination={product.switcherLinkURL}
                icon={product.switcherIcon}
                text={product.switcherText}
            />
        );
    });

    return (
        <>
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
                offset={[0, 75]}
                zIndex={20}
            >
                <Shape
                    elevation={1}
                    elevationOnHover={3}
                    width={200}
                >
                    <Flex
                        padding={Spacing.all(50)}
                    >
                        <Text
                            size={300}
                            weight={'bold'}
                        >
                            <FormattedMessage
                                defaultMessage='Open...'
                                id='global_header.open'
                            />
                        </Text>
                        {productItems}
                        <ProductSwitcherMenu id='ProductSwitcherMenu'/>
                    </Flex>
                </Shape>
            </Popover>
        </>
    );
};

export default ProductSwitcher;
