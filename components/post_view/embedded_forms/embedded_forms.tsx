// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {Post} from 'mattermost-redux/types/posts';

import {PostEmbed} from 'mattermost-redux/types/apps';

import {TextFormattingOptions} from 'utils/text_formatting';

import EmbeddedForm from './embedded_form';

type Props = {

    /**
     * The post id
     */
    post: Post;

    /**
     * Array of attachments to render
     */
    embeds: PostEmbed[]; // Type App Embed Wrapper

    /**
     * Options specific to text formatting
     */
    options?: Partial<TextFormattingOptions>;

}

export default class EmbeddedForms extends React.PureComponent<Props> {
    static defaultProps = {
        imagesMetadata: {},
    }

    render() {
        const content = [] as JSX.Element[];
        this.props.embeds.forEach((embed, i) => {
            content.push(
                <EmbeddedForm
                    embed={embed}
                    post={this.props.post}
                    key={'att_' + i}
                    options={this.props.options}
                />,
            );
        });

        return (
            <div
                id={`messageAttachmentList_${this.props.post.id}`}
                className='attachment__list'
            >
                {content}
            </div>
        );
    }
}
