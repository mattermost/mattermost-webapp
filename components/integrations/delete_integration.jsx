// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import DeleteModalTrigger from 'components/delete_modal_trigger.jsx';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

export default class DeleteIntegration extends DeleteModalTrigger {
    get triggerTitle() {
        return (
            <FormattedMessage
                id='installed_integrations.delete'
                defaultMessage='Delete'
            />
        );
    }

    get modalTitle() {
        return (
            <FormattedMessage
                id='integrations.delete.confirm.title'
                defaultMessage='Delete Integration'
            />
        );
    }

    get modalMessage() {
        return (
            <div className='alert alert-warning'>
                <WarningIcon additionalClassName='fa-margin--right'/>
                <FormattedMessage
                    id={this.props.messageId}
                    defaultMessage='This action permanently deletes the integration and breaks any integrations using it. Are you sure you want to delete it?'
                />
            </div>
        );
    }

    get modalConfirmButton() {
        return (
            <FormattedMessage
                id='integrations.delete.confirm.button'
                defaultMessage='Delete'
            />
        );
    }
}

DeleteIntegration.propTypes = {
    messageId: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
};
