// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {PluginComponent} from 'types/store/plugins';

type Props = {
    showPreview?: boolean;
    previewMessageLink?: string;
    hasText?: boolean;
    hasExceededCharacterLimit?: boolean;
    isMarkdownPreviewEnabled: boolean;
    currentLocale: string;
    updatePreview?: (showPreview: boolean) => void;
    customEditor?: PluginComponent;
    customEditors?: Array<PluginComponent>;
    setCustomEditor: (editor: PluginComponent) => void;
};

function TextboxLinks({
    showPreview,
    previewMessageLink,
    hasText = false,
    hasExceededCharacterLimit = false,
    isMarkdownPreviewEnabled,
    currentLocale,
    updatePreview,
    customEditor,
    customEditors,
    setCustomEditor,
}: Props) {
    const handleShowPreview = (e: MouseEvent) => {
        e.preventDefault();
        updatePreview?.(true);
    };

    const handleHidePreview = (e: MouseEvent) => {
        e.preventDefault();
        updatePreview?.(false);
    };

    let editHeader;

    let helpTextClass = '';

    if (hasExceededCharacterLimit) {
        helpTextClass = 'hidden';
    }

    if (previewMessageLink) {
        editHeader = (
            <span>
                {previewMessageLink}
            </span>
        );
    } else {
        editHeader = (
            <FormattedMessage
                id='textbox.edit'
                defaultMessage='Edit message'
            />
        );
    }

    let editMessageLink = null;
    if ((isMarkdownPreviewEnabled && showPreview) || customEditor) {
        editMessageLink = (
            <button
                id='previewLink'
                onClick={handleHidePreview}
                className='style--none textbox-preview-link color--link'
            >
                {editHeader}
            </button>
        );
    }

    let previewLink = null;
    if ((isMarkdownPreviewEnabled && !showPreview) || customEditor) {
        previewLink = (
            <button
                id='previewLink'
                onClick={handleShowPreview}
                className='style--none textbox-preview-link color--link'
            >
                <FormattedMessage
                    id='textbox.preview'
                    defaultMessage='Preview'
                />
            </button>
        );
    }

    const customEditorLinks = customEditors?.filter((pluggable) => (
        pluggable.id !== customEditor?.id
    )).map((pluggable) => (
        <button
            key={pluggable.id}
            onClick={() => setCustomEditor(pluggable)}
            className='style--none textbox-preview-link color--link'
        >
            {pluggable.text}
        </button>
    ));

    const helpText = (
        <div
            style={{visibility: hasText ? 'visible' : 'hidden', opacity: hasText ? '0.45' : '0'}}
            className='help__format-text'
        >
            <b>
                <FormattedMessage
                    id='textbox.bold'
                    defaultMessage='**bold**'
                />
            </b>
            <i>
                <FormattedMessage
                    id='textbox.italic'
                    defaultMessage='*italic*'
                />
            </i>
            <span>
                {'~~'}
                <s>
                    <FormattedMessage
                        id='textbox.strike'
                        defaultMessage='strike'
                    />
                </s>
                {'~~ '}
            </span>
            <span>
                <FormattedMessage
                    id='textbox.inlinecode'
                    defaultMessage='`inline code`'
                />
            </span>
            <span>
                <FormattedMessage
                    id='textbox.preformatted'
                    defaultMessage='```preformatted```'
                />
            </span>
            <span>
                <FormattedMessage
                    id='textbox.quote'
                    defaultMessage='>quote'
                />
            </span>
        </div>
    );

    return (
        <div className={'help__text ' + helpTextClass}>
            {helpText}
            {editMessageLink}
            {previewLink}
            {customEditorLinks}
            <Link
                target='_blank'
                rel='noopener noreferrer'
                to={`/help/messaging?locale=${currentLocale}`}
                className='textbox-help-link'
            >
                <FormattedMessage
                    id='textbox.help'
                    defaultMessage='Help'
                />
            </Link>
        </div>
    );
}

export default TextboxLinks;
