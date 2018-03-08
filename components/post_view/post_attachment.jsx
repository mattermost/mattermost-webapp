// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import * as PostActions from 'actions/post_actions.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import {messageHtmlToComponent} from 'utils/post_utils.jsx';
import {isUrlSafe} from 'utils/url.jsx';
import {localizeMessage} from 'utils/utils.jsx';

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
    }

    constructor(props) {
        super(props);

        this.handleActionButtonClick = this.handleActionButtonClick.bind(this);
        this.getActionView = this.getActionView.bind(this);
        this.getFieldsTable = this.getFieldsTable.bind(this);
        this.getInitState = this.getInitState.bind(this);
        this.shouldCollapse = this.shouldCollapse.bind(this);
        this.toggleCollapseState = this.toggleCollapseState.bind(this);
    }

    componentDidMount() {
        $(this.refs.attachment).on('click', '.attachment-link-more', this.toggleCollapseState);
    }

    componentWillUnmount() {
        $(this.refs.attachment).off('click', '.attachment-link-more', this.toggleCollapseState);
    }

    componentWillMount() {
        this.setState(this.getInitState());
    }

    getInitState() {
        const shouldCollapse = this.shouldCollapse();
        const text = TextFormatting.formatText(this.props.attachment.text || '');
        const uncollapsedTextHTML = text + (shouldCollapse ? `<div><a class="attachment-link-more" href="#">${localizeMessage('post_attachment.collapse', 'Show less...')}</a></div>` : '');
        const collapsedTextHTML = shouldCollapse ? this.getCollapsedTextHTML() : text;

        return {
            shouldCollapse,
            collapsedTextHTML,
            uncollapsedTextHTML,
            textHTML: shouldCollapse ? collapsedTextHTML : uncollapsedTextHTML,
            collapsed: shouldCollapse,
        };
    }

    toggleCollapseState(e) {
        e.preventDefault();
        this.setState((prevState) => {
            return {
                textHTML: prevState.collapsed ? prevState.uncollapsedTextHTML : prevState.collapsedTextHTML,
                collapsed: !prevState.collapsed,
            };
        });
    }

    shouldCollapse() {
        const text = this.props.attachment.text || '';
        return (text.match(/\n/g) || []).length >= 5 || text.length > 700;
    }

    getCollapsedTextHTML() {
        let text = this.props.attachment.text || '';
        if ((text.match(/\n/g) || []).length >= 5) {
            text = text.split('\n').splice(0, 5).join('\n');
        }
        if (text.length > 300) {
            text = text.substr(0, 300);
        }

        return TextFormatting.formatText(text) + `<div><a class="attachment-link-more" href="#">${localizeMessage('post_attachment.more', 'Show more...')}</a></div>`;
    }

    getActionView() {
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
    }

    handleActionButtonClick(e) {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id');
        PostActions.doPostAction(this.props.postId, actionId);
    }

    getFieldsTable() {
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

            const formattedText = TextFormatting.formatText(field.value || '');

            bodyCols.push(
                <td
                    className='attachment-field'
                    key={'attachment__field-' + i + '__' + nrTables}
                >
                    {messageHtmlToComponent(formattedText, false)}
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
    }

    render() {
        const data = this.props.attachment;
        let preTextClass = '';

        let preText;
        if (data.pretext) {
            const formattedText = TextFormatting.formatText(data.pretext || '');
            preTextClass = 'attachment--pretext';
            preText = (
                <div className='attachment__thumb-pretext'>
                    {messageHtmlToComponent(formattedText, false)}
                </div>
            );
        }

        let author = [];
        if (data.author_name || data.author_icon) {
            if (data.author_icon) {
                author.push(
                    <img
                        className='attachment__author-icon'
                        src={data.author_icon}
                        key={'attachment__author-icon'}
                        height='14'
                        width='14'
                    />
                );
            }
            if (data.author_name) {
                author.push(
                    <span
                        className='attachment__author-name'
                        key={'attachment__author-name'}
                    >
                        {data.author_name}
                    </span>
                );
            }
        }
        if (data.author_link && isUrlSafe(data.author_link)) {
            author = (
                <a
                    href={data.author_link}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {author}
                </a>
            );
        }

        let title;
        if (data.title) {
            if (data.title_link && isUrlSafe(data.title_link)) {
                title = (
                    <h1
                        className='attachment__title'
                    >
                        <a
                            className='attachment__title-link'
                            href={data.title_link}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {data.title}
                        </a>
                    </h1>
                );
            } else {
                title = (
                    <h1
                        className='attachment__title'
                    >
                        {data.title}
                    </h1>
                );
            }
        }

        let text;
        if (data.text) {
            text = (
                <div className='attachment__text'>
                    {messageHtmlToComponent(this.state.textHTML, false)}
                </div>
            );
        }

        let image;
        if (data.image_url) {
            image = (
                <img
                    className='attachment__image'
                    src={data.image_url}
                />
            );
        }

        let thumb;
        if (data.thumb_url) {
            thumb = (
                <div
                    className='attachment__thumb-container'
                >
                    <img
                        src={data.thumb_url}
                    />
                </div>
            );
        }

        const fields = this.getFieldsTable();
        const actions = this.getActionView();

        let useBorderStyle;
        if (data.color && data.color[0] === '#') {
            useBorderStyle = {borderLeftColor: data.color};
        }

        return (
            <div
                className={'attachment ' + preTextClass}
                ref='attachment'
            >
                {preText}
                <div className='attachment__content'>
                    <div
                        className={useBorderStyle ? 'clearfix attachment__container' : 'clearfix attachment__container attachment__container--' + data.color}
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
