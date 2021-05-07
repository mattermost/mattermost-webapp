import React from 'react';

import Grid, { Spacing, TSpacingTokensSymmetric } from '../../foundations/layout';
import Shape from '../../foundations/shape';
import Icon, { TIconSize } from '../icon';
import Text, { TTextSizeToken } from '../text';

import { PButton } from './Button.props';

const ButtonBase: React.FC<PButton> = ({
    label,
    icon,
    iconPosition,
    size,
    width,
    ...rest
}: PButton) => {
    let labelSize: TTextSizeToken = 100;
    let iconSize: TIconSize = 16;
    let height = 40;

    const spacing: TSpacingTokensSymmetric = {
        vertical: 0,
        horizontal: 125,
    };

    switch (size) {
        case 'large':
            labelSize = 200;
            iconSize = 20;
            height = 48;
            spacing.horizontal = 150;
            break;
        case 'small':
            labelSize = 75;
            iconSize = 12;
            height = 32;
            // line-height on text is 16, so there is no need to adjust paddings
            spacing.horizontal = 100;
            break;
        case 'medium':
        default:
    }

    return (
        <Shape
            component={'button'}
            borderRadius={4}
            width={width === 'full' ? '100%' : width}
            height={height}
            {...rest}
        >
            <Grid
                row
                component={'span'}
                alignment={'center'}
                justify={'center'}
                padding={Spacing.symmetric(spacing)}
                flex={1}
            >
                {icon && iconPosition === 'start' ? <Icon glyph={icon} size={iconSize} /> : null}
                <Text
                    element={'span'}
                    size={labelSize}
                    margin={'none'}
                    weight={'bold'}
                    inheritLineHeight
                >
                    {label}
                </Text>
                {icon && iconPosition === 'end' ? <Icon glyph={icon} size={iconSize} /> : null}
            </Grid>
        </Shape>
    );
};

export default ButtonBase;
