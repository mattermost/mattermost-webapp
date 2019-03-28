// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal.jsx';
import SaveButton from 'components/save_button.jsx';
import WarningIcon from 'components/icon/warning_icon';
import * as Utils from 'utils/utils.jsx';

export default class Bot extends React.PureComponent {
    static propTypes = {

        /**
        *  Bot that we are displaying
        */
        bot: PropTypes.object.isRequired,

        /**
        * Owner of the bot we are displaying
        */
        owner: PropTypes.object,

        /**
        * The access tokens of the bot user
        */
        accessTokens: PropTypes.object.isRequired,

        /**
        * String used for filtering bot items
        */
        filter: PropTypes.string,

        actions: PropTypes.shape({

            /**
            * Disable a bot
            */
            disableBot: PropTypes.func.isRequired,

            /**
            * Enable a bot
            */
            enableBot: PropTypes.func.isRequired,

            /**
            * Access token managment
            */
            createUserAccessToken: PropTypes.func.isRequired,
            revokeUserAccessToken: PropTypes.func.isRequired,
            enableUserAccessToken: PropTypes.func.isRequired,
            disableUserAccessToken: PropTypes.func.isRequired,
        }),

        /**
        *  Only used for routing since backstage is team based.
        */
        team: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            confirmingId: '',
            creatingTokenState: 'CLOSED',
            token: {},
            error: '',
        };
    }

    enableBot = () => {
        this.props.actions.enableBot(this.props.bot.user_id);
    }

    disableBot = () => {
        this.props.actions.disableBot(this.props.bot.user_id);
    }

    enableUserAccessToken = (id) => {
        this.props.actions.enableUserAccessToken(id);
    }

    disableUserAccessToken = (id) => {
        this.props.actions.disableUserAccessToken(id);
    }

    confirmRevokeToken = (id) => {
        this.setState({confirmingId: id});
    }

    revokeTokenConfirmed = () => {
        this.props.actions.revokeUserAccessToken(this.state.confirmingId);
        this.closeConfirm();
    }

    closeConfirm = () => {
        this.setState({confirmingId: ''});
    }

    openCreateToken = () => {
        this.setState({
            creatingTokenState: 'OPEN',
            token: {
                description: '',
            },
        });
    }

    closeCreateToken = () => {
        this.setState({
            creatingTokenState: 'CLOSED',
            token: {
                description: '',
            },
        });
    }

    handleUpdateDescription = (e) => {
        this.setState({
            token: Object.assign({}, this.state.token, {description: e.target.value}),
        });
    }

    handleCreateToken = async (e) => {
        e.preventDefault();

        if (this.state.token.description === '') {
            this.setState({error: (
                <FormattedMessage
                    id='bot.token.error.description'
                    defaultMessage='Please enter a description.'
                />
            )});
            return;
        }

        const {data, error} = await this.props.actions.createUserAccessToken(this.props.bot.user_id, this.state.token.description);
        if (data) {
            this.setState({creatingTokenState: 'CREATED', token: data});
        } else if (error) {
            this.setState({error: error.message});
        }
    }

    render() {
        const username = this.props.bot.username || '';
        const description = this.props.bot.description || '';
        const displayName = this.props.bot.display_name || '';

        let ownerUsername = 'plugin';
        if (this.props.owner && this.props.owner.username) {
            ownerUsername = this.props.owner.username;
        }

        const filter = this.props.filter ? this.props.filter.toLowerCase() : '';
        if (filter &&
            username.toLowerCase().indexOf(filter) === -1 &&
            displayName.toLowerCase().indexOf(filter) === -1 &&
            description.toLowerCase().indexOf(filter) === -1 &&
            ownerUsername.toLowerCase().indexOf(filter) === -1) {
            return null;
        }

        const tokenList = [];
        Object.values(this.props.accessTokens).forEach((token) => {
            let activeLink;
            let disableClass = '';
            let disabledText;

            if (token.is_active) {
                activeLink = (
                    <a
                        name={token.id + '_deactivate'}
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            this.disableUserAccessToken(token.id);
                        }}
                    >
                        <FormattedMessage
                            id='user.settings.tokens.deactivate'
                            defaultMessage='Disable'
                        />
                    </a>);
            } else {
                disableClass = 'light';
                disabledText = (
                    <span className='margin-right light'>
                        <FormattedMessage
                            id='user.settings.tokens.deactivatedWarning'
                            defaultMessage='(Disabled)'
                        />
                    </span>
                );
                activeLink = (
                    <a
                        name={token.id + '_activate'}
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            this.enableUserAccessToken(token.id);
                        }}
                    >
                        <FormattedMessage
                            id='user.settings.tokens.activate'
                            defaultMessage='Enable'
                        />
                    </a>
                );
            }

            tokenList.push(
                <div
                    key={token.id}
                    className='bot-list__item'
                >
                    <div className='item-details__row d-flex justify-content-between'>
                        <div className={disableClass}>
                            <div className='whitespace--nowrap overflow--ellipsis'>
                                <b>
                                    <FormattedMessage
                                        id='user.settings.tokens.tokenDesc'
                                        defaultMessage='Token Description: '
                                    />
                                </b>
                                {token.description}
                            </div>
                            <div className='setting-box__token-id whitespace--nowrap overflow--ellipsis'>
                                <b>
                                    <FormattedMessage
                                        id='user.settings.tokens.tokenId'
                                        defaultMessage='Token ID: '
                                    />
                                </b>
                                {token.id}
                            </div>
                        </div>
                        <div>
                            {disabledText}
                            {activeLink}
                            {' - '}
                            <a
                                name={token.id + '_delete'}
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.confirmRevokeToken(token.id);
                                }}
                            >
                                <FormattedMessage
                                    id='user.settings.tokens.delete'
                                    defaultMessage='Delete'
                                />
                            </a>
                        </div>
                    </div>
                </div>
            );
        });

        let options = (
            <div className='item-actions'>
                <button
                    id='createToken'
                    className='style--none color--link'
                    onClick={this.openCreateToken}
                >
                    <FormattedMessage
                        id='bot.manage.create_token'
                        defaultMessage='Create New Token'
                    />
                </button>
                {' - '}
                <Link to={`/${this.props.team.name}/integrations/bots/edit?id=${this.props.bot.user_id}`}>
                    <FormattedMessage
                        id='bots.manage.edit'
                        defaultMessage='Edit'
                    />
                </Link>
                {' - '}
                <button
                    className='style--none color--link'
                    onClick={this.disableBot}
                >
                    <FormattedMessage
                        id='bot.manage.disable'
                        defaultMessage='Disable'
                    />
                </button>
            </div>
        );
        if (this.props.bot.delete_at !== 0) {
            options = (
                <div className='item-actions'>
                    <button
                        className='style--none color--link'
                        onClick={this.enableBot}
                    >
                        <FormattedMessage
                            id='bot.manage.enable'
                            defaultMessage='Enable'
                        />
                    </button>
                </div>
            );
        }

        if (this.state.creatingTokenState === 'OPEN') {
            tokenList.push(
                <div
                    key={'create'}
                    className='bot-list__item'
                >
                    <div key={'create'}>
                        <form
                            className='form-horizontal'
                            onSubmit={this.handleCreateToken}
                        >
                            <div className='row'>
                                <label className='col-sm-auto control-label'>
                                    <FormattedMessage
                                        id='user.settings.tokens.name'
                                        defaultMessage='Token Description: '
                                    />
                                </label>
                                <div className='col-sm-4'>
                                    <input
                                        autoFocus={true}
                                        className='form-control form-sm'
                                        type='text'
                                        maxLength={64}
                                        value={this.state.token.description}
                                        onChange={this.handleUpdateDescription}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='padding-top padding-bottom'>
                                    <FormattedMessage
                                        id='user.settings.tokens.nameHelp'
                                        defaultMessage='Enter a description for your token to remember what it does.'
                                    />
                                </div>
                                <label
                                    id='clientError'
                                    className='has-error is-empty'
                                >
                                    {this.state.error}
                                </label>
                                <div className='margin-top'>
                                    <SaveButton
                                        btnClass='btn-sm btn-primary'
                                        savingMessage={
                                            <FormattedMessage
                                                id='user.settings.tokens.save'
                                                defaultMessage='Save'
                                            />
                                        }
                                        saving={false}
                                    />
                                    <button
                                        className='btn btn-sm btn-link'
                                        onClick={this.closeCreateToken}
                                    >
                                        <FormattedMessage
                                            id='user.settings.tokens.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            );
        } else if (this.state.creatingTokenState === 'CREATED') {
            tokenList.push(
                <div
                    key={'created'}
                    className='bot-list__item alert alert-warning'
                >
                    <div className='margin-bottom'>
                        <WarningIcon additionalClassName='margin-right'/>
                        <FormattedMessage
                            id='user.settings.tokens.copy'
                            defaultMessage="Please copy the access token below. You won't be able to see it again!"
                        />
                    </div>
                    <div className='whitespace--nowrap overflow--ellipsis'>
                        <FormattedMessage
                            id='user.settings.tokens.name'
                            defaultMessage='Token Description: '
                        />
                        {this.state.token.description}
                    </div>
                    <div className='whitespace--nowrap overflow--ellipsis'>
                        <FormattedMessage
                            id='user.settings.tokens.id'
                            defaultMessage='Token ID: '
                        />
                        {this.state.token.id}
                    </div>
                    <strong className='word-break--all'>
                        <FormattedMessage
                            id='user.settings.tokens.token'
                            defaultMessage='Access Token: '
                        />
                        {this.state.token.token}
                    </strong>
                    <div className='margin-top'>
                        <button
                            className='btn btn-sm btn-primary'
                            onClick={this.closeCreateToken}
                        >
                            <FormattedMessage
                                id='bot.create_token.close'
                                defaultMessage='Close'
                            />
                        </button>
                    </div>
                </div>
            );
        }

        const imageURL = Utils.imageURLForUser(this.props.bot.user_id);

        return (
            <div className='backstage-list__item'>
                <div className={'bot-list-img-container'}>
                    <img
                        className={'bot-list-img'}
                        alt={'bot image'}
                        src={imageURL}
                    />
                </div>
                <div className='item-details'>
                    <div className='item-details__row d-flex justify-content-between'>
                        <strong className='item-details__name'>
                            {displayName + ' (@' + username + ')'}
                        </strong>
                        {options}
                    </div>
                    <div className='bot-details__description'>
                        {description}
                    </div>
                    <div className='light small'>
                        <FormattedMessage
                            id='bots.managed_by'
                            defaultMessage='Managed by '
                        />
                        {ownerUsername}
                    </div>
                    <div className='bot-list is-empty'>
                        {tokenList}
                    </div>
                </div>
                <ConfirmModal
                    title={
                        <FormattedMessage
                            id='bots.token.delete'
                            defaultMessage='Delete Token'
                        />
                    }
                    message={
                        <FormattedMessage
                            id='bots.token.confirm_text'
                            defaultMessage='Are you sure you want to delete the token?'
                        />
                    }
                    confirmButtonText={
                        <FormattedMessage
                            id='bots.token.confirm'
                            defaultMessage='Delete'
                        />
                    }
                    show={this.state.confirmingId !== ''}
                    onConfirm={this.revokeTokenConfirmed}
                    onCancel={this.closeConfirm}
                />
            </div>
        );
    }
}
