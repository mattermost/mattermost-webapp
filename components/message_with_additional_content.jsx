import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';

export default function MessageWithAdditionalContent({post, previewCollapsed, previewEnabled, isEmbedVisible, pluginPostTypes}) {
    const hasPlugin = post.type && pluginPostTypes.hasOwnProperty(post.type);
    let msg;
    const messageWrapper = (
        <PostMessageContainer
            post={post}
            isRHS={true}
            hasMention={true}
        />
    );
    if (post.state === Posts.POST_DELETED || hasPlugin) {
        msg = messageWrapper;
    } else {
        msg = (
            <PostBodyAdditionalContent
                post={post}
                previewCollapsed={previewCollapsed}
                previewEnabled={previewEnabled}
                isEmbedVisible={isEmbedVisible}
            >
                {messageWrapper}
            </PostBodyAdditionalContent>
        );
    }
    return msg;
}