import styled, { css } from 'styled-components';
import { FlattenSimpleInterpolation } from 'styled-components/ts3.6';

import { Utils } from '../../shared';

import { PIcon } from './Icon.props';
import { DEFAULT_ICON_GLYPH, DEFAULT_ICON_SIZE, ICON_FONT_SIZES } from './Icon.constants';

function getIconSizes({ size = DEFAULT_ICON_SIZE }: PIcon): FlattenSimpleInterpolation {
    return css`
        height: ${size}px;
        width: ${size}px;

        &::before {
            font-size: ${ICON_FONT_SIZES[size]}px;
            letter-spacing: ${ICON_FONT_SIZES[size]}px;
        }
    `;
}

const Icon = styled.i
    .attrs(
        ({
            size = DEFAULT_ICON_SIZE,
            glyph = DEFAULT_ICON_GLYPH,
            className = `icon-${glyph || DEFAULT_ICON_GLYPH}`,
            ...rest
        }: PIcon) => ({
            ...rest,
            className,
            size,
            glyph,
            'aria-label': rest.ariaLabel,
        })
    )
    .withConfig({
        shouldForwardProp: Utils.forwardProperties(),
    })<PIcon>`    
    // element container base styles
    position: relative;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;

    display: inline-flex;
    align-items: center;

    color: inherit;

    // sub elements
    &::before {
        font-size: ${ICON_FONT_SIZES[DEFAULT_ICON_SIZE]}px;
        line-height: 1;
        letter-spacing: ${ICON_FONT_SIZES[DEFAULT_ICON_SIZE]}px;
        margin: 0; // remove margins added by fontello
    }
    
    ${getIconSizes};

    // animation
    body.enable-animations & {
        transition: color var(--animation-speed) 0s ease-in-out;
    }
`;

export default Icon;
