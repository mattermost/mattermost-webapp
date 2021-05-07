import { Utils } from '../../shared';

import {
    TTextColor,
    TTextDefinitionMap,
    TTextElement,
    TTextMargin,
    TTextSizeToken,
    TTextWeight,
} from './Text.types';

const TEXT_SIZES: TTextSizeToken[] = [25, 50, 75, 100, 200, 300];

const DEFAULT_TEXT_SIZE: TTextSizeToken = 100;

const TEXT_ELEMENTS: TTextElement[] = ['p', 'span', 'label'];

const DEFAULT_TEXT_ELEMENT: TTextElement = 'p';

const TEXT_WEIGHTS: TTextWeight[] = ['light', 'regular', 'bold'];

const DEFAULT_TEXT_WEIGHT: TTextWeight = 'regular';

const TEXT_MARGINS: TTextMargin[] = ['none', 'both', 'bottom', 'top'];

const DEFAULT_TEXT_MARGIN: TTextMargin = 'both';

const TEXT_COLORS: TTextColor[] = ['primary', 'secondary', 'disabled'];

const TEXT_DEFINITIONS: TTextDefinitionMap = {
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
        lineHeight: 28,
    },
};

TEXT_SIZES.forEach((sizeToken) => {
    TEXT_DEFINITIONS[sizeToken].margin = Utils.getFontMargin(
        TEXT_DEFINITIONS[sizeToken].size,
        0.75
    );
});

export {
    TEXT_SIZES,
    DEFAULT_TEXT_SIZE,
    TEXT_ELEMENTS,
    DEFAULT_TEXT_ELEMENT,
    TEXT_WEIGHTS,
    DEFAULT_TEXT_WEIGHT,
    TEXT_MARGINS,
    DEFAULT_TEXT_MARGIN,
    TEXT_COLORS,
    TEXT_DEFINITIONS,
};
