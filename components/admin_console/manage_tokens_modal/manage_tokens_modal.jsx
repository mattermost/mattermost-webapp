// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import * as UserUtils from 'mattermost-redux/utils/user_utils';

import RevokeTokenButton from 'components/admin_console/revoke_token_button';
import LoadingScreen from 'components/loading_screen.jsx';
import Avatar from 'components/widgets/users/avatar.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class ManageTokensModal extends React.PureComponent {
    static propTypes = {

        /**
         * Set to render the modal
         */
        show: PropTypes.bool.isRequired,

        /**
         * The user the roles are being managed for
         */
        user: PropTypes.object,

        /**
         * The personal access tokens for a user, object with token ids as keys
         */
        userAccessTokens: PropTypes.object,

        /**
         * Function called when modal is dismissed
         */
        onModalDismissed: PropTypes.func.isRequired,

        actions: PropTypes.shape({

            /**
             * Function to get a user's access tokens
             */
            getUserAccessTokensForUser: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {error: null};
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        const userId = this.props.user ? this.props.user.id : null;
        const nextUserId = nextProps.user ? nextProps.user.id : null;
        if (nextUserId && nextUserId !== userId) {
            this.props.actions.getUserAccessTokensForUser(nextUserId, 0, 200);
        }
    }

    handleError = (error) => {
        this.setState({
            error,
        });
    }

    renderContents = () => {
        const {user, userAccessTokens} = this.props;

        if (!user) {
            return <LoadingScreen/>;
        }

        let name = UserUtils.getFullName(user);
        if (name) {
            name += ` (@${user.username})`;
        } else {
            name = `@${user.username}`;
        }

        let tokenList;
        if (userAccessTokens) {
            const userAccessTokensList = Object.values(userAccessTokens);

            if (userAccessTokensList.length === 0) {
                tokenList = (
                    <div className='manage-row__empty'>
                        <FormattedMessage
                            id='admin.manage_tokens.userAccessTokensNone'
                            defaultMessage='No personal access tokens.'
                        />
                    </div>
                );
            } else {
                tokenList = userAccessTokensList.map((token) => {
                    return (
                        <div
                            key={token.id}
                            className='manage-teams__team'
                        >
                            <div className='manage-teams__team-name'>
                                <div className='whitespace--nowrap overflow--ellipsis'>
                                    <FormattedMessage
                                        id='admin.manage_tokens.userAccessTokensNameLabel'
                                        defaultMessage='Token Description: '
                                    />
                                    {token.description}
                                </div>
                                <div className='whitespace--nowrap overflow--ellipsis'>
                                    <FormattedMessage
                                        id='admin.manage_tokens.userAccessTokensIdLabel'
                                        defaultMessage='Token ID: '
                                    />
                                    {token.id}
                                </div>
                            </div>
                            <div className='manage-teams__team-actions'>
                                <RevokeTokenButton
                                    tokenId={token.id}
                                    onError={this.handleError}
                                />
                            </div>
                        </div>
                    );
                });
            }
        } else {
            tokenList = <LoadingScreen/>;
        }

        return (
            <div>
                <div className='manage-teams__user'>
                    <Avatar
                        username={user.username}
                        url={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                        size='lg'
                    />
                    <div className='manage-teams__info'>
                        <div className='manage-teams__name'>
                            {name}
                        </div>
                        <div className='manage-teams__email'>
                            {user.email}
                        </div>
                    </div>
                </div>
                <div className='padding-top x2'>
                    <FormattedMarkdownMessage
                        id='admin.manage_tokens.userAccessTokensDescription'
                        defaultMessage='Personal access tokens function similarly to session tokens and can be used by integrations to [interact with this Mattermost server](!https://about.mattermost.com/default-api-authentication). Tokens are disabled if the user is deactivated. Learn more about [personal access tokens](!https://about.mattermost.com/default-user-access-tokens).'
                    />
                </div>
                <div className='manage-teams__teams'>
                    {tokenList}
                </div>
            </div>
        );
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onModalDismissed}
                dialogClassName='a11y__modal manage-teams'
                role='dialog'
                aria-labelledby='manageTokensModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='manageTokensModalLabel'
                    >
                        <FormattedMessage
                            id='admin.manage_tokens.manageTokensTitle'
                            defaultMessage='Manage Personal Access Tokens'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderContents()}
                    {this.state.error}
                </Modal.Body>
            </Modal>
        );
    }
}
