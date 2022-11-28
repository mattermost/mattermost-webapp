// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getFontMargin} from '../../../stories/font-utils';

const baseStyles = {
    fontFamily: 'Metropolis, sans-serif',
    fontStyle: 'normal',
    fontWeight: 600,

    '&:first-child': {
        marginTop: 0,
    },
};

// const getFontSizeAndMargins = (fontSize: number) => ({
//     fontSize: `${fontSize}rem`,
//     marginTop: `${getFontMargin(fontSize, 8 / 9)}rem`,
//     marginBottom: `${getFontMargin(fontSize, 0.5)}rem,
// });

export const h25 = {
    fontSize: '1rem',
    lineHeight: '1.6rem',
    marginTop: getFontMargin(10, 8 / 9),
    marginBottom: getFontMargin(10, 0.5),
    ...baseStyles,
    fontFamily: 'Open Sans, sans-serif',
};
export const h50 = {
    fontSize: '1.1rem',
    lineHeight: '1.6rem',
    marginTop: getFontMargin(11, 8 / 9),
    marginBottom: getFontMargin(11, 0.5),
    ...baseStyles,
    fontFamily: 'Open Sans, sans-serif',
};
export const h75 = {
    fontSize: '1.2rem',
    lineHeight: '1.6rem',
    marginTop: getFontMargin(12, 8 / 9),
    marginBottom: getFontMargin(12, 0.5),
    ...baseStyles,
    fontFamily: 'Open Sans, sans-serif',
};
export const h100 = {
    fontSize: '1.4rem',
    lineHeight: '2rem',
    marginTop: getFontMargin(14, 8 / 9),
    marginBottom: getFontMargin(14, 0.5),
    ...baseStyles,
    fontFamily: 'Open Sans, sans-serif',
};
export const h200 = {
    fontSize: '1.6rem',
    lineHeight: '2.4rem',
    marginTop: getFontMargin(16, 8 / 9),
    marginBottom: getFontMargin(16, 0.5),
    ...baseStyles,
};
export const h300 = {
    fontSize: '1.8rem',
    lineHeight: '2.4rem',
    marginTop: getFontMargin(18, 8 / 9),
    marginBottom: getFontMargin(18, 0.5),
    ...baseStyles,
};
export const h400 = {
    fontSize: '2rem',
    lineHeight: '2.8rem',
    marginTop: getFontMargin(18, 8 / 9),
    marginBottom: getFontMargin(18, 0.5),
    ...baseStyles,
};
export const h500 = {
    fontSize: '2.2rem',
    lineHeight: '2.8rem',
    marginTop: getFontMargin(22, 8 / 9),
    marginBottom: getFontMargin(22, 0.5),
    ...baseStyles,
};
export const h600 = {
    fontSize: '2.5rem',
    lineHeight: '3rem',
    marginTop: getFontMargin(25, 8 / 9),
    marginBottom: getFontMargin(25, 0.5),
    ...baseStyles,
};
export const h700 = {
    fontSize: '2.8rem',
    lineHeight: '3.6rem',
    marginTop: getFontMargin(28, 8 / 9),
    marginBottom: getFontMargin(28, 0.5),
    ...baseStyles,
};
export const h800 = {
    fontSize: '3.2rem',
    lineHeight: '4rem',
    marginTop: getFontMargin(32, 8 / 9),
    marginBottom: getFontMargin(32, 0.5),
    ...baseStyles,
};
export const h900 = {
    fontSize: '3.6rem',
    lineHeight: '4.4rem',
    marginTop: getFontMargin(36, 8 / 9),
    marginBottom: getFontMargin(36, 0.5),
    ...baseStyles,
};
export const h1000 = {
    fontSize: '4rem',
    lineHeight: '4.8rem',
    marginTop: getFontMargin(40, 8 / 9),
    marginBottom: getFontMargin(40, 0.5),
    ...baseStyles,
};
