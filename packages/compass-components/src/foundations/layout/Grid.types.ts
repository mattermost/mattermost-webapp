import { TContainerElement } from '../../shared/types';

type TGridAlignment = 'initial' | 'flex-start' | 'center' | 'flex-end' | 'stretch';

type TGridJustify =
    | 'initial'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly';

type TGridFlex = number | 'auto' | 'initial';

type TSpacingTokens =
    | 0
    | 25
    | 50
    | 75
    | 100
    | 125
    | 150
    | 175
    | 200
    | 250
    | 300
    | 350
    | 400
    | 450
    | 500;

type TSpacingSides = 'top' | 'right' | 'bottom' | 'left';

type TSpacingSymmetricSides = 'vertical' | 'horizontal';

type TSpacingTokensTRBL = {
    [key in TSpacingSides]?: TSpacingTokens;
};

type TSpacingTokensSymmetric = {
    [key in TSpacingSymmetricSides]?: TSpacingTokens;
};

// defining all entries in this Tuple restricts the length to 4
type TSpacingDefinition = [
    TSpacingTokens | null,
    TSpacingTokens | null,
    TSpacingTokens | null,
    TSpacingTokens | null
];

type TSpacing = {
    all: (spacingToken: TSpacingTokens) => TSpacingDefinition;
    trbl: (spacingTokensTRBL: TSpacingTokensTRBL) => TSpacingDefinition;
    only: (side: TSpacingSides, spacingToken: TSpacingTokens) => TSpacingDefinition;
    symmetric: (spacingTokensSymmetric: TSpacingTokensSymmetric) => TSpacingDefinition;
};

export type {
    TContainerElement as TGridComponent,
    TGridAlignment,
    TGridJustify,
    TGridFlex,
    TSpacing,
    TSpacingSides,
    TSpacingTokens,
    TSpacingTokensTRBL,
    TSpacingDefinition,
    TSpacingTokensSymmetric,
};
