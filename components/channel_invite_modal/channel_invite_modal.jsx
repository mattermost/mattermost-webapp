// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {filterProfilesMatchingTerm} from 'mattermost-redux/utils/user_utils';

import {addUserToChannel} from 'actions/channel_actions.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';
import ProfilePicture from 'components/profile_picture.jsx';
import MultiSelect from 'components/multiselect/multiselect.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class ChannelInviteModal extends React.Component {
    static propTypes = {
        profilesNotInCurrentChannel: PropTypes.array.isRequired,
        onHide: PropTypes.func.isRequired,
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getProfilesNotInChannel: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

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
    }

    componentDidMount() {
        this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, 0).then(() => {
            this.setUsersLoadingState(false);
        });
        this.props.actions.getTeamStats(this.props.channel.team_id);
    }

    onHide = () => {
        this.setState({show: false});
    }

    handleInviteError = (err) => {
        if (err) {
            this.setState({
                saving: false,
                inviteError: err.message,
            });
        } else {
            this.setState({
                saving: false,
                inviteError: null,
            });
        }
    }

    handleDelete = (values) => {
        this.setState({values});
    }

    setUsersLoadingState = (loadingState) => {
        this.setState({
            loadingUsers: loadingState,
        });
    }

    handlePageChange = (page, prevPage) => {
        if (page > prevPage) {
            this.setUsersLoadingState(true);
            this.props.actions.getProfilesNotInChannel(this.props.channel.team_id, this.props.channel.id, page + 1, USERS_PER_PAGE).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    }

    handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }

        const userIds = this.state.values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        this.setState({saving: true});

        userIds.forEach((userId) => {
            addUserToChannel(
                this.props.channel.id,
                userId,
                () => {
                    this.handleInviteError(null);
                },
                (err) => {
                    this.handleInviteError(err);
                }
            );
        });

        this.onHide();
    }

    search = (term) => {
        this.setState({
            term,
        });
    }

    renderOption = (option, isSelected, onAdd) => {
        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
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

    renderValue = (user) => {
        return user.username;
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
                valueKey='id'
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
