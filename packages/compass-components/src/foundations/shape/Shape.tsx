import styled, { css } from 'styled-components';
import { FlattenSimpleInterpolation, ThemedStyledProps } from 'styled-components/ts3.6';

import { TTheme } from '../theme-provider/themes/theme.types';
import { Utils } from '../../shared';

import PShape from './Shape.props';
import {
    DEFAULT_SHAPE_BORDER_RADIUS,
    DEFAULT_SHAPE_ELEVATION_LEVEL,
    SHAPE_ELEVATION_DEFINITIONS,
} from './Shape.constants';
import { TShapeBorderRadius, TShapeElevationLevel } from './Shape.types';

const getPxValue = (value: string | number): string =>
    typeof value === 'number' ? `${value}px` : getPercentageValue(value);

const getPercentageValue = (value: string): string => (value.endsWith('%') ? value : '');

const getShapeDimensions = (props: PShape): string => {
    if (props.borderRadius === 'circle' && (!props.width || typeof props.width !== 'number')) {
        throw new TypeError(
            'SHAPE: When choosing `circle` as value for `borderRadius` the width needs to be a number'
        );
    }

    if (props.borderRadius === 'circle' && props.width) {
        return `width: ${getPxValue(props.width)}; height: ${getPxValue(props.width)};`;
    }

    const width = props.width ? `width: ${getPxValue(props.width)};` : '';
    const height = props.height ? `height: ${getPxValue(props.height)};` : '';

    return width + height;
};

const getBorderRadius = (radius: TShapeBorderRadius): string => {
    if (Utils.isString(radius)) {
        return radius === 'circle' ? '50%' : '10000px';
    }

    return `${radius}px`;
};

const getElevationValue = (elevation: TShapeElevationLevel, opacity: number): string =>
    `0 ${SHAPE_ELEVATION_DEFINITIONS[elevation].y}px ${SHAPE_ELEVATION_DEFINITIONS[elevation].blur}px 0 rgba(0,0,0,${opacity})`;

const getElevation = ({
    elevation,
    elevationOnHover,
    theme,
}: ThemedStyledProps<PShape, TTheme>): FlattenSimpleInterpolation | null => {
    if (Utils.isNumber(elevation) && Utils.isNumber(elevationOnHover)) {
        const clampedElevation = Utils.clamp(elevation, 0, 6);
        const clampedElevationOnHover = Utils.clamp(elevation, 0, 6);

        return css`
            box-shadow: ${getElevationValue(
                clampedElevation as TShapeElevationLevel,
                theme.elevationOpacity
            )};

            ${elevation === elevationOnHover
                ? null
                : `
                    &:hover {
                        box-shadow: ${getElevationValue(
                            clampedElevationOnHover as TShapeElevationLevel,
                            theme.elevationOpacity
                        )};
                    }
                `}
        `;
    }

    return null;
};

const Shape = styled.div
    // ignoring the className property prevents duplicate classes to be added to the HTML element
    .attrs(
        ({
            component,
            borderRadius = DEFAULT_SHAPE_BORDER_RADIUS,
            elevation = DEFAULT_SHAPE_ELEVATION_LEVEL,
            elevationOnHover = DEFAULT_SHAPE_ELEVATION_LEVEL,
            className: ignoreClassName,
            ...rest
        }: PShape) => ({
            as: component,
            borderRadius,
            elevation,
            elevationOnHover,
            ...rest,
        })
    )
    .withConfig({
        shouldForwardProp: Utils.forwardProperties(),
    })<ThemedStyledProps<PShape, TTheme>>`
    display: flex;

    border-radius: ${(props): string => getBorderRadius(props.borderRadius)};
    background-color: ${(props): string => props.theme.background.shape};

    ${getShapeDimensions};
    ${getElevation};
    
    z-index: ${(props): number => props.elevation || 0};
`;

export default Shape;
