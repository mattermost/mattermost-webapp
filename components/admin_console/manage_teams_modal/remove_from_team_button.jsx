// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class RemoveFromTeamButton extends React.PureComponent {
    static propTypes = {
        teamId: PropTypes.string.isRequired,
        handleRemoveUserFromTeam: PropTypes.func.isRequired,
    };

    handleClick = (e) => {
        e.preventDefault();
        this.props.handleRemoveUserFromTeam(this.props.teamId);
    }

    render() {
        return (
            <button
                type='button'
                className='btn btn-danger'
                onClick={this.handleClick}
            >
                <FormattedMessage
                    id='team_members_dropdown.leave_team'
                    defaultMessage='Remove from Team'
                />
            </button>
        );
    }
}
