// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ReactNode, useMemo} from 'react';
import {createTheme, ThemeProvider, Theme as MuiTheme} from '@mui/material/styles';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

interface Props {
    theme?: Theme;
    children?: ReactNode;
}

const CompassDesignProvider: FC<Props> = (props: Props) => {
    const theme = useMemo<MuiTheme>(() => createTheme({
        palette: {
            primary: {
                main: '#166de0',
            },
        },
    }), [props?.theme]);

    return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default memo(CompassDesignProvider);
