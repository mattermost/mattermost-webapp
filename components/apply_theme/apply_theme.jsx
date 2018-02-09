// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {ThemeProvider} from 'styled-components';

const ApplyTheme = ({children, theme}) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);
ApplyTheme.propTypes = {
    children: PropTypes.any,
    theme: PropTypes.object,
};

export default ApplyTheme;
