// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, FormattedDate} from 'react-intl';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';
import SettingPicture from 'components/setting_picture.jsx';
import BackIcon from 'components/widgets/icons/fa_back_icon';
import LocalizedInput from 'components/localized_input/localized_input';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import {t} from 'utils/i18n.jsx';

const ACCEPTED_TEAM_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/bmp'];

export default class GeneralTab extends React.PureComponent {
    static propTypes = {
        updateSection: PropTypes.func.isRequired,
        team: PropTypes.object.isRequired,
        activeSection: PropTypes.string.isRequired,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
        maxFileSize: PropTypes.number.isRequired,
        actions: PropTypes.shape({
            getTeam: PropTypes.func.isRequired,
            patchTeam: PropTypes.func.isRequired,
            regenerateTeamInviteId: PropTypes.func.isRequired,
            removeTeamIcon: PropTypes.func.isRequired,
            setTeamIcon: PropTypes.func.isRequired,
        }).isRequired,
        canInviteTeamMembers: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = this.setupInitialState(props);
    }

    updateSection = (section) => {
        this.setState(this.setupInitialState(this.props));
        this.props.updateSection(section);
    }

    setupInitialState(props) {
        const team = props.team;

        return {
            name: team.display_name,
            invite_id: team.invite_id,
            allow_open_invite: team.allow_open_invite,
            description: team.description,
            allowed_domains: team.allowed_domains,
            serverError: '',
            clientError: '',
            teamIconFile: null,
            loadingIcon: false,
            submitActive: false,
            isInitialState: true,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const {team} = nextProps;
        if (!prevState.isInitialState) {
            return {
                name: team.display_name,
                description: team.description,
                allowed_domains: team.allowed_domains,
                invite_id: team.invite_id,
                allow_open_invite: team.allow_open_invite,
                isInitialState: false,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.shouldFetchTeam && this.state.shouldFetchTeam) {
            this.fetchTeam();
        }
    }

    fetchTeam() {
        if (this.state.serverError) {
            return;
        }
        this.props.actions.getTeam(this.props.team.id).then(({error}) => {
            const state = {
                shouldFetchTeam: false,
            };
            if (error) {
                state.serverError = error.message;
            }
            this.setState(state);
        });
    }

    handleOpenInviteRadio = (openInvite) => {
        this.setState({allow_open_invite: openInvite});
    }

    handleAllowedDomainsSubmit = async () => {
        var state = {serverError: '', clientError: ''};

        var data = {...this.props.team};
        data.allowed_domains = this.state.allowed_domains;

        const {error} = await this.props.actions.patchTeam(data);

        if (error) {
            state.serverError = error.message;
            this.setState(state);
        } else {
            this.updateSection('');
        }
    }

    handleOpenInviteSubmit = async () => {
        var state = {serverError: '', clientError: ''};

        var data = {...this.props.team};
        data.allow_open_invite = this.state.allow_open_invite;

        const {error} = await this.props.actions.patchTeam(data);

        if (error) {
            state.serverError = error.message;
            this.setState(state);
        } else {
            this.updateSection('');
        }
    }

    handleNameSubmit = async () => {
        var state = {serverError: '', clientError: ''};
        let valid = true;

        const name = this.state.name.trim();

        if (!name) {
            state.clientError = Utils.localizeMessage('general_tab.required', 'This field is required');
            valid = false;
        } else if (name.length < Constants.MIN_TEAMNAME_LENGTH) {
            state.clientError = (
                <FormattedMessage
                    id='general_tab.teamNameRestrictions'
                    defaultMessage='Team Name must be {min} or more characters up to a maximum of {max}. You can add a longer team description.'
                    values={{
                        min: Constants.MIN_TEAMNAME_LENGTH,
                        max: Constants.MAX_TEAMNAME_LENGTH,
                    }}
                />
            );

            valid = false;
        } else {
            state.clientError = '';
        }

        this.setState(state);

        if (!valid) {
            return;
        }

        var data = {...this.props.team};
        data.display_name = this.state.name;

        const {error} = await this.props.actions.patchTeam(data);

        if (error) {
            state.serverError = error.message;
            this.setState(state);
        } else {
            this.updateSection('');
        }
    }

    handleInviteIdSubmit = async () => {
        const state = {serverError: '', clientError: ''};
        this.setState(state);

        const {error} = await this.props.actions.regenerateTeamInviteId(this.props.team.id);

        if (error) {
            state.serverError = error.message;
            this.setState(state);
        } else {
            this.updateSection('');
        }
    }

    handleClose = () => {
        this.updateSection('');
    }

    handleDescriptionSubmit = async () => {
        var state = {serverError: '', clientError: ''};
        let valid = true;

        const description = this.state.description.trim();
        if (description === this.props.team.description) {
            state.clientError = Utils.localizeMessage('general_tab.chooseDescription', 'Please choose a new description for your team');
            valid = false;
        } else {
            state.clientError = '';
        }

        this.setState(state);

        if (!valid) {
            return;
        }

        var data = {...this.props.team};
        data.description = this.state.description;

        const {error} = await this.props.actions.patchTeam(data);

        if (error) {
            state.serverError = error.message;
            this.setState(state);
        } else {
            this.updateSection('');
        }
    }

    handleTeamIconSubmit = async () => {
        if (!this.state.teamIconFile) {
            return;
        }

        if (!this.state.submitActive) {
            return;
        }

        this.setState({
            loadingIcon: true,
            clientError: '',
            serverError: '',
        });

        const {error} = await this.props.actions.setTeamIcon(this.props.team.id, this.state.teamIconFile);

        if (error) {
            this.setState({
                loadingIcon: false,
                serverError: error.message,
            });
        } else {
            this.setState({
                loadingIcon: false,
                submitActive: false,
            });
            this.updateSection('');
        }
    }

    handleTeamIconRemove = async () => {
        this.setState({
            loadingIcon: true,
            clientError: '',
            serverError: '',
        });

        const {error} = await this.props.actions.removeTeamIcon(this.props.team.id);

        if (error) {
            this.setState({
                loadingIcon: false,
                serverError: error.message,
            });
        } else {
            this.setState({
                loadingIcon: false,
                submitActive: false,
            });
            this.updateSection('');
        }
    }

    componentDidMount() {
        $('#team_settings').on('hidden.bs.modal', this.handleClose);
    }

    componentWillUnmount() {
        $('#team_settings').off('hidden.bs.modal', this.handleClose);
    }

    handleUpdateSection = (section) => {
        if (section === 'invite_id' && this.props.activeSection !== section && !this.props.team.invite_id) {
            this.setState({shouldFetchTeam: true}, () => {
                this.updateSection(section);
            });
            return;
        }

        this.updateSection(section);
    }

    updateName = (e) => {
        this.setState({name: e.target.value});
    }

    updateDescription = (e) => {
        this.setState({description: e.target.value});
    }

    updateTeamIcon = (e) => {
        if (e && e.target && e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (!ACCEPTED_TEAM_IMAGE_TYPES.includes(file.type)) {
                this.setState({
                    clientError: Utils.localizeMessage('general_tab.teamIconInvalidFileType', 'Only BMP, JPG or PNG images may be used for team icons'),
                });
            } else if (file.size > this.props.maxFileSize) {
                this.setState({
                    clientError: Utils.localizeMessage('general_tab.teamIconTooLarge', 'Unable to upload team icon. File is too large.'),
                });
            } else {
                this.setState({
                    teamIconFile: e.target.files[0],
                    clientError: '',
                    submitActive: true,
                });
            }
        } else {
            this.setState({
                teamIconFile: null,
                clientError: Utils.localizeMessage('general_tab.teamIconError', 'An error occurred while selecting the image.'),
            });
        }
    }

    updateAllowedDomains = (e) => {
        this.setState({allowed_domains: e.target.value});
    }

    render() {
        const team = this.props.team;

        let clientError = null;
        let serverError = null;

        if (this.state.clientError) {
            clientError = this.state.clientError;
        }
        if (this.state.serverError) {
            serverError = this.state.serverError;
        }

        let openInviteSection;
        if (this.props.activeSection === 'open_invite') {
            let inputs;

            if (team.group_constrained) {
                inputs = [
                    <div key='userOpenInviteOptions'>
                        <div>
                            <FormattedMarkdownMessage
                                id='team_settings.openInviteDescription.groupConstrained'
                                defaultMessage='No, members of this team are added and removed by linked groups. [Learn More](!https://mattermost.com/pl/default-ldap-group-constrained-team-channel.html)'
                            />
                        </div>
                    </div>,
                ];
            } else {
                inputs = [
                    <fieldset key='userOpenInviteOptions'>
                        <legend className='form-legend hidden-label'>
                            <FormattedMessage
                                id='team_settings.openInviteDescription.ariaLabel'
                                defaultMessage='Invite Code'
                            />
                        </legend>
                        <div className='radio'>
                            <label>
                                <input
                                    id='teamOpenInvite'
                                    name='userOpenInviteOptions'
                                    type='radio'
                                    defaultChecked={this.state.allow_open_invite}
                                    onChange={this.handleOpenInviteRadio.bind(this, true)}
                                />
                                <FormattedMessage
                                    id='general_tab.yes'
                                    defaultMessage='Yes'
                                />
                            </label>
                            <br/>
                        </div>
                        <div className='radio'>
                            <label>
                                <input
                                    id='teamOpenInviteNo'
                                    name='userOpenInviteOptions'
                                    type='radio'
                                    defaultChecked={!this.state.allow_open_invite}
                                    onChange={this.handleOpenInviteRadio.bind(this, false)}
                                />
                                <FormattedMessage
                                    id='general_tab.no'
                                    defaultMessage='No'
                                />
                            </label>
                            <br/>
                        </div>
                        <div className='mt-5'>
                            <FormattedMessage
                                id='general_tab.openInviteDesc'
                                defaultMessage='When allowed, a link to this team will be included on the landing page allowing anyone with an account to join this team. Changing from "Yes" to "No" will regenerate the  invitation code, create a new invitation link and invalidate the previous link.'
                            />
                        </div>
                    </fieldset>,
                ];
            }

            openInviteSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('general_tab.openInviteTitle', 'Allow any user with an account on this server to join this team')}
                    inputs={inputs}
                    submit={this.handleOpenInviteSubmit}
                    serverError={serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        } else {
            let describe = '';
            if (this.state.allow_open_invite === true) {
                describe = Utils.localizeMessage('general_tab.yes', 'Yes');
            } else if (team.group_constrained) {
                describe = Utils.localizeMessage('team_settings.openInviteSetting.groupConstrained', 'No, members of this team are added and removed by linked groups.');
            } else {
                describe = Utils.localizeMessage('general_tab.no', 'No');
            }

            openInviteSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('general_tab.openInviteTitle', 'Allow any user with an account on this server to join this team')}
                    describe={describe}
                    updateSection={this.handleUpdateSection}
                    section={'open_invite'}
                />
            );
        }

        let inviteSection;

        if (this.props.activeSection === 'invite_id' && this.props.canInviteTeamMembers) {
            const inputs = [];

            inputs.push(
                <div key='teamInviteSetting'>
                    <div className='row'>
                        <label className='col-sm-5 control-label visible-xs-block'/>
                        <div className='col-sm-12'>
                            <input
                                id='teamInviteId'
                                autoFocus={true}
                                className='form-control'
                                type='text'
                                value={this.state.invite_id}
                                maxLength='32'
                                onFocus={Utils.moveCursorToEnd}
                                readOnly={true}
                            />
                        </div>
                    </div>
                    <div className='setting-list__hint'>
                        <FormattedMessage
                            id='general_tab.codeLongDesc'
                            defaultMessage='The Invite Code is part of the unique team invitation link which is sent to members you’re inviting to this team. Regenerating the code creates a new invitation link and invalidates the previous link.'
                            values={{
                                getTeamInviteLink: (
                                    <strong>
                                        <FormattedMessage
                                            id='general_tab.getTeamInviteLink'
                                            defaultMessage='Get Team Invite Link'
                                        />
                                    </strong>
                                ),
                            }}
                        />
                    </div>
                </div>,
            );

            inviteSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('general_tab.codeTitle', 'Invite Code')}
                    inputs={inputs}
                    submit={this.handleInviteIdSubmit}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.handleUpdateSection}
                    saveButtonText={Utils.localizeMessage('general_tab.regenerate', 'Regenerate')}
                />
            );
        } else if (this.props.canInviteTeamMembers) {
            inviteSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('general_tab.codeTitle', 'Invite Code')}
                    describe={Utils.localizeMessage('general_tab.codeDesc', "Click 'Edit' to regenerate Invite Code.")}
                    updateSection={this.handleUpdateSection}
                    section={'invite_id'}
                />
            );
        }

        let nameSection;

        if (this.props.activeSection === 'name') {
            const inputs = [];

            let teamNameLabel = (
                <FormattedMessage
                    id='general_tab.teamName'
                    defaultMessage='Team Name'
                />
            );
            if (Utils.isMobile()) {
                teamNameLabel = '';
            }

            inputs.push(
                <div
                    key='teamNameSetting'
                    className='form-group'
                >
                    <label className='col-sm-5 control-label'>{teamNameLabel}</label>
                    <div className='col-sm-7'>
                        <input
                            id='teamName'
                            autoFocus={true}
                            className='form-control'
                            type='text'
                            maxLength={Constants.MAX_TEAMNAME_LENGTH.toString()}
                            onChange={this.updateName}
                            value={this.state.name}
                            onFocus={Utils.moveCursorToEnd}
                        />
                    </div>
                </div>,
            );

            const nameExtraInfo = <span>{Utils.localizeMessage('general_tab.teamNameInfo', 'Set the name of the team as it appears on your sign-in screen and at the top of the left-hand sidebar.')}</span>;

            nameSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('general_tab.teamName', 'Team Name')}
                    inputs={inputs}
                    submit={this.handleNameSubmit}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.handleUpdateSection}
                    extraInfo={nameExtraInfo}
                />
            );
        } else {
            var describe = this.state.name;

            nameSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('general_tab.teamName', 'Team Name')}
                    describe={describe}
                    updateSection={this.handleUpdateSection}
                    section={'name'}
                />
            );
        }

        let descriptionSection;

        if (this.props.activeSection === 'description') {
            const inputs = [];

            let teamDescriptionLabel = (
                <FormattedMessage
                    id='general_tab.teamDescription'
                    defaultMessage='Team Description'
                />
            );
            if (Utils.isMobile()) {
                teamDescriptionLabel = '';
            }

            inputs.push(
                <div
                    key='teamDescriptionSetting'
                    className='form-group'
                >
                    <label className='col-sm-5 control-label'>{teamDescriptionLabel}</label>
                    <div className='col-sm-7'>
                        <input
                            id='teamDescription'
                            autoFocus={true}
                            className='form-control'
                            type='text'
                            maxLength={Constants.MAX_TEAMDESCRIPTION_LENGTH.toString()}
                            onChange={this.updateDescription}
                            value={this.state.description}
                            onFocus={Utils.moveCursorToEnd}
                        />
                    </div>
                </div>,
            );

            const descriptionExtraInfo = <span>{Utils.localizeMessage('general_tab.teamDescriptionInfo', 'Team description provides additional information to help users select the right team. Maximum of 50 characters.')}</span>;

            descriptionSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('general_tab.teamDescription', 'Team Description')}
                    inputs={inputs}
                    submit={this.handleDescriptionSubmit}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.handleUpdateSection}
                    extraInfo={descriptionExtraInfo}
                />
            );
        } else {
            let describemsg = '';
            if (this.state.description) {
                describemsg = this.state.description;
            } else {
                describemsg = (
                    <FormattedMessage
                        id='general_tab.emptyDescription'
                        defaultMessage="Click 'Edit' to add a team description."
                    />
                );
            }
            descriptionSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('general_tab.teamDescription', 'Team Description')}
                    describe={describemsg}
                    updateSection={this.handleUpdateSection}
                    section={'description'}
                />
            );
        }

        let teamIconSection;
        if (this.props.activeSection === 'team_icon') {
            const helpText = (
                <FormattedMarkdownMessage
                    id={'setting_picture.help.team'}
                    defaultMessage='Upload a team icon in BMP, JPG or PNG format.\nSquare images with a solid background color are recommended.'
                />
            );
            teamIconSection = (
                <SettingPicture
                    imageContext='team'
                    title={Utils.localizeMessage('general_tab.teamIcon', 'Team Icon')}
                    src={Utils.imageURLForTeam(team)}
                    file={this.state.teamIconFile}
                    serverError={this.state.serverError}
                    clientError={this.state.clientError}
                    loadingPicture={this.state.loadingIcon}
                    submitActive={this.state.submitActive}
                    updateSection={(e) => {
                        this.updateSection('');
                        e.preventDefault();
                    }}
                    onFileChange={this.updateTeamIcon}
                    onSubmit={this.handleTeamIconSubmit}
                    onRemove={this.handleTeamIconRemove}
                    helpText={helpText}
                />
            );
        } else {
            let minMessage;

            if (team.last_team_icon_update) {
                minMessage = (
                    <FormattedMessage
                        id='general_tab.teamIconLastUpdated'
                        defaultMessage='Image last updated {date}'
                        values={{
                            date: (
                                <FormattedDate
                                    value={new Date(team.last_team_icon_update)}
                                    day='2-digit'
                                    month='short'
                                    year='numeric'
                                />
                            ),
                        }}
                    />
                );
            } else {
                minMessage = Utils.isMobile() ?
                    Utils.localizeMessage('general_tab.teamIconEditHintMobile', 'Click to upload an image') :
                    Utils.localizeMessage('general_tab.teamIconEditHint', 'Click \'Edit\' to upload an image.');
            }

            teamIconSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('general_tab.teamIcon', 'Team Icon')}
                    describe={minMessage}
                    section={'team_icon'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let allowedDomainsSection;

        if (this.props.activeSection === 'allowed_domains') {
            const inputs = [];

            inputs.push(
                <div
                    key='allowedDomainsSetting'
                    className='form-group'
                >
                    <div className='col-sm-12'>
                        <LocalizedInput
                            id='allowedDomains'
                            autoFocus={true}
                            className='form-control'
                            type='text'
                            onChange={this.updateAllowedDomains}
                            value={this.state.allowed_domains}
                            onFocus={Utils.moveCursorToEnd}
                            placeholder={{id: t('general_tab.AllowedDomainsExample'), defaultMessage: 'corp.mattermost.com, mattermost.org'}}
                            aria-label={Utils.localizeMessage('general_tab.allowedDomains.ariaLabel', 'Allowed Domains')}
                        />
                    </div>
                </div>,
            );

            const allowedDomainsInfo = <span>{Utils.localizeMessage('general_tab.AllowedDomainsInfo', 'Users can only join the team if their email matches a specific domain (e.g. "mattermost.org") or list of comma-separated domains (e.g. "corp.mattermost.com, mattermost.org").')}</span>;

            allowedDomainsSection = (
                <SettingItemMax
                    title={Utils.localizeMessage('general_tab.allowedDomains', 'Allow only users with a specific email domain to join this team')}
                    inputs={inputs}
                    submit={this.handleAllowedDomainsSubmit}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.handleUpdateSection}
                    extraInfo={allowedDomainsInfo}
                />
            );
        } else {
            let describemsg = '';
            if (this.state.allowed_domains) {
                describemsg = this.state.allowed_domains;
            } else {
                describemsg = (
                    <FormattedMessage
                        id='general_tab.allowedDomainsEdit'
                        defaultMessage="Click 'Edit' to add an email domain whitelist."
                    />
                );
            }
            allowedDomainsSection = (
                <SettingItemMin
                    title={Utils.localizeMessage('general_tab.allowedDomains', 'allowedDomains')}
                    describe={describemsg}
                    updateSection={this.handleUpdateSection}
                    section={'allowed_domains'}
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
                            id='general_tab.title'
                            defaultMessage='General Settings'
                        />
                    </h4>
                </div>
                <div
                    ref='wrapper'
                    className='user-settings'
                >
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='general_tab.title'
                            defaultMessage='General Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {nameSection}
                    <div className='divider-light'/>
                    {descriptionSection}
                    <div className='divider-light'/>
                    {teamIconSection}
                    {!team.group_constrained &&
                        <>
                            <div className='divider-light'/>
                            {allowedDomainsSection}
                        </>
                    }
                    <div className='divider-light'/>
                    {openInviteSection}
                    {!team.group_constrained &&
                        <>
                            <div className='divider-light'/>
                            {inviteSection}
                        </>
                    }
                    <div className='divider-dark'/>
                </div>
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
