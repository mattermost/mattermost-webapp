import { TContainerElement, TInteractionElement } from '../../shared/types';

// TODO: maybe move the hard-coded ones to a separate union type (`TActionElement` maybe?)
type TShapeElement = TContainerElement | TInteractionElement;

type TShapeBorderRadius = 0 | 4 | 8 | 12 | 16 | 20 | 24 | 'circle' | 'pill';

type TShapeElevationLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type TShapeElevationDefinition = {
    y: number;
    blur: number;
};

type TShapeElevationDefinitions = {
    [key in TShapeElevationLevel]: TShapeElevationDefinition;
};

export type {
    TShapeElement,
    TShapeBorderRadius,
    TShapeElevationLevel,
    TShapeElevationDefinition,
    TShapeElevationDefinitions,
};
