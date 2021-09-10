// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';

import Toast from 'components/toast/toast';
import * as Utils from 'utils/utils.jsx';

import './new_replies_banner.scss';

type Props = {
    hasNewReplies: boolean;
    width: number;
    onClick: () => void;
    onDismiss: () => void;
    actions: {
        updateThreadToastStatus: (status: boolean) => void;
    };
}

function NewRepliesBanner({
    hasNewReplies,
    onClick,
    onDismiss,
    width,
    actions,
}: Props) {
    const onClickMessage = Utils.localizeMessage('postlist.toast.scrollToLatest', 'Jump to new messages');

    useEffect(() => {
        actions.updateThreadToastStatus(hasNewReplies);
    }, [hasNewReplies]);

    return (
        <div
            className='new-replies-banner'
            style={{width}}
        >
            <Toast
                show={hasNewReplies}
                showActions={true}
                onClick={onClick}
                onDismiss={onDismiss}
                onClickMessage={onClickMessage}
                width={156}
            >
                <FormattedMessage
                    id='rhs_thread.toast.newReplies'
                    defaultMessage='New Replies'
                />
            </Toast>
        </div>
    );
}

export default memo(NewRepliesBanner);
