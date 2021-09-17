// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {removeFilePreview} from 'actions/views/drafts';

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
    draftId: string;
    fileInfos: PostDraft['fileInfos'];
    message: string;
    status: UserStatus['status'];
    uploadsInProgress: PostDraft['uploadsInProgress'];
    user: UserProfile;
}

function Body({
    channelId,
    displayName,
    draftId,
    fileInfos,
    message,
    status,
    uploadsInProgress,
    user,
}: Props) {
    const dispatch = useDispatch();

    const handleRemovePreview = useCallback((id: string) => {
        dispatch(removeFilePreview(draftId, id));
    }, [draftId]);

    return (
        <div className='PanelBody'>
            <div className='PanelBody__left'>
                <ProfilePicture
                    status={status}
                    channelId={channelId}
                    username={user.username}
                    userId={user.id}
                    size={'md'}
                    src={imageURLForUser(user.id)}
                />
            </div>
            <div className='PanelBody__right'>
                <p><strong>{displayName}</strong></p>
                <Markdown message={message}/>
                {(fileInfos.length > 0 || uploadsInProgress?.length > 0) && (
                    <FilePreview
                        fileInfos={fileInfos}
                        onRemove={handleRemovePreview}
                        uploadsInProgress={uploadsInProgress}
                    />
                )}
            </div>
        </div>
    );
}

export default Body;
