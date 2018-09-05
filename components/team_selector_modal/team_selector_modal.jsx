// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect.jsx';
import TeamInfo from 'components/team_info.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

const TEAMS_PER_PAGE = 50;

export default class TeamSelectorModal extends React.Component {
    static propTypes = {
        currentSchemeId: PropTypes.string,
        alreadySelected: PropTypes.array,
        searchTerm: PropTypes.string.isRequired,
        teams: PropTypes.array.isRequired,
        onModalDismissed: PropTypes.func,
        onTeamsSelected: PropTypes.func,
        actions: PropTypes.shape({
            loadTeams: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            searchTeams: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            values: [],
            show: true,
            search: false,
            loadingTeams: true,
            confirmAddModal: false,
            confirmAddTeam: null,
        };
    }

    componentDidMount() {
        this.props.actions.loadTeams(0, TEAMS_PER_PAGE * 2).then(() => {
            this.setTeamsLoadingState(false);
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
                    this.setTeamsLoadingState(true);
                    await this.props.actions.searchTeams(searchTerm);
                    this.setTeamsLoadingState(false);
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

    handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }

        if (this.state.values.length === 0) {
            return;
        }

        this.props.onTeamsSelected(this.state.values);
        this.handleHide();
    }

    addValue = (value, confirmed = false) => {
        if (value.scheme_id !== null && value.scheme_id !== '' && !confirmed) {
            this.setState({confirmAddModal: true, confirmAddTeam: value});
            return;
        }
        const values = Object.assign([], this.state.values);
        const teamIds = values.map((v) => v.id);
        if (value && value.id && teamIds.indexOf(value.id) === -1) {
            values.push(value);
        }

        this.setState({values, confirmAddModal: false, confirmAddTeam: null});
    }

    setTeamsLoadingState = (loadingState) => {
        this.setState({
            loadingTeams: loadingState,
        });
    }

    handlePageChange = (page, prevPage) => {
        if (page > prevPage) {
            this.setTeamsLoadingState(true);
            this.props.actions.loadTeams(page + 1, TEAMS_PER_PAGE).then(() => {
                this.setTeamsLoadingState(false);
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
                <div
                    className='more-modal__details'
                >
                    <TeamInfo team={option}/>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <i className='fa fa-plus'/>
                    </div>
                </div>
            </div>
        );
    }

    renderValue(team) {
        return team.display_name;
    }

    renderConfirmModal(show, team) {
        const title = (
            <FormattedMessage
                id='add_teams_to_scheme.confirmation.title'
                defaultMessage='Team Override Scheme Change?'
            />
        );
        const message = (
            <FormattedMessage
                id='add_teams_to_scheme.confirmation.message'
                defaultMessage='This team is already selected in another team scheme, are you sure you want to move it to this team scheme?'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='add_teams_to_scheme.confirmation.accept'
                defaultMessage='Yes, Move Team'
            />
        );
        return (
            <ConfirmModal
                show={show}
                title={title}
                message={message}
                confirmButtonText={confirmButtonText}
                onCancel={() => this.setState({confirmAddModal: false, confirmAddTeam: null})}
                onConfirm={() => this.addValue(team, true)}
            />
        );
    }

    render() {
        const confirmModal = this.renderConfirmModal(this.state.confirmAddModal, this.state.confirmAddTeam);
        const numRemainingText = (
            <FormattedMessage
                id='multiselect.selectTeams'
                defaultMessage='Use ↑↓ to browse, ↵ to select.'
            />
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');

        let teams = [];
        if (this.props.teams) {
            teams = this.props.teams.filter((team) => team.delete_at === 0);
            teams = teams.filter((team) => team.scheme_id !== this.currentSchemeId);
            teams = teams.filter((team) => this.props.alreadySelected.indexOf(team.id) === -1);
            teams.sort((a, b) => {
                const aName = a.display_name.toUpperCase();
                const bName = b.display_name.toUpperCase();
                if (aName === bName) {
                    return 0;
                }
                if (aName > bName) {
                    return 1;
                }
                return -1;
            });
        }

        return (
            <Modal
                dialogClassName={'more-modal more-direct-channels team-selector-modal'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMarkdownMessage
                            id='add_teams_to_scheme.title'
                            defaultMessage='Add Teams To **Team Selection** List'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {confirmModal}
                    <MultiSelect
                        key='addTeamsToSchemeKey'
                        options={teams}
                        optionRenderer={this.renderOption}
                        values={this.state.values}
                        valueKey='id'
                        valueRenderer={this.renderValue}
                        perPage={TEAMS_PER_PAGE}
                        handlePageChange={this.handlePageChange}
                        handleInput={this.search}
                        handleDelete={this.handleDelete}
                        handleAdd={this.addValue}
                        handleSubmit={this.handleSubmit}
                        numRemainingText={numRemainingText}
                        buttonSubmitText={buttonSubmitText}
                        saving={false}
                        loading={this.state.loadingTeams}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
