// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import PostAttachmentOpenGraphOld from 'components/post_view/attachments/post_attachment_opengraph/post_attachment_opengraph_old';
import PostAttachmentOpenGraph from 'components/post_view/attachments/post_attachment_opengraph/post_attachment_opengraph';

export default class PostAttachmentOpengraphContainer extends React.PureComponent {
    static propTypes = {

        /**
         * The link to display the open graph data for
         */
        link: PropTypes.string.isRequired,

        /**
         * The current user viewing the post
         */
        currentUser: PropTypes.object,

        /**
         * The post where this link is included
         */
        post: PropTypes.object,

        /**
         * The open graph data to render
         */
        openGraphData: PropTypes.object,

        /**
         * Set to collapse the preview
         */
        previewCollapsed: PropTypes.string,
        actions: PropTypes.shape({

            /**
             * The function to get open graph data for a link
             */
            getOpenGraphMetadata: PropTypes.func.isRequired
        }).isRequired
    };

    render() {
        return (
            <div>
                <PostAttachmentOpenGraph {...this.props}/>
                <PostAttachmentOpenGraphOld {...this.props}/>
            </div>
        );
    }
}
