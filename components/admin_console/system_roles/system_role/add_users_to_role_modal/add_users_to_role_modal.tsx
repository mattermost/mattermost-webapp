
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {Role} from 'mattermost-redux/types/roles';

import {filterProfilesMatchingTerm, profileListToMap} from 'mattermost-redux/utils/user_utils';
import {filterProfiles} from 'mattermost-redux/selectors/entities/users';

import {Client4} from 'mattermost-redux/client';

import {displayEntireNameForUser, localizeMessage, isGuest} from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import MultiSelect, {Value} from 'components/multiselect/multiselect';
import AddIcon from 'components/widgets/icons/fa_add_icon';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

type UserProfileValue = Value & UserProfile;

type Props = {
    role: Role;
    users: UserProfile[];
    excludeUsers: { [userId: string]: UserProfile };
    includeUsers: { [userId: string]: UserProfile };
    onAddCallback: (users: UserProfile[]) => void;
    onHide?: () => void;

    actions: {
        getProfiles: (page: number, perPage?: number, options?: Record<string, any>) => Promise<{ data: UserProfile[] }>;
        searchProfiles: (term: string, options?: Record<string, any>) => Promise<{ data: UserProfile[] }>;
    };
}

type State = {
    searchResults: UserProfile[];
    values: UserProfileValue[];
    show: boolean;
    saving: boolean;
    addError: null;
    loading: boolean;
    term: string;
}

function searchUsersToAdd(users: Dictionary<UserProfile>, term: string): Dictionary<UserProfile> {
    const profiles = filterProfilesMatchingTerm(Object.keys(users).map((key) => users[key]), term);
    const filteredProfilesMap = filterProfiles(profileListToMap(profiles), {});

    return filteredProfilesMap;
}

export default class AddUsersToRoleModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            searchResults: [],
            values: [],
            show: true,
            saving: false,
            addError: null,
            loading: true,
            term: '',
        };
    }

    public componentDidMount = async () => {
        await this.props.actions.getProfiles(0, USERS_PER_PAGE * 2, {roles: ['system_user']});
        this.setUsersLoadingState(false);
    }

    private setUsersLoadingState = (loading: boolean) => {
        this.setState({loading});
    }

    public search = async (term: string) => {
        this.setUsersLoadingState(true);
        let searchResults: UserProfile[] = [];
        const search = term !== '';
        if (search) {
            const {data} = await this.props.actions.searchProfiles(term, {replace: true, roles: ['system_user']});
            searchResults = data;
        } else {
            await this.props.actions.getProfiles(0, USERS_PER_PAGE * 2, {roles: ['system_user']});
        }
        this.setState({loading: false, searchResults, term});
    }

    public handleHide = () => {
        this.setState({show: false});
    }

    private handleExit = () => {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    private renderOption = (option: UserProfileValue, isSelected: boolean, onAdd: (user: UserProfileValue) => void, onMouseMove: (user: UserProfileValue) => void) => {
        let rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
                onMouseMove={() => onMouseMove(option)}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                    size='md'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {displayEntireNameForUser(option)}
                        <BotBadge
                            show={Boolean(option.is_bot)}
                            className='badge-popoverlist'
                        />
                        <GuestBadge
                            show={isGuest(option)}
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
    }

    private renderValue = (value: { data: UserProfileValue }): string => {
        return value.data?.username || '';
    }

    private renderAriaLabel = (option: UserProfileValue): string => {
        return option?.username || '';
    }

    private handleAdd = (value: UserProfileValue) => {
        const values: UserProfileValue[] = [...this.state.values];
        if (!values.includes(value)) {
            values.push(value);
        }
        this.setState({values});
    }

    private handleDelete = (values: UserProfileValue[]) => {
        this.setState({values});
    }

    private handlePageChange = (page: number, prevPage: number) => {
        if (page > prevPage) {
            const needMoreUsers = (this.props.users.length / USERS_PER_PAGE) <= page + 1;
            this.setUsersLoadingState(needMoreUsers);
            this.props.actions.getProfiles(page, USERS_PER_PAGE * 2, {roles: ['system_user']}).
                then(() => this.setUsersLoadingState(false));
        }
    };

    private handleSubmit = () => {
        this.props.onAddCallback(this.state.values);
        this.handleHide();
    }

    public render = (): JSX.Element => {
        const numRemainingText = (
            <div id='numPeopleRemaining'>
                <FormattedMessage
                    id='multiselect.numPeopleRemaining'
                    defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                    values={{
                        num: MAX_SELECTABLE_VALUES - this.state.values.length,
                    }}
                />
            </div>
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');
        const buttonSubmitLoadingText = localizeMessage('multiselect.adding', 'Adding...');

        let addError = null;
        if (this.state.addError) {
            addError = (<div className='has-error col-sm-12'><label className='control-label font-weight--normal'>{this.state.addError}</label></div>);
        }

        let usersToDisplay: UserProfile[] = [];
        usersToDisplay = this.state.term ? this.state.searchResults : this.props.users;
        if (this.props.excludeUsers) {
            const hasUser = (user: UserProfile) => !this.props.excludeUsers[user.id];
            usersToDisplay = usersToDisplay.filter(hasUser);
        }

        if (this.props.includeUsers) {
            let {includeUsers} = this.props;
            if (this.state.term) {
                includeUsers = searchUsersToAdd(includeUsers, this.state.term);
            }
            usersToDisplay = [...usersToDisplay, ...Object.values(includeUsers)];
        }

        const options = usersToDisplay.map((user) => {
            return {label: user.username, value: user.id, ...user};
        });

        return (
            <Modal
                id='addUsersToRoleModal'
                dialogClassName={'a11y__modal more-modal more-direct-channels'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title componentClass='h1'>
                        <FormattedMessage
                            id='add_users_to_role.title'
                            defaultMessage='Add users to {roleName}'
                            values={{
                                roleName: (
                                    <strong>{this.props.role.name}</strong>
                                ),
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addError}
                    <MultiSelect
                        key='addUsersToRoleKey'
                        options={options}
                        optionRenderer={this.renderOption}
                        ariaLabelRenderer={this.renderAriaLabel}
                        values={this.state.values}
                        valueRenderer={this.renderValue}
                        perPage={USERS_PER_PAGE}
                        handlePageChange={this.handlePageChange}
                        handleInput={this.search}
                        handleDelete={this.handleDelete}
                        handleAdd={this.handleAdd}
                        handleSubmit={this.handleSubmit}
                        maxValues={MAX_SELECTABLE_VALUES}
                        numRemainingText={numRemainingText}
                        buttonSubmitText={buttonSubmitText}
                        buttonSubmitLoadingText={buttonSubmitLoadingText}
                        saving={this.state.saving}
                        loading={this.state.loading}
                        placeholderText={localizeMessage('multiselect.placeholder', 'Search and add members')}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
