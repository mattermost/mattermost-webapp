// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import * as GlobalActions from 'actions/global_actions.jsx';
import {updateUser} from 'actions/user_actions.jsx';
import * as I18n from 'i18n/i18n.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';

export default class ManageLanguage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            locale: props.locale,
            isSaving: false
        };
    }

    setLanguage = (e) => {
        this.setState({locale: e.target.value});
    }

    changeLanguage = () => {
        if (this.props.user.locale === this.state.locale) {
            this.props.updateSection('');
        } else {
            this.submitUser({
                ...this.props.user,
                locale: this.state.locale
            });
        }
    }

    submitUser = (user) => {
        this.setState({isSaving: true});

        updateUser(
            user,
            () => {
                GlobalActions.newLocalizationSelected(user.locale);
            },
            (err) => {
                let serverError;
                if (err.message) {
                    serverError = err.message;
                } else {
                    serverError = err;
                }
                this.setState({serverError, isSaving: false});
            }
        );
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
                order: locales[l].order
            };
        }).sort((a, b) => a.order - b.order);

        languages.forEach((lang) => {
            options.push(
                <option
                    key={lang.value}
                    value={lang.value}
                >
                    {lang.name}
                </option>
            );
        });

        const input = (
            <div key='changeLanguage'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='user.settings.languages.change'
                        defaultMessage='Change interface language'
                    />
                </label>
                <div className='padding-top'>
                    <select
                        id='displayLanguage'
                        ref='language'
                        className='form-control'
                        value={this.state.locale}
                        onChange={this.setLanguage}
                    >
                        {options}
                    </select>
                    {serverError}
                </div>
                <div>
                    <br/>
                    <FormattedHTMLMessage
                        id='user.settings.languages.promote'
                        defaultMessage='Select which language Mattermost displays in the user interface.<br /><br />Would like to help with translations? Join the <a href="http://translate.mattermost.com/" target="_blank">Mattermost Translation Server</a> to contribute.'
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

ManageLanguage.propTypes = {
    user: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    updateSection: PropTypes.func.isRequired
};
