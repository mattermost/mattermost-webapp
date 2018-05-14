// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import ConfirmModal from 'components/confirm_modal.jsx';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';

export default class PermissionsSchemeSummary extends React.Component {
    static propTypes = {
        scheme: PropTypes.object.isRequired,
        teams: PropTypes.array,
        actions: PropTypes.shape({
            deleteScheme: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showConfirmModal: false,
            deleting: false,
        };
    }

    renderConfirmModal = () => {
        const title = (
            <FormattedMessage
                id='admin.permissions.permissionsSchemeSummary.deleteSchemeTitle'
                defaultMessage='Confirm scheme deletion'
            />
        );

        const message = (
            <div>
                <p>
                    <FormattedMessage
                        id='admin.permissions.permissionsSchemeSummary.deleteConfirmQuestion'
                        defaultMessage='Are you sure you want to delete the {schemeName} scheme?'
                        values={{schemeName: this.props.scheme.name}}
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='admin.permissions.permissionsSchemeSummary.deleteConfirmExplanation'
                        defaultMessage='Once deleted, all the teams using this scheme will start to use the default system scheme.'
                    />
                </p>
            </div>
        );

        let confirmButton = (
            <FormattedMessage
                id='admin.permissions.permissionsSchemeSummary.deleteConfirmButton'
                defaultMessage='Confirm deletion'
            />
        );

        if (this.state.deleting) {
            confirmButton = (
                <span>
                    <span className='fa fa-refresh icon--rotate'/>
                    <FormattedMessage
                        id='admin.permissions.permissionsSchemeSummary.deleting'
                        defaultMessage='Deleting...'
                    />
                </span>
            );
        }

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
        this.setState({deleting: true});
        await this.props.actions.deleteScheme(this.props.scheme.id);
        this.setState({deleting: false, showConfirmModal: false});
    }

    delete = (e) => {
        e.stopPropagation();
        this.setState({showConfirmModal: true});
    }

    goToEdit = () => {
        browserHistory.push('/admin_console/permissions/team-override-scheme/' + this.props.scheme.id);
    }

    render = () => {
        const scheme = this.props.scheme;

        let teams = this.props.teams ? this.props.teams.map((team) => (
            <span
                className='team'
                key={team.id}
            >
                {team.name}
            </span>
        )) : [];

        let extraTeams = null;
        if (teams.length > 8) {
            extraTeams = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={
                        <Tooltip
                            className='team-scheme-extra-teams-overlay'
                            id={scheme.id + '-extra-teams-overlay'}
                        >
                            {teams.slice(8)}
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
                            values={{number: teams.length - 8}}
                        />
                    </span>
                </OverlayTrigger>
            );
            teams = teams.slice(0, 8);
        }
        const confirmModal = this.renderConfirmModal();

        return (
            <div
                className='permissions-scheme-summary'
                onClick={this.goToEdit}
            >
                <div onClick={this.stopPropagation}>{confirmModal}</div>
                <div
                    className='permissions-scheme-summary--header'
                >
                    <div className='title'>
                        {scheme.name}
                    </div>
                    <div className='actions'>
                        <Link
                            className='edit-button'
                            to={'/admin_console/permissions/team-override-scheme/' + scheme.id}
                        >
                            <FormattedMessage
                                id='admin.permissions.permissionsSchemeSummary.edit'
                                defaultMessage='Edit'
                            />
                        </Link>
                        {'-'}
                        <a
                            className='delete-button'
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
