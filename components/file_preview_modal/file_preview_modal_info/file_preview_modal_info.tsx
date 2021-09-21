// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

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
    showFileName: boolean;
    filename: string;
    post: React.ComponentProps<typeof Post>;
}

const displayNameGetter = makeGetDisplayName();

const FilePreviewModalInfo: React.FC<Props> = (props: Props) => {
    const user = useSelector((state: GlobalState) => selectUser(state, props.post.user_id)) as UserProfile | undefined;
    const channel = useSelector((state: GlobalState) => selectChannel(state, props.post.channel_id));
    const name = useSelector((state: GlobalState) => displayNameGetter(state, props.post.user_id, true));

    if (!channel) {
        return <div/>;
    }

    let info;
    const channelName = (
        <FormattedMessage
            id='file_preview_modal_info.shared_in'
            defaultMessage='Shared in ~{name}'
            values={{
                name: channel.name,
            }}
        />
    );
    if (props.showFileName) {
        info = (
            <>
                <h5 className='file-preview-modal__file-name'>{props.filename}
                </h5>
                <span className='file-preview-modal__file-details'>
                    <span className='file-preview-modal__file-details-user-name'>{name}</span>
                    <span className='file-preview-modal__channel'>{channelName}</span>
                </span>
            </>
        );
    } else {
        info = (
            <>
                <h5 className='file-preview-modal__user-name'>{name}
                </h5>
                <span className='file-preview-modal__channel'>{channelName}
                </span>
            </>
        );
    }

    return (
        <div className='file-preview-modal__info'>
            <Avatar
                size='lg'
                url={imageURLForUser(props.post.user_id, user?.last_picture_update)}
                className='file-preview-modal__avatar'
            />
            <div className='file-preview-modal__info-details'>
                {info}
            </div>
        </div>
    );
};

export default memo(FilePreviewModalInfo);
