// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import DeleteModalTrigger from 'components/delete_modal_trigger.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export default class DeleteEmoji extends DeleteModalTrigger {
    static propTypes = {
        onDelete: PropTypes.func.isRequired,
    }

    get triggerTitle() {
        return (
            <FormattedMessage
                id='emoji_list.delete'
                defaultMessage='Delete'
            />
        );
    }

    get modalTitle() {
        return (
            <FormattedMessage
                id='emoji_list.delete.confirm.title'
                defaultMessage='Delete Custom Emoji'
            />
        );
    }

    get modalMessage() {
        return (
            <div className='alert alert-warning'>
                <i
                    className='fa fa-warning fa-margin--right'
                    title={localizeMessage('generic_icons.warning', 'Warning Icon')}
                />
                <FormattedMessage
                    id='emoji_list.delete.confirm.msg'
                    defaultMessage='This action permanently deletes the custom emoji. Are you sure you want to delete it?'
                />
            </div>
        );
    }

    get modalConfirmButton() {
        return (
            <FormattedMessage
                id='emoji_list.delete.confirm.button'
                defaultMessage='Delete'
            />
        );
    }
}
