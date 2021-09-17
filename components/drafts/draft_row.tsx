// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {UserProfile, UserStatus} from 'mattermost-redux/types/users';
import {Draft} from 'selectors/drafts';

import ChannelDraft from './channel_draft';
import ThreadDraft from './thread_draft';

type Props = {
    user: UserProfile;
    status: UserStatus['status'];
    displayName: string;
    draft: Draft;
}

function DraftRow({draft, user, status, displayName}: Props) {
    let Component;

    switch (draft.type) {
    case 'channel':
        Component = ChannelDraft;
        break;
    case 'thread':
        Component = ThreadDraft;
        break;
    default:
        return null;
    }

    return (
        <Component
            {...draft}
            draftId={String(draft.key)}
            user={user}
            status={status}
            displayName={displayName}
        />
    );
}

export default memo(DraftRow);
