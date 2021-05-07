import { FONT_COLORS, FONT_MARGINS, FONT_WEIGHTS } from '../../shared/constants';
import { Utils } from '../../shared';

import {
    THeadingDefinitions,
    THeadingElement,
    THeadingMargin,
    THeadingSizeToken,
    THeadingWeight,
} from './Heading.types';

const DEFAULT_HEADING_SIZE: THeadingSizeToken = 100;

const HEADING_ELEMENTS: THeadingElement[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const DEFAULT_HEADING_ELEMENT_SIZES: Record<THeadingElement, THeadingSizeToken> = {
    h1: 800,
    h2: 700,
    h3: 600,
    h4: 500,
    h5: 400,
    h6: 300,
};

const HEADING_SIZE_TOKENS: THeadingSizeToken[] = [
    25,
    50,
    75,
    100,
    200,
    300,
    400,
    500,
    600,
    700,
    800,
    900,
    1000,
];

const HEADING_DEFINITIONS: THeadingDefinitions = {
    25: {
        size: 10,
        lineHeight: 16,
    },
    50: {
        size: 11,
        lineHeight: 16,
    },
    75: {
        size: 12,
        lineHeight: 16,
    },
    100: {
        size: 14,
        lineHeight: 20,
    },
    200: {
        size: 16,
        lineHeight: 24,
    },
    300: {
        size: 18,
        lineHeight: 24,
    },
    400: {
        size: 20,
        lineHeight: 28,
    },
    500: {
        size: 22,
        lineHeight: 28,
    },
    600: {
        size: 25,
        lineHeight: 30,
    },
    700: {
        size: 28,
        lineHeight: 36,
    },
    800: {
        size: 32,
        lineHeight: 40,
    },
    900: {
        size: 36,
        lineHeight: 44,
    },
    1000: {
        size: 40,
        lineHeight: 48,
    },
};

HEADING_SIZE_TOKENS.forEach((sizeToken) => {
    HEADING_DEFINITIONS[sizeToken].marginTop = Utils.getFontMargin(
        HEADING_DEFINITIONS[sizeToken].size,
        8 / 9
    );
    HEADING_DEFINITIONS[sizeToken].marginBottom = Utils.getFontMargin(
        HEADING_DEFINITIONS[sizeToken].size,
        0.5
    );
});

const DEFAULT_HEADING_ELEMENT: THeadingElement = 'h6';

const DEFAULT_HEADING_WEIGHT: THeadingWeight = 'bold';

const DEFAULT_HEADING_MARGIN: THeadingMargin = 'both';

export {
    HEADING_SIZE_TOKENS,
    DEFAULT_HEADING_SIZE,
    HEADING_ELEMENTS,
    DEFAULT_HEADING_ELEMENT,
    DEFAULT_HEADING_ELEMENT_SIZES,
    FONT_WEIGHTS as HEADING_WEIGHTS,
    DEFAULT_HEADING_WEIGHT,
    FONT_MARGINS as HEADING_MARGINS,
    DEFAULT_HEADING_MARGIN,
    FONT_COLORS as HEADING_COLORS,
    HEADING_DEFINITIONS,
};
