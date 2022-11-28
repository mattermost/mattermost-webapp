// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {CheckIcon} from '@mattermost/compass-icons/components';

import Toggle from 'components/toggle';
import menuItem from 'components/widgets/menu/menu_items/menu_item';
import MenuGroup from 'components/widgets/menu/menu_group';

type ItemProps = {
    ariaLabel: string;
    isSelected: boolean;
    onClick: () => void;
    text: React.ReactNode;
}

type ToggleProps = {
    ariaLabel?: string;
    description: React.ReactNode;
    disabled: boolean;
    icon: React.ReactNode;
    onToggle: () => void;
    text: React.ReactNode;
    toggled: boolean;
}

const ItemButton = styled.button`
    display: flex !important;
    align-items: center !important;
`;

const Wrapper = styled.div`
    display: flex !important;
    align-items: center !important;
    padding: 8px 16px 4px;
`;

const Text = styled.div`
    padding-left: 10px;
`;

const Description = styled.div`
    padding: 0 44px;
    font-size: 12px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const ToggleWrapper = styled.div`
    flex-shrink: 0;
    width: 32px;
    margin-left: auto;
`;

const StyledCheckIcon = styled(CheckIcon)`
    display: flex;
    margin-left: auto;
    fill: var(--button-bg);
`;

const Menu = styled.ul`
    display: block;
    position: relative;
    box-shadow: none;
    border-radius: 0;
    border: 0;
    padding: 0 0 8px;
    margin: 0;
    color: var(--center-channel-text-rgb);
    list-style: none;
`;

function Item({
    onClick,
    ariaLabel,
    text,
    isSelected,
}: ItemProps) {
    return (
        <ItemButton
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

function ToggleItem({
    ariaLabel,
    description,
    disabled,
    icon,
    onToggle,
    text,
    toggled,
}: ToggleProps) {
    return (
        <div>
            <Wrapper>
                {icon}
                <Text>
                    {text}
                </Text>
                <ToggleWrapper>
                    <Toggle
                        aria-label={ariaLabel}
                        size='btn-sm'
                        disabled={disabled}
                        onToggle={onToggle}
                        toggled={toggled}
                    />
                </ToggleWrapper>
            </Wrapper>
            <Description>
                {description}
            </Description>
        </div>
    );
}

const MenuItem = menuItem(Item);

export {MenuItem, ToggleItem, MenuGroup};

export default Menu;
