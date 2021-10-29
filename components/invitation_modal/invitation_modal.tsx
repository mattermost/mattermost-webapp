// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {debounce} from 'mattermost-redux/actions/helpers';
import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import {Team} from 'mattermost-redux/types/teams';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';


import ResultView, {ResultState, defaultResultState} from './result_view';
import InviteView, {InviteState, defaultInviteState} from './invite_view';
import {As} from './invite_as';
import {EmailInvite} from 'components/widgets/inputs/users_emails_input';

type Props = {
    show: boolean;
    inviteToTeamTreatment: InviteToTeamTreatments;
    actions: {
        closeModal: () => void;
        searchChannels: (teamId: string, term: string) => ActionFunc;
        regenerateTeamInviteId: (teamId: string) => void;
        // sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{ data: TeamInviteWithError[]; error: ServerError }>;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
    };
    currentTeam: Team;
    currentChannelName: string;
    invitableChannels: Channel[];
    isAdmin: boolean;
}

type View = 'invite' | 'result' | 'error'

type State = {
    view: View;
    invite: InviteState;
    result: ResultState;
    termWithoutResults: string | null;
};

const defaultState: State = deepFreeze({
    view: 'invite',
    termWithoutResults: null,
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

    debouncedSearchProfiles = debounce((term:string, callback: (users: Array<UserProfile>) => void) => {
        this.props.actions.searchProfiles(term, null)
        .then(({data}) => {
            callback(data as unknown as Array<UserProfile>);
            if (data.length === 0) {
                this.setState({termWithoutResults: term});
            } else {
                this.setState({termWithoutResults: null});
            }
        }).
            catch(() => {
            callback([]);
        });
    }, 150);

    usersLoader = (term: string, callback: (users: Array<UserProfile>) => void) => {
        if (
            this.state.termWithoutResults &&
            term.startsWith(this.state.termWithoutResults)
        ) {
            callback([]);
            return;
        }
        try {
            this.debouncedSearchProfiles(term, callback);
        } catch (error) {
            callback([]);
        }
    };

    onChangeUsersEmails = (usersEmails: Array<UserProfile | EmailInvite>) => {
        this.setState((state: State) => ({
            ...state,
            invite: {
                ...state.invite,
                usersEmails,
            }
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
                regenerateTeamInviteId={this.props.actions.regenerateTeamInviteId}
                currentTeam={this.props.currentTeam}
                onChannelsInputChange={this.onChannelsInputChange}
                onChannelsChange={this.onChannelsChange}
                currentChannelName={this.props.currentChannelName}
                isAdmin={this.props.isAdmin}
                usersLoader={this.usersLoader} 
                onChangeUsersEmails={this.onChangeUsersEmails}
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
