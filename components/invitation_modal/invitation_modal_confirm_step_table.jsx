// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import BackIcon from 'components/svg/back_icon';

import InvitationModalConfirmStepRow from 'components/invitation_modal/invitation_modal_confirm_step_row';

import './invitation_modal_confirm_step_table.scss';

export default class InvitationModalConfirmStepTable extends React.Component {
    static propTypes = {
        invites: PropTypes.arrayOf(PropTypes.object).isRequired,
    }
    render() {
        return (
            <div className='InvitationModalConfirmStepTable'>
                <div className='table-header'>
                    <div className='people-header'>
                        <BackIcon/>
                        <FormattedMessage
                            id='invitation-modal.confirm.people-header'
                            defaultMessage='People'
                        />
                    </div>
                    <div className='details-header'>
                        <FormattedMessage
                            id='invitation-modal.confirm.details-header'
                            defaultMessage='Details'
                        />
                    </div>
                </div>
                <div className='rows'>
                    {this.props.invites.map((invitation) => (
                        <InvitationModalConfirmStepRow
                            key={invitation.email || invitation.user.id}
                            invitation={invitation}
                        />
                    ))}
                </div>
            </div>
        );
    }
}
