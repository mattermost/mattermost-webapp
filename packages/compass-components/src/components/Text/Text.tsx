import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { calculateRelativeSize } from 'utilities/styleUtilities';
import { ANIMATION_SPEEDS } from 'constants/styleConstants';

export type TextSize = 'small' | 'medium' | 'large';

export interface TextProps {
    className?: string;
    size?: TextSize;
    bold?: boolean;
    wrap?: boolean;
    animate?: boolean;
}

const TextBase: React.FC<React.PropsWithChildren<TextProps>> = ({ className, size = 'medium', bold = false, wrap = false, animate = false, children, ...props }): React.ReactElement => {
    return (
        <span
            className={classnames('Text', `Text__${size}`, { Text__wrap: wrap, Text__bold: bold }, className)}
            data-animate={animate}
            {...props}
        >
            {children}
        </span>
    );
};

const Text = styled(TextBase)`
    display: inline-block;
    position: relative;
    max-width: 100%;
    font-family: 'Open Sans', sans-serif;
    font-size: ${calculateRelativeSize(14, 10, 'rem')};
    line-height: ${calculateRelativeSize(18, 14)};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    // variations
    &.Text__bold {
        font-weight: 600;
    }

    // sizes
    &.Text__small {
        font-size: ${calculateRelativeSize(12, 10, 'rem')};
        line-height: ${calculateRelativeSize(16, 12)};
    }

    &.Text__large {
        font-size: ${calculateRelativeSize(16, 10, 'rem')};
        line-height: ${calculateRelativeSize(20, 16)};
    }

    &.Text__wrap {
        white-space: normal;
    }

    // animation
    .enable-animations & {
        &[data-animate] {
            transition: color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
        }
    }
`;

export default Text;
