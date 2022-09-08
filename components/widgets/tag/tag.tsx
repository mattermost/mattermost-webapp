// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, MouseEventHandler} from 'react';
import styled, {css} from 'styled-components';
import classNames from 'classnames';
import {IconGlyphTypes} from '@mattermost/compass-icons/IconGlyphs';
import glyphMap from '@mattermost/compass-icons/components';

export type TagVariant = 'info' | 'success' | 'warning' | 'danger';

type Props = {
    text: React.ReactNode;
    show?: boolean;
    capitalize?: boolean;
    icon?: IconGlyphTypes;
    variant?: TagVariant;
    size?: 'sm' | 'xs';
    onClick?: MouseEventHandler;
    className?: string;
};

type TagWrapperProps = Pick<Props, 'capitalize' | 'size'>;

const TagWrapper = styled.div<TagWrapperProps>`
    appearance: none;

    display: inline-flex;
    align-items: center;
    align-content: center;
    margin: 0 0 0 4px;
    ${({size}) => (size === 'xs' ? css`padding: 1px 4px;` : css`padding: 2px 5px;`)}
    gap: 4px;

    border: none;
    border-radius: 2px;
    background: rgba(var(--semantic-color-general), 0.08);

    font-family: inherit;
    font-weight: 600;
    line-height: 16px;
    ${({size}) => (size === 'xs' ? css`font-size: 10px;` : css`font-size: 12px;`)}
    ${({capitalize}) => (capitalize ? css`text-transform: uppercase;` : css`text-transform: none;`)}

    &.BotTag,
    &.GuestTag {
        padding: 2px 4px;
    }

    &.info {
        background: rgb(var(--semantic-color-info));
        color: #fff;
    }

    &.success {
        background: rgb(var(--semantic-color-success));
        border-radius: 4px;
        color: #fff;
    }

    &.warning {
        background: rgb(var(--semantic-color-warning));
        color: #fff;
    }

    &.danger {
        background: rgb(var(--semantic-color-danger));
        color: #fff;
    }
`;

const Tag = ({
    variant,
    onClick,
    className,
    text,
    icon: iconName,
    size = 'xs',
    show = true,
    ...rest
}: Props) => {
    if (!show || !text) {
        return null;
    }

    const Icon = iconName ? glyphMap[iconName] : null;
    const element = onClick ? 'button' : 'div';
    return (
        <TagWrapper
            {...rest}
            as={element}
            size={size}
            onClick={onClick}
            className={classNames('Tag', {[`${variant}`]: variant}, className)}
        >
            {Icon && <Icon size={size === 'xs' ? 10 : 12}/>}
            {text}
        </TagWrapper>
    );
};

export default memo(Tag);
