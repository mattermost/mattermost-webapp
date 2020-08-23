// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal';
import OverlayTrigger from 'components/overlay_trigger';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';

const MAX_TEAMS_PER_SCHEME_SUMMARY = 8;

export default class PermissionsSchemeSummary extends React.PureComponent {
    static propTypes = {
        scheme: PropTypes.object.isRequired,
        teams: PropTypes.array,
        isDisabled: PropTypes.func,
        actions: PropTypes.shape({
            deleteScheme: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showConfirmModal: false,
            deleting: false,
            serverError: null,
        };
    }

    renderConfirmModal = () => {
        const title = (
            <FormattedMessage
                id='admin.permissions.permissionsSchemeSummary.deleteSchemeTitle'
                defaultMessage='Delete {scheme} scheme?'
                values={{scheme: this.props.scheme.display_name}}
            />
        );

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='permission-scheme-summary-error-message'>
                    <i className='fa fa-exclamation-circle'/> {this.state.serverError}
                </div>
            );
        }

        const message = (
            <div>
                <p>
                    <FormattedMessage
                        id='admin.permissions.permissionsSchemeSummary.deleteConfirmQuestion'
                        defaultMessage='The permissions in the teams using this scheme will reset to the defaults in the System Scheme. Are you sure you want to delete the {schemeName} scheme?'
                        values={{schemeName: this.props.scheme.display_name}}
                    />
                </p>
                {serverError}
            </div>
        );

        const confirmButton = (
            <LoadingWrapper
                loading={this.state.deleting}
                text={Utils.localizeMessage('admin.permissions.permissionsSchemeSummary.deleting', 'Deleting...')}
            >
                <FormattedMessage
                    id='admin.permissions.permissionsSchemeSummary.deleteConfirmButton'
                    defaultMessage='Yes, Delete'
                />
            </LoadingWrapper>
        );

        return (
            <ConfirmModal
                show={this.state.showConfirmModal}
                title={title}
                message={message}
                confirmButtonText={confirmButton}
                onConfirm={this.handleDeleteConfirmed}
                onCancel={this.handleDeleteCanceled}
            />
        );
    }

    stopPropagation = (e) => {
        e.stopPropagation();
    }

    handleDeleteCanceled = () => {
        this.setState({
            showConfirmModal: false,
        });
    }

    handleDeleteConfirmed = async () => {
        this.setState({deleting: true, serverError: null});
        const data = await this.props.actions.deleteScheme(this.props.scheme.id);
        if (data.error) {
            this.setState({deleting: false, serverError: data.error.message});
        } else {
            this.setState({deleting: false, showConfirmModal: false});
        }
    }

    delete = (e) => {
        e.stopPropagation();
        if (this.props.isDisabled) {
            return;
        }
        this.setState({showConfirmModal: true, serverError: null});
    }

    goToEdit = () => {
        this.props.history.push('/admin_console/user_management/permissions/team_override_scheme/' + this.props.scheme.id);
    }

    render = () => {
        const {scheme, isDisabled} = this.props;

        let teams = this.props.teams ? this.props.teams.map((team) => (
            <span
                className='team'
                key={team.id}
            >
                {team.display_name}
            </span>
        )) : [];

        let extraTeams = null;
        if (teams.length > MAX_TEAMS_PER_SCHEME_SUMMARY) {
            extraTeams = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={
                        <Tooltip
                            className='team-scheme-extra-teams-overlay'
                            id={scheme.id + '-extra-teams-overlay'}
                        >
                            {teams.slice(MAX_TEAMS_PER_SCHEME_SUMMARY)}
                        </Tooltip>
                    }
                >
                    <span
                        className='team'
                        key='extra-teams'
                    >
                        <FormattedMessage
                            id='admin.permissions.permissionsSchemeSummary.moreTeams'
                            defaultMessage='+{number} more'
                            values={{number: teams.length - MAX_TEAMS_PER_SCHEME_SUMMARY}}
                        />
                    </span>
                </OverlayTrigger>
            );
            teams = teams.slice(0, MAX_TEAMS_PER_SCHEME_SUMMARY);
        }
        const confirmModal = this.renderConfirmModal();

        return (
            <div
                className='permissions-scheme-summary'
                data-testid='permissions-scheme-summary'
                onClick={this.goToEdit}
            >
                <div onClick={this.stopPropagation}>{confirmModal}</div>
                <div
                    className='permissions-scheme-summary--header'
                >
                    <div className='title'>
                        {scheme.display_name}
                    </div>
                    <div className='actions'>
                        <Link
                            data-testid={`${scheme.display_name}-edit`}
                            className='edit-button'
                            to={'/admin_console/user_management/permissions/team_override_scheme/' + scheme.id}
                        >
                            <FormattedMessage
                                id='admin.permissions.permissionsSchemeSummary.edit'
                                defaultMessage='Edit'
                            />
                        </Link>
                        {'-'}
                        <a
                            data-testid={`${scheme.display_name}-delete`}
                            className={isDisabled ? 'delete-button disabled' : 'delete-button'}
                            onClick={this.delete}
                        >
                            <FormattedMessage
                                id='admin.permissions.permissionsSchemeSummary.delete'
                                defaultMessage='Delete'
                            />
                        </a>
                    </div>
                </div>
                <div className='permissions-scheme-summary--description'>
                    {scheme.description}
                </div>
                <div className='permissions-scheme-summary--teams'>
                    {teams}
                    {extraTeams}
                </div>
            </div>
        );
    };
}
