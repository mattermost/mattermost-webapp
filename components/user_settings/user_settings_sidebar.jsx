// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {savePreferences} from 'actions/user_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import UserStore from 'stores/user_store.jsx';

import Constants from 'utils/constants.jsx';

import SettingItemMax from '../setting_item_max.jsx';
import SettingItemMin from '../setting_item_min.jsx';

export default class SidebarSettingsDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.getStateFromStores = this.getStateFromStores.bind(this);
        this.updateSection = this.updateSection.bind(this);
        this.updateSetting = this.updateSetting.bind(this);

        this.renderAutoCloseDMSection = this.renderAutoCloseDMSection.bind(this);

        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        const settings = {
            close_unused_direct_messages: PreferenceStore.get(
                Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                'close_unused_direct_messages',
                'after_seven_days'
            )
        };

        return {
            settings,
            isSaving: false
        };
    }

    updateSetting(setting, value) {
        const settings = this.state.settings;
        settings[setting] = value;
        this.setState(settings);
    }

    handleSubmit(setting) {
        const preferences = [];
        const userId = UserStore.getCurrentId();

        preferences.push({
            user_id: userId,
            category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: setting,
            value: this.state.settings[setting]
        });

        this.setState({isSaving: true});

        savePreferences(
            preferences,
            () => {
                this.updateSection('');
            }
        );
    }

    updateSection(section) {
        if (!section) {
            this.setState(this.getStateFromStores());
        }
        this.setState({isSaving: false});
        this.props.updateSection(section);
    }

    renderAutoCloseDMLabel(value) {
        if (value === 'after_seven_days') {
            return (
                <FormattedMessage
                    id='user.settings.sidebar.after_seven_days'
                    defaultMessage='After 7 days with no new messages'
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.sidebar.never'
                defaultMessage='Never'
            />
        );
    }

    renderAutoCloseDMSection() {
        if (this.props.activeSection === 'autoCloseDM') {
            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.autoCloseDMTitle'
                            defaultMessage='Automatically Close Direct Messages'
                        />
                    }
                    inputs={[
                        <div key='autoCloseDMSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='autoCloseDMAfterSevenDays'
                                        type='radio'
                                        name='autoCloseDM'
                                        checked={this.state.settings.close_unused_direct_messages === 'after_seven_days'}
                                        onChange={this.updateSetting.bind(this, 'close_unused_direct_messages', 'after_seven_days')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.after_seven_days'
                                        defaultMessage='After 7 days with no new messages'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='autoCloseDMNever'
                                        type='radio'
                                        name='autoCloseDM'
                                        checked={this.state.settings.close_unused_direct_messages === 'never'}
                                        onChange={this.updateSetting.bind(this, 'close_unused_direct_messages', 'never')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.never'
                                        defaultMessage='Never'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div>
                                <br/>
                                <FormattedMessage
                                    id='user.settings.sidebar.autoCloseDMDesc'
                                    defaultMessage='Direct Message conversations can be reopened with the “+” button in the sidebar or using the Channel Switcher (CTRL+K).'
                                />
                            </div>
                        </div>
                    ]}
                    submit={() => this.handleSubmit('close_unused_direct_messages')}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={(e) => {
                        this.updateSection('');
                        e.preventDefault();
                    }}
                />
            );
        }

        return (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.sidebar.autoCloseDMTitle'
                        defaultMessage='Automatically Close Direct Messages'
                    />
                }
                describe={this.renderAutoCloseDMLabel(this.state.settings.close_unused_direct_messages)}
                updateSection={() => this.props.updateSection('autoCloseDM')}
            />
        );
    }

    render() {
        const autoCloseDMSection = this.renderAutoCloseDMSection();

        return (
            <div>
                <div className='modal-header'>
                    <button
                        id='closeButton'
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <i
                                className='fa fa-angle-left'
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {autoCloseDMSection}
                    <div className='divider-dark'/>
                </div>
            </div>
        );
    }
}

SidebarSettingsDisplay.propTypes = {
    user: PropTypes.object,
    updateSection: PropTypes.func,
    updateTab: PropTypes.func,
    activeSection: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    collapseModal: PropTypes.func.isRequired
};
