// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {getFullName} from 'mattermost-redux/utils/user_utils';

import SearchChannelWithPermissionsProvider from 'components/suggestion/search_channel_with_permissions_provider.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

import {placeCaretAtEnd} from 'utils/utils.jsx';

export default class AddUserToChannelModal extends React.PureComponent {
    static propTypes = {

        /**
         * Function that's called when modal is closed
         */
        onHide: PropTypes.func.isRequired,

        /**
         * The user that is being added to a channel
         */
        user: PropTypes.object.isRequired,

        /**
         * Object used to determine if the user
         * is a member of a given channel
         */
        channelMembers: PropTypes.object.isRequired,

        actions: PropTypes.shape({

            /**
             * Function to add the user to a channel
             */
            addChannelMember: PropTypes.func.isRequired,

            /**
             * Function to fetch the user's channel membership
             */
            getChannelMember: PropTypes.func.isRequired,

            /**
             * Function passed on to the constructor of the
             * SearchChannelWithPermissionsProvider class to fetch channels
             * based on a search term
             */
            autocompleteChannelsForSearch: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {

            /**
             * Whether or not the modal is visible
             */
            show: true,

            /**
             * Whether or not a request to add the user is in progress
             */
            saving: false,

            /**
             * Whether or not a request to check for the user's channel membership
             * is in progress
             */
            checkingForMembership: false,

            /**
             * The user input in the channel search box
             */
            text: '',

            /**
             * The id for the channel that is selected
             */
            selectedChannelId: null,

            /**
             * An error to display when the add request fails
             */
            submitError: '',
        };
        this.suggestionProviders = [new SearchChannelWithPermissionsProvider(props.actions.autocompleteChannelsForSearch)];
        this.enableChannelProvider();
    }

    enableChannelProvider = () => {
        this.suggestionProviders[0].disableDispatches = false;
    }

    focusTextbox = () => {
        if (this.channelSearchBox == null) {
            return;
        }

        const textbox = this.channelSearchBox.getTextbox();
        if (document.activeElement !== textbox) {
            textbox.focus();
            placeCaretAtEnd(textbox);
        }
    }

    onInputChange = (e) => {
        this.setState({text: e.target.value, selectedChannelId: null});
    }

    onHide = () => {
        this.setState({show: false});
        this.props.onHide();
    }

    setSearchBoxRef = (input) => {
        this.channelSearchBox = input;
        this.focusTextbox();
    }

    handleSubmitError = (error) => {
        if (error) {
            this.setState({submitError: error.message, saving: false});
        }
    }

    didSelectChannel = (selection) => {
        const channel = selection.channel;
        const userId = this.props.user.id;

        this.setState({
            text: channel.display_name,
            selectedChannelId: channel.id,
            checkingForMembership: true,
            submitError: '',
        });

        this.props.actions.getChannelMember(channel.id, userId).then(() => {
            this.setState({checkingForMembership: false});
        });
    }

    handleSubmit = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const channelId = this.state.selectedChannelId;
        const user = this.props.user;

        if (!channelId) {
            return;
        }

        if (this.isUserMemberOfChannel(channelId) || this.state.saving) {
            return;
        }

        this.setState({saving: true});

        this.props.actions.addChannelMember(channelId, user.id).then(({error}) => {
            if (error) {
                this.handleSubmitError(error);
            } else {
                this.onHide();
            }
        });
    }

    isUserMemberOfChannel = (channelId) => {
        const user = this.props.user;
        const memberships = this.props.channelMembers;

        if (!channelId) {
            return false;
        }

        if (!memberships[channelId]) {
            return false;
        }

        return Boolean(memberships[channelId][user.id]);
    }

    render() {
        const user = this.props.user;
        const channelId = this.state.selectedChannelId;
        const targetUserIsMemberOfSelectedChannel = this.isUserMemberOfChannel(channelId);

        let name = getFullName(user);
        if (!name) {
            name = `@${user.username}`;
        }

        let errorMsg;
        if (!this.state.saving) {
            if (this.state.submitError) {
                errorMsg = (
                    <label
                        id='add-user-to-channel-modal__invite-error'
                        className='modal__error has-error control-label'
                    >
                        {this.state.submitError}
                    </label>
                );
            } else if (targetUserIsMemberOfSelectedChannel) {
                errorMsg = (
                    <label
                        id='add-user-to-channel-modal__user-is-member'
                        className='modal__error has-error control-label'
                    >
                        <FormattedMessage
                            id='add_user_to_channel_modal.membershipExistsError'
                            defaultMessage='{name} is already a member of that channel'
                            values={{
                                name,
                            }}
                        />
                    </label>
                );
            }
        }

        const help = (
            <FormattedMessage
                id='add_user_to_channel_modal.help'
                defaultMessage='Type to find a channel. Use ↑↓ to browse, ↵ to select, ESC to dismiss.'
            />
        );

        const content = (
            <SuggestionBox
                ref={this.setSearchBoxRef}
                className='form-control focused'
                onChange={this.onInputChange}
                value={this.state.text}
                onItemSelected={this.didSelectChannel}
                listComponent={SuggestionList}
                maxLength='64'
                providers={this.suggestionProviders}
                listStyle='bottom'
                completeOnTab={false}
                renderDividers={false}
                delayInputUpdate={true}
                openWhenEmpty={false}
            />
        );

        const shouldDisableAddButton = targetUserIsMemberOfSelectedChannel ||
            this.state.checkingForMembership ||
            Boolean(!this.state.selectedChannelId) ||
            this.state.saving;

        return (
            <Modal
                dialogClassName='a11y__modal modal--overflow'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                ref='modal'
                enforceFocus={true}
                role='dialog'
                aria-labelledby='addChannelModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='addChannelModalLabel'
                    >
                        <FormattedMessage
                            id='add_user_to_channel_modal.title'
                            defaultMessage='Add {name} to a Channel'
                            values={{
                                name,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <form
                    role='form'
                    onSubmit={this.handleSubmit}
                >
                    <Modal.Body>
                        <div className='modal__hint'>
                            {help}
                        </div>
                        <div className='pos-relative'>
                            {content}
                        </div>
                        <div>
                            {errorMsg}
                            <br/>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-link'
                            onClick={this.onHide}
                        >
                            <FormattedMessage
                                id='add_user_to_channel_modal.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            type='button'
                            id='add-user-to-channel-modal__add-button'
                            className='btn btn-primary'
                            onClick={this.handleSubmit}
                            disabled={shouldDisableAddButton}
                        >
                            <FormattedMessage
                                id='add_user_to_channel_modal.add'
                                defaultMessage='Add'
                            />
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
/* eslint-enable react/no-string-refs */
