// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import PostAttachment from './post_attachment.jsx';

export default class PostAttachmentList extends React.PureComponent {
    static propTypes = {

        /**
         * The post id
         */
        postId: PropTypes.string.isRequired,

        /**
         * Array of attachments to render
         */
        attachments: PropTypes.array.isRequired,
    }

    render() {
        const content = [];
        this.props.attachments.forEach((attachment, i) => {
            content.push(
                <PostAttachment
                    attachment={attachment}
                    postId={this.props.postId}
                    key={'att_' + i}
                />
            );
        });

        return (
            <div className='attachment__list'>
                {content}
            </div>
        );
    }
}
