import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { calculateRelativeSize } from '../../utilities/styleUtilities';
import { ANIMATION_SPEEDS } from '../../constants/styleConstants';

export type TextSize = 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32;

export interface TextProps {
    className?: string;
    size?: TextSize;
    bold?: boolean;
    italic?: boolean;
    wrap?: boolean;
}

const TextBase: React.FC<React.PropsWithChildren<TextProps>> = ({
    className,
    size = 14,
    bold = false,
    italic = false,
    wrap = false,
    children,
    ...props
}): React.ReactElement => {
    return (
        <span
            className={classnames('Text', { Text__wrap: wrap, Text__bold: bold, Text__italics: italic }, className)}
            data-size={size}
            {...props}
        >
            {children}
        </span>
    );
};

function generateSizeStyles(size: TextSize, lineHeight: number): string {
    return `
        &[data-size="${size}"] {
            font-size: ${calculateRelativeSize(size, 10, 'rem')};
            line-height: ${calculateRelativeSize(lineHeight, size)};
        }
    `;
}

const Text = styled(TextBase)`
    display: inline-block;
    position: relative;
    max-width: 100%;
    font-family: 'Open Sans', sans-serif;
    font-size: ${calculateRelativeSize(14, 10, 'rem')};
    line-height: ${calculateRelativeSize(20, 14)};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    // variations
    &.Text__bold {
        font-weight: 600;
    }
    &.Text__italics {
        font-style: italic;
    }

    // sizes
    ${generateSizeStyles(12, 16)}

    ${generateSizeStyles(14, 20)}

    ${generateSizeStyles(16, 24)}

    ${generateSizeStyles(18, 24)}

    ${generateSizeStyles(20, 28)}

    ${generateSizeStyles(24, 32)}

    ${generateSizeStyles(28, 36)}

    ${generateSizeStyles(32, 40)}

    &.Text__wrap {
        white-space: normal;
    }

    // animation
    .enable-animations & {
        transition: color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
    }
`;

export default Text;
