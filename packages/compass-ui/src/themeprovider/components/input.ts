// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentsProps} from '@mui/material';

const componentName = 'MuiInput';

export const inputDefaultProps: ComponentsProps[typeof componentName] = {
    disableUnderline: true,
};

export default {
    defaultProps: inputDefaultProps,
};
