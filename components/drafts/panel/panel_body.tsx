// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {PostDraft} from 'types/store/rhs';

import Markdown from 'components/markdown';
import FilePreview from 'components/file_preview';
import ProfilePicture from 'components/profile_picture';
import {imageURLForUser} from 'utils/utils';

import './panel_body.scss';

type Props = {
    channelId: string;
    displayName: string;
    fileInfos: PostDraft['fileInfos'];
    message: string;
    status: UserStatus['status'];
    uploadsInProgress: PostDraft['uploadsInProgress'];
    userId: UserProfile['id'];
    username: UserProfile['username'];
}

function Body({
    channelId,
    displayName,
    fileInfos,
    message,
    status,
    uploadsInProgress,
    userId,
    username,
}: Props) {
    return (
        <div className='DraftPanelBody post'>
            <div className='DraftPanelBody__left post__img'>
                <ProfilePicture
                    status={status}
                    channelId={channelId}
                    username={username}
                    userId={userId}
                    size={'md'}
                    src={imageURLForUser(userId)}
                />
            </div>
            <div className='post__content'>
                <div className='DraftPanelBody__right'>
                    <div className='post__header'>
                        <strong>{displayName}</strong>
                    </div>
                    <div className='post__body'>
                        <Markdown message={message}/>
                    </div>
                    {(fileInfos.length > 0 || uploadsInProgress?.length > 0) && (
                        <FilePreview
                            fileInfos={fileInfos}
                            uploadsInProgress={uploadsInProgress}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Body;
