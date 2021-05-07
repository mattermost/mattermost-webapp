import { TFontColor, TFontMargin, TFontWeight } from '../../shared/types';

type TTextSizeToken = 25 | 50 | 75 | 100 | 200 | 300;

type TTextDefinition = {
    size: number;
    lineHeight: number;
    margin?: number;
};

type TTextDefinitionMap = {
    [key in TTextSizeToken]: TTextDefinition;
};

type TTextElement = 'p' | 'span' | 'label';

export type {
    TTextSizeToken,
    TTextDefinition,
    TTextDefinitionMap,
    TTextElement,
    TFontWeight as TTextWeight,
    TFontColor as TTextColor,
    TFontMargin as TTextMargin,
};
