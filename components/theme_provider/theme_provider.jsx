// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants';

export default class ThemeProvider extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        theme: PropTypes.object.isRequired,
    };

    render() {
        let style = ':root {\n';
        for (const {id} of Constants.THEME_ELEMENTS) {
            style += `\t--mm-${id}: ${this.props.theme[id]};\n`;
        }
        style += '}';

        return (
            <React.Fragment>
                <style>{style}</style>
                {this.props.children}
            </React.Fragment>
        );
    }
}
