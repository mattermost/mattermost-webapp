// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

export default class PremadeThemeChooser extends React.Component {
    componentDidMount() {
        this.props.actions.getAllThemes();
    }

    render() {
        const theme = this.props.theme;

        const premadeThemes = [];
        const allowedThemes = this.props.allowedThemes;
        const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);
        const allThemes = this.props.themes;

        for (const k in allThemes) {
            if (allThemes.hasOwnProperty(k)) {
                if (hasAllowedThemes && allowedThemes.indexOf(k) < 0) {
                    continue;
                }

                const premadeTheme = $.extend(true, {}, allThemes[k]);

                let activeClass = '';
                if (premadeTheme.id === theme.id) {
                    activeClass = 'active';
                }

                premadeThemes.push(
                    <div
                        className='col-xs-6 col-sm-3 premade-themes'
                        key={'premade-theme-key' + k}
                    >
                        <div
                            id={`premadeTheme${premadeTheme.id.replace(' ', '')}`}
                            className={activeClass}
                            onClick={() => this.props.updateTheme(premadeTheme, k)}
                        >
                            <label>
                                <img
                                    alt={'premade theme ' + k}
                                    className='img-responsive'
                                    src={premadeTheme.image}
                                />
                                <div className='theme-label'>{Utils.toTitleCase(premadeTheme.display_name)}</div>
                            </label>
                        </div>
                    </div>
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
