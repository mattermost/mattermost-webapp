// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React, {CSSProperties} from 'react';

import {AppBinding} from 'mattermost-redux/types/apps';

import {Post} from 'mattermost-redux/types/posts';

import * as Utils from 'utils/utils';
import LinkOnlyRenderer from 'utils/markdown/link_only_renderer';
import {TextFormattingOptions} from 'utils/text_formatting';

import Markdown from 'components/markdown';
import ShowMore from 'components/post_view/show_more';

import ButtonBinding from '../button_binding';
import SelectBinding from '../select_binding';

import {cleanBinding} from 'mattermost-redux/utils/apps';
import {AppBindingLocations} from 'mattermost-redux/constants/apps';

type Props = {

    /**
     * The post id
     */
    post: Post;

    /**
     * The attachment to render
     */
    embed: AppBinding;

    /**
     * Options specific to text formatting
     */
    options?: Partial<TextFormattingOptions>;

    currentRelativeTeamUrl: string;
}

export default class EmbeddedBinding extends React.PureComponent<Props> {
    fillBindings = (binding: AppBinding) => {
        const copiedBindings = JSON.parse(JSON.stringify(binding)) as AppBinding;
        cleanBinding(copiedBindings, AppBindingLocations.IN_POST);
        return copiedBindings.bindings;
    }

    renderBindings = () => {
        if (!this.props.embed.app_id) {
            return null;
        }

        if (!this.props.embed.bindings) {
            return null;
        }

        const bindings = this.fillBindings(this.props.embed);
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
        if (embed.label) {
            title = (
                <h1 className='attachment__title'>
                    <Markdown
                        message={embed.label}
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
        if (embed.description) {
            attachmentText = (
                <ShowMore
                    isAttachmentText={true}
                    text={embed.description}
                    maxHeight={200}
                >
                    <Markdown
                        message={embed.description}
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
