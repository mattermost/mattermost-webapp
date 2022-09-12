// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {CheckIcon} from '@mattermost/compass-icons/components';

import menuItem from 'components/widgets/menu/menu_items/menu_item';

type Props = {
    isSelected: boolean;
    onClick: () => void;
    ariaLabel: string;
    text: React.ReactNode;
    id: string;
}

const ItemButton = styled.button`
    display: flex !important;
    align-items: center !important;
`;

const StyledCheckIcon = styled(CheckIcon)`
    display: flex;
    margin-left: auto;
    fill: var(--button-bg);
`;

const Menu = styled.ul`
    padding: 8px 0;
    margin: 0;
    color: var(--center-channel-text-rgb);
    list-style: none;
`;

function Item({
    onClick,
    ariaLabel,
    text,
    isSelected,
    id,
}: Props) {
    return (
        <ItemButton
            id={id}
            aria-label={ariaLabel}
            className='style--none'
            onClick={onClick}
        >
            {text && <span className='MenuItem__primary-text'>{text}</span>}
            {isSelected && (
                <StyledCheckIcon size={18}/>
            )}
        </ItemButton>
    );
}

const MenuItem = menuItem(Item);

export {MenuItem};

export default Menu;
