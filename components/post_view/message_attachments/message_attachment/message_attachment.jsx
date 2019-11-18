// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import truncate from 'lodash/truncate';

import {isUrlSafe} from 'utils/url';
import {handleFormattedTextClick} from 'utils/utils';
import {Constants} from 'utils/constants';

import ExternalImage from 'components/external_image';
import Markdown from 'components/markdown';
import ShowMore from 'components/post_view/show_more';
import SizeAwareImage from 'components/size_aware_image';

import ActionButton from '../action_button';
import ActionMenu from '../action_menu';
import LinkOnlyRenderer from 'utils/markdown/link_only_renderer';

export default class MessageAttachment extends React.PureComponent {
    static propTypes = {

        /**
         * The post id
         */
        postId: PropTypes.string.isRequired,

        /**
         * The attachment to render
         */
        attachment: PropTypes.object.isRequired,

        /**
         * Options specific to text formatting
         */
        options: PropTypes.object,

        /**
         * images object for dimensions
         */
        imagesMetadata: PropTypes.object,

        actions: PropTypes.shape({
            doPostActionWithCookie: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            checkOverflow: 0,
        };

        this.imageProps = {
            onImageLoaded: this.handleHeightReceived,
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleHeightReceivedForThumbUrl = ({height}) => {
        const {attachment} = this.props;
        if (!this.props.imagesMetadata || (this.props.imagesMetadata && !this.props.imagesMetadata[attachment.thumb_url])) {
            this.handleHeightReceived(height);
        }
    }

    handleHeightReceivedForImageUrl = ({height}) => {
        const {attachment} = this.props;
        if (!this.props.imagesMetadata || (this.props.imagesMetadata && !this.props.imagesMetadata[attachment.image_url])) {
            this.handleHeightReceived(height);
        }
    }

    handleHeightReceived = (height) => {
        if (!this.mounted) {
            return;
        }

        if (height > 0) {
            // Increment checkOverflow to indicate change in height
            // and recompute textContainer height at ShowMore component
            // and see whether overflow text of show more/less is necessary or not.
            this.setState((prevState) => {
                return {checkOverflow: prevState.checkOverflow + 1};
            });
        }
    };

    renderPostActions = () => {
        const actions = this.props.attachment.actions;
        if (!actions || !actions.length) {
            return '';
        }

        const content = [];

        actions.forEach((action) => {
            if (!action.id || !action.name) {
                return;
            }

            switch (action.type) {
            case 'select':
                content.push(
                    <ActionMenu
                        key={action.id}
                        postId={this.props.postId}
                        action={action}
                        disabled={action.disabled}
                    />
                );
                break;
            case 'button':
            default:
                content.push(
                    <ActionButton
                        key={action.id}
                        action={action}
                        disabled={action.disabled}
                        handleAction={this.handleAction}
                    />
                );
                break;
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

    handleAction = (e) => {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id');
        const actionCookie = e.currentTarget.getAttribute('data-action-cookie');

        this.props.actions.doPostActionWithCookie(this.props.postId, actionId, actionCookie);
    };

    getFieldsTable = () => {
        const fields = this.props.attachment.fields;
        if (!fields || !fields.length) {
            return '';
        }

        const fieldTables = [];

        let headerCols = [];
        let bodyCols = [];
        let rowPos = 0;
        let lastWasLong = false;
        let nrTables = 0;
        const markdown = {markdown: false, mentionHighlight: false};

        fields.forEach((field, i) => {
            if (rowPos === 2 || !(field.short === true) || lastWasLong) {
                fieldTables.push(
                    <table
                        className='attachment-fields'
                        key={'attachment__table__' + nrTables}
                    >
                        <thead>
                            <tr>
                                {headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {bodyCols}
                            </tr>
                        </tbody>
                    </table>
                );
                headerCols = [];
                bodyCols = [];
                rowPos = 0;
                nrTables += 1;
                lastWasLong = false;
            }
            headerCols.push(
                <th
                    className='attachment-field__caption'
                    key={'attachment__field-caption-' + i + '__' + nrTables}
                    width='50%'
                >
                    <Markdown
                        message={field.title}
                        options={markdown}
                    />
                </th>
            );

            bodyCols.push(
                <td
                    className='attachment-field'
                    key={'attachment__field-' + i + '__' + nrTables}
                >
                    <Markdown message={field.value}/>
                </td>
            );
            rowPos += 1;
            lastWasLong = !(field.short === true);
        });
        if (headerCols.length > 0) { // Flush last fields
            fieldTables.push(
                <table
                    className='attachment-fields'
                    key={'attachment__table__' + nrTables}
                >
                    <thead>
                        <tr>
                            {headerCols}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {bodyCols}
                        </tr>
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                {fieldTables}
            </div>
        );
    };

    render() {
        const {attachment, options} = this.props;
        let preTextClass = '';

        let preText;
        if (attachment.pretext) {
            preTextClass = 'attachment--pretext';
            preText = (
                <div className='attachment__thumb-pretext'>
                    <Markdown message={attachment.pretext}/>
                </div>
            );
        }

        let author = [];
        if (attachment.author_name || attachment.author_icon) {
            if (attachment.author_icon) {
                author.push(
                    <ExternalImage
                        key={'attachment__author-icon'}
                        src={attachment.author_icon}
                        imageMetadata={this.props.imagesMetadata[attachment.author_icon]}
                    >
                        {(iconUrl) => (
                            <img
                                alt={'attachment author icon'}
                                className='attachment__author-icon'
                                src={iconUrl}
                                height='14'
                                width='14'
                            />
                        )}
                    </ExternalImage>
                );
            }
            if (attachment.author_name) {
                author.push(
                    <span
                        className='attachment__author-name'
                        key={'attachment__author-name'}
                    >
                        {attachment.author_name}
                    </span>
                );
            }
        }
        if (attachment.author_link && isUrlSafe(attachment.author_link)) {
            author = (
                <a
                    href={attachment.author_link}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {author}
                </a>
            );
        }

        let title;
        if (attachment.title) {
            if (attachment.title_link && isUrlSafe(attachment.title_link)) {
                title = (
                    <h1 className='attachment__title'>
                        <a
                            className='attachment__title-link'
                            href={attachment.title_link}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {attachment.title}
                        </a>
                    </h1>
                );
            } else {
                title = (
                    <h1 className='attachment__title'>
                        <Markdown
                            message={attachment.title}
                            options={{
                                mentionHighlight: false,
                                renderer: new LinkOnlyRenderer(),
                                autolinkedUrlSchemes: [],
                            }}
                        />
                    </h1>
                );
            }
        }

        let attachmentText;
        if (attachment.text) {
            attachmentText = (
                <ShowMore
                    checkOverflow={this.state.checkOverflow}
                    isAttachmentText={true}
                    text={attachment.text}
                >
                    <Markdown
                        message={attachment.text || ''}
                        options={options}
                        imageProps={this.imageProps}
                    />
                </ShowMore>
            );
        }

        let image;
        if (attachment.image_url) {
            const imageMetadata = this.props.imagesMetadata[attachment.image_url];

            image = (
                <div className='attachment__image-container'>
                    <ExternalImage
                        src={attachment.image_url}
                        imageMetadata={imageMetadata}
                    >
                        {(imageUrl) => (
                            <SizeAwareImage
                                className='attachment__image'
                                onImageLoaded={this.handleHeightReceivedForImageUrl}
                                src={imageUrl}
                                dimensions={imageMetadata}
                            />
                        )}
                    </ExternalImage>
                </div>
            );
        }

        let footer;
        if (attachment.footer) {
            let footerIcon;
            if (attachment.footer_icon) {
                const footerIconMetadata = this.props.imagesMetadata[attachment.footer_icon];

                footerIcon = (
                    <ExternalImage
                        src={attachment.footer_icon}
                        imageMetadata={footerIconMetadata}
                    >
                        {(footerIconUrl) => (
                            <img
                                alt={'attachment footer icon'}
                                className='attachment__footer-icon'
                                src={footerIconUrl}
                                height='16'
                                width='16'
                            />
                        )}
                    </ExternalImage>
                );
            }

            footer = (
                <div className='attachment__footer-container'>
                    {footerIcon}
                    <span>{truncate(attachment.footer, {length: Constants.MAX_ATTACHMENT_FOOTER_LENGTH, omission: '…'})}</span>
                </div>
            );
        }

        let thumb;
        if (attachment.thumb_url) {
            const thumbMetadata = this.props.imagesMetadata[attachment.thumb_url];

            thumb = (
                <div className='attachment__thumb-container'>
                    <ExternalImage
                        src={attachment.thumb_url}
                        imageMetadata={thumbMetadata}
                    >
                        {(thumbUrl) => (
                            <SizeAwareImage
                                onImageLoaded={this.handleHeightReceivedForThumbUrl}
                                src={thumbUrl}
                                dimensions={thumbMetadata}
                            />
                        )}
                    </ExternalImage>
                </div>
            );
        }

        const fields = this.getFieldsTable();
        const actions = this.renderPostActions();

        let useBorderStyle;
        if (attachment.color && attachment.color[0] === '#') {
            useBorderStyle = {borderLeftColor: attachment.color};
        }

        return (
            <div
                className={'attachment ' + preTextClass}
                ref='attachment'
            >
                {preText}
                <div className='attachment__content'>
                    <div
                        className={useBorderStyle ? 'clearfix attachment__container' : 'clearfix attachment__container attachment__container--' + attachment.color}
                        style={useBorderStyle}
                    >
                        {author}
                        {title}
                        <div>
                            <div
                                className={thumb ? 'attachment__body' : 'attachment__body attachment__body--no_thumb'}
                                onClick={handleFormattedTextClick}
                            >
                                {attachmentText}
                                {image}
                                {fields}
                                {footer}
                                {actions}
                            </div>
                            {thumb}
                            <div style={style.footer}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const style = {
    footer: {clear: 'both'},
};
