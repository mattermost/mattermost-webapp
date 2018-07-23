// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as PostActions from 'actions/post_actions.jsx';
import {postListScrollChange} from 'actions/global_actions';

import Markdown from 'components/markdown';

import {isUrlSafe} from 'utils/url.jsx';
import {localizeMessage} from 'utils/utils.jsx';

// This must match the max-height defined in CSS for the collapsed attachmentText div
const MAX_ATTACHMENT_TEXT_HEIGHT = 600;

export default class PostAttachment extends React.PureComponent {
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
    }

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true,
            hasOverflow: false,
        };

        this.imageProps = {
            onHeightReceived: this.handleImageHeightReceived,
        };
    }

    componentDidMount() {
        this.checkAttachmentTextOverflow();

        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        if (this.props.attachment.text !== prevProps.attachment.text) {
            this.checkAttachmentTextOverflow();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    checkAttachmentTextOverflow = () => {
        const attachmentText = this.refs.attachmentText;
        let hasOverflow = false;
        if (attachmentText && attachmentText.scrollHeight > MAX_ATTACHMENT_TEXT_HEIGHT) {
            hasOverflow = true;
        }

        if (hasOverflow !== this.state.hasOverflow) {
            this.setState({
                hasOverflow,
            });
        }
    };

    handleImageHeightReceived = () => {
        postListScrollChange();

        this.checkAttachmentTextOverflow();
    };

    handleResize = () => {
        this.checkAttachmentTextOverflow();
    };

    toggleCollapseState = (e) => {
        e.preventDefault();
        this.setState((prevState) => {
            return {
                collapsed: !prevState.collapsed,
            };
        });
    };

    getActionView = () => {
        const actions = this.props.attachment.actions;
        if (!actions || !actions.length) {
            return '';
        }

        const buttons = [];

        actions.forEach((action) => {
            if (!action.id || !action.name) {
                return;
            }
            buttons.push(
                <button
                    data-action-id={action.id}
                    key={action.id}
                    onClick={this.handleActionButtonClick}
                >
                    {action.name}
                </button>
            );
        });

        return (
            <div
                className='attachment-actions'
            >
                {buttons}
            </div>
        );
    };

    handleActionButtonClick = (e) => {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id');
        PostActions.doPostAction(this.props.postId, actionId);
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
                    {field.title}
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
        const {
            collapsed,
            hasOverflow,
        } = this.state;
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
                    <img
                        className='attachment__author-icon'
                        src={attachment.author_icon}
                        key={'attachment__author-icon'}
                        height='14'
                        width='14'
                    />
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
                        {attachment.title}
                    </h1>
                );
            }
        }

        let text;
        if (attachment.text) {
            let collapseMessage = localizeMessage('post_attachment.more', 'Show more...');
            let textClass = 'attachment__text';
            if (collapsed) {
                collapseMessage = localizeMessage('post_attachment.collapse', 'Show less...');
                textClass += ' attachment__text--collapsed';
            }

            let textOverflow = null;
            if (hasOverflow) {
                textOverflow = (
                    <div className='attachment__text-collapse'>
                        <div className='attachment__text-collapse__link-more'>
                            <a
                                className='attachment__text-link-more'
                                href='#'
                                onClick={this.toggleCollapseState}
                            >
                                {collapseMessage}
                            </a>
                        </div>
                    </div>
                );
            }

            text = (
                <div className={textClass}>
                    <div
                        className='attachment__text-container'
                        ref='attachmentText'
                    >
                        <Markdown
                            message={attachment.text || ''}
                            options={options}
                            imageProps={this.imageProps}
                        />
                    </div>
                    {textOverflow}
                </div>
            );
        }

        let image;
        if (attachment.image_url) {
            image = (
                <img
                    className='attachment__image'
                    src={attachment.image_url}
                />
            );
        }

        let thumb;
        if (attachment.thumb_url) {
            thumb = (
                <div
                    className='attachment__thumb-container'
                >
                    <img
                        src={attachment.thumb_url}
                    />
                </div>
            );
        }

        const fields = this.getFieldsTable();
        const actions = this.getActionView();

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
                            >
                                {text}
                                {image}
                                {fields}
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
