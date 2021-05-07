import styled, { css } from 'styled-components';
import { FlattenSimpleInterpolation, ThemedStyledProps } from 'styled-components/ts3.6';

import { FONT_TYPE_FAMILIES } from '../../shared/constants';
import { TTheme } from '../../foundations/theme-provider/themes/theme.types';
import { Utils } from '../../shared';

import {
    DEFAULT_HEADING_ELEMENT,
    DEFAULT_HEADING_MARGIN,
    DEFAULT_HEADING_SIZE,
    DEFAULT_HEADING_WEIGHT,
    HEADING_DEFINITIONS,
    HEADING_ELEMENTS,
} from './Heading.constants';
import { PHeading } from './Heading.props';

const getHeadingVariables = ({
    color,
    theme,
    inheritLineHeight = false,
    element = DEFAULT_HEADING_ELEMENT,
    margin = DEFAULT_HEADING_MARGIN,
    size = DEFAULT_HEADING_SIZE,
    weight = DEFAULT_HEADING_WEIGHT,
}: ThemedStyledProps<PHeading, TTheme>): FlattenSimpleInterpolation => {
    // Whenever this component is used with an element that is not supported within the headings throw an error!
    if (!HEADING_ELEMENTS.includes(element)) {
        throw new Error(
            `Compass Components: Heading component was used with an unsupported element '${element}'.
            Please provide one from these available options: ${HEADING_ELEMENTS.join(', ')}.`
        );
    }

    const textColor = color && color !== 'inherit' ? theme.text[color] : color;
    const lineHeight = inheritLineHeight ? 'inherit' : `${HEADING_DEFINITIONS[size].lineHeight}px`;

    let marginValue = `${HEADING_DEFINITIONS[size].marginTop}px 0 ${HEADING_DEFINITIONS[size].marginBottom}px`;

    switch (margin) {
        case 'none':
            marginValue = '0';
            break;
        case 'bottom':
            marginValue = `0 0 ${HEADING_DEFINITIONS[size].marginBottom}px`;
            break;
        case 'top':
            marginValue = `${HEADING_DEFINITIONS[size].marginTop}px 0 0`;
            break;
        default:
    }

    return css`
        font-family: ${size > 300 ? FONT_TYPE_FAMILIES.heading : FONT_TYPE_FAMILIES.body};
        font-weight: ${weight};
        font-size: ${HEADING_DEFINITIONS[size].size}px;
        line-height: ${lineHeight};

        margin: ${marginValue};
        color: ${textColor};
    `;
};

const Heading = styled.h6
    .attrs((props: PHeading) => ({
        // it is possible to remap props, so we do not need to pass down the
        // `as` property from styled-components and prevent usage of
        // unsupported HTML tags
        as: props.element,
    }))
    .withConfig({
        shouldForwardProp: Utils.forwardProperties(),
    })<PHeading>`
    ${getHeadingVariables}
    
    // animation
    body.enable-animations & {
        transition: color var(--animation-speed-shortest) 0s ease-in-out;
    }
`;

export default Heading;
