// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React, {CSSProperties} from 'react';

import {AppBinding, AppPostEmbed} from 'mattermost-redux/types/apps';

import {Post} from 'mattermost-redux/types/posts';

import memoize from 'memoize-one';

import * as Utils from 'utils/utils';
import LinkOnlyRenderer from 'utils/markdown/link_only_renderer';
import {TextFormattingOptions} from 'utils/text_formatting';

import Markdown from 'components/markdown';
import ShowMore from 'components/post_view/show_more';

import ButtonBinding from '../button_binding';
import SelectBinding from '../select_binding';

import {fillBindingsInformation} from 'utils/apps';

type Props = {

    /**
     * The post id
     */
    post: Post;

    /**
     * The attachment to render
     */
    embed: AppPostEmbed;

    /**
     * Options specific to text formatting
     */
    options?: Partial<TextFormattingOptions>;

    currentRelativeTeamUrl: string;
}

export default class AppPostEmbedComponent extends React.PureComponent<Props> {
    fillBindings = memoize(
        (bindings: AppBinding[], appId: string) => {
            const copiedBindings = JSON.parse(JSON.stringify(bindings)) as AppBinding[];
            copiedBindings.forEach((b) => {
                b.app_id = appId;
                fillBindingsInformation(b);
            });
            return copiedBindings;
        },
    )

    renderBindings = () => {
        if (!this.props.embed.app_id) {
            return null;
        }

        if (!this.props.embed.bindings) {
            return null;
        }

        const bindings = this.fillBindings(this.props.embed.bindings, this.props.embed.app_id);
        if (!bindings || !bindings.length) {
            return null;
        }

        const content = [] as JSX.Element[];

        bindings.forEach((binding: AppBinding) => {
            if (!binding.call || !binding.location) {
                return;
            }

            if (binding.bindings && binding.bindings.length > 0) {
                content.push(
                    <SelectBinding
                        key={binding.location}
                        post={this.props.post}
                        binding={binding}
                    />,
                );
            } else {
                content.push(
                    <ButtonBinding
                        key={binding.location}
                        post={this.props.post}
                        binding={binding}
                    />,
                );
            }
        });

        return (
            <div
                className='attachment-actions'
            >
                {content}
            </div>
        );
    };

    handleFormattedTextClick = (e: React.MouseEvent) => Utils.handleFormattedTextClick(e, this.props.currentRelativeTeamUrl);

    render() {
        const {embed, options} = this.props;

        let title;
        if (embed.title) {
            title = (
                <h1 className='attachment__title'>
                    <Markdown
                        message={embed.title}
                        options={{
                            mentionHighlight: false,
                            renderer: new LinkOnlyRenderer(),
                            autolinkedUrlSchemes: [],
                        }}
                    />
                </h1>
            );
        }

        let attachmentText;
        if (embed.text) {
            attachmentText = (
                <ShowMore
                    isAttachmentText={true}
                    text={embed.text}
                >
                    <Markdown
                        message={embed.text || ''}
                        options={options}
                    />
                </ShowMore>
            );
        }

        const bindings = this.renderBindings();

        return (
            <div
                className={'attachment'}
                ref='attachment'
                onClick={this.handleFormattedTextClick}
            >
                <div className='attachment__content'>
                    <div
                        className={'clearfix attachment__container attachment__container--'}
                    >
                        {title}
                        <div>
                            <div
                                className={'attachment__body attachment__body--no_thumb'}
                            >
                                {attachmentText}
                                {bindings}
                            </div>
                            <div style={style.footer}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const style = {
    footer: {clear: 'both'} as CSSProperties,
};
/* eslint-enable react/no-string-refs */
