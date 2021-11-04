// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

import {injectIntl, IntlShape} from 'react-intl';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {debounce} from 'mattermost-redux/actions/helpers';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {SubscriptionStats} from 'mattermost-redux/types/cloud';

import {Team} from 'mattermost-redux/types/teams';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {trackEvent} from 'actions/telemetry_actions';

import {isEmail} from 'mattermost-redux/utils/helpers';

import ResultView, {ResultState, defaultResultState, InviteResults} from './result_view';
import InviteView, {InviteState, defaultInviteState} from './invite_view';
import {As} from './invite_as';

import './invitation_modal.scss';

type Props = {
    show: boolean;
    inviteToTeamTreatment: InviteToTeamTreatments;
    actions: {
        closeModal: () => void;
        searchChannels: (teamId: string, term: string) => ActionFunc;
        regenerateTeamInviteId: (teamId: string) => void;

        searchProfiles: (term: string, options?: Record<string, string>) => ActionFunc;
        sendGuestsInvites: (
            currentTeamId: string,
            channels: Channel[],
            users: UserProfile[],
            emails: string[],
            message: string,
        ) => any;
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
    subscriptionStats?: SubscriptionStats | null;
    cloudUserLimit: string;
    intl: IntlShape;
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

class InvitationModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = defaultState;
    }

    handleHide = () => {
        this.props.actions.closeModal();
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
        const inviteAs = this.state.invite.as;
        if (inviteAs === 'member' && this.props.isCloud) {
            trackEvent('cloud_invite_users', 'click_send_invitations', {num_invitations: this.state.invite.usersEmails.length});
        }

        const users: UserProfile[] = [];
        const emails: string[] = [];
        for (const userOrEmail of this.state.invite.usersEmails) {
            if (typeof userOrEmail === 'string' && isEmail(userOrEmail)) {
                emails.push(userOrEmail);
            } else if (typeof userOrEmail !== 'string') {
                users.push(userOrEmail);
            }
        }
        let invites: InviteResults = {notSent: [], sent: []};
        if (inviteAs === 'member') {
            invites = await this.props.actions.sendMembersInvites(this.props.currentTeam.id, users, emails);
        } else if (inviteAs === 'guest') {
            invites = await this.props.actions.sendGuestsInvites(
                this.props.currentTeam.id,
                this.state.invite.inviteChannels.channels,
                users,
                emails,
                this.state.invite.customMessage.open ? this.state.invite.customMessage.message : '',
            );
        }

        if (this.state.invite.usersEmailsSearch !== '') {
            invites.notSent.push({
                text: this.state.invite.usersEmailsSearch,
                reason: this.props.intl.formatMessage({
                    id: 'invitation-modal.confirm.not-valid-user-or-email',
                    defaultMessage: 'Does not match a valid user or email.',
                }),
            });
        }

        if (inviteAs === 'guest' && this.state.invite.inviteChannels.search !== '') {
            invites.notSent.push({
                text: this.state.invite.inviteChannels.search,
                reason: this.props.intl.formatMessage({
                    id: 'invitation-modal.confirm.not-valid-channel',
                    defaultMessage: 'Does not match a valid channel name.',
                }),
            });
        }

        this.setState((state: State) => ({
            view: 'result',
            result: {
                ...state.result,
                sent: invites.sent,
                notSent: invites.notSent,
            },
        }));
    }

    inviteMore = () => {
        this.setState((state: State) => ({
            view: 'invite',
            invite: {
                ...defaultInviteState,
                as: state.invite.as,
            },
            result: defaultResultState,
            termWithoutResults: null,
        }));
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
    }

    getBackdrop = () => {
        // 'static' means backdrop clicks do not close
        // true means backdrop clicks do close
        // false means no backdrop
        if (this.state.view === 'result') {
            return true;
        }

        const emptyInvites = this.state.invite.usersEmails.length === 0 && this.state.invite.usersEmailsSearch === '';
        if (this.state.invite.as === 'member' && !emptyInvites) {
            return 'static';
        } else if (this.state.invite.as === 'guest') {
            if (this.state.invite.inviteChannels.channels.length !== 0 ||
                this.state.invite.inviteChannels.search !== '' ||
                    !emptyInvites
            ) {
                return 'static';
            }
        }
        return true;
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
                headerClass='InvitationModal__header'
                footerClass='InvitationModal__footer'
                {...this.state.invite}
            />
        );
        if (this.state.view === 'result') {
            view = (
                <ResultView
                    invitedAs={this.state.invite.as}
                    currentTeamName={this.props.currentTeam.name}
                    onDone={this.handleHide}
                    inviteMore={this.inviteMore}
                    headerClass='InvitationModal__header'
                    footerClass='InvitationModal__footer'
                    {...this.state.result}
                />
            );
        }

        return (
            <Modal
                id='invitationModal'
                dialogClassName='a11y__modal'
                className='InvitationModal'
                show={this.props.show}
                onHide={this.handleHide}
                role='dialog'
                backdrop={this.getBackdrop()}
                aria-labelledby='invitationModalLabel'
            >
                {view}
            </Modal>
        );
    }
}

export default injectIntl(InvitationModal);
