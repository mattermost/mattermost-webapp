// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import Constants from 'utils/constants.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect.jsx';
import ProfilePicture from 'components/profile_picture.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class AddUsersToTeam extends React.Component {
    static propTypes = {
        currentTeamName: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.array.isRequired,
        onModalDismissed: PropTypes.func,
        actions: PropTypes.shape({
            getProfilesNotInTeam: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
            addUsersToTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            values: [],
            show: true,
            search: false,
            saving: false,
            addError: null,
            loadingUsers: true,
        };
    }

    componentDidMount() {
        this.props.actions.getProfilesNotInTeam(this.props.currentTeamId, 0, USERS_PER_PAGE * 2).then(() => {
            this.setUsersLoadingState(false);
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                return;
            }

            this.searchTimeoutId = setTimeout(
                async () => {
                    this.setUsersLoadingState(true);
                    const {data} = await this.props.actions.searchProfiles(searchTerm, {not_in_team_id: this.props.currentTeamId});
                    if (data) {
                        loadStatusesForProfilesList(data);
                    }
                    this.setUsersLoadingState(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );
        }
    }

    handleHide = () => {
        this.props.actions.setModalSearchTerm('');
        this.setState({show: false});
    }

    handleExit = () => {
        if (this.props.onModalDismissed) {
            this.props.onModalDismissed();
        }
    }

    handleResponse = (err) => {
        let addError = null;
        if (err && err.message) {
            addError = err.message;
        }

        this.setState({
            saving: false,
            addError,
        });
    }

    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const userIds = this.state.values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        this.setState({saving: true});

        const {error} = await this.props.actions.addUsersToTeam(this.props.currentTeamId, userIds);
        this.handleResponse(error);
        if (!error) {
            this.handleHide();
        }
    }

    addValue = (value) => {
        const values = Object.assign([], this.state.values);
        const userIds = values.map((v) => v.id);
        if (value && value.id && userIds.indexOf(value.id) === -1) {
            values.push(value);
        }

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
            this.props.actions.getProfilesNotInTeam(this.props.currentTeamId, page + 1, USERS_PER_PAGE).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    }

    handleDelete = (values) => {
        this.setState({values});
    }

    search = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    renderOption(option, isSelected, onAdd) {
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
                <div
                    className='more-modal__details'
                >
                    <div className='more-modal__name'>
                        {displayEntireNameForUser(option)}
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

    render() {
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

        let users = [];
        if (this.props.users) {
            users = this.props.users.filter((user) => user.delete_at === 0);
        }

        let addError = null;
        if (this.state.addError) {
            addError = (<div className='has-error col-sm-12'><label className='control-label font-weight--normal'>{this.state.addError}</label></div>);
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
                            id='add_users_to_team.title'
                            defaultMessage='Add New Members To {teamName} Team'
                            values={{
                                teamName: (
                                    <strong>{this.props.currentTeamName}</strong>
                                ),
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addError}
                    <MultiSelect
                        key='addUsersToTeamKey'
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
                </Modal.Body>
            </Modal>
        );
    }
}
