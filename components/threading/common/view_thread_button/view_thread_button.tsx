// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ButtonHTMLAttributes} from 'react';
import classNames from 'classnames';

import {FormattedMessage} from 'react-intl';

import {MessageTextOutlineIcon} from '@mattermost/compass-icons/components';

import './view_thread_button.scss';

type Props = {
    hasNewReplies: boolean;
}

type Attrs = Exclude<ButtonHTMLAttributes<HTMLButtonElement>, Props>

function ViewThreadButton({
    hasNewReplies,
    ...attrs
}: Props & Attrs) {
    return (
        <button
            {...attrs}
            className={classNames('ViewThreadButton', attrs.className)}
            data-testid='view-thread-button'
        >
            <span className='ViewThreadButton_prepended'>
                <div className='ViewThreadButton_icon'>
                    <MessageTextOutlineIcon size={18}/>
                </div>
            </span>
            <span className='ViewThreadButton_label'>
                <FormattedMessage
                    id={hasNewReplies ? 'post_message_preview.view_newer_replies_button' : 'post_message_preview.view_thread_button'}
                    defaultMessage={hasNewReplies ? 'View newer replies' : 'View thread'}
                />
            </span>
        </button>
    );
}

export default memo(ViewThreadButton);
