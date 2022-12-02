// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ThemeOptions} from '@mui/material/styles/createTheme';

import MuiButton from './button';
import MuiButtonBase from './button-base';
import MuiIconButton from './icon-button';
import MuiFormControl from './form-control';
import MuiInputBase from './input-base';
import MuiInputLabel from './input-label';
import MuiOutlinedInput from './outlined-input';

const componentOverrides: ThemeOptions['components'] = {
    MuiButton,
    MuiButtonBase,
    MuiIconButton,
    MuiFormControl,
    MuiInputBase,
    MuiInputLabel,
    MuiOutlinedInput,
};

export default componentOverrides;
