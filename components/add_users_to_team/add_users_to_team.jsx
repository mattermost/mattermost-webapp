// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import Constants from 'utils/constants.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect.jsx';
import ProfilePicture from 'components/profile_picture.jsx';
import AddIcon from 'components/icon/add_icon';
import BotBadge from 'components/widgets/badges/bot_badge.jsx';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class AddUsersToTeam extends React.Component {
    static propTypes = {
        currentTeamName: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        currentTeamGroupConstrained: PropTypes.bool,
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.array.isRequired,
        onHide: PropTypes.func,
        actions: PropTypes.shape({
            getProfilesNotInTeam: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            searchProfiles: PropTypes.func.isRequired,
            addUsersToTeam: PropTypes.func.isRequired,
            loadStatusesForProfilesList: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        currentTeamGroupConstrained: false,
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
        this.props.actions.getProfilesNotInTeam(this.props.currentTeamId, this.props.currentTeamGroupConstrained, 0, USERS_PER_PAGE * 2).then(() => {
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
                    const {data} = await this.props.actions.searchProfiles(searchTerm, {not_in_team_id: this.props.currentTeamId, group_constrained: this.props.currentTeamGroupConstrained});
                    if (data) {
                        this.props.actions.loadStatusesForProfilesList(data);
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
        if (this.props.onHide) {
            this.props.onHide();
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

        let email = option.email;
        if (option.is_bot) {
            email = null;
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
                        <BotBadge
                            show={Boolean(option.is_bot)}
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

    render() {
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
                id='addUsersToTeamModal'
                dialogClassName={'more-modal more-direct-channels'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
                role='dialog'
                aria-labelledby='addTeamModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='addTeamModalLabel'
                    >
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
                        buttonSubmitLoadingText={buttonSubmitLoadingText}
                        saving={this.state.saving}
                        loading={this.state.loadingUsers}
                        placeholderText={localizeMessage('multiselect.placeholder', 'Search and add members')}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
