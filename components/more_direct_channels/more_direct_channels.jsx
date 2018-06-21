// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {browserHistory} from 'utils/browser_history';
import {openDirectChannelToUser, openGroupChannelToUsers} from 'actions/channel_actions.jsx';
import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import Constants from 'utils/constants.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';
import MultiSelect from 'components/multiselect/multiselect.jsx';
import ProfilePicture from 'components/profile_picture.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = Constants.MAX_USERS_IN_GM - 1;

export default class MoreDirectChannels extends React.Component {
    static propTypes = {

        currentUserId: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        currentTeamName: PropTypes.string.isRequired,
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.arrayOf(PropTypes.object).isRequired,
        statuses: PropTypes.object.isRequired,

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
        onModalDismissed: PropTypes.func,
        onHide: PropTypes.func,

        actions: PropTypes.shape({
            getProfiles: PropTypes.func.isRequired,
            getProfilesInTeam: PropTypes.func.isRequired,
            getStatusesByIds: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

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
            values,
            show: true,
            search: false,
            saving: false,
            loadingUsers: true,
        };
    }

    componentDidMount() {
        this.getUserProfiles();
        this.loadProfilesMissingStatus(this.props.users, this.props.statuses);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                this.resetPaging();
            } else {
                const teamId = nextProps.restrictDirectMessage === 'any' ? '' : nextProps.currentTeamId;

                this.searchTimeoutId = setTimeout(
                    async () => {
                        this.setUsersLoadingState(true);
                        const {data} = await this.props.actions.searchProfiles(searchTerm, {team_id: teamId});
                        if (data) {
                            loadStatusesForProfilesList(data);
                            this.resetPaging();
                        }
                        this.setUsersLoadingState(false);
                    },
                    Constants.SEARCH_TIMEOUT_MILLISECONDS
                );
            }
        }

        if (
            this.props.users.length !== nextProps.users.length ||
            Object.keys(this.props.statuses).length !== Object.keys(nextProps.statuses).length
        ) {
            this.loadProfilesMissingStatus(nextProps.users, nextProps.statuses);
        }
    }

    loadProfilesMissingStatus = (users = [], statuses = {}) => {
        const missingStatusByIds = users.
            filter((user) => !statuses[user.id]).
            map((user) => user.id);

        if (missingStatusByIds.length > 0) {
            this.props.actions.getStatusesByIds(missingStatusByIds);
        }
    }

    handleHide = () => {
        this.props.actions.setModalSearchTerm('');
        this.setState({show: false});
    }

    setUsersLoadingState = (loadingState) => {
        this.setState({
            loadingUsers: loadingState,
        });
    }

    handleExit = () => {
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

    handleSubmit = (values = this.state.values) => {
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
            this.exitToChannel = '/' + this.props.currentTeamName + '/channels/' + channel.name;
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

    addValue = (value) => {
        const values = Object.assign([], this.state.values);

        if (values.indexOf(value) === -1) {
            values.push(value);
        }

        this.setState({values});
    }

    getUserProfiles = (page) => {
        const pageNum = page ? page + 1 : 0;
        if (this.props.restrictDirectMessage === 'any') {
            this.props.actions.getProfiles(pageNum, USERS_PER_PAGE * 2).then(() => {
                this.setUsersLoadingState(false);
            });
        } else {
            this.props.actions.getProfilesInTeam(this.props.currentTeamId, pageNum, USERS_PER_PAGE * 2).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    }

    handlePageChange = (page, prevPage) => {
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

    search = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    handleDelete = (values) => {
        this.setState({values});
    }

    renderOption = (option, isSelected, onAdd) => {
        const displayName = displayEntireNameForUser(option);

        let modalName = displayName;
        if (option.id === this.props.currentUserId) {
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

        const status = option.delete_at ? null : this.props.statuses[option.id];

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
                        <i
                            className='fa fa-plus'
                            title={localizeMessage('generic_icons.add', 'Add Icon')}
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderValue(user) {
        return user.username;
    }

    handleSubmitImmediatelyOn = (value) => {
        return value.id === this.props.currentUserId || Boolean(value.delete_at);
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

        let users = this.props.users || [];

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
