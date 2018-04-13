// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import {searchProfiles, searchProfilesInCurrentTeam} from 'mattermost-redux/selectors/entities/users';

import {browserHistory} from 'utils/browser_history';
import {openDirectChannelToUser, openGroupChannelToUsers} from 'actions/channel_actions.jsx';
import {searchUsers} from 'actions/user_actions.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';
import MultiSelect from 'components/multiselect/multiselect.jsx';
import ProfilePicture from 'components/profile_picture.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = Constants.MAX_USERS_IN_GM - 1;

export default class MoreDirectChannels extends React.Component {
    static propTypes = {

        /*
         * Current user's ID
         */
        currentUserId: PropTypes.string.isRequired,

        /*
         * List of current channel members of existing channel
         */
        currentChannelMembers: PropTypes.arrayOf(PropTypes.object),

        /*
         * Whether the modal is for existing channel or not
         */
        isExistingChannel: PropTypes.bool.isRequired,

        /*
         * The mode by which direct messages are restricted, if at all.
         */
        restrictDirectMessage: PropTypes.string,

        /*
         * Function to call on modal dismissed
         */
        onModalDismissed: PropTypes.func,

        /**
         * Function to call on modal hide
         */
        onHide: PropTypes.func,

        actions: PropTypes.shape({

            /**
             * Function to get profiles
             */
            getProfiles: PropTypes.func.isRequired,

            /**
             * Function to get profiles in team
             */
            getProfilesInTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.handleHide = this.handleHide.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.search = this.search.bind(this);
        this.addValue = this.addValue.bind(this);

        this.searchTimeoutId = 0;
        this.term = '';
        this.listType = this.props.restrictDirectMessage;

        const values = [];

        if (props.currentChannelMembers) {
            for (let i = 0; i < props.currentChannelMembers.length; i++) {
                const user = Object.assign({}, props.currentChannelMembers[i]);

                if (user.id === props.currentUserId) {
                    continue;
                }

                values.push(user);
            }
        }

        this.state = {
            users: null,
            values,
            show: true,
            search: false,
            saving: false,
            loadingUsers: true,
        };
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onChange);
        UserStore.addInTeamChangeListener(this.onChange);
        UserStore.addStatusesChangeListener(this.onChange);
        this.getUserProfiles();
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onChange);
        UserStore.removeInTeamChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
    }

    handleHide() {
        this.setState({show: false});
    }

    setUsersLoadingState = (loadingState) => {
        this.setState({
            loadingUsers: loadingState,
        });
    }

    handleExit() {
        if (this.exitToChannel) {
            browserHistory.push(this.exitToChannel);
        }

        if (this.props.onModalDismissed) {
            this.props.onModalDismissed();
        }

        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    handleSubmit(values = this.state.values) {
        if (this.state.saving) {
            return;
        }

        const userIds = values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        this.setState({saving: true});

        const success = (channel) => {
            // Due to how react-overlays Modal handles focus, we delay pushing
            // the new channel information until the modal is fully exited.
            // The channel information will be pushed in `handleExit`
            this.exitToChannel = TeamStore.getCurrentTeamRelativeUrl() + '/channels/' + channel.name;
            this.setState({saving: false});
            this.handleHide();
        };

        const error = () => {
            this.setState({saving: false});
        };

        if (userIds.length === 1) {
            openDirectChannelToUser(userIds[0], success, error);
        } else {
            openGroupChannelToUsers(userIds, success, error);
        }
    }

    addValue(value) {
        const values = Object.assign([], this.state.values);

        if (values.indexOf(value) === -1) {
            values.push(value);
        }

        this.setState({values});
    }

    onChange() {
        let users;

        if (this.term) {
            if (this.listType === 'any') {
                users = Object.assign([], searchProfiles(store.getState(), this.term, false));
            } else {
                users = Object.assign([], searchProfilesInCurrentTeam(store.getState(), this.term, false));
            }
        } else if (this.listType === 'any') {
            users = Object.assign([], UserStore.getProfileList(false, true));
        } else {
            users = Object.assign([], UserStore.getProfileListInTeam(TeamStore.getCurrentId(), false, false));
        }

        for (let i = 0; i < users.length; i++) {
            const user = Object.assign({}, users[i]);
            users[i] = user;
        }

        this.setState({
            users,
        });
    }

    getUserProfiles(page) {
        const pageNum = page ? page + 1 : 0;
        if (this.listType === 'any') {
            this.props.actions.getProfiles(pageNum, USERS_PER_PAGE * 2).then(() => {
                this.setUsersLoadingState(false);
            });
        } else {
            this.props.actions.getProfilesInTeam(TeamStore.getCurrentId(), pageNum, USERS_PER_PAGE * 2).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    }

    handlePageChange(page, prevPage) {
        if (page > prevPage) {
            this.setUsersLoadingState(true);
            this.getUserProfiles(page);
        }
    }

    resetPaging = () => {
        if (this.refs.multiselect) {
            this.refs.multiselect.resetPaging();
        }
    }

    search(term) {
        clearTimeout(this.searchTimeoutId);
        this.term = term;

        if (term === '') {
            this.resetPaging();
            this.onChange();
            return;
        }

        let teamId;
        if (this.listType === 'any') {
            teamId = '';
        } else {
            teamId = TeamStore.getCurrentId();
        }

        this.searchTimeoutId = setTimeout(
            () => {
                this.setUsersLoadingState(true);
                searchUsers(term, teamId, {}, this.resetPaging).then(() => {
                    this.setUsersLoadingState(false);
                });
            },
            Constants.SEARCH_TIMEOUT_MILLISECONDS
        );
    }

    handleDelete(values) {
        this.setState({values});
    }

    renderOption(option, isSelected, onAdd) {
        const currentUser = UserStore.getCurrentUser();
        const displayName = displayEntireNameForUser(option);

        let modalName = displayName;
        if (option.id === currentUser.id) {
            modalName = (
                <FormattedMessage
                    id='more_direct_channels.directchannel.you'
                    defaultMessage='{displayname} (you)'
                    values={{
                        displayname: displayName,
                    }}
                />
            );
        } else if (option.delete_at) {
            modalName = (
                <FormattedMessage
                    id='more_direct_channels.directchannel.deactivated'
                    defaultMessage='{displayname} - Deactivated'
                    values={{
                        displayname: displayName,
                    }}
                />
            );
        }

        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        const status = option.delete_at ? null : UserStore.getStatus(option.id);

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                    status={status}
                    width='32'
                    height='32'
                />
                <div
                    className='more-modal__details'
                >
                    <div className='more-modal__name'>
                        {modalName}
                    </div>
                    <div className='more-modal__description'>
                        {option.email}
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <i className='fa fa-plus'/>
                    </div>
                </div>
            </div>
        );
    }

    renderValue(user) {
        return user.username;
    }

    handleSubmitImmediatelyOn = (value) => {
        return value.id === this.props.currentUserId || value.delete_at;
    }

    render() {
        let note;
        if (this.props.currentChannelMembers) {
            if (this.state.values && this.state.values.length >= MAX_SELECTABLE_VALUES) {
                note = (
                    <FormattedMessage
                        id='more_direct_channels.new_convo_note.full'
                        defaultMessage={'You\'ve reached the maximum number of people for this conversation. Consider creating a private channel instead.'}
                    />
                );
            } else if (this.props.isExistingChannel) {
                note = (
                    <FormattedMessage
                        id='more_direct_channels.new_convo_note'
                        defaultMessage={'This will start a new conversation. If you\'re adding a lot of people, consider creating a private channel instead.'}
                    />
                );
            }
        }

        const buttonSubmitText = localizeMessage('multiselect.go', 'Go');

        const numRemainingText = (
            <FormattedMessage
                id='multiselect.numPeopleRemaining'
                defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                values={{
                    num: MAX_SELECTABLE_VALUES - this.state.values.length,
                }}
            />
        );

        let users = this.state.users || [];

        if (this.state.values.length) {
            users = users.filter((user) => user.delete_at === 0 && user.id !== this.props.currentUserId);
        } else {
            const active = [];
            const inactive = [];
            for (const user of users) {
                (user.delete_at ? inactive : active).push(user);
            }
            users = active.concat(inactive);
        }

        return (
            <Modal
                dialogClassName={'more-modal more-direct-channels'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='more_direct_channels.title'
                            defaultMessage='Direct Messages'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MultiSelect
                        key='moreDirectChannelsList'
                        ref='multiselect'
                        options={users}
                        optionRenderer={this.renderOption}
                        values={this.state.values}
                        valueKey='id'
                        valueRenderer={this.renderValue}
                        perPage={USERS_PER_PAGE}
                        handlePageChange={this.handlePageChange}
                        handleInput={this.search}
                        handleDelete={this.handleDelete}
                        handleAdd={this.addValue}
                        handleSubmit={this.handleSubmit}
                        noteText={note}
                        maxValues={MAX_SELECTABLE_VALUES}
                        numRemainingText={numRemainingText}
                        buttonSubmitText={buttonSubmitText}
                        submitImmediatelyOn={this.handleSubmitImmediatelyOn}
                        saving={this.state.saving}
                        loading={this.state.loadingUsers}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
