// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {debounce} from 'mattermost-redux/actions/helpers';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {Team} from 'mattermost-redux/types/teams';

import {Channel} from 'mattermost-redux/types/channels';

import ResultView, {ResultState, defaultResultState} from './result_view';
import InviteView, {InviteState, defaultInviteState} from './invite_view';
import {As} from './invite_as';

type Props = {
    show: boolean;
    inviteToTeamTreatment: InviteToTeamTreatments;
    actions: {
        closeModal: () => void;
        searchChannels: (teamId: string, term: string) => ActionFunc;
    };
    currentTeam: Team;
    currentChannelName: string;
    invitableChannels: Channel[];
}

type View = 'invite' | 'result' | 'error'

type State = {
    view: View;
    invite: InviteState;
    result: ResultState;
};

const defaultState: State = deepFreeze({
    view: 'invite',
    invite: defaultInviteState,
    result: defaultResultState,
});

export default class InvitationModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = defaultState;
    }

    handleHide = () => {
        this.props.actions.closeModal();
    }

    handleHidden = () => {
    }

    toggleCustomMessage = () => {
        this.setState((state) => ({
            ...state,
            invite: {
                ...state.invite,
                customMessage: {
                    ...state.invite.customMessage,
                    open: !state.invite.customMessage.open,
                },
            },
        }));
    }

    setCustomMessage = (message: string) => {
        this.setState((state) => ({
            ...state,
            invite: {
                ...state.invite,
                customMessage: {
                    ...state.invite.customMessage,
                    message,
                },
            },
        }));
    }

    setInviteAs = (as: As) => {
        if (this.state.invite.as !== as) {
            this.setState((state) => ({
                ...state,
                invite: {
                    ...this.state.invite,
                    as,
                },
            }));
        }
    }

    invite = () => {
    }

    debouncedSearchChannels = debounce((term) => this.props.actions.searchChannels(this.props.currentTeam.id, term), 150);

    channelsLoader = async (value: string) => {
        if (!value) {
            return this.props.invitableChannels;
        }

        this.debouncedSearchChannels(value);
        return this.props.invitableChannels.filter((channel) => {
            return channel.display_name.toLowerCase().startsWith(value.toLowerCase()) || channel.name.toLowerCase().startsWith(value.toLowerCase());
        });
    }

    onChannelsChange = (channels: Channel[]) => {
        this.setState((state) => ({
            ...state,
            invite: {
                ...state.invite,
                inviteChannels: {
                    ...state.invite.inviteChannels,
                    channels,
                },
            },
        }));
    }
    onChannelsInputChange = (search: string) => {
        this.setState((state) => ({
            ...state,
            invite: {
                ...state.invite,
                inviteChannels: {
                    ...state.invite.inviteChannels,
                    search,
                },
            },
        }));
    }

    render() {
        let view = (
            <InviteView
                setInviteAs={this.setInviteAs}
                inviteToTeamTreatment={this.props.inviteToTeamTreatment}
                invite={this.invite}
                setCustomMessage={this.setCustomMessage}
                channelsLoader={this.channelsLoader}
                toggleCustomMessage={this.toggleCustomMessage}
                currentTeamName={this.props.currentTeam.name}
                onChannelsInputChange={this.onChannelsInputChange}
                onChannelsChange={this.onChannelsChange}
                currentChannelName={this.props.currentChannelName}
                {...this.state.invite}
            />
        );
        if (this.state.view === 'result') {
            view = <ResultView/>;
        }

        return (
            <Modal
                id='invitationModal'
                dialogClassName='a11y__modal'
                show={this.props.show}
                onHide={this.handleHide}
                onExited={this.handleHidden}
                role='dialog'
                aria-labelledby='invitationModalLabel'
            >
                {view}
            </Modal>
        );
    }
}
