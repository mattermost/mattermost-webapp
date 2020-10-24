// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import DeleteModalTrigger from 'components/delete_modal_trigger';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

export default class DeleteEmoji extends DeleteModalTrigger {
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
                <WarningIcon additionalClassName='mr-1'/>
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
