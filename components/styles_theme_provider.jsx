// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {ThemeProvider} from 'styled-components';

const StylesThemeProvider = ({children}) => (
    <ThemeProvider theme={{color: 'yellow'}}>
        {children}
    </ThemeProvider>
);
StylesThemeProvider.propTypes = {
    children: PropTypes.any
};

export default StylesThemeProvider;
