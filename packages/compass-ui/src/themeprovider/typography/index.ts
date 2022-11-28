// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TypographyOptions} from '@mui/material/styles/createTypography';

import * as bodyOverrides from './body';
import * as headingOverrides from './heading';

declare module '@mui/material/styles' {
    interface TypographyVariants {

        // body text variants
        b25: React.CSSProperties;
        b50: React.CSSProperties;
        b75: React.CSSProperties;
        b100: React.CSSProperties;
        b200: React.CSSProperties;
        b300: React.CSSProperties;

        // heading variants
        h25: React.CSSProperties;
        h50: React.CSSProperties;
        h75: React.CSSProperties;
        h100: React.CSSProperties;
        h200: React.CSSProperties;
        h300: React.CSSProperties;
        h400: React.CSSProperties;
        h500: React.CSSProperties;
        h600: React.CSSProperties;
        h700: React.CSSProperties;
        h800: React.CSSProperties;
        h900: React.CSSProperties;
        h1000: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {

        // body text style properties
        b25?: React.CSSProperties;
        b50?: React.CSSProperties;
        b75?: React.CSSProperties;
        b100?: React.CSSProperties;
        b200?: React.CSSProperties;
        b300?: React.CSSProperties;

        // heading style properties
        h25?: React.CSSProperties;
        h50?: React.CSSProperties;
        h75?: React.CSSProperties;
        h100?: React.CSSProperties;
        h200?: React.CSSProperties;
        h300?: React.CSSProperties;
        h400?: React.CSSProperties;
        h500?: React.CSSProperties;
        h600?: React.CSSProperties;
        h700?: React.CSSProperties;
        h800?: React.CSSProperties;
        h900?: React.CSSProperties;
        h1000?: React.CSSProperties;
    }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {

        // enable our custom body text variants
        b25: true;
        b50: true;
        b75: true;
        b100: true;
        b200: true;
        b300: true;

        // enable our custom heading variants
        h25: true;
        h50: true;
        h75: true;
        h100: true;
        h200: true;
        h300: true;
        h400: true;
        h500: true;
        h600: true;
        h700: true;
        h800: true;
        h900: true;
        h1000: true;

        // disable the MUI variants
        h1: false;
        h2: false;
        h3: false;
        h4: false;
        h5: false;
        h6: false;
        body1: false;
        body2: false;
        button: false;
        caption: false;
        inherit: false;
        overline: false;
        subtitle1: false;
        subtitle2: false;
    }
}

const typographyOverrides: TypographyOptions = {
    ...bodyOverrides,
    ...headingOverrides,
};

export default typographyOverrides;
