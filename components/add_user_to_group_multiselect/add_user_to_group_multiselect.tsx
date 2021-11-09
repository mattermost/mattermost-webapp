// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';
import {Dictionary, RelationOneToOne} from 'mattermost-redux/types/utilities';
import {ActionResult} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {filterProfilesStartingWithTerm, isGuest} from 'mattermost-redux/utils/user_utils';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture';
import MultiSelect, {Value} from 'components/multiselect/multiselect';
import AddIcon from 'components/widgets/icons/fa_add_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';

import Constants from 'utils/constants';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

type UserProfileValue = Value & UserProfile;

export type Props = {
    multilSelectKey: string;
    userStatuses: RelationOneToOne<UserProfile, string>;
    focusOnLoad?: boolean;

    // Used if we are adding new members to an existing group
    groupId?: string;

    // skipCommit = true used with onAddCallback will result in users not being committed immediately
    skipCommit?: boolean;

    // onAddCallback takes an array of UserProfiles and should set usersToAdd in state of parent component
    onAddCallback?: (userProfiles?: UserProfileValue[]) => void;

    // These are the optinoal search parameters
    searchOptions?: any;

    // Dictionaries of userid mapped users to exclude or include from this list
    excludeUsers?: Dictionary<UserProfileValue>;
    includeUsers?: Dictionary<UserProfileValue>;

    profiles: UserProfileValue[];

    actions: {
        getProfiles: (page?: number, perPage?: number) => Promise<ActionResult>;
        getProfilesNotInGroup: (groupId: string, page?: number, perPage?: number) => Promise<ActionResult>;
        loadStatusesForProfilesList: (users: UserProfile[]) => void;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
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

export default class AddUserToGroupMultiSelect extends React.PureComponent<Props, State> {
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
        if (this.props.groupId) {
            this.props.actions.getProfilesNotInGroup(this.props.groupId).then(() => {
                this.setUsersLoadingState(false);
            });
        } else {
            this.props.actions.getProfiles().then(() => {
                this.setUsersLoadingState(false);
            });
        }

        this.props.actions.loadStatusesForProfilesList(this.props.profiles);
    }

    public onHide = (): void => {
        this.setState({show: false});
        this.props.actions.loadStatusesForProfilesList(this.props.profiles);
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
            if (this.props.groupId) {
                this.props.actions.getProfilesNotInGroup(this.props.groupId, page + 1, USERS_PER_PAGE).then(() => {
                    this.setUsersLoadingState(false);
                });
            } else {
                this.props.actions.getProfiles(page + 1, USERS_PER_PAGE).then(() => {
                    this.setUsersLoadingState(false);
                });
            }
        }
    };

    public handleSubmit = (): void => {
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

        // this.setState({saving: true});

        // actions.addUsersToChannel(channel.id, userIds).then((result: any) => {
        //     if (result.error) {
        //         this.handleInviteError(result.error);
        //     } else {
        //         this.setState({
        //             saving: false,
        //             inviteError: undefined,
        //         });
        //         this.onHide();
        //     }
        // });
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
                    await this.props.actions.searchProfiles(term, this.props.searchOptions);
                    this.setUsersLoadingState(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS,
            );
        } else {
            return;
        }
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
                        {displayEntireNameForUser(option)}
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

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');
        const buttonSubmitLoadingText = localizeMessage('multiselect.adding', 'Adding...');

        let users = filterProfilesStartingWithTerm(this.props.profiles, this.state.term).filter((user) => {
            return user.delete_at === 0 &&
                (this.props.excludeUsers !== undefined && !this.props.excludeUsers[user.id]);
        }).map((user) => user as UserProfileValue);

        if (this.props.includeUsers) {
            const includeUsers = Object.values(this.props.includeUsers);
            users = [...users, ...includeUsers];
        }

        return (
            <MultiSelect
                key={this.props.multilSelectKey}
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
                maxValues={MAX_SELECTABLE_VALUES}
                buttonSubmitText={buttonSubmitText}
                buttonSubmitLoadingText={buttonSubmitLoadingText}
                saving={this.state.saving}
                loading={this.state.loadingUsers}
                placeholderText={localizeMessage('multiselect.placeholder', 'Search for people')}
                valueWithImage={true}
                focusOnLoad={this.props.focusOnLoad}
            />
        );
    }
}
