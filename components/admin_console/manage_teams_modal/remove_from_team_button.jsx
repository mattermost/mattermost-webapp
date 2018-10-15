// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class RemoveFromTeamButton extends React.PureComponent {
    static propTypes = {
        onError: PropTypes.func.isRequired,
        onMemberRemove: PropTypes.func.isRequired,
        team: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        removeUserFromTeam: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.handleMemberRemove = this.handleMemberRemove.bind(this);
    }

    handleClick = async (e) => {
        e.preventDefault();

        const {data, error} = await this.props.removeUserFromTeam(this.props.team.id, this.props.user.id);
        if (data) {
            this.handleMemberRemove();
        } else if (error) {
            this.props.onError(error.message);
        }
    }

    handleMemberRemove() {
        this.props.onMemberRemove(this.props.team.id);
    }

    render() {
        return (
            <button
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
