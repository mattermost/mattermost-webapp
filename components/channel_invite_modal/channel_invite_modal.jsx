// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {filterProfilesMatchingTerm} from 'mattermost-redux/utils/user_utils';

import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture.jsx';
import MultiSelect from 'components/multiselect/multiselect.jsx';
import AddIcon from 'components/icon/add_icon';

import {searchUsers} from 'actions/user_actions.jsx';
import Constants from 'utils/constants.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class ChannelInviteModal extends React.Component {
    static propTypes = {
        profilesNotInCurrentChannel: PropTypes.array.isRequired,
        onHide: PropTypes.func.isRequired,
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            addUsersToChannel: PropTypes.func.isRequired,
            getProfilesNotInChannel: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
        }).isRequired,
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
    }

    addValue = (value) => {
        const values = Object.assign([], this.state.values);
        if (values.indexOf(value) === -1) {
            values.push(value);
        }

        this.setState({values});
    };

    componentDidMount() {
        this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, 0).then(() => {
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
            this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, page + 1, USERS_PER_PAGE).then(() => {
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

    search = (term) => {
        clearTimeout(this.searchTimeoutId);
        this.setState({
            term,
        });

        this.searchTimeoutId = setTimeout(
            () => {
                this.setUsersLoadingState(true);
                searchUsers(term, this.props.channel.team_id, {not_in_channel_id: this.props.channel.id}).then(() => {
                    this.setUsersLoadingState(false);
                });
            },
            Constants.SEARCH_TIMEOUT_MILLISECONDS
        );
    };

    renderOption = (option, isSelected, onAdd) => {
        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }
        let tag = null;
        if (option.is_bot) {
            tag = (
                <div className='bot-indicator bot-indicator__popoverlist'>
                    <FormattedMessage
                        id='post_info.bot'
                        defaultMessage='BOT'
                    />
                </div>
            );
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                    width='32'
                    height='32'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {displayEntireNameForUser(option)}
                        {tag}
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

        let users = filterProfilesMatchingTerm(this.props.profilesNotInCurrentChannel, this.state.term);
        users = users.filter((user) => user.delete_at === 0);

        const content = (
            <MultiSelect
                key='addUsersToChannelKey'
                options={users}
                optionRenderer={this.renderOption}
                values={this.state.values}
                valueRenderer={this.renderValue}
                perPage={USERS_PER_PAGE}
                handlePageChange={this.handlePageChange}
                handleInput={this.search}
                handleDelete={this.handleDelete}
                handleAdd={this.addValue}
                handleSubmit={this.handleSubmit}
                maxValues={MAX_SELECTABLE_VALUES}
                numRemainingText={numRemainingText}
                buttonSubmitText={buttonSubmitText}
                saving={this.state.saving}
                loading={this.state.loadingUsers}
            />
        );

        return (
            <Modal
                dialogClassName='more-modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='channel_invite.addNewMembers'
                            defaultMessage='Add New Members to '
                        />
                        <span className='name'>{this.props.channel.display_name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {inviteError}
                    {content}
                </Modal.Body>
            </Modal>
        );
    }
}
