import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { calculateRelativeSize } from 'utilities/styleUtilities';

export type TextSize = 'small' | 'medium' | 'large';

export interface TextProps {
    className?: string;
    size?: TextSize;
    wrap?: boolean;
    title?: string;
}

const TextBase: React.FC<React.PropsWithChildren<TextProps>> = ({ className, size = 'medium', wrap = false, children, ...props }): React.ReactElement => {
    return (
        <span
            className={classnames('Text', `Text__${size}`, { Text__wrap: wrap }, className)}
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
`;

export default Text;
