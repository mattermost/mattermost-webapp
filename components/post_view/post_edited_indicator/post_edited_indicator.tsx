// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import {isSameDay, isWithinLastWeek, isYesterday} from '../../../utils/datetime';
import OverlayTrigger from '../../overlay_trigger';

interface Props {
    postId?: string;
    editedAt?: number;
}

const PostEditedIndicator = ({postId, editedAt = 0}: Props): JSX.Element | null => {
    if (!postId || editedAt === 0) {
        return null;
    }

    const {formatMessage, formatDate, formatTime} = useIntl();
    const editedDate = new Date(editedAt);

    let date;
    switch (true) {
    case isSameDay(editedDate):
        date = formatMessage({id: 'datetime.today', defaultMessage: 'today '});
        break;
    case isYesterday(editedDate):
        date = formatMessage({id: 'datetime.yesterday', defaultMessage: 'yesterday '});
        break;
    case isWithinLastWeek(editedDate):
        date = formatDate(editedDate, {weekday: 'long'});
        break;
    case !isWithinLastWeek(editedDate):
    default:
        date = formatDate(editedDate, {month: 'long', day: 'numeric'});
    }

    const time = formatTime(editedDate, {hour: 'numeric', minute: '2-digit'});

    const editedText = formatMessage({
        id: 'post_message_view.edited',
        defaultMessage: 'Edited',
    });

    const formattedTime = formatMessage({
        id: 'timestamp.datetime',
        defaultMessage: '{relativeOrDate} at {time}',
    },
    {
        relativeOrDate: date,
        time,
    });

    const tooltip = (
        <Tooltip
            id={`edited-post-tooltip_${postId}`}
            className='hidden-xs'
        >
            {`${editedText} ${formattedTime}`}
        </Tooltip>
    );

    return !postId || editedAt === 0 ? null : (
        <OverlayTrigger
            delayShow={250}
            placement='top'
            overlay={tooltip}
        >
            <span
                id={`postEdited_${postId}`}
                className='post-edited__indicator'
                data-post-id={postId}
                data-edited-at={editedAt}
            >
                <Icon
                    glyph={'pencil-outline'}
                    size={10}
                />
                {editedText}
            </span>
        </OverlayTrigger>
    );
};

export default PostEditedIndicator;
