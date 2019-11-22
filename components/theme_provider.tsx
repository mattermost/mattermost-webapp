// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    children: React.ReactNode;
    theme: object;
}

export default class ThemeProvider extends React.PureComponent<Props> {
    keyToCssVariable = (key) => {
        return '--' + key.replace(/([a-z])([A-Z])/g, (fullMatch, a, b) => `${a}-${b.toLowerCase()}`);
    }

    getStyle = () => {
        const style = {};

        for (const [key, value] of Object.entries(this.props.theme)) {
            if (key === 'type' || key === 'codeTheme' || key === 'image') {
                continue;
            }

            style[this.keyToCssVariable(key)] = value;
        }

        return style;
    }

    render() {
        return (
            <div style={this.getStyle()}>
                {this.props.children}
            </div>
        );
    }
}
