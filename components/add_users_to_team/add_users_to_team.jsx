// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import {searchProfilesNotInCurrentTeam} from 'mattermost-redux/selectors/entities/users';

import {addUsersToTeam} from 'actions/team_actions.jsx';
import {searchUsersNotInTeam} from 'actions/user_actions.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';
import MultiSelect from 'components/multiselect/multiselect.jsx';
import ProfilePicture from 'components/profile_picture.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class AddUsersToTeam extends React.Component {
    static propTypes = {
        onModalDismissed: PropTypes.func,
        actions: PropTypes.shape({
            getProfilesNotInTeam: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.handleHide = this.handleHide.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.onChange = this.onChange.bind(this);
        this.search = this.search.bind(this);
        this.addValue = this.addValue.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);

        this.searchTimeoutId = 0;

        this.state = {
            users: Object.assign([], UserStore.getProfileListNotInTeam(TeamStore.getCurrentId(), true)),
            values: [],
            show: true,
            search: false,
            saving: false,
            addError: null,
            loadingUsers: true
        };
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onChange);
        UserStore.addNotInTeamChangeListener(this.onChange);
        UserStore.addStatusesChangeListener(this.onChange);

        this.props.actions.getProfilesNotInTeam(TeamStore.getCurrentId(), 0, USERS_PER_PAGE * 2).then(() => {
            this.setUsersLoadingState(false);
        });
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onChange);
        UserStore.removeNotInTeamChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
    }

    handleHide() {
        this.setState({show: false});
    }

    handleExit() {
        if (this.props.onModalDismissed) {
            this.props.onModalDismissed();
        }
    }

    handleResponse(err) {
        let addError = null;
        if (err && err.message) {
            addError = err.message;
        }

        this.setState({
            saving: false,
            addError
        });
    }

    handleSubmit(e) {
        if (e) {
            e.preventDefault();
        }

        const userIds = this.state.values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        this.setState({saving: true});

        addUsersToTeam(
            TeamStore.getCurrentId(),
            userIds,
            () => {
                this.handleResponse();
                this.handleHide();
            },
            (err) => {
                this.handleResponse(err);
            }
        );
    }

    addValue(value) {
        const values = Object.assign([], this.state.values);
        const userIds = values.map((v) => v.id);
        if (value && value.id && userIds.indexOf(value.id) === -1) {
            values.push(value);
        }

        this.setState({values});
    }

    setUsersLoadingState = (loadingState) => {
        this.setState({
            loadingUsers: loadingState
        });
    }

    onChange() {
        let users;
        if (this.term) {
            users = Object.assign([], searchProfilesNotInCurrentTeam(store.getState(), this.term, true));
        } else {
            users = Object.assign([], UserStore.getProfileListNotInTeam(TeamStore.getCurrentId(), true));
        }

        for (let i = 0; i < users.length; i++) {
            const user = Object.assign({}, users[i]);
            user.value = user.id;
            user.label = '@' + user.username;
            users[i] = user;
        }

        this.setState({
            users
        });
    }

    handlePageChange(page, prevPage) {
        if (page > prevPage) {
            this.setUsersLoadingState(true);
            this.props.actions.getProfilesNotInTeam(TeamStore.getCurrentId(), page + 1, USERS_PER_PAGE).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    }

    search(term) {
        clearTimeout(this.searchTimeoutId);
        this.term = term;

        if (term === '') {
            this.onChange();
            return;
        }

        this.searchTimeoutId = setTimeout(
            () => {
                this.setUsersLoadingState(true);
                searchUsersNotInTeam(term, TeamStore.getCurrentId(), {}).then(() => {
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
                        <i className='fa fa-plus'/>
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
                    num: MAX_SELECTABLE_VALUES - this.state.values.length
                }}
            />
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');

        let users = [];
        if (this.state.users) {
            users = this.state.users.filter((user) => user.delete_at === 0);
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
                                    <strong>{TeamStore.getCurrent().display_name}</strong>
                                )
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
