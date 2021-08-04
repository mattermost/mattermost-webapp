// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {Preferences} from 'mattermost-redux/constants';
import * as Utils from 'utils/utils.jsx';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import ThemeThumbnail from '../theme_thumbnail';

export default class PremadeThemeChooser extends React.PureComponent {
    render() {
        const theme = this.props.theme;

        const premadeThemes = [];
        const allowedThemes = this.props.allowedThemes;
        const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);

        for (const k in Preferences.THEMES) {
            if (Preferences.THEMES.hasOwnProperty(k)) {
                if (hasAllowedThemes && allowedThemes.indexOf(k) < 0) {
                    continue;
                }

                const premadeTheme = Object.assign({}, Preferences.THEMES[k]);

                let activeClass = '';
                if (premadeTheme.type === theme.type) {
                    activeClass = 'active';
                }

                premadeThemes.push(
                    <div
                        className='col-xs-6 col-sm-3 premade-themes'
                        key={'premade-theme-key' + k}
                    >
                        <div
                            id={`premadeTheme${premadeTheme.type.replace(' ', '')}`}
                            className={activeClass}
                            onClick={() => this.props.updateTheme(premadeTheme)}
                        >
                            <label>
                                <ThemeThumbnail
                                    themeKey={k}
                                    themeName={premadeTheme.type}
                                    sidebarBg={premadeTheme.sidebarBg}
                                    sidebarText={changeOpacity(premadeTheme.sidebarText, 0.48)}
                                    sidebarUnreadText={premadeTheme.sidebarUnreadText}
                                    onlineIndicator={premadeTheme.onlineIndicator}
                                    awayIndicator={premadeTheme.awayIndicator}
                                    dndIndicator={premadeTheme.dndIndicator}
                                    centerChannelColor={changeOpacity(premadeTheme.centerChannelColor, 0.16)}
                                    centerChannelBg={premadeTheme.centerChannelBg}
                                    newMessageSeparator={premadeTheme.newMessageSeparator}
                                    buttonBg={premadeTheme.buttonBg}
                                />
                                <div className='theme-label'>{Utils.toTitleCase(premadeTheme.type)}</div>
                            </label>
                        </div>
                    </div>,
                );
            }
        }

        return (
            <div className='row appearance-section'>
                <div className='clearfix'>
                    {premadeThemes}
                </div>
            </div>
        );
    }
}

PremadeThemeChooser.propTypes = {
    theme: PropTypes.object.isRequired,
    updateTheme: PropTypes.func.isRequired,
    allowedThemes: PropTypes.arrayOf(PropTypes.string),
};

PremadeThemeChooser.defaultProps = {
    allowedThemes: [],
};
