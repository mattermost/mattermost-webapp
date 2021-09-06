// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';

import Toast from 'components/toast/toast';
import {RelativeRanges} from 'components/timestamp';
import {isIdNotPost, getNewMessageIndex} from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';

const TOAST_TEXT_COLLAPSE_WIDTH = 500;

const TOAST_REL_RANGES = [
    RelativeRanges.TODAY_YESTERDAY,
];

type Props = {
    hasNewReplies: boolean;
    width: number;
    onClick: () => void;
    onDismiss: () => void;
}

function NewRepliesBanner({
    hasNewReplies,
    onClick,
    onDismiss,
    width,
}: Props) {
    const onClickMessage = Utils.localizeMessage('postlist.toast.scrollToLatest', 'Jump to new messages');

    return (
        <React.Fragment>
            <Toast
                show={hasNewReplies}
                showActions={true}
                onClick={onClick}
                onDismiss={onDismiss}
                onClickMessage={onClickMessage}
                width={width}
            >
                <FormattedMessage
                    id='rhs_thread.toast.newReplies'
                    defaultMessage='New Replies'
                />
            </Toast>
        </React.Fragment>
    );
}

export default memo(NewRepliesBanner);
