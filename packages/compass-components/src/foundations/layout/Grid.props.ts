import React from 'react';

import {
    TGridAlignment,
    TGridComponent,
    TGridFlex,
    TGridJustify,
    TSpacingDefinition,
} from './Grid.types';

export type PGrid = {
    /** renders the `Grid` component as a row (`flex-direction: row`) */
    row?: boolean;
    /** flex value to use */
    flex?: TGridFlex;
    /** wrap content? */
    wrap?: boolean;
    /** the HTML tag that is used to render the component */
    component?: TGridComponent;
    /** defines the vertical alignment of items inside the component */
    alignment?: TGridAlignment;
    /** defines the horizontal alignment of items inside the component */
    justify?: TGridJustify;
    /** padding according to `TSpacingDefinition` typography */
    padding?: TSpacingDefinition;
    /** margin according to `TSpacingDefinition` typography */
    margin?: TSpacingDefinition;
    /** restrict the width of a `Grid` */
    width?: number;
    /** restrict the height of a `Grid` */
    height?: number;
    children?: React.ReactNode;
    className?: string;
};
