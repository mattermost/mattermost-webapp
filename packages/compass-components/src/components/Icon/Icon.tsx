import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import '@mattermost/compass-icons';

import { calculateRelativeSize } from 'utilities/styleUtilities';
import { ANIMATION_SPEEDS } from 'constants/styleConstants';

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
                `Icon__size-${size}`,
                glyph,
                className,
            )}
            {...props}
        />
    );
};

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

    &.Icon__size-10 {
        width: 10px;
        height: 10px;

        &::before {
            font-size: ${calculateRelativeSize(12, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(12, 10, 'rem')};
        }
    }

    &.Icon__size-12 {
        width: 12px;
        height: 12px;

        &::before {
            font-size: ${calculateRelativeSize(14, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(14, 10, 'rem')};
        }
    }

    &.Icon__size-16 {
        width: 16px;
        height: 16px;

        &::before {
            font-size: ${calculateRelativeSize(18, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(18, 10, 'rem')};
        }
    }

    &.Icon__size-20 {
        // this is the default, including the class for consistency
    }

    &.Icon__size-28 {
        width: 28px;
        height: 28px;

        &::before {
            font-size: ${calculateRelativeSize(31.2, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(31.2, 10, 'rem')};
        }
    }

    &.Icon__size-32 {
        width: 32px;
        height: 32px;

        &::before {
            font-size: ${calculateRelativeSize(36, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(36, 10, 'rem')};
        }
    }

    &.Icon__size-40 {
        width: 40px;
        height: 40px;

        &::before {
            font-size: ${calculateRelativeSize(48, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(48, 10, 'rem')};
        }
    }

    &.Icon__size-52 {
        width: 52px;
        height: 52px;

        &::before {
            font-size: ${calculateRelativeSize(60, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(60, 10, 'rem')};
        }
    }

    &.Icon__size-64 {
        width: 64px;
        height: 64px;

        &::before {
            font-size: ${calculateRelativeSize(72, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(72, 10, 'rem')};
        }
    }

    &.Icon__size-104 {
        width: 104px;
        height: 104px;

        &::before {
            font-size: ${calculateRelativeSize(120, 10, 'rem')};
            letter-spacing: ${calculateRelativeSize(120, 10, 'rem')};
        }
    }

    // animation
    .enable-animations & {
        transition: color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
    }
`;

export default Icon;
