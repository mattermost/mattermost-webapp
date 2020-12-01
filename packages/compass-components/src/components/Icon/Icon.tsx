import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import '@mattermost/compass-icons';

import { calculateRelativeSize } from '../../utilities/styleUtilities';
import { ANIMATION_SPEEDS } from '../../constants/styleConstants';

export type IconSize = 10 | 12 | 16 | 20 | 28 | 32 | 40 | 52 | 64 | 104;

export interface IconProps {
    className?: string;
    glyph: string;
    size?: IconSize;
}

const IconBase: React.FC<IconProps> = ({
    className,
    glyph,
    size = 20,
    ...props
}) => {
    return (
        <i
            className={classnames(
                'Icon',
                glyph,
                className,
            )}
            data-size={size}
            {...props}
        />
    );
};

function generateSizeStyles(size: IconSize): string {
    const relativeSize = calculateRelativeSize(size, 10, 'rem');
    return `
        &[data-size="${size}"] {
            width: ${size}px;
            height: ${size}px;

            &::before {
                font-size: ${relativeSize};
                letter-spacing: ${relativeSize};
            }
        }
    `
}

const Icon = styled(IconBase)`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 0;
    width: 20px;
    height: 20px;

    &::before {
        margin: 0; // remove margins added by fontello
        font-size: ${calculateRelativeSize(24, 10, 'rem')};
        line-height: 1;
        letter-spacing: ${calculateRelativeSize(24, 10, 'rem')};
    }

    // sizes
    ${generateSizeStyles(10)}

    ${generateSizeStyles(12)}

    ${generateSizeStyles(16)}

    ${generateSizeStyles(20)}

    ${generateSizeStyles(28)}

    ${generateSizeStyles(32)}

    ${generateSizeStyles(40)}

    ${generateSizeStyles(52)}

    ${generateSizeStyles(64)}

    ${generateSizeStyles(104)}

    // animation
    .enable-animations & {
        transition: color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
    }
`;

export default Icon;
