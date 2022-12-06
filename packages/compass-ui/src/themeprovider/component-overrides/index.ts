// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ThemeOptions} from '@mui/material/styles/createTheme';

import MuiButton from '../../components/button/overrides/button';

import MuiInputLabel from '../../components/textfield/overrides/input-label';
import MuiOutlinedInput from '../../components/textfield/overrides/outlined-input';

import MuiIconButton from './icon-button';

const componentOverrides: ThemeOptions['components'] = {
    MuiButton,
    MuiIconButton,
    MuiInputLabel,
    MuiOutlinedInput,
};

export default componentOverrides;
