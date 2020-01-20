// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants';
import {displayEntireNameForUser, localizeMessage, isGuest} from 'utils/utils.jsx';
import MultiSelect from 'components/multiselect/multiselect';
import ProfilePicture from 'components/profile_picture';
import AddIcon from 'components/widgets/icons/fa_add_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';

import GroupMessageOption from './group_message_option';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = Constants.MAX_USERS_IN_GM - 1;

export default class MoreDirectChannels extends React.Component {
    static propTypes = {

        currentUserId: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        currentTeamName: PropTypes.string.isRequired,
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.arrayOf(PropTypes.object).isRequired,
        groupChannels: PropTypes.arrayOf(PropTypes.object).isRequired,
        statuses: PropTypes.object.isRequired,
        totalCount: PropTypes.number,

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
        bodyOnly: PropTypes.bool,
        actions: PropTypes.shape({
            getProfiles: PropTypes.func.isRequired,
            getProfilesInTeam: PropTypes.func.isRequired,
            getStatusesByIds: PropTypes.func.isRequired,
            getTotalUsersStats: PropTypes.func.isRequired,
            loadStatusesForProfilesList: PropTypes.func.isRequired,
            loadProfilesForGroupChannels: PropTypes.func.isRequired,
            openDirectChannelToUserId: PropTypes.func.isRequired,
            openGroupChannelToUserIds: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
            searchGroupChannels: PropTypes.func.isRequired,
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
        this.props.actions.getTotalUsersStats();
        this.loadProfilesMissingStatus(this.props.users, this.props.statuses);
    }

    updateFromProps(prevProps) {
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = this.props.searchTerm;
            if (searchTerm === '') {
                this.resetPaging();
            } else {
                const teamId = this.props.restrictDirectMessage === 'any' ? '' : this.props.currentTeamId;

                this.searchTimeoutId = setTimeout(
                    async () => {
                        this.setUsersLoadingState(true);
                        const [{data: profilesData}, {data: groupChannelsData}] = await Promise.all([
                            this.props.actions.searchProfiles(searchTerm, {team_id: teamId}),
                            this.props.actions.searchGroupChannels(searchTerm),
                        ]);
                        if (profilesData) {
                            this.props.actions.loadStatusesForProfilesList(profilesData);
                        }
                        if (groupChannelsData) {
                            this.props.actions.loadProfilesForGroupChannels(groupChannelsData);
                        }
                        this.resetPaging();
                        this.setUsersLoadingState(false);
                    },
                    Constants.SEARCH_TIMEOUT_MILLISECONDS
                );
            }
        }

        if (
            prevProps.users.length !== this.props.users.length ||
            Object.keys(prevProps.statuses).length !== Object.keys(this.props.statuses).length
        ) {
            this.loadProfilesMissingStatus(this.props.users, this.props.statuses);
        }
    }

    componentDidUpdate(prevProps) {
        this.updateFromProps(prevProps);
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

        if (this.props.bodyOnly) {
            this.handleExit();
        }
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
        const {actions} = this.props;
        if (this.state.saving) {
            return;
        }

        const userIds = values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        this.setState({saving: true});

        const done = (result) => {
            const {data, error} = result;
            this.setState({saving: false});

            if (!error) {
                this.exitToChannel = '/' + this.props.currentTeamName + '/channels/' + data.name;
                this.handleHide();
            }
        };

        if (userIds.length === 1) {
            actions.openDirectChannelToUserId(userIds[0]).then(done);
        } else {
            actions.openGroupChannelToUserIds(userIds).then(done);
        }
    };

    addValue = (value) => {
        if (Array.isArray(value)) {
            this.addUsers(value);
        } else if ('profiles' in value) {
            this.addUsers(value.profiles);
        } else {
            const values = Object.assign([], this.state.values);

            if (values.indexOf(value) === -1) {
                values.push(value);
            }

            this.setState({values});
        }
    };

    addUsers = (users) => {
        const values = Object.assign([], this.state.values);
        const existingUserIds = values.map((user) => user.id);
        for (const user of users) {
            if (existingUserIds.indexOf(user.id) !== -1) {
                continue;
            }
            values.push(user);
        }

        this.setState({values});
    };

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

    renderAriaLabel = (option) => {
        if (!option) {
            return null;
        }
        return option.username;
    }

    renderOption = (option, isSelected, onAdd, onMouseMove) => {
        if (option.type && option.type === 'G') {
            return (
                <GroupMessageOption
                    key={option.id}
                    channel={option}
                    isSelected={isSelected}
                    onAdd={onAdd}
                />
            );
        }

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

        const status = option.delete_at || option.is_bot ? null : this.props.statuses[option.id];
        const email = option.is_bot ? null : option.email;

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
                    status={status}
                    size='md'
                />
                <div
                    className='more-modal__details'
                >
                    <div className='more-modal__name'>
                        {modalName}
                        <BotBadge
                            show={Boolean(option.is_bot)}
                            className='badge-popoverlist'
                        />
                        <GuestBadge
                            show={isGuest(option)}
                            className='badge-popoverlist'
                        />
                    </div>
                    <div className='more-modal__description'>
                        {email}
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

    renderValue(props) {
        return props.data.username;
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
        const buttonSubmitLoadingText = localizeMessage('multiselect.loading', 'Loading..');

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
        users = users.map((user) => {
            return {label: user.username, value: user.id, ...user};
        });

        let groupChannels = this.props.groupChannels || [];
        groupChannels = groupChannels.map((group) => {
            return {label: group.display_name, value: group.id, ...group};
        });

        const options = [...users, ...groupChannels];
        const body = (
            <MultiSelect
                key='moreDirectChannelsList'
                ref='multiselect'
                options={options}
                optionRenderer={this.renderOption}
                values={this.state.values}
                valueRenderer={this.renderValue}
                ariaLabelRenderer={this.renderAriaLabel}
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
                buttonSubmitLoadingText={buttonSubmitLoadingText}
                submitImmediatelyOn={this.handleSubmitImmediatelyOn}
                saving={this.state.saving}
                loading={this.state.loadingUsers}
                users={this.props.users}
                totalCount={this.props.totalCount}
                placeholderText={localizeMessage('multiselect.placeholder', 'Search and add members')}
            />
        );

        if (this.props.bodyOnly) {
            return body;
        }

        return (
            <Modal
                dialogClassName='a11y__modal more-modal more-direct-channels'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
                role='dialog'
                aria-labelledby='moreDmModalLabel'
                id='moreDmModal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='moreDmModalLabel'
                    >
                        <FormattedMessage
                            id='more_direct_channels.title'
                            defaultMessage='Direct Messages'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    role='application'
                >
                    {body}
                </Modal.Body>
                <Modal.Footer className='modal-footer--invisible'>
                    <button
                        id='closeModalButton'
                        type='button'
                        className='btn btn-link'
                    >
                        <FormattedMessage
                            id='general_button.close'
                            defaultMessage='Close'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
