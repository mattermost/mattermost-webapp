import styled, { css } from 'styled-components';
import { FlattenSimpleInterpolation, ThemedStyledProps } from 'styled-components/ts3.6';

import { Utils } from '../../shared';
import { TTheme } from '../../foundations/theme-provider/themes/theme.types';
import { FONT_TYPE_FAMILIES } from '../../shared/constants';

import PText from './Text.props';
import {
    DEFAULT_TEXT_MARGIN,
    DEFAULT_TEXT_SIZE,
    DEFAULT_TEXT_ELEMENT,
    DEFAULT_TEXT_WEIGHT,
    TEXT_ELEMENTS,
    TEXT_DEFINITIONS,
} from './Text.constants';

const getTextVariables = ({
    color,
    theme,
    inheritLineHeight = false,
    element = DEFAULT_TEXT_ELEMENT,
    margin = DEFAULT_TEXT_MARGIN,
    size = DEFAULT_TEXT_SIZE,
    weight = DEFAULT_TEXT_WEIGHT,
}: ThemedStyledProps<PText, TTheme>): FlattenSimpleInterpolation => {
    // Whenever this component is used with an element that is not supported within the headings throw an error!
    if (!TEXT_ELEMENTS.includes(element)) {
        throw new Error(
            `Compass Components: Text component was used with an unsupported element '${element}'.
            Please provide one from these available options: ${TEXT_ELEMENTS.join(', ')}.`
        );
    }

    const textColor = color && color !== 'inherit' ? theme.text[color] : color;
    const lineHeight = inheritLineHeight ? 'inherit' : `${TEXT_DEFINITIONS[size].lineHeight}px`;

    let marginValue = `${TEXT_DEFINITIONS[size].margin}px 0`;

    switch (margin) {
        case 'none':
            marginValue = '0';
            break;
        case 'bottom':
            marginValue = `0 0 ${TEXT_DEFINITIONS[size].margin}px`;
            break;
        case 'top':
            marginValue = `${TEXT_DEFINITIONS[size].margin}px 0 0`;
            break;
        default:
    }

    return css`
        font-family: ${FONT_TYPE_FAMILIES.body};
        font-weight: ${weight};
        font-size: ${TEXT_DEFINITIONS[size].size}px;
        line-height: ${lineHeight};

        margin: ${marginValue};
        color: ${textColor};
    `;
};

const Text = styled.p
    .attrs((props: PText) => ({
        // it is possible to remap props, so we do not need to pass down the
        // `as` property from styled-components and prevent usage of
        // unsupported HTML tags
        as: props.element,
    }))
    .withConfig({
        shouldForwardProp: Utils.forwardProperties(),
    })<PText>`
    ${getTextVariables}
    
    // animation
    body.enable-animations & {
        transition: color var(--animation-speed-shortest) 0s ease-in-out;
    }
`;

export default Text;
