// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {PostDraft} from 'types/store/rhs';

import './channel_pencil_icon.scss';

type Props = {
    draft: PostDraft|null;
};

function ChannelPencilIcon({draft}: Props) {
    if (draft) {
        return (
            <i
                data-testid='draftIcon'
                className='icon icon-pencil-outline channel-pencil-icon'
            />
        );
    }
    return null;
}

export default memo(ChannelPencilIcon);
