// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Typography as MuiTypography, TypographyProps as MuiTypographyProps} from '@mui/material';

type Props = Omit<MuiTypographyProps, 'sx' | 'variantMapping' | 'paragraph'> & {
    gutterTop?: boolean;
}

const Typography = (props: Props) => {
    return <MuiTypography {...props}/>;
};

export default Typography;
