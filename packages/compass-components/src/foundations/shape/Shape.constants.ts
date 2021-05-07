import {
    TShapeBorderRadius,
    TShapeElement,
    TShapeElevationDefinitions,
    TShapeElevationLevel,
} from './Shape.types';

const SHAPE_BORDER_RADII: TShapeBorderRadius[] = [0, 4, 8, 12, 16, 20, 24, 'circle', 'pill'];

const DEFAULT_SHAPE_BORDER_RADIUS: TShapeBorderRadius = 4;

const SHAPE_ELEVATION_LEVELS: TShapeElevationLevel[] = [0, 1, 2, 3, 4, 5, 6];

const DEFAULT_SHAPE_ELEVATION_LEVEL: TShapeElevationLevel = 0;

const SHAPE_ELEMENTS: TShapeElement[] = ['div', 'span', 'section', 'aside', 'button'];

const DEFAULT_SHAPE_ELEMENT: TShapeElement = 'div';

const SHAPE_ELEVATION_DEFINITIONS: TShapeElevationDefinitions = {
    0: { y: 0, blur: 0 },
    1: { y: 2, blur: 3 },
    2: { y: 4, blur: 6 },
    3: { y: 6, blur: 14 },
    4: { y: 8, blur: 24 },
    5: { y: 12, blur: 32 },
    6: { y: 20, blur: 32 },
};

export {
    SHAPE_BORDER_RADII,
    DEFAULT_SHAPE_BORDER_RADIUS,
    SHAPE_ELEVATION_LEVELS,
    DEFAULT_SHAPE_ELEVATION_LEVEL,
    SHAPE_ELEVATION_DEFINITIONS,
    SHAPE_ELEMENTS,
    DEFAULT_SHAPE_ELEMENT,
};
