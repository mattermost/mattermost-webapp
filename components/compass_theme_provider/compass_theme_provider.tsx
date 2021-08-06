// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';

import ThemeProvider, {lightTheme} from '@mattermost/compass-components/utilities/theme';

import {Theme} from 'mattermost-redux/types/themes';

type Props = {
    theme: Theme;
    children?: React.ReactNode | React.ReactNode[];
}

const CompassThemeProvider = ({theme, children}: Props): JSX.Element | null => {
    const [compassTheme, setCompassTheme] = useState({
        ...lightTheme,
        noStyleReset: true,
        noDefaultStyle: true,
    });

    useEffect(() => {
        setCompassTheme({
            ...compassTheme,
            palette: {
                ...compassTheme.palette,
                primary: {
                    ...compassTheme.palette.primary,
                    main: theme.buttonBg,
                    contrast: theme.sidebarText,
                },
                alert: {
                    ...compassTheme.palette.alert,
                    main: theme.dndIndicator,
                    contrast: theme.buttonColor,
                },
            },
            action: {
                ...compassTheme.action,
                hover: theme.centerChannelColor,
                disabled: theme.sidebarText,
            },
            text: {
                ...compassTheme.text,
                primary: theme.buttonColor,
                contrast: theme.sidebarText,
            },
        });
    }, [theme]);

    return (
        <ThemeProvider theme={compassTheme}>
            {children}
        </ThemeProvider>
    );
};

export default CompassThemeProvider;
