// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsProps} from '@mui/material';

const componentName = 'MuiButtonBase';

export const buttonBaseDefaultProps: ComponentsProps[typeof componentName] = {
    disableRipple: true,
};

export default {
    defaultProps: buttonBaseDefaultProps,
};
