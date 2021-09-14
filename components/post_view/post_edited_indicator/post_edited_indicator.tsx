// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';

interface Props {
    postId?: string | null;
    editedAt?: number;
}

const PostEditedIndicator = ({postId = null, editedAt = 0}: Props): JSX.Element | null => {
    return postId && editedAt > 0 ? (
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
            <FormattedMessage
                id='post_message_view.edited'
                defaultMessage='Edited'
            />
        </span>
    ) : null;
};

export default PostEditedIndicator;
