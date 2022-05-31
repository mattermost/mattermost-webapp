// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';
import {RelationOneToOne} from '@mattermost/types/utilities';
import {ActionResult} from 'mattermost-redux/types/actions';
import {Channel} from '@mattermost/types/channels';
import {UserProfile} from '@mattermost/types/users';

import {filterProfilesStartingWithTerm, isGuest} from 'mattermost-redux/utils/user_utils';
import {getLongDisplayNameParts, localizeMessage} from 'utils/utils';
import ProfilePicture from 'components/profile_picture';
import MultiSelect, {Value} from 'components/multiselect/multiselect';
import AddIcon from 'components/widgets/icons/fa_add_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import InvitationModal from 'components/invitation_modal';
import ToggleModalButton from 'components/toggle_modal_button';

import Constants, {ModalIdentifiers} from 'utils/constants';

const USERS_PER_PAGE = 50;

type UserProfileValue = Value & UserProfile;

export type Props = {
    profilesNotInCurrentChannel: UserProfileValue[];
    profilesInCurrentChannel: UserProfileValue[];
    profilesNotInCurrentTeam: UserProfileValue[];
    userStatuses: RelationOneToOne<UserProfile, string>;
    onExited: () => void;
    channel: Channel;

    // skipCommit = true used with onAddCallback will result in users not being committed immediately
    skipCommit?: boolean;

    // onAddCallback takes an array of UserProfiles and should set usersToAdd in state of parent component
    onAddCallback?: (userProfiles?: UserProfileValue[]) => void;

    // Dictionaries of userid mapped users to exclude or include from this list
    excludeUsers?: Record<string, UserProfileValue>;
    includeUsers?: Record<string, UserProfileValue>;
    canInviteGuests?: boolean;
    emailInvitationsEnabled?: boolean;
    actions: {
        addUsersToChannel: (channelId: string, userIds: string[]) => Promise<ActionResult>;
        getProfilesNotInChannel: (teamId: string, channelId: string, groupConstrained: boolean, page: number, perPage?: number) => Promise<ActionResult>;
        getProfilesInChannel: (channelId: string, page: number, perPage: number, sort: string, options: {active?: boolean}) => Promise<ActionResult>;
        getTeamStats: (teamId: string) => void;
        loadStatusesForProfilesList: (users: UserProfile[]) => void;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
        closeModal: (modalId: string) => void;
    };
}

type State = {
    values: UserProfileValue[];
    term: string;
    show: boolean;
    saving: boolean;
    loadingUsers: boolean;
    inviteError?: string;
}

export default class ChannelInviteModal extends React.PureComponent<Props, State> {
    private searchTimeoutId = 0;
    private selectedItemRef = React.createRef<HTMLDivElement>();

    public static defaultProps = {
        includeUsers: {},
        excludeUsers: {},
        skipCommit: false,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            values: [],
            term: '',
            show: true,
            saving: false,
            loadingUsers: true,
        } as State;
    }

    private addValue = (value: UserProfileValue): void => {
        const values: UserProfileValue[] = Object.assign([], this.state.values);
        if (values.indexOf(value) === -1) {
            values.push(value);
        }

        this.setState({values});
    };

    public componentDidMount(): void {
        this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, this.props.channel.group_constrained, 0).then(() => {
            this.setUsersLoadingState(false);
        });
        this.props.actions.getProfilesInChannel(this.props.channel.id, 0, USERS_PER_PAGE, '', {active: true});
        this.props.actions.getTeamStats(this.props.channel.team_id);
        this.props.actions.loadStatusesForProfilesList(this.props.profilesNotInCurrentChannel);
        this.props.actions.loadStatusesForProfilesList(this.props.profilesInCurrentChannel);
    }

    public onHide = (): void => {
        this.setState({show: false});
        this.props.actions.loadStatusesForProfilesList(this.props.profilesNotInCurrentChannel);
        this.props.actions.loadStatusesForProfilesList(this.props.profilesInCurrentChannel);
    };

    public handleInviteError = (err: any): void => {
        if (err) {
            this.setState({
                saving: false,
                inviteError: err.message,
            });
        }
    };

    private handleDelete = (values: UserProfileValue[]): void => {
        this.setState({values});
    };

    private setUsersLoadingState = (loadingState: boolean): void => {
        this.setState({
            loadingUsers: loadingState,
        });
    };

    private handlePageChange = (page: number, prevPage: number): void => {
        if (page > prevPage) {
            this.setUsersLoadingState(true);
            this.props.actions.getProfilesNotInChannel(
                this.props.channel.team_id,
                this.props.channel.id,
                this.props.channel.group_constrained,
                page + 1, USERS_PER_PAGE).then(() => this.setUsersLoadingState(false));

            this.props.actions.getProfilesInChannel(this.props.channel.id, page + 1, USERS_PER_PAGE, '', {active: true});
        }
    };

    public handleSubmit = (): void => {
        const {actions, channel} = this.props;

        const userIds = this.state.values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        if (this.props.skipCommit && this.props.onAddCallback) {
            this.props.onAddCallback(this.state.values);
            this.setState({
                saving: false,
                inviteError: undefined,
            });
            this.onHide();
            return;
        }

        this.setState({saving: true});

        actions.addUsersToChannel(channel.id, userIds).then((result: any) => {
            if (result.error) {
                this.handleInviteError(result.error);
            } else {
                this.setState({
                    saving: false,
                    inviteError: undefined,
                });
                this.onHide();
            }
        });
    };

    public search = (searchTerm: string): void => {
        const term = searchTerm.trim();
        clearTimeout(this.searchTimeoutId);
        this.setState({
            term,
        });

        if (term) {
            this.setUsersLoadingState(true);
            this.searchTimeoutId = window.setTimeout(
                async () => {
                    const options = {
                        team_id: this.props.channel.team_id,
                        not_in_channel_id: this.props.channel.id,
                        group_constrained: this.props.channel.group_constrained,
                    };
                    await this.props.actions.searchProfiles(term, options);
                    this.setUsersLoadingState(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS,
            );
        } else {
            return;
        }

        this.searchTimeoutId = window.setTimeout(
            async () => {
                if (!term) {
                    return;
                }

                const options = {
                    team_id: this.props.channel.team_id,
                    not_in_channel_id: this.props.channel.id,
                    group_constrained: this.props.channel.group_constrained,
                };
                await this.props.actions.searchProfiles(term, options);
                this.setUsersLoadingState(false);
            },
            Constants.SEARCH_TIMEOUT_MILLISECONDS,
        );
    };

    private renderAriaLabel = (option: UserProfileValue): string => {
        if (!option) {
            return '';
        }
        return option.username;
    }

    renderOption = (option: UserProfileValue, isSelected: boolean, onAdd: (user: UserProfileValue) => void, onMouseMove: (user: UserProfileValue) => void) => {
        let rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        const ProfilesInGroup = this.props.profilesInCurrentChannel.map((user) => user.id);

        const userMapping: Record<string, string> = {};

        for (let i = 0; i < ProfilesInGroup.length; i++) {
            userMapping[ProfilesInGroup[i]] = 'Already in channel';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? this.selectedItemRef : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
                onMouseMove={() => onMouseMove(option)}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                    status={this.props.userStatuses[option.id]}
                    size='md'
                    username={option.username}
                />

                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        <span>
                            {getLongDisplayNameParts(option).displayName}
                            <span
                                style={{position: 'absolute', right: 20}}
                                className='light'
                            >{userMapping[option.id]}</span>
                        </span>
                        <BotBadge
                            show={Boolean(option.is_bot)}
                            className='badge-popoverlist'
                        />
                        <GuestBadge
                            show={isGuest(option.roles)}
                            className='popoverlist'
                        />
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <AddIcon/>
                    </div>
                </div>
            </div>
        );
    };

    public render = (): JSX.Element => {
        let inviteError = null;
        if (this.state.inviteError) {
            inviteError = (<label className='has-error control-label'>{this.state.inviteError}</label>);
        }

        const header = (
            <h1>
                <FormattedMessage
                    id='channel_invite.addNewMembers'
                    defaultMessage='Add people to {channel}'
                    values={{
                        channel: this.props.channel.display_name,
                    }}
                />
            </h1>
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');
        const buttonSubmitLoadingText = localizeMessage('multiselect.adding', 'Adding...');

        let users = filterProfilesStartingWithTerm(this.props.profilesNotInCurrentChannel.concat(this.props.profilesInCurrentChannel), this.state.term).filter((user) => {
            return user.delete_at === 0 &&
                !this.props.profilesNotInCurrentTeam.includes(user as UserProfileValue) &&
                (this.props.excludeUsers !== undefined && !this.props.excludeUsers[user.id]);
        }).map((user) => user as UserProfileValue);

        if (this.props.includeUsers) {
            const includeUsers = Object.values(this.props.includeUsers);
            users = [...users, ...includeUsers];
        }

        const closeMembersInviteModal = () => {
            this.props.actions.closeModal(ModalIdentifiers.CHANNEL_INVITE);
        };

        const InviteModalLink = ({
            children,
            inviteAsGuest,
        }: {children: React.ReactNode; inviteAsGuest?: boolean}) => {
            return (
                <ToggleModalButton
                    id='inviteGuest'
                    className={`${inviteAsGuest ? 'invite-as-guest' : ''} btn btn-link`}
                    modalId={ModalIdentifiers.INVITATION}
                    dialogType={InvitationModal}
                    dialogProps={{
                        channelToInvite: this.props.channel,
                        initialValue: this.state.term,
                        inviteAsGuest,
                    }}
                    onClick={closeMembersInviteModal}
                >
                    {children}
                </ToggleModalButton>
            );
        };

        const customNoOptionsMessage = (
            <div className='custom-no-options-message'>
                <FormattedMessage
                    id='channel_invite.no_options_message'
                    defaultMessage='No matches found - <InvitationModalLink>Invite them to the team</InvitationModalLink>'
                    values={{
                        InvitationModalLink: (chunks: string) => (
                            <InviteModalLink>
                                {chunks}
                            </InviteModalLink>
                        ),
                    }}
                />
            </div>
        );

        const content = (
            <MultiSelect
                key='addUsersToChannelKey'
                options={users}
                optionRenderer={this.renderOption}
                selectedItemRef={this.selectedItemRef}
                values={this.state.values}
                ariaLabelRenderer={this.renderAriaLabel}
                saveButtonPosition={'bottom'}
                perPage={USERS_PER_PAGE}
                handlePageChange={this.handlePageChange}
                handleInput={this.search}
                handleDelete={this.handleDelete}
                handleAdd={this.addValue}
                handleSubmit={this.handleSubmit}
                handleCancel={closeMembersInviteModal}
                buttonSubmitText={buttonSubmitText}
                buttonSubmitLoadingText={buttonSubmitLoadingText}
                saving={this.state.saving}
                loading={this.state.loadingUsers}
                placeholderText={localizeMessage('multiselect.placeholder', 'Search for people')}
                valueWithImage={true}
                backButtonText={localizeMessage('multiselect.cancel', 'Cancel')}
                backButtonClick={closeMembersInviteModal}
                backButtonClass={'btn-cancel tertiary-button'}
                customNoOptionsMessage={this.props.emailInvitationsEnabled ? customNoOptionsMessage : null}
            />
        );

        const inviteGuestLink = (
            <InviteModalLink inviteAsGuest={true}>
                <FormattedMessage
                    id='channel_invite.invite_guest'
                    defaultMessage='Invite as a Guest'
                />
            </InviteModalLink>
        );

        return (
            <Modal
                id='addUsersToChannelModal'
                dialogClassName='a11y__modal channel-invite'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='channelInviteModalLabel'
            >
                <Modal.Header
                    id='channelInviteModalLabel'
                    closeButton={true}
                />
                <Modal.Body
                    role='application'
                    className='overflow--visible'
                >
                    <div className='channel-invite__header'>
                        {header}
                    </div>
                    {inviteError}
                    <div className='channel-invite__content'>
                        {content}
                        {(this.props.emailInvitationsEnabled && this.props.canInviteGuests) && inviteGuestLink}
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
