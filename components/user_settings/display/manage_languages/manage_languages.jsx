// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';

import * as I18n from 'i18n/i18n.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import {isKeyPressed} from 'utils/utils.jsx';
import Constants from 'utils/constants';

export default class ManageLanguage extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        updateSection: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            updateMe: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        const locales = I18n.getLanguages();
        const userLocale = props.locale;
        const selectedOption = {value: locales[userLocale].value, label: locales[userLocale].name};
        this.reactSelectContainer = React.createRef();

        this.state = {
            locale: props.locale,
            selectedOption,
            isSaving: false,
            openMenu: false,
        };
    }

    componentDidMount() {
        if (this.reactSelectContainer.current) {
            this.reactSelectContainer.current.addEventListener('keydown', this.handleContainerKeyDown);
        }
    }

    componentWillUnmount() {
        if (this.reactSelectContainer.current) {
            this.reactSelectContainer.current.removeEventListener('keydown', this.handleContainerKeyDown);
        }
    }

    handleContainerKeyDown = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ESCAPE) && this.state.openMenu) {
            document.querySelector('.modal-body').classList.remove('no-scroll');
            this.setState({openMenu: false});
            e.stopPropagation();
        }
    }

    handleKeyDown = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            document.querySelector('.modal-body').classList.add('no-scroll');
            this.setState({openMenu: true});
        }
    }

    setLanguage = (selectedOption) => {
        this.setState({
            locale: selectedOption.value,
            selectedOption,
        });
    }

    changeLanguage = () => {
        if (this.props.user.locale === this.state.locale) {
            this.props.updateSection('');
        } else {
            this.submitUser({
                ...this.props.user,
                locale: this.state.locale,
            });
        }
    }

    submitUser = (user) => {
        this.setState({isSaving: true});

        this.props.actions.updateMe(user).
            then(({data, error: err}) => {
                if (data) {
                    // Do nothing since changing the locale essentially refreshes the page
                } else if (err) {
                    let serverError;
                    if (err.message) {
                        serverError = err.message;
                    } else {
                        serverError = err;
                    }
                    this.setState({serverError, isSaving: false});
                }
            });
    }

    handleMenuClose = () => {
        document.querySelector('.modal-body').classList.remove('no-scroll');
        this.setState({openMenu: false});
    }

    handleMenuOpen = () => {
        document.querySelector('.modal-body').classList.add('no-scroll');
        this.setState({openMenu: true});
    }

    render() {
        let serverError;
        if (this.state.serverError) {
            serverError = <label className='has-error'>{this.state.serverError}</label>;
        }

        const options = [];
        const locales = I18n.getLanguages();

        const languages = Object.keys(locales).map((l) => {
            return {
                value: locales[l].value,
                name: locales[l].name,
                order: locales[l].order,
            };
        }).sort((a, b) => a.order - b.order);

        languages.forEach((lang) => {
            options.push(
                {value: lang.value, label: lang.name}
            );
        });

        const reactStyles = {
            menuPortal: (provided) => ({
                ...provided,
                zIndex: 9999,
            }),
        };

        const input = (
            <div key='changeLanguage'>
                <br/>
                <label
                    className='control-label'
                    id='changeInterfaceLanguageLabel'
                >
                    <FormattedMessage
                        id='user.settings.languages.change'
                        defaultMessage='Change interface language'
                    />
                </label>
                <div
                    ref={this.reactSelectContainer}
                    className='pt-2'
                >
                    <ReactSelect
                        className='react-select react-select-top'
                        classNamePrefix='react-select'
                        id='displayLanguage'
                        menuIsOpen={this.state.openMenu}
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                        options={options}
                        clearable={false}
                        onChange={this.setLanguage}
                        onKeyDown={this.handleKeyDown}
                        value={this.state.selectedOption}
                        onMenuClose={this.handleMenuClose}
                        onMenuOpen={this.handleMenuOpen}
                        aria-labelledby='changeInterfaceLanguageLabel'
                    />
                    {serverError}
                </div>
                <div>
                    <br/>
                    <FormattedMarkdownMessage
                        id='user.settings.languages.promote'
                        defaultMessage='Select which language Mattermost displays in the user interface.\n \nWould you like to help with translations? Join the [Mattermost Translation Server](!http://translate.mattermost.com/) to contribute.'
                    />
                </div>
            </div>
        );

        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.language'
                        defaultMessage='Language'
                    />
                }
                width='medium'
                submit={this.changeLanguage}
                saving={this.state.isSaving}
                inputs={[input]}
                updateSection={this.props.updateSection}
            />
        );
    }
}
