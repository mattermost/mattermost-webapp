// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import LoadingScreen from 'components/loading_screen';

import './styles.scss';

export default class PremadeThemeChooser extends React.PureComponent {
    static propTypes = {
        allowedThemes: PropTypes.arrayOf(PropTypes.string),
        systemThemes: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        updateTheme: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            getAllThemes: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        allowedThemes: [],
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        this.props.actions.getAllThemes().then(() => this.setState({loading: false}));
    }

    renderPreview = (theme) => {
        return (
            <div
                className='theme-preview'
                style={{backgroundColor: theme.centerChannelBg}}
            >
                <div
                    className='theme-preview__sidebar'
                    style={{backgroundColor: theme.sidebarBg, borderColor: changeOpacity(theme.centerChannelColor, 0.2)}}
                >
                    <div
                        className='theme-preview__sidebar-header'
                        style={{backgroundColor: theme.sidebarHeaderBg}}
                    />
                </div>
                <div
                    className='theme-preview__channel-header'
                    style={{borderColor: changeOpacity(theme.centerChannelColor, 0.2)}}
                />
            </div>
        );
    }

    render() {
        const {
            allowedThemes,
            systemThemes,
            theme,
        } = this.props;

        const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);

        let content;
        if (this.state.loading) {
            content = <LoadingScreen/>;
        } else {
            content = [];

            const sortedThemes = Object.values(systemThemes).sort(sortSystemThemes);

            for (const systemTheme of sortedThemes) {
                if (hasAllowedThemes && allowedThemes.indexOf(systemTheme.id) !== -1) {
                    continue;
                }

                let className = 'col-xs-6 col-sm-3 premade-themes';
                if (systemTheme.id === theme.id) {
                    className += ' active';
                }

                content.push(
                    <div
                        key={systemTheme.id}
                        id={`premadeTheme-${systemTheme.id}`}
                        className={className}
                        onClick={() => this.props.updateTheme(systemTheme, systemTheme.id)}
                    >
                        <label>
                            {this.renderPreview(systemTheme)}
                            <div className='theme-label'>{systemTheme.display_name}</div>
                        </label>
                    </div>
                );
            }
        }

        return (
            <div className='row appearance-section'>
                <div className='clearfix'>
                    {content}
                </div>
            </div>
        );
    }
}

function sortSystemThemes(themeA, themeB) {
    if (themeA.display_name !== themeB.display_name) {
        return themeA.display_name.localeCompare(themeB.display_name);
    }

    if (themeA.id < themeB.id) {
        return -1;
    } else if (themeA.id > themeB.id) {
        return 1;
    }

    return 0;
}
