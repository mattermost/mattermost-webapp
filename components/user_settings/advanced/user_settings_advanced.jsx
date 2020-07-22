// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';
import ConfirmModal from 'components/confirm_modal';
import BackIcon from 'components/widgets/icons/fa_back_icon';

import JoinLeaveSection from './join_leave_section';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

export default class AdvancedSettingsDisplay extends React.PureComponent {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        advancedSettingsCategory: PropTypes.array.isRequired,
        sendOnCtrlEnter: PropTypes.string.isRequired,
        codeBlockOnCtrlEnter: PropTypes.bool,
        formatting: PropTypes.string.isRequired,
        joinLeave: PropTypes.string.isRequired,
        updateSection: PropTypes.func,
        activeSection: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
        enablePreviewFeatures: PropTypes.bool,
        enableUserDeactivation: PropTypes.bool,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
            updateUserActive: PropTypes.func.isRequired,
            revokeAllSessionsForUser: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = this.getStateFromProps();
    }

    getStateFromProps = () => {
        const advancedSettings = this.props.advancedSettingsCategory;
        const settings = {
            send_on_ctrl_enter: this.props.sendOnCtrlEnter,
            code_block_ctrl_enter: this.props.codeBlockOnCtrlEnter,
            formatting: this.props.formatting,
            join_leave: this.props.joinLeave,
        };

        const preReleaseFeaturesKeys = Object.keys(PreReleaseFeatures);
        let enabledFeatures = 0;
        for (const as of advancedSettings) {
            for (const key of preReleaseFeaturesKeys) {
                const feature = PreReleaseFeatures[key];

                if (as.name === Constants.FeatureTogglePrefix + feature.label) {
                    settings[as.name] = as.value;

                    if (as.value === 'true') {
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

    handleSubmit = async (settings) => {
        const preferences = [];
        const {actions, currentUser} = this.props;
        const userId = currentUser.id;

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
        await actions.savePreferences(userId, preferences);

        this.handleUpdateSection('');
    }

    handleDeactivateAccountSubmit = async () => {
        const userId = this.props.currentUser.id;

        this.setState({isSaving: true});

        this.props.actions.updateUserActive(userId, false).
            then(({error}) => {
                if (error) {
                    this.setState({serverError: error.message});
                }
            });

        const {data, error} = await this.props.actions.revokeAllSessionsForUser(userId);
        if (data) {
            emitUserLoggedOutEvent();
        } else if (error) {
            this.setState({serverError: error.message});
        }
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
            this.setState(this.getStateFromProps());
        }
        this.setState({isSaving: false});
        this.props.updateSection(section);
    }

    // This function changes ctrl to cmd when OS is mac
    getCtrlSendText = () => {
        const description = {
            default: {
                id: t('user.settings.advance.sendDesc'),
                defaultMessage: 'When enabled, CTRL + ENTER will send the message and ENTER inserts a new line.',
            },
            mac: {
                id: t('user.settings.advance.sendDesc.mac'),
                defaultMessage: 'When enabled, ⌘ + ENTER will send the message and ENTER inserts a new line.',
            },
        };
        const title = {
            default: {
                id: t('user.settings.advance.sendTitle'),
                defaultMessage: 'Send Messages on CTRL+ENTER',
            },
            mac: {
                id: t('user.settings.advance.sendTitle.mac'),
                defaultMessage: 'Send Messages on ⌘+ENTER',
            },
        };
        if (Utils.isMac()) {
            return {
                ctrlSendTitle: title.mac,
                ctrlSendDesc: description.mac,
            };
        }
        return {
            ctrlSendTitle: title.default,
            ctrlSendDesc: description.default,
        };
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

    renderCtrlEnterLabel() {
        const ctrlEnter = this.state.settings.send_on_ctrl_enter;
        const codeBlockCtrlEnter = this.state.settings.code_block_ctrl_enter;
        if (ctrlEnter === 'false' && codeBlockCtrlEnter === 'false') {
            return (
                <FormattedMessage
                    id='user.settings.advance.off'
                    defaultMessage='Off'
                />
            );
        } else if (ctrlEnter === 'true' && codeBlockCtrlEnter === 'true') {
            return (
                <FormattedMessage
                    id='user.settings.advance.onForAllMessages'
                    defaultMessage='On for all messages'
                />
            );
        }
        return (
            <FormattedMessage
                id='user.settings.advance.onForCode'
                defaultMessage='On only for code blocks starting with ```'
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
                        <fieldset key='formattingSetting'>
                            <legend className='form-legend hidden-label'>
                                <FormattedMessage
                                    id='user.settings.advance.formattingTitle'
                                    defaultMessage='Enable Post Formatting'
                                />
                            </legend>
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
                            <div className='mt-5'>
                                <FormattedMessage
                                    id='user.settings.advance.formattingDesc'
                                    defaultMessage='If enabled, posts will be formatted to create links, show emoji, style the text, and add line breaks. By default, this setting is enabled.'
                                />
                            </div>
                        </fieldset>,
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
        const {ctrlSendTitle, ctrlSendDesc} = this.getCtrlSendText();

        if (this.props.activeSection === 'advancedCtrlSend') {
            const ctrlSendActive = [
                this.state.settings.send_on_ctrl_enter === 'true',
                this.state.settings.send_on_ctrl_enter === 'false' && this.state.settings.code_block_ctrl_enter === 'true',
                this.state.settings.send_on_ctrl_enter === 'false' && this.state.settings.code_block_ctrl_enter === 'false',
            ];

            const inputs = [
                <fieldset key='ctrlSendSetting'>
                    <legend className='form-legend hidden-label'>
                        <FormattedMessage {...ctrlSendTitle}/>
                    </legend>
                    <div className='radio'>
                        <label>
                            <input
                                id='ctrlSendOn'
                                type='radio'
                                name='sendOnCtrlEnter'
                                checked={ctrlSendActive[0]}
                                onChange={() => {
                                    this.updateSetting('send_on_ctrl_enter', 'true');
                                    this.updateSetting('code_block_ctrl_enter', 'true');
                                }}
                            />
                            <FormattedMessage
                                id='user.settings.advance.onForAllMessages'
                                defaultMessage='On for all messages'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='ctrlSendOnForCode'
                                type='radio'
                                name='sendOnCtrlEnter'
                                checked={ctrlSendActive[1]}
                                onChange={() => {
                                    this.updateSetting('send_on_ctrl_enter', 'false');
                                    this.updateSetting('code_block_ctrl_enter', 'true');
                                }}
                            />
                            <FormattedMessage
                                id='user.settings.advance.onForCode'
                                defaultMessage='On only for code blocks starting with ```'
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
                                checked={ctrlSendActive[2]}
                                onChange={() => {
                                    this.updateSetting('send_on_ctrl_enter', 'false');
                                    this.updateSetting('code_block_ctrl_enter', 'false');
                                }}
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
                        <FormattedMessage {...ctrlSendDesc}/>
                    </div>
                </fieldset>,
            ];
            ctrlSendSection = (
                <SettingItemMax
                    title={
                        <FormattedMessage {...ctrlSendTitle}/>
                    }
                    inputs={inputs}
                    submit={this.handleSubmit.bind(this, ['send_on_ctrl_enter', 'code_block_ctrl_enter'])}
                    saving={this.state.isSaving}
                    server_error={serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        } else {
            ctrlSendSection = (
                <SettingItemMin
                    title={
                        <FormattedMessage {...ctrlSendTitle}/>
                    }
                    describe={this.renderCtrlEnterLabel()}
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
                        </div>,
                    );
                });

                inputs.push(
                    <div key='advancedPreviewFeatures_helptext'>
                        <br/>
                        <FormattedMessage
                            id='user.settings.advance.preReleaseDesc'
                            defaultMessage="Check any pre-released features you'd like to preview.  You may also need to refresh the page before the setting will take effect."
                        />
                    </div>,
                );
                previewFeaturesSection = (
                    <SettingItemMax
                        title={
                            <FormattedMessage
                                id='user.settings.advance.preReleaseTitle'
                                defaultMessage='Preview Pre-release Features'
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
                        title={Utils.localizeMessage('user.settings.advance.preReleaseTitle', 'Preview Pre-release Features')}
                        describe={
                            <FormattedMessage
                                id='user.settings.advance.enabledFeatures'
                                defaultMessage='{count, number} {count, plural, one {Feature} other {Features}} Enabled'
                                values={{count: this.state.enabledFeatures}}
                            />
                        }
                        section={'advancedPreviewFeatures'}
                        updateSection={this.handleUpdateSection}
                    />
                );
            }
        }

        let deactivateAccountSection = '';
        let makeConfirmationModal = '';
        const currentUser = this.props.currentUser;

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
                            <span onClick={this.props.collapseModal}>
                                <BackIcon/>
                            </span>
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
                    {formattingSectionDivider}
                    {formattingSection}
                    <div className='divider-light'/>
                    <JoinLeaveSection
                        activeSection={this.props.activeSection}
                        onUpdateSection={this.handleUpdateSection}
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
/* eslint-enable react/no-string-refs */
