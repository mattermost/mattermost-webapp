// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {filterProfilesStartingWithTerm} from 'mattermost-redux/utils/user_utils';

import {displayEntireNameForUser, localizeMessage, isGuest} from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture';
import MultiSelect from 'components/multiselect/multiselect';
import AddIcon from 'components/widgets/icons/fa_add_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';

import Constants from 'utils/constants';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class ChannelInviteModal extends React.PureComponent {
    static propTypes = {
        profilesNotInCurrentChannel: PropTypes.array.isRequired,
        profilesNotInCurrentTeam: PropTypes.array.isRequired,
        onHide: PropTypes.func.isRequired,
        channel: PropTypes.object.isRequired,

        // skipCommit = true used with onAddCallback will result in users not being committed immediately
        skipCommit: PropTypes.bool,

        // onAddCallback takes an array of UserProfiles and should set usersToAdd in state of parent component
        onAddCallback: PropTypes.func,

        // Dictionaries of userid mapped users to exclude or include from this list
        excludeUsers: PropTypes.object,
        includeUsers: PropTypes.object,

        actions: PropTypes.shape({
            addUsersToChannel: PropTypes.func.isRequired,
            getProfilesNotInChannel: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        includeUsers: {},
        excludeUsers: {},
        skipCommit: false,
    };

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            values: [],
            term: '',
            show: true,
            saving: false,
            loadingUsers: true,
        };

        this.selectedItemRef = React.createRef();
    }

    addValue = (value) => {
        const values = Object.assign([], this.state.values);
        if (values.indexOf(value) === -1) {
            values.push(value);
        }

        this.setState({values});
    };

    componentDidMount() {
        this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, this.props.channel.group_constrained, 0).then(() => {
            this.setUsersLoadingState(false);
        });
        this.props.actions.getTeamStats(this.props.channel.team_id);
    }

    onHide = () => {
        this.setState({show: false});
    };

    handleInviteError = (err) => {
        if (err) {
            this.setState({
                saving: false,
                inviteError: err.message,
            });
        }
    };

    handleDelete = (values) => {
        this.setState({values});
    };

    setUsersLoadingState = (loadingState) => {
        this.setState({
            loadingUsers: loadingState,
        });
    };

    handlePageChange = (page, prevPage) => {
        if (page > prevPage) {
            this.setUsersLoadingState(true);
            this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, this.props.channel.group_constrained, page + 1, USERS_PER_PAGE).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    };

    handleSubmit = (e) => {
        const {actions, channel} = this.props;
        if (e) {
            e.preventDefault();
        }

        const userIds = this.state.values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        if (this.props.skipCommit && this.props.onAddCallback) {
            this.props.onAddCallback(this.state.values);
            this.setState({
                saving: false,
                inviteError: null,
            });
            this.onHide();
            return;
        }

        this.setState({saving: true});

        actions.addUsersToChannel(channel.id, userIds).then((result) => {
            if (result.error) {
                this.handleInviteError(result.error);
            } else {
                this.setState({
                    saving: false,
                    inviteError: null,
                });
                this.onHide();
            }
        });
    };

    search = (searchTerm) => {
        const term = searchTerm.trim();
        clearTimeout(this.searchTimeoutId);
        this.setState({
            term,
        });

        this.searchTimeoutId = setTimeout(
            async () => {
                if (!term) {
                    return;
                }

                this.setUsersLoadingState(true);
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

    renderAriaLabel = (option) => {
        if (!option) {
            return null;
        }
        return option.username;
    }

    renderOption = (option, isSelected, onAdd, onMouseMove) => {
        var rowSelected = '';
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
    };

    renderValue(props) {
        return props.data.username;
    }

    render() {
        let inviteError = null;
        if (this.state.inviteError) {
            inviteError = (<label className='has-error control-label'>{this.state.inviteError}</label>);
        }

        const numRemainingText = (
            <FormattedMessage
                id='multiselect.numPeopleRemaining'
                defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                values={{
                    num: MAX_SELECTABLE_VALUES - this.state.values.length,
                }}
            />
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');
        const buttonSubmitLoadingText = localizeMessage('multiselect.adding', 'Adding...');

        let users = filterProfilesStartingWithTerm(this.props.profilesNotInCurrentChannel, this.state.term).filter((user) => {
            return user.delete_at === 0 && !this.props.profilesNotInCurrentTeam.includes(user) && !this.props.excludeUsers[user.id];
        });

        if (this.props.includeUsers) {
            const includeUsers = Object.values(this.props.includeUsers);
            users = [...users, ...includeUsers];
        }

        const content = (
            <MultiSelect
                key='addUsersToChannelKey'
                options={users}
                optionRenderer={this.renderOption}
                selectedItemRef={this.selectedItemRef}
                values={this.state.values}
                valueRenderer={this.renderValue}
                ariaLabelRenderer={this.renderAriaLabel}
                perPage={USERS_PER_PAGE}
                handlePageChange={this.handlePageChange}
                handleInput={this.search}
                handleDelete={this.handleDelete}
                handleAdd={this.addValue}
                handleSubmit={this.handleSubmit}
                maxValues={MAX_SELECTABLE_VALUES}
                numRemainingText={numRemainingText}
                buttonSubmitText={buttonSubmitText}
                buttonSubmitLoadingText={buttonSubmitLoadingText}
                saving={this.state.saving}
                loading={this.state.loadingUsers}
                placeholderText={localizeMessage('multiselect.placeholder', 'Search and add members')}
            />
        );

        return (
            <Modal
                id='addUsersToChannelModal'
                dialogClassName='a11y__modal more-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                role='dialog'
                aria-labelledby='channelInviteModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='channelInviteModalLabel'
                    >
                        <FormattedMessage
                            id='channel_invite.addNewMembers'
                            defaultMessage='Add New Members to '
                        />
                        <span className='name'>{this.props.channel.display_name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    role='application'
                >
                    {inviteError}
                    {content}
                </Modal.Body>
            </Modal>
        );
    }
}
