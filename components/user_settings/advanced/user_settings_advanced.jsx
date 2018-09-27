// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {savePreferences, updateActive, revokeAllSessions} from 'actions/user_actions.jsx';
import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

import JoinLeaveSection from './join_leave_section';
import CodeBlockCtrlEnterSection from './code_block_ctrl_enter_section';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

export default class AdvancedSettingsDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromStores();

        this.prevSections = {
            advancedCtrlSend: 'dummySectionName', // dummy value that should never match any section name
            formatting: 'advancedCtrlSend',
            join_leave: 'formatting',
            advancedPreviewFeatures: 'join_leave',
            deactivateAccount: 'advancedPreviewFeatures',
        };
    }

    getStateFromStores = () => {
        const advancedSettings = PreferenceStore.getCategory(Constants.Preferences.CATEGORY_ADVANCED_SETTINGS);
        const settings = {
            send_on_ctrl_enter: PreferenceStore.get(
                Constants.Preferences.CATEGORY_ADVANCED_SETTINGS,
                'send_on_ctrl_enter',
                'false'
            ),
            formatting: PreferenceStore.get(
                Constants.Preferences.CATEGORY_ADVANCED_SETTINGS,
                'formatting',
                'true'
            ),
            join_leave: PreferenceStore.get(
                Constants.Preferences.CATEGORY_ADVANCED_SETTINGS,
                'join_leave',
                'true'
            ),
        };

        const preReleaseFeaturesKeys = Object.keys(PreReleaseFeatures);
        let enabledFeatures = 0;
        for (const [name, value] of advancedSettings) {
            for (const key of preReleaseFeaturesKeys) {
                const feature = PreReleaseFeatures[key];

                if (name === Constants.FeatureTogglePrefix + feature.label) {
                    settings[name] = value;

                    if (value === 'true') {
                        enabledFeatures += 1;
                    }
                }
            }
        }

        const isSaving = false;

        const previewFeaturesEnabled = this.props.enablePreviewFeatures;
        const showDeactivateAccountModal = false;

        return {
            preReleaseFeatures: PreReleaseFeatures,
            settings,
            preReleaseFeaturesKeys,
            enabledFeatures,
            isSaving,
            previewFeaturesEnabled,
            showDeactivateAccountModal,
        };
    }

    updateSetting = (setting, value) => {
        const settings = this.state.settings;
        settings[setting] = value;
        this.setState(settings);
    }

    toggleFeature = (feature, checked) => {
        const settings = this.state.settings;
        settings[Constants.FeatureTogglePrefix + feature] = String(checked);

        let enabledFeatures = 0;
        Object.keys(this.state.settings).forEach((setting) => {
            if (setting.lastIndexOf(Constants.FeatureTogglePrefix) === 0 && this.state.settings[setting] === 'true') {
                enabledFeatures++;
            }
        });

        this.setState({settings, enabledFeatures});
    }

    saveEnabledFeatures = () => {
        const features = [];
        Object.keys(this.state.settings).forEach((setting) => {
            if (setting.lastIndexOf(Constants.FeatureTogglePrefix) === 0) {
                features.push(setting);
            }
        });

        this.handleSubmit(features);
    }

    handleSubmit = (settings) => {
        const preferences = [];
        const userId = UserStore.getCurrentId();

        // this should be refactored so we can actually be certain about what type everything is
        (Array.isArray(settings) ? settings : [settings]).forEach((setting) => {
            preferences.push({
                user_id: userId,
                category: Constants.Preferences.CATEGORY_ADVANCED_SETTINGS,
                name: setting,
                value: this.state.settings[setting],
            });
        });

        this.setState({isSaving: true});

        savePreferences(
            preferences,
            () => {
                this.handleUpdateSection('');
            }
        );
    }

    handleDeactivateAccountSubmit = () => {
        const userId = UserStore.getCurrentId();

        this.setState({isSaving: true});

        updateActive(userId, false,
            null,
            (err) => {
                this.setState({serverError: err.message});
            }
        );

        revokeAllSessions(userId,
            () => {
                emitUserLoggedOutEvent();
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleShowDeactivateAccountModal = () => {
        this.setState({
            showDeactivateAccountModal: true,
        });
    }

    handleHideDeactivateAccountModal = () => {
        this.setState({
            showDeactivateAccountModal: false,
        });
    }

    handleUpdateSection = (section) => {
        if (!section) {
            this.setState(this.getStateFromStores());
        }
        this.setState({isSaving: false});
        this.props.updateSection(section);
    }

    renderOnOffLabel(enabled) {
        if (enabled === 'false') {
            return (
                <FormattedMessage
                    id='user.settings.advance.off'
                    defaultMessage='Off'
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.advance.on'
                defaultMessage='On'
            />
        );
    }

    renderFormattingSection = () => {
        if (this.props.activeSection === 'formatting') {
            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.advance.formattingTitle'
                            defaultMessage='Enable Post Formatting'
                        />
                    }
                    inputs={[
                        <div key='formattingSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='postFormattingOn'
                                        type='radio'
                                        name='formatting'
                                        checked={this.state.settings.formatting !== 'false'}
                                        onChange={this.updateSetting.bind(this, 'formatting', 'true')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.advance.on'
                                        defaultMessage='On'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='postFormattingOff'
                                        type='radio'
                                        name='formatting'
                                        checked={this.state.settings.formatting === 'false'}
                                        onChange={this.updateSetting.bind(this, 'formatting', 'false')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.advance.off'
                                        defaultMessage='Off'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div>
                                <br/>
                                <FormattedMessage
                                    id='user.settings.advance.formattingDesc'
                                    defaultMessage='If enabled, posts will be formatted to create links, show emoji, style the text, and add line breaks. By default, this setting is enabled. Changing this setting requires the page to be refreshed.'
                                />
                            </div>
                        </div>,
                    ]}
                    setting={'formatting'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        return (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.advance.formattingTitle'
                        defaultMessage='Enable Post Formatting'
                    />
                }
                describe={this.renderOnOffLabel(this.state.settings.formatting)}
                focused={this.props.prevActiveSection === this.prevSections.formatting}
                section={'formatting'}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    renderFeatureLabel(feature) {
        switch (feature) {
        case 'MARKDOWN_PREVIEW':
            return (
                <FormattedMessage
                    id='user.settings.advance.markdown_preview'
                    defaultMessage='Show markdown preview option in message input box'
                />
            );
        default:
            return null;
        }
    }

    render() {
        const serverError = this.state.serverError || null;
        let ctrlSendSection;

        if (this.props.activeSection === 'advancedCtrlSend') {
            const ctrlSendActive = [
                this.state.settings.send_on_ctrl_enter === 'true',
                this.state.settings.send_on_ctrl_enter === 'false',
            ];

            const inputs = [
                <div key='ctrlSendSetting'>
                    <div className='radio'>
                        <label>
                            <input
                                id='ctrlSendOn'
                                type='radio'
                                name='sendOnCtrlEnter'
                                checked={ctrlSendActive[0]}
                                onChange={this.updateSetting.bind(this, 'send_on_ctrl_enter', 'true')}
                            />
                            <FormattedMessage
                                id='user.settings.advance.on'
                                defaultMessage='On'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='ctrlSendOff'
                                type='radio'
                                name='sendOnCtrlEnter'
                                checked={ctrlSendActive[1]}
                                onChange={this.updateSetting.bind(this, 'send_on_ctrl_enter', 'false')}
                            />
                            <FormattedMessage
                                id='user.settings.advance.off'
                                defaultMessage='Off'
                            />
                        </label>
                        <br/>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.advance.sendDesc'
                            defaultMessage='If enabled ENTER inserts a new line and CTRL+ENTER submits the message.'
                        />
                    </div>
                </div>,
            ];
            ctrlSendSection = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.advance.sendTitle'
                            defaultMessage='Send messages on CTRL+ENTER'
                        />
                    }
                    inputs={inputs}
                    setting={'send_on_ctrl_enter'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        } else {
            ctrlSendSection = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.advance.sendTitle'
                            defaultMessage='Send messages on CTRL+ENTER'
                        />
                    }
                    describe={this.renderOnOffLabel(this.state.settings.send_on_ctrl_enter)}
                    focused={this.props.prevActiveSection === this.prevSections.advancedCtrlSend}
                    section={'advancedCtrlSend'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        const formattingSection = this.renderFormattingSection();
        let formattingSectionDivider = null;
        if (formattingSection) {
            formattingSectionDivider = <div className='divider-light'/>;
        }

        let previewFeaturesSection;
        let previewFeaturesSectionDivider;
        if (this.state.previewFeaturesEnabled && this.state.preReleaseFeaturesKeys.length > 0) {
            previewFeaturesSectionDivider = (
                <div className='divider-light'/>
            );

            if (this.props.activeSection === 'advancedPreviewFeatures') {
                const inputs = [];

                this.state.preReleaseFeaturesKeys.forEach((key) => {
                    const feature = this.state.preReleaseFeatures[key];
                    inputs.push(
                        <div key={'advancedPreviewFeatures_' + feature.label}>
                            <div className='checkbox'>
                                <label>
                                    <input
                                        id={'advancedPreviewFeatures' + feature.label}
                                        type='checkbox'
                                        checked={this.state.settings[Constants.FeatureTogglePrefix + feature.label] === 'true'}
                                        onChange={(e) => {
                                            this.toggleFeature(feature.label, e.target.checked);
                                        }}
                                    />
                                    {this.renderFeatureLabel(key)}
                                </label>
                            </div>
                        </div>
                    );
                });

                inputs.push(
                    <div key='advancedPreviewFeatures_helptext'>
                        <br/>
                        <FormattedMessage
                            id='user.settings.advance.preReleaseDesc'
                            defaultMessage="Check any pre-released features you'd like to preview.  You may also need to refresh the page before the setting will take effect."
                        />
                    </div>
                );
                previewFeaturesSection = (
                    <SettingItemMax
                        title={
                            <FormattedMessage
                                id='user.settings.advance.preReleaseTitle'
                                defaultMessage='Preview pre-release features'
                            />
                        }
                        inputs={inputs}
                        submit={this.saveEnabledFeatures}
                        saving={this.state.isSaving}
                        server_error={serverError}
                        updateSection={this.handleUpdateSection}
                    />
                );
            } else {
                previewFeaturesSection = (
                    <SettingItemMin
                        title={Utils.localizeMessage('user.settings.advance.preReleaseTitle', 'Preview pre-release features')}
                        describe={
                            <FormattedMessage
                                id='user.settings.advance.enabledFeatures'
                                defaultMessage='{count, number} {count, plural, one {Feature} other {Features}} Enabled'
                                values={{count: this.state.enabledFeatures}}
                            />
                        }
                        focused={this.props.prevActiveSection === this.prevSections.advancedPreviewFeatures}
                        section={'advancedPreviewFeatures'}
                        updateSection={this.handleUpdateSection}
                    />
                );
            }
        }

        let deactivateAccountSection = '';
        let makeConfirmationModal = '';
        const currentUser = UserStore.getCurrentUser();

        if (currentUser.auth_service === '' && this.props.enableUserDeactivation) {
            if (this.props.activeSection === 'deactivateAccount') {
                deactivateAccountSection = (
                    <SettingItemMax
                        title={
                            <FormattedMessage
                                id='user.settings.advance.deactivateAccountTitle'
                                defaultMessage='Deactivate Account'
                            />
                        }
                        inputs={[
                            <div key='formattingSetting'>
                                <div>
                                    <br/>
                                    <FormattedMessage
                                        id='user.settings.advance.deactivateDesc'
                                        defaultMessage='Deactivating your account removes your ability to log in to this server and disables all email and mobile notifications. To reactivate your account, contact your System Administrator.'
                                    />
                                </div>
                            </div>,
                        ]}
                        saveButtonText={'Deactivate'}
                        setting={'deactivateAccount'}
                        submit={this.handleShowDeactivateAccountModal}
                        saving={this.state.isSaving}
                        server_error={this.state.serverError}
                        updateSection={this.handleUpdateSection}
                    />
                );
            } else {
                deactivateAccountSection = (
                    <SettingItemMin
                        title={
                            <FormattedMessage
                                id='user.settings.advance.deactivateAccountTitle'
                                defaultMessage='Deactivate Account'
                            />
                        }
                        describe={
                            <FormattedMessage
                                id='user.settings.advance.deactivateDescShort'
                                defaultMessage="Click 'Edit' to deactivate your account"
                            />
                        }
                        focused={this.props.prevActiveSection === this.prevSections.deactivateAccount}
                        section={'deactivateAccount'}
                        updateSection={this.handleUpdateSection}
                    />
                );
            }

            const confirmButtonClass = 'btn btn-danger';
            const deactivateMemberButton = (
                <FormattedMessage
                    id='user.settings.advance.deactivate_member_modal.deactivateButton'
                    defaultMessage='Yes, deactivate my account'
                />
            );

            makeConfirmationModal = (
                <ConfirmModal
                    show={this.state.showDeactivateAccountModal}
                    title={
                        <FormattedMessage
                            id='user.settings.advance.confirmDeactivateAccountTitle'
                            defaultMessage='Confirm Deactivation'
                        />
                    }
                    message={
                        <FormattedMessage
                            id='user.settings.advance.confirmDeactivateDesc'
                            defaultMessage='Are you sure you want to deactivate your account? This can only be reversed by your System Administrator.'
                        />
                    }
                    confirmButtonClass={confirmButtonClass}
                    confirmButtonText={deactivateMemberButton}
                    onConfirm={this.handleDeactivateAccountSubmit}
                    onCancel={this.handleHideDeactivateAccountModal}
                />
            );
        }

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
                                title={Utils.localizeMessage('generic_icons.back', 'Back Icon')}
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.advance.title'
                            defaultMessage='Advanced Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.advance.title'
                            defaultMessage='Advanced Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {ctrlSendSection}
                    <CodeBlockCtrlEnterSection
                        activeSection={this.props.activeSection}
                        onUpdateSection={this.handleUpdateSection}
                        prevActiveSection={this.props.prevActiveSection}
                        renderOnOffLabel={this.renderOnOffLabel}
                    />
                    {formattingSectionDivider}
                    {formattingSection}
                    <div className='divider-light'/>
                    <JoinLeaveSection
                        activeSection={this.props.activeSection}
                        onUpdateSection={this.handleUpdateSection}
                        prevActiveSection={this.props.prevActiveSection}
                        renderOnOffLabel={this.renderOnOffLabel}
                    />
                    {previewFeaturesSectionDivider}
                    {previewFeaturesSection}
                    {formattingSectionDivider}
                    {deactivateAccountSection}
                    <div className='divider-dark'/>
                    {makeConfirmationModal}
                </div>
            </div>
        );
    }
}

AdvancedSettingsDisplay.propTypes = {
    updateSection: PropTypes.func,
    activeSection: PropTypes.string,
    prevActiveSection: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    collapseModal: PropTypes.func.isRequired,
    enablePreviewFeatures: PropTypes.bool,
    enableUserDeactivation: PropTypes.bool,
};
