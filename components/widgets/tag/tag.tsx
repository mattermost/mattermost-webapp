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
    gap: 4px;
    max-width: 100%;
    margin: 0;
    ${({size}) => (size === 'xs' ? css`padding: 1px 4px;` : css`padding: 2px 5px;`)}

    border: none;
    border-radius: 4px;

    font-family: inherit;
    font-weight: 600;
    line-height: 16px;
    ${({size}) => (size === 'xs' ? css`font-size: 10px;` : css`font-size: 12px;`)}
    ${({capitalize}) => (capitalize ? css`text-transform: uppercase;` : css`text-transform: none;`)}

    &.Tag__info,
    &.Tag__success,
    &.Tag__warning,
    &.Tag__danger {
        --tag-bg-opacity: 1;
        --tag-color: 255, 255, 255;
    }

    &.Tag__info {
        --tag-bg: var(--semantic-color-info);
    }

    &.Tag__success {
        --tag-bg: var(--semantic-color-success);
    }

    &.Tag__warning {
        --tag-bg: var(--semantic-color-warning);
    }

    &.Tag__danger {
        --tag-bg: var(--semantic-color-danger);
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

    .Tag__text {
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
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
            className={classNames('Tag', {[`Tag__${variant}`]: variant}, className)}
        >
            {Icon && <Icon size={size === 'xs' ? 10 : 12}/>}
            <span className={'Tag__text'}>{text}</span>
        </TagWrapper>
    );
};

export default memo(Tag);
