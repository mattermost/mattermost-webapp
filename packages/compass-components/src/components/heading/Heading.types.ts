import { TFontColor, TFontMargin, TFontWeight } from '../../shared/types';

type THeadingSizeToken = 25 | 50 | 75 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;

type THeadingDefinition = {
    size: number;
    lineHeight: number;
    marginTop?: number;
    marginBottom?: number;
};

type THeadingDefinitions = {
    [key in THeadingSizeToken]: THeadingDefinition;
};

type THeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type {
    THeadingSizeToken,
    THeadingElement,
    THeadingDefinition,
    THeadingDefinitions,
    TFontWeight as THeadingWeight,
    TFontColor as THeadingColor,
    TFontMargin as THeadingMargin,
};
