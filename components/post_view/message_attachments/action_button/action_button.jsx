// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import Markdown from 'components/markdown';

export default class ActionButton extends React.PureComponent {
    static propTypes = {
        action: PropTypes.object.isRequired,
        handleAction: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        theme: PropTypes.object.isRequired,
    }

    getStatusColors(theme) {
        return {
            good: '#00c100',
            warning: '#dede01',
            danger: theme.errorTextColor,
            default: theme.centerChannelColor,
            primary: theme.buttonBg,
            success: theme.onlineIndicator,
        };
    }

    render() {
        const {action, handleAction, disabled, theme} = this.props;
        let customButtonStyle;

        if (action.style) {
            const STATUS_COLORS = this.getStatusColors(theme);
            const hexColor =
                STATUS_COLORS[action.style] ||
                theme[action.style] ||
                (action.style.match('^#(?:[0-9a-fA-F]{3}){1,2}$') && action.style);

            if (hexColor) {
                customButtonStyle = {
                    borderColor: changeOpacity(hexColor, 0.25),
                    backgroundColor: '#ffffff',
                    color: hexColor,
                    borderWidth: 2
                };
            }
        }

        return (
            <button
                data-action-id={action.id}
                data-action-cookie={action.cookie}
                disabled={disabled}
                key={action.id}
                onClick={handleAction}
                style={customButtonStyle}
            >
                <Markdown
                    message={action.name}
                    options={{
                        mentionHighlight: false,
                        markdown: false,
                        autolinkedUrlSchemes: [],
                    }}
                />
            </button>
        );
    }
}
