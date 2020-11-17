// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {ActionTypes, Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';

import CustomThemeChooser from './custom_theme_chooser.jsx';
import PremadeThemeChooser from './premade_theme_chooser';

export default class ThemeSetting extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            saveTheme: PropTypes.func.isRequired,
            deleteTeamSpecificThemes: PropTypes.func.isRequired,
        }).isRequired,
        currentTeamId: PropTypes.string.isRequired,
        theme: PropTypes.object,
        selected: PropTypes.bool.isRequired,
        updateSection: PropTypes.func.isRequired,
        setRequireConfirm: PropTypes.func.isRequired,
        setEnforceFocus: PropTypes.func.isRequired,
        allowCustomThemes: PropTypes.bool,
        focused: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.getStateFromProps(props),
            isSaving: false,
        };

        this.originalTheme = Object.assign({}, this.state.theme);
    }

    componentDidMount() {
        if (this.props.selected) {
            $(ReactDOM.findDOMNode(this.refs[this.state.theme])).addClass('active-border'); // eslint-disable-line jquery/no-class
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selected && !this.props.selected) {
            this.resetFields();
        }

        if (this.props.selected) {
            $('.color-btn').removeClass('active-border'); // eslint-disable-line jquery/no-class
            $(ReactDOM.findDOMNode(this.refs[this.state.theme])).addClass('active-border'); // eslint-disable-line jquery/no-class
        }
    }

    componentWillUnmount() {
        if (this.props.selected) {
            Utils.applyTheme(this.props.theme);
        }
    }

    getStateFromProps(props = this.props) {
        const theme = {...props.theme};
        if (!theme.codeTheme) {
            theme.codeTheme = Constants.DEFAULT_CODE_THEME;
        }

        return {
            theme,
            type: theme.type || 'premade',
            showAllTeamsCheckbox: props.showAllTeamsCheckbox,
            applyToAllTeams: props.applyToAllTeams,
        };
    }

    submitTheme = async () => {
        const teamId = this.state.applyToAllTeams ? '' : this.props.currentTeamId;

        this.setState({isSaving: true});

        await this.props.actions.saveTheme(teamId, this.state.theme);

        if (this.state.applyToAllTeams) {
            await this.props.actions.deleteTeamSpecificThemes();
        }

        this.props.setRequireConfirm(false);
        this.originalTheme = Object.assign({}, this.state.theme);
        this.props.updateSection('');
        this.setState({isSaving: false});
    };

    updateTheme = (theme) => {
        let themeChanged = this.state.theme.length === theme.length;
        if (!themeChanged) {
            for (const field in theme) {
                if (theme.hasOwnProperty(field)) {
                    if (this.state.theme[field] !== theme[field]) {
                        themeChanged = true;
                        break;
                    }
                }
            }
        }

        this.props.setRequireConfirm(themeChanged);

        this.setState({theme});
        Utils.applyTheme(theme);
    };

    updateType(type) {
        this.setState({type});
    }

    resetFields = () => {
        const state = this.getStateFromProps();
        state.serverError = null;
        this.setState(state);

        Utils.applyTheme(state.theme);

        this.props.setRequireConfirm(false);
    };

    handleImportModal = () => {
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_IMPORT_THEME_MODAL,
            value: true,
            callback: this.updateTheme,
        });

        this.props.setEnforceFocus(false);
    };

    handleUpdateSection = (section) => {
        this.props.updateSection(section);
    };

    render() {
        let serverError;
        if (this.state.serverError) {
            serverError = this.state.serverError;
        }

        const displayCustom = this.state.type === 'custom';

        let custom;
        let premade;
        if (displayCustom && this.props.allowCustomThemes) {
            custom = (
                <div key='customThemeChooser'>
                    <CustomThemeChooser
                        theme={this.state.theme}
                        updateTheme={this.updateTheme}
                    />
                </div>
            );
        } else {
            premade = (
                <div key='premadeThemeChooser'>
                    <br/>
                    <PremadeThemeChooser
                        theme={this.state.theme}
                        updateTheme={this.updateTheme}
                    />
                </div>
            );
        }

        let themeUI;
        if (this.props.selected) {
            const inputs = [];

            if (this.props.allowCustomThemes) {
                inputs.push(
                    <div
                        className='radio'
                        key='premadeThemeColorLabel'
                    >
                        <label>
                            <input
                                id='standardThemes'
                                type='radio'
                                name='theme'
                                checked={!displayCustom}
                                onChange={this.updateType.bind(this, 'premade')}
                            />
                            <FormattedMessage
                                id='user.settings.display.theme.themeColors'
                                defaultMessage='Theme Colors'
                            />
                        </label>
                        <br/>
                    </div>,
                );
            }

            inputs.push(premade);

            if (this.props.allowCustomThemes) {
                inputs.push(
                    <div
                        className='radio'
                        key='customThemeColorLabel'
                    >
                        <label>
                            <input
                                id='customThemes'
                                type='radio'
                                name='theme'
                                checked={displayCustom}
                                onChange={this.updateType.bind(this, 'custom')}
                            />
                            <FormattedMessage
                                id='user.settings.display.theme.customTheme'
                                defaultMessage='Custom Theme'
                            />
                        </label>
                    </div>,
                );

                inputs.push(custom);

                inputs.push(
                    <div key='otherThemes'>
                        <br/>
                        <a
                            id='otherThemes'
                            href='http://docs.mattermost.com/help/settings/theme-colors.html#custom-theme-examples'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <FormattedMessage
                                id='user.settings.display.theme.otherThemes'
                                defaultMessage='See other themes'
                            />
                        </a>
                    </div>,
                );

                inputs.push(
                    <div
                        key='importSlackThemeButton'
                        className='pt-2'
                    >
                        <button
                            id='slackImportTheme'
                            className='theme style--none color--link'
                            onClick={this.handleImportModal}
                        >
                            <FormattedMessage
                                id='user.settings.display.theme.import'
                                defaultMessage='Import theme colors from Slack'
                            />
                        </button>
                    </div>,
                );
            }

            let allTeamsCheckbox = null;
            if (this.state.showAllTeamsCheckbox) {
                allTeamsCheckbox = (
                    <div className='checkbox user-settings__submit-checkbox'>
                        <label>
                            <input
                                id='applyThemeToAllTeams'
                                type='checkbox'
                                checked={this.state.applyToAllTeams}
                                onChange={(e) => this.setState({applyToAllTeams: e.target.checked})}
                            />
                            <FormattedMessage
                                id='user.settings.display.theme.applyToAllTeams'
                                defaultMessage='Apply new theme to all my teams'
                            />
                        </label>
                    </div>
                );
            }

            themeUI = (
                <SettingItemMax
                    inputs={inputs}
                    submitExtra={allTeamsCheckbox}
                    submit={this.submitTheme}
                    disableEnterSubmit={true}
                    saving={this.state.isSaving}
                    server_error={serverError}
                    width='full'
                    updateSection={this.handleUpdateSection}
                />
            );
        } else {
            themeUI = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.display.theme.title'
                            defaultMessage='Theme'
                        />
                    }
                    describe={
                        <FormattedMessage
                            id='user.settings.display.theme.describe'
                            defaultMessage='Open to manage your theme'
                        />
                    }
                    section={'theme'}
                    updateSection={this.handleUpdateSection}
                    focused={this.props.focused}
                />
            );
        }

        return themeUI;
    }
}
/* eslint-enable react/no-string-refs */
