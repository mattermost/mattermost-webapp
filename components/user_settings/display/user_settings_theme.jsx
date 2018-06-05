// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import * as UserActions from 'actions/user_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import {ActionTypes, Constants, Preferences} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import CustomThemeChooser from './custom_theme_chooser.jsx';
import PremadeThemeChooser from './premade_theme_chooser';

export default class ThemeSetting extends React.Component {
    static propTypes = {
        selected: PropTypes.bool.isRequired,
        updateSection: PropTypes.func.isRequired,
        setRequireConfirm: PropTypes.func.isRequired,
        setEnforceFocus: PropTypes.func.isRequired,
        allowCustomThemes: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.getStateFromStores(),
            isSaving: false,
        };

        this.originalTheme = Object.assign({}, this.state.theme);
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onChange);

        if (this.props.selected) {
            $(ReactDOM.findDOMNode(this.refs[this.state.theme])).addClass('active-border');
        }
    }

    componentDidUpdate() {
        if (this.props.selected) {
            $('.color-btn').removeClass('active-border');
            $(ReactDOM.findDOMNode(this.refs[this.state.theme])).addClass('active-border');
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.selected && !nextProps.selected) {
            this.resetFields();
        }
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onChange);

        if (this.props.selected) {
            const state = this.getStateFromStores();
            Utils.applyTheme(state.theme);
        }
    }

    getStateFromStores() {
        const theme = PreferenceStore.getTheme();
        if (!theme.codeTheme) {
            theme.codeTheme = Constants.DEFAULT_CODE_THEME;
        }

        // show the "apply to all teams" checkbox if the user is on more than one team
        const showAllTeamsCheckbox = Object.keys(TeamStore.getAll()).length > 1;

        // check the "apply to all teams" checkbox by default if the user has any team-specific themes
        const applyToAllTeams = PreferenceStore.getCategory(Preferences.CATEGORY_THEME).size <= 1;

        return {
            teamId: TeamStore.getCurrentId(),
            theme,
            type: theme.type || 'premade',
            showAllTeamsCheckbox,
            applyToAllTeams,
        };
    }

    onChange = () => {
        const newState = this.getStateFromStores();

        if (!Utils.areObjectsEqual(this.state, newState)) {
            this.setState(newState);
        }

        this.props.setEnforceFocus(true);
    }

    scrollToTop() {
        $('.ps-container.modal-body').scrollTop(0);
    }

    submitTheme = () => {
        const teamId = this.state.applyToAllTeams ? '' : this.state.teamId;

        this.setState({isSaving: true});

        UserActions.saveTheme(
            teamId,
            this.state.theme,
            () => {
                this.props.setRequireConfirm(false);
                this.originalTheme = Object.assign({}, this.state.theme);
                this.scrollToTop();
                this.props.updateSection('');
                this.setState({isSaving: false});
            }
        );
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
        const state = this.getStateFromStores();
        state.serverError = null;
        this.setState(state);
        this.scrollToTop();

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
                    </div>
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
                    </div>
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
                    </div>
                );

                inputs.push(
                    <div
                        key='importSlackThemeButton'
                        className='padding-top'
                    >
                        <a
                            id='slackImportTheme'
                            className='theme'
                            onClick={this.handleImportModal}
                        >
                            <FormattedMessage
                                id='user.settings.display.theme.import'
                                defaultMessage='Import theme colors from Slack'
                            />
                        </a>
                    </div>
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
                />
            );
        }

        return themeUI;
    }
}
