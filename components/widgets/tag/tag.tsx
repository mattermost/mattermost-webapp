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
    capitalize?: boolean;
    icon?: IconGlyphTypes;
    variant?: TagVariant;
    size?: 'sm' | 'xs';
    onClick?: MouseEventHandler;
    className?: string;
};

type TagWrapperProps = Pick<Props, 'capitalize' | 'size'>;

const TagWrapper = styled.div<TagWrapperProps>`
    --tag-bg: var(--semantic-color-general);
    --tag-bg-opacity: 0.08;
    --tag-color: var(--semantic-color-general);

    appearance: none;

    display: inline-flex;
    align-items: center;
    align-content: center;
    align-self: center;
    margin: 0 0 0 4px;
    ${({size}) => (size === 'xs' ? css`padding: 1px 4px;` : css`padding: 2px 5px;`)}
    gap: 4px;

    border: none;
    border-radius: 4px;

    font-family: inherit;
    font-weight: 600;
    line-height: 16px;
    ${({size}) => (size === 'xs' ? css`font-size: 10px;` : css`font-size: 12px;`)}
    ${({capitalize}) => (capitalize ? css`text-transform: uppercase;` : css`text-transform: none;`)}

    &.info,
    &.success,
    &.warning,
    &.danger {
        --tag-bg-opacity: 1;
    }

    &.info {
        --tag-bg: var(--semantic-color-info);
        --tag-color: 255 255 255;
    }

    &.success {
        --tag-bg: var(--semantic-color-success);
        --tag-color: 255 255 255;
    }

    &.warning {
        --tag-bg: var(--semantic-color-warning);
        --tag-color: 255 255 255;
    }

    &.danger {
        --tag-bg: var(--semantic-color-danger);
        --tag-color: 255 255 255;
    }

    background: rgba(var(--tag-bg), var(--tag-bg-opacity));
    color: rgb(var(--tag-color));

    ${({onClick}) => typeof onClick === 'function' && (
        css`
            &:hover,
            &:focus {
                background: rgba(var(--tag-bg), 0.16);
                cursor: pointer;
            }
        `
    )}
`;

const Tag = ({
    variant,
    onClick,
    className,
    text,
    icon: iconName,
    size = 'xs',
    ...rest
}: Props) => {
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
            <span className={'Tag__text'}>{text}</span>
        </TagWrapper>
    );
};

export default memo(Tag);
