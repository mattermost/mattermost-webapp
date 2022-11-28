// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getFontMargin} from '../../../stories/font-utils';

const baseStyles = {
    fontFamily: 'Open Sans, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
};

export const b25 = {
    fontSize: '1rem',
    lineHeight: '1.6rem',
    marginTop: getFontMargin(10, 0.75),
    marginBottom: getFontMargin(10, 0.75),
    ...baseStyles,
};
export const b50 = {
    fontSize: '1.1rem',
    lineHeight: '1.6rem',
    marginTop: getFontMargin(11, 0.75),
    marginBottom: getFontMargin(11, 0.75),
    ...baseStyles,
};
export const b75 = {
    fontSize: '1.2rem',
    lineHeight: '1.6rem',
    marginTop: getFontMargin(12, 0.75),
    marginBottom: getFontMargin(12, 0.75),
    ...baseStyles,
};
export const b100 = {
    fontSize: '1.4rem',
    lineHeight: '2rem',
    marginTop: getFontMargin(14, 0.75),
    marginBottom: getFontMargin(14, 0.75),
    ...baseStyles,
};
export const b200 = {
    fontSize: '1.6rem',
    lineHeight: '2.4rem',
    marginTop: getFontMargin(16, 0.75),
    marginBottom: getFontMargin(16, 0.75),
    ...baseStyles,
};
export const b300 = {
    fontSize: '1.8rem',
    lineHeight: '2.8rem',
    marginTop: getFontMargin(18, 0.75),
    marginBottom: getFontMargin(18, 0.75),
    ...baseStyles,
};
