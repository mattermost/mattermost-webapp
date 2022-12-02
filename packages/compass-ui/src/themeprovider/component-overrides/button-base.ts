// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentsProps} from '@mui/material';

const componentName = 'MuiButtonBase';

const buttonBaseDefaultProps: ComponentsProps[typeof componentName] = {
    disableRipple: true,
    disableTouchRipple: true,
};

const overrides = {
    defaultProps: buttonBaseDefaultProps,
};

export default overrides;
