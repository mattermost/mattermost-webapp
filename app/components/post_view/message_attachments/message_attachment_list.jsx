// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import MessageAttachment from './message_attachment';

export default class MessageAttachmentList extends React.PureComponent {
    static propTypes = {

        /**
         * The post id
         */
        postId: PropTypes.string.isRequired,

        /**
         * Array of attachments to render
         */
        attachments: PropTypes.array.isRequired,

        /**
         * Options specific to text formatting
         */
        options: PropTypes.object,

        /**
         * Images object used for creating placeholders to prevent scroll popup
         */
        imagesMetadata: PropTypes.object,
    }

    static defaultProps = {
        imagesMetadata: {},
    }

    render() {
        const content = [];
        this.props.attachments.forEach((attachment, i) => {
            content.push(
                <MessageAttachment
                    attachment={attachment}
                    postId={this.props.postId}
                    key={'att_' + i}
                    options={this.props.options}
                    imagesMetadata={this.props.imagesMetadata}
                />,
            );
        });

        return (
            <div
                id={`messageAttachmentList_${this.props.postId}`}
                className='attachment__list'
            >
                {content}
            </div>
        );
    }
}
