// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ButtonHTMLAttributes} from 'react';
import classNames from 'classnames';

import {useIntl} from 'react-intl';

import {MessageTextOutlineIcon} from '@mattermost/compass-icons/components';

import {t} from 'utils/i18n';

import './view_thread_button.scss';

type Props = {
    hasNewReplies: boolean;
}

type Attrs = Exclude<ButtonHTMLAttributes<HTMLButtonElement>, Props>

function ViewThreadButton({
    hasNewReplies,
    ...attrs
}: Props & Attrs) {
    const {formatMessage} = useIntl();
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
                {formatMessage(hasNewReplies ? {
                    id: t('post_message_preview.view_newer_replies_button'),
                    defaultMessage: 'View newer replies',
                } : {
                    id: t('post_message_preview.view_thread_button'),
                    defaultMessage: 'View thread',
                })}
            </span>
        </button>
    );
}

export default memo(ViewThreadButton);
