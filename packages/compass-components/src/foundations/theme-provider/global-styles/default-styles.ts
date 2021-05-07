import { css } from 'styled-components';
import { FlattenSimpleInterpolation } from 'styled-components/ts3.6';

import {
    DEFAULT_HEADING_ELEMENT_SIZES,
    DEFAULT_HEADING_SIZE,
    DEFAULT_HEADING_WEIGHT,
    HEADING_DEFINITIONS,
    HEADING_ELEMENTS,
    THeadingElement,
} from '../../../components/heading';
import { DEFAULT_TEXT_SIZE, DEFAULT_TEXT_WEIGHT, TEXT_DEFINITIONS } from '../../../components/text';
import { FONT_TYPE_FAMILIES } from '../../../shared/constants';

const generateDefaultHeadingStyles = (): FlattenSimpleInterpolation =>
    HEADING_ELEMENTS.map((headingElement: THeadingElement) => {
        const size = DEFAULT_HEADING_ELEMENT_SIZES[headingElement];

        return css`
            ${headingElement} {
                font-size: ${HEADING_DEFINITIONS[size].size}px;
                line-height: ${HEADING_DEFINITIONS[size].lineHeight}px;
                margin: ${HEADING_DEFINITIONS[size].marginTop}px 0
                    ${HEADING_DEFINITIONS[size].marginBottom}px;
            }
        `;
    });

const VDefaultStyles = css`
    :root {
        font-size: ${TEXT_DEFINITIONS[DEFAULT_TEXT_SIZE].size}px;
        font-weight: ${DEFAULT_TEXT_WEIGHT};
        line-height: ${TEXT_DEFINITIONS[DEFAULT_TEXT_SIZE].lineHeight}px;
    }

    p,
    span,
    label {
        // set body type styles
        // - defaults
        margin: ${TEXT_DEFINITIONS[DEFAULT_TEXT_SIZE].margin}px 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        // set heading type styles
        // - defaults
        font-family: ${FONT_TYPE_FAMILIES.heading};
        font-weight: ${DEFAULT_HEADING_WEIGHT};
        margin: ${HEADING_DEFINITIONS[DEFAULT_HEADING_SIZE].marginTop}px 0
            ${HEADING_DEFINITIONS[DEFAULT_HEADING_SIZE].marginBottom}px;
    }

    ${generateDefaultHeadingStyles()}

    html, body {
        background: ${({ theme }): string => theme.background.default};
    }
`;

export default VDefaultStyles;
