// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {Post} from 'mattermost-redux/types/posts';

import FileCard from './file_card';
import AttachmentCard from './attachment_card';

type Props = {
    post: Post;
}

function Attachment({post}: Props) {
    if (post.file_ids?.length) {
        return <FileCard id={post.file_ids[0]}/>;
    }

    if (post.props.attachments && post.props.attachments.length) {
        return <AttachmentCard {...post.props.attachments[0]}/>;
    }

    return null;
}

function arePropsEqual(prevProps: Props, nextProps: Props) {
    return (
        prevProps.post.file_ids?.[0] === nextProps.post.file_ids?.[0] &&
        prevProps.post.props.attachments?.[0] === nextProps.post.props.attachments?.[0]
    );
}

export default memo(Attachment, arePropsEqual);
