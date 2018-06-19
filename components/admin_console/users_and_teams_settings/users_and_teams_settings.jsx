// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedHTMLMessage, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {rolesFromMapping, mappingValueFromRoles} from 'utils/policy_roles_adapter';
import {saveConfig} from 'actions/admin_actions.jsx';

import LoadingScreen from 'components/loading_screen.jsx';

import AdminSettings from '../admin_settings.jsx';
import BooleanSetting from '../boolean_setting.jsx';
import DropdownSetting from '../dropdown_setting.jsx';
import SettingsGroup from '../settings_group.jsx';
import TextSetting from '../text_setting.jsx';

const RESTRICT_DIRECT_MESSAGE_ANY = 'any';
const RESTRICT_DIRECT_MESSAGE_TEAM = 'team';

export class UsersAndTeamsSettings extends AdminSettings {
    static propTypes = {
        intl: intlShape.isRequired,
        roles: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            loadRolesIfNeeded: PropTypes.func.isRequired,
            editRole: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.state, // Brings the state in from the parent class.
            enableTeamCreation: null,
            loaded: false,
            edited: {},
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.props.actions.loadRolesIfNeeded(['system_user']);
        if (this.props.roles.system_user) {
            this.loadPoliciesIntoState(this.props);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!this.state.loaded && nextProps.roles.system_user) {
            this.loadPoliciesIntoState(nextProps);
        }
    }

    handleChange = (id, value) => {
        this.setState({
            saveNeeded: true,
            [id]: value,
            edited: {...this.state.edited, [id]: this.props.intl.formatMessage({id: 'admin.field_names.' + id, defaultMessage: id})},
        });

        this.props.setNavigationBlocked(true);
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        this.setState({
            saving: true,
            serverError: null,
        });

        // Purposely converting enableTeamCreation value from boolean to string 'true' or 'false'
        // so that it can be used as a key in the policy roles adapter mapping.
        const updatedRoles = rolesFromMapping({enableTeamCreation: this.state.enableTeamCreation.toString()}, this.props.roles);

        let success = true;

        await Promise.all(Object.values(updatedRoles).map(async (item) => {
            try {
                await this.props.actions.editRole(item);
            } catch (err) {
                success = false;
                this.setState({
                    saving: false,
                    serverError: err.message,
                });
            }
        }));

        if (success) {
            const configFieldEdited = (
                this.state.edited.enableUserCreation ||
                this.state.edited.maxUsersPerTeam ||
                this.state.edited.restrictCreationToDomains ||
                this.state.edited.restrictDirectMessage ||
                this.state.edited.teammateNameDisplay ||
                this.state.edited.maxChannelsPerTeam ||
                this.state.edited.maxNotificationsPerChannel ||
                this.state.edited.enableConfirmNotificationsToChannel
            );

            if (configFieldEdited) {
                this.doSubmit(() => {
                    if (!this.state.serverError) {
                        this.setState({edited: {}});
                    }
                });
            } else {
                this.setState({
                    saving: false,
                    saveNeeded: false,
                    serverError: null,
                    edited: {},
                });
                this.props.setNavigationBlocked(false);
            }
        }
    };

    doSubmit = (callback) => {
        this.setState({
            saving: true,
            serverError: null,
        });

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        saveConfig(
            config,
            (savedConfig) => {
                this.setState(this.getStateFromConfig(savedConfig));

                this.setState({
                    saveNeeded: false,
                    saving: false,
                });

                this.props.setNavigationBlocked(false);

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            },
            (err) => {
                let errMessage = err.message;
                if (err.id === 'ent.cluster.save_config.error') {
                    errMessage = (
                        <FormattedMessage
                            id='ent.cluster.save_config_with_roles.error'
                            defaultMessage='The following configuration settings cannot be saved when High Availability is enabled and the System Console is in read-only mode: {keys}.'
                            values={{
                                keys: [
                                    this.state.edited.enableUserCreation,
                                    this.state.edited.maxUsersPerTeam,
                                    this.state.edited.restrictCreationToDomains,
                                    this.state.edited.restrictDirectMessage,
                                    this.state.edited.teammateNameDisplay,
                                    this.state.edited.maxChannelsPerTeam,
                                    this.state.edited.maxNotificationsPerChannel,
                                    this.state.edited.enableConfirmNotificationsToChannel,
                                ].filter((v) => v).join(', '),
                            }}
                        />
                    );
                }

                this.setState({
                    saving: false,
                    serverError: errMessage,
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            }
        );
    };

    loadPoliciesIntoState(props) {
        const {roles} = props;

        // Purposely parsing boolean from string 'true' or 'false'
        // because the string comes from the policy roles adapter mapping.
        const enableTeamCreation = (mappingValueFromRoles('enableTeamCreation', roles) === 'true');

        this.setState({enableTeamCreation, loaded: true});
    }

    getConfigFromState = (config) => {
        config.TeamSettings.EnableUserCreation = this.state.enableUserCreation;
        config.TeamSettings.MaxUsersPerTeam = this.parseIntNonZero(this.state.maxUsersPerTeam, Constants.DEFAULT_MAX_USERS_PER_TEAM);
        config.TeamSettings.RestrictCreationToDomains = this.state.restrictCreationToDomains;
        config.TeamSettings.RestrictDirectMessage = this.state.restrictDirectMessage;
        config.TeamSettings.TeammateNameDisplay = this.state.teammateNameDisplay;
        config.TeamSettings.MaxChannelsPerTeam = this.parseIntNonZero(this.state.maxChannelsPerTeam, Constants.DEFAULT_MAX_CHANNELS_PER_TEAM);
        config.TeamSettings.MaxNotificationsPerChannel = this.parseIntNonZero(this.state.maxNotificationsPerChannel, Constants.DEFAULT_MAX_NOTIFICATIONS_PER_CHANNEL);
        config.TeamSettings.EnableConfirmNotificationsToChannel = this.state.enableConfirmNotificationsToChannel;
        return config;
    };

    getStateFromConfig(config) {
        return {
            enableUserCreation: config.TeamSettings.EnableUserCreation,
            maxUsersPerTeam: config.TeamSettings.MaxUsersPerTeam,
            restrictCreationToDomains: config.TeamSettings.RestrictCreationToDomains,
            restrictDirectMessage: config.TeamSettings.RestrictDirectMessage,
            teammateNameDisplay: config.TeamSettings.TeammateNameDisplay,
            maxChannelsPerTeam: config.TeamSettings.MaxChannelsPerTeam,
            maxNotificationsPerChannel: config.TeamSettings.MaxNotificationsPerChannel,
            enableConfirmNotificationsToChannel: config.TeamSettings.EnableConfirmNotificationsToChannel,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.general.usersAndTeams'
                defaultMessage='Users and Teams'
            />
        );
    }

    renderSettings = () => {
        if (!this.state.loaded) {
            return <LoadingScreen/>;
        }
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enableUserCreation'
                    label={
                        <FormattedMessage
                            id='admin.team.userCreationTitle'
                            defaultMessage='Enable Account Creation: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.team.userCreationDescription'
                            defaultMessage='When false, the ability to create accounts is disabled. The create account button displays error when pressed.'
                        />
                    }
                    value={this.state.enableUserCreation}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.EnableUserCreation')}
                />
                {this.props.license.IsLicensed === 'false' &&
                    <BooleanSetting
                        id='enableTeamCreation'
                        label={
                            <FormattedMessage
                                id='admin.team.teamCreationTitle'
                                defaultMessage='Enable Team Creation: '
                            />
                        }
                        helpText={
                            <FormattedMessage
                                id='admin.team.teamCreationDescription'
                                defaultMessage='When false, only System Administrators can create teams.'
                            />
                        }
                        value={this.state.enableTeamCreation}
                        onChange={this.handleChange}
                        setByEnv={false}
                    />}
                <TextSetting
                    id='maxUsersPerTeam'
                    label={
                        <FormattedMessage
                            id='admin.team.maxUsersTitle'
                            defaultMessage='Max Users Per Team:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.team.maxUsersExample', 'Ex "25"')}
                    helpText={
                        <FormattedMessage
                            id='admin.team.maxUsersDescription'
                            defaultMessage='Maximum total number of users per team, including both active and inactive users.'
                        />
                    }
                    value={this.state.maxUsersPerTeam}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.MaxUsersPerTeam')}
                />
                <TextSetting
                    id='maxChannelsPerTeam'
                    label={
                        <FormattedMessage
                            id='admin.team.maxChannelsTitle'
                            defaultMessage='Max Channels Per Team:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.team.maxChannelsExample', 'Ex "100"')}
                    helpText={
                        <FormattedMessage
                            id='admin.team.maxChannelsDescription'
                            defaultMessage='Maximum total number of channels per team, including both active and archived channels.'
                        />
                    }
                    value={this.state.maxChannelsPerTeam}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.MaxChannelsPerTeam')}
                />
                <TextSetting
                    id='maxNotificationsPerChannel'
                    label={
                        <FormattedMessage
                            id='admin.team.maxNotificationsPerChannelTitle'
                            defaultMessage='Max Notifications Per Channel:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.team.maxNotificationsPerChannelExample', 'Ex "1000"')}
                    helpText={
                        <FormattedMessage
                            id='admin.team.maxNotificationsPerChannelDescription'
                            defaultMessage='Maximum total number of users in a channel before users typing messages, @all, @here, and @channel no longer send notifications because of performance.'
                        />
                    }
                    value={this.state.maxNotificationsPerChannel}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.MaxNotificationsPerChannel')}
                />
                <BooleanSetting
                    id='enableConfirmNotificationsToChannel'
                    label={
                        <FormattedMessage
                            id='admin.team.enableConfirmNotificationsToChannelTitle'
                            defaultMessage='Show @channel and @all confirmation dialog: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.team.enableConfirmNotificationsToChannelDescription'
                            defaultMessage='When true, users will be prompted to confirm when posting @channel and @all in channels with over five members. When false, no confirmation is required.'
                        />
                    }
                    value={this.state.enableConfirmNotificationsToChannel}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.EnableConfirmNotificationsToChannel')}
                />
                <TextSetting
                    id='restrictCreationToDomains'
                    label={
                        <FormattedMessage
                            id='admin.team.restrictTitle'
                            defaultMessage='Restrict account creation to specified email domains:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.team.restrictExample', 'Ex "corp.mattermost.com, mattermost.org"')}
                    helpText={
                        <FormattedMessage
                            id='admin.team.restrictDescription'
                            defaultMessage='Teams and user accounts can only be created from a specific domain (e.g. "mattermost.org") or list of comma-separated domains (e.g. "corp.mattermost.com, mattermost.org").'
                        />
                    }
                    value={this.state.restrictCreationToDomains}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.RestrictCreationToDomains')}
                />
                <DropdownSetting
                    id='restrictDirectMessage'
                    values={[
                        {value: RESTRICT_DIRECT_MESSAGE_ANY, text: Utils.localizeMessage('admin.team.restrict_direct_message_any', 'Any user on the Mattermost server')},
                        {value: RESTRICT_DIRECT_MESSAGE_TEAM, text: Utils.localizeMessage('admin.team.restrict_direct_message_team', 'Any member of the team')},
                    ]}
                    label={
                        <FormattedMessage
                            id='admin.team.restrictDirectMessage'
                            defaultMessage='Enable users to open Direct Message channels with:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.team.restrictDirectMessageDesc'
                            defaultMessage='"Any user on the Mattermost server" enables users to open a Direct Message channel with any user on the server, even if they are not on any teams together. "Any member of the team" limits the ability in the Direct Messages "More" menu to only open Direct Message channels with users who are in the same team.<br /><br />Note: This setting only affects the UI, not permissions on the server.'
                        />
                    }
                    value={this.state.restrictDirectMessage}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.RestrictDirectMessage')}
                />
                <DropdownSetting
                    id='teammateNameDisplay'
                    values={[
                        {value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME, text: Utils.localizeMessage('admin.team.showUsername', 'Show username (default)')},
                        {value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_NICKNAME_FULLNAME, text: Utils.localizeMessage('admin.team.showNickname', 'Show nickname if one exists, otherwise show first and last name')},
                        {value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME, text: Utils.localizeMessage('admin.team.showFullname', 'Show first and last name')},
                    ]}
                    label={
                        <FormattedMessage
                            id='admin.team.teammateNameDisplay'
                            defaultMessage='Teammate Name Display:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.team.teammateNameDisplayDesc'
                            defaultMessage="Set how to display users' names in posts and the Direct Messages list."
                        />
                    }
                    value={this.state.teammateNameDisplay}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSetting.TeammateNameDisplay')}
                />
            </SettingsGroup>
        );
    };
}

export default injectIntl(UsersAndTeamsSettings);
