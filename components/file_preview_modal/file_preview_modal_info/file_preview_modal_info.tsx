// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {useSelector} from 'react-redux';

import Avatar from '../../widgets/users/avatar/avatar';
import {imageURLForUser} from '../../../utils/utils';
import {GlobalState} from '../../../types/store';
import {
    getUser as selectUser,
    makeGetDisplayName,
} from 'mattermost-redux/selectors/entities/users';
import {UserProfile} from 'mattermost-redux/types/users';
import {getChannel as selectChannel} from 'mattermost-redux/selectors/entities/channels';
import Post from '../../post_view/post/post';

import './file_preview_modal_info.scss';

interface Props {
    filename: string;
    post: React.ComponentProps<typeof Post>;
}

const displayNameGetter = makeGetDisplayName();

const FilePreviewModalInfo: React.FC<Props> = (props: Props) => {
    const user = useSelector((state: GlobalState) => selectUser(state, props.post.user_id)) as UserProfile | undefined;
    const channel = useSelector((state: GlobalState) => selectChannel(state, props.post.channel_id));
    const name = useSelector((state: GlobalState) => displayNameGetter(state, props.post.user_id, true));

    return (
        <div className='file-preview-modal__info'>
            <Avatar
                size='lg'
                url={imageURLForUser(props.post.user_id, user?.last_picture_update)}
                className='file-preview-modal__avatar'
            />
            <div className='file-preview-modal__info-details'>
                <h5 className='file-preview-modal__file-name'>
                    {props.filename}
                </h5>
                <span>
                    {name} <span className='file-preview-modal__channel'>{' shared in ~' + channel.name}</span>
                </span>
            </div>
        </div>
    );
};

export default memo(FilePreviewModalInfo);
