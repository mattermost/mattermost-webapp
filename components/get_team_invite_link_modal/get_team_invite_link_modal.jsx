// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ModalStore from 'stores/modal_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {getSiteURL} from 'utils/url.jsx';

import GetLinkModal from 'components/get_link_modal.jsx';

export default class GetTeamInviteLinkModal extends React.PureComponent {
    static propTypes = {

        /**
         * Current team object
         */
        currentTeam: PropTypes.object.isRequired,

        /**
         * Global config object
         */
        config: PropTypes.object.isRequired
    }

    static defaultProps = {
        currentTeam: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
    }

    componentDidMount() {
        ModalStore.addModalListener(Constants.ActionTypes.TOGGLE_GET_TEAM_INVITE_LINK_MODAL, this.handleToggle);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(Constants.ActionTypes.TOGGLE_GET_TEAM_INVITE_LINK_MODAL, this.handleToggle);
    }

    handleToggle = (value) => {
        this.setState({
            show: value
        });
    }

    onHide = () => {
        this.handleToggle(false);
    }

    render() {
        const inviteUrl = getSiteURL() + '/signup_user_complete/?id=' + this.props.currentTeam.invite_id;

        let helpText;
        if (this.props.config.EnableUserCreation === 'true') {
            helpText = Utils.localizeMessage('get_team_invite_link_modal.help', 'Send teammates the link below for them to sign-up to this team site. The Team Invite Link can be shared with multiple teammates as it does not change unless it\'s regenerated in Team Settings by a Team Admin.');
        } else {
            helpText = Utils.localizeMessage('get_team_invite_link_modal.helpDisabled', 'User creation has been disabled for your team. Please ask your team administrator for details.');
        }

        return (
            <GetLinkModal
                show={this.state.show}
                onHide={this.onHide}
                title={Utils.localizeMessage('get_team_invite_link_modal.title', 'Team Invite Link')}
                helpText={helpText}
                link={inviteUrl}
            />
        );
    }
}
