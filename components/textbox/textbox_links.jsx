// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

export default class TextboxLinks extends React.Component {
    static propTypes = {
        showPreview: PropTypes.bool,
        characterLimit: PropTypes.number.isRequired,
        previewMessageLink: PropTypes.string,
        updatePreview: PropTypes.func,
        message: PropTypes.string.isRequired,
    };

    static defaultProps = {
        message: '',
    };

    togglePreview = (e) => {
        e.preventDefault();
        this.props.updatePreview(!this.props.showPreview);
    }

    render() {
        const hasText = this.props.message && this.props.message.length > 0;
        let editHeader;

        let helpTextClass = '';

        if (this.props.message && this.props.message.length > this.props.characterLimit) {
            helpTextClass = 'hidden';
        }

        if (this.props.previewMessageLink) {
            editHeader = (
                <span>
                    {this.props.previewMessageLink}
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

        let previewLink = null;
        if (Utils.isFeatureEnabled(PreReleaseFeatures.MARKDOWN_PREVIEW)) {
            previewLink = (
                <button
                    id='previewLink'
                    onClick={this.togglePreview}
                    className='style--none textbox-preview-link color--link'
                >
                    {this.props.showPreview ? (
                        editHeader
                    ) : (
                        <FormattedMessage
                            id='textbox.preview'
                            defaultMessage='Preview'
                        />
                    )}
                </button>
            );
        }

        const helpText = (
            <div
                id='helpText'
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
                        defaultMessage='_italic_'
                    />
                </i>
                <span>
                    {'~~'}
                    <strike>
                        <FormattedMessage
                            id='textbox.strike'
                            defaultMessage='strike'
                        />
                    </strike>
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
                {previewLink}
                <Link
                    id='helpTextLink'
                    target='_blank'
                    rel='noopener noreferrer'
                    to='/help/messaging'
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
}
