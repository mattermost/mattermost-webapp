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
import {UserProfile} from 'mattermost-redux/types/users';

import ResultView, {ResultState, defaultResultState} from './result_view';
import InviteView, {InviteState, defaultInviteState} from './invite_view';
import {As} from './invite_as';
import {trackEvent} from 'actions/telemetry_actions';

import {isEmail} from 'mattermost-redux/utils/helpers';

type InviteResults = {
    sent: React.ReactNode | React.ReactNodeArray;
    notSent: React.ReactNode | React.ReactNodeArray;
}

type Props = {
    show: boolean;
    inviteToTeamTreatment: InviteToTeamTreatments;
    actions: {
        closeModal: () => void;
        searchChannels: (teamId: string, term: string) => ActionFunc;
        regenerateTeamInviteId: (teamId: string) => void;

        // sendEmailInvitesToTeamGracefully: (teamId: string, emails: string[]) => Promise<{ data: TeamInviteWithError[]; error: ServerError }>;
        searchProfiles: (term: string, options?: Record<string, string>) => ActionFunc;
        sendGuestsInvites: (
            currentTeamId: string,
            channels: Channel[],
            users:  UserProfile[],
            emails: string[],
            message: string,
        ) => any; //Promise<InviteResults>,
        sendMembersInvites: (
            teamId: string,
            users: UserProfile[],
            emails: string[]
        ) => any;
    };
    currentTeam: Team;
    currentChannelName: string;
    invitableChannels: Channel[];
    emailInvitationsEnabled: boolean;
    isAdmin: boolean;
    isCloud: boolean;
    subscriptionStats: any;
    cloudUserLimit: string;
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

    invite = async () => {
        if (this.props.isCloud) {
            trackEvent('cloud_invite_users', 'click_send_invitations', {num_invitations: this.state.invite.usersEmails.length});
        }

        const users = [];
        const emails = [];
        for (const userOrEmail of this.state.invite.usersEmails) {
            if (typeof userOrEmail === 'string' && isEmail(userOrEmail)) {
                emails.push(userOrEmail);
            } else {
                users.push(userOrEmail);
            }
        }
    }

    // onMembersSubmit = async (users, emails, extraText) => {
    //     const invites = await this.props.actions.sendMembersInvites(this.props.currentTeam.id, users, emails);

    //     if (this.props.isCloud) {
    //         trackEvent('cloud_invite_users', 'invitations_sent', {num_invitations_sent: invites.sent});
    //     }

    //     if (extraText !== '') {
    //         invites.notSent.push({
    //             text: extraText,
    //             reason: (
    //                 <FormattedMessage
    //                     id='invitation-modal.confirm.not-valid-user-or-email'
    //                     defaultMessage='Does not match a valid user or email.'
    //                 />
    //             ),
    //         });
    //     }

    //     this.setState({step: STEPS_INVITE_CONFIRM, prevStep: this.state.step, invitesSent: invites.sent, invitesNotSent: invites.notSent, invitesType: InviteTypes.INVITE_MEMBER, hasChanges: false});
    // }

    // onGuestsSubmit = async (users, emails, channels, message, extraUserText, extraChannelText) => {
    //     const invites = await this.props.actions.sendGuestsInvites(
    //         this.props.currentTeam.id,
    //         channels.map((c) => c.id),
    //         users,
    //         emails,
    //         message,
    //     );
    //     if (extraUserText !== '') {
    //         invites.notSent.push({
    //             text: extraUserText,
    //             reason: (
    //                 <FormattedMessage
    //                     id='invitation-modal.confirm.not-valid-user-or-email'
    //                     defaultMessage='Does not match a valid user or email.'
    //                 />
    //             ),
    //         });
    //     }
    //     if (extraChannelText !== '') {
    //         invites.notSent.push({
    //             text: extraChannelText,
    //             reason: (
    //                 <FormattedMessage
    //                     id='invitation-modal.confirm.not-valid-channel'
    //                     defaultMessage='Does not match a valid channel name.'
    //                 />
    //             ),
    //         });
    //     }
    //     this.setState({step: STEPS_INVITE_CONFIRM, prevStep: this.state.step, lastInviteChannels: channels, lastInviteMessage: message, invitesSent: invites.sent, invitesNotSent: invites.notSent, invitesType: InviteTypes.INVITE_GUEST, hasChanges: false});
    // }

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

    debouncedSearchProfiles = debounce((term: string, callback: (users: UserProfile[]) => void) => {
        (this.props.actions.searchProfiles(term) as any).
            then(({data}: {data: any}) => {
                callback(data as unknown as UserProfile[]);
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

    usersLoader = (term: string, callback: (users: UserProfile[]) => undefined | Promise<UserProfile[]>) => {
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

    onChangeUsersEmails = (usersEmails: Array<UserProfile | string>) => {
        this.setState((state: State) => ({
            ...state,
            invite: {
                ...state.invite,
                usersEmails,
            },
        }));
    }

    onUsersInputChange = (usersEmailsSearch: string) => {
        this.setState((state: State) => ({
            ...state,
            invite: {
                ...state.invite,
                usersEmailsSearch,
            },
        }));

        // this.props.onEdit(
        //     this.state.usersAndEmails.length > 0 || usersInputValue,
        // );
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
                usersLoader={this.usersLoader as any}
                emailInvitationsEnabled={this.props.emailInvitationsEnabled}
                onChangeUsersEmails={this.onChangeUsersEmails}
                onUsersInputChange={this.onUsersInputChange}
                isCloud={this.props.isCloud}
                subscriptionStats={this.props.subscriptionStats}
                cloudUserLimit={this.props.cloudUserLimit}
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
