// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as PropTypes from 'prop-types';

import FormError from 'components/form_error';

import ToggleModalButton from 'components/toggle_modal_button.jsx';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';

export const NeedGroupsError = () => (
    <FormError
        error={(
            <FormattedMessage
                id='admin.team_settings.team_detail.need_groups'
                defaultMessage='You must add at least one group to manage this team by sync group members.'
            />)}
    />
);

export class UsersWillBeRemovedError extends React.PureComponent {
    static propTypes = {
        team: PropTypes.object.isRequired,
        amount: PropTypes.number.isRequired,
    }

    render() {
        const {amount, team} = this.props;
        return (
            <FormError
                iconClassName='fa-exclamation-triangle'
                textClassName='has-warning'
                error={(
                    <span>
                        <FormattedMessage
                            id='admin.team_settings.team_detail.users_will_be_removed'
                            defaultMessage='{amount} Users will be removed from this team. They are not in groups linked to this team.'
                            values={{amount}}
                        />
                        <ToggleModalButton
                            className='btn btn-link'
                            dialogType={AddGroupsToTeamModal}
                            dialogProps={{team}}
                        >
                            <FormattedMessage
                                id='admin.team_settings.team_details.view_removed_users'
                                defaultMessage='View These Users'
                            />
                        </ToggleModalButton>
                    </span>
                )}
            />

        );
    }
}
