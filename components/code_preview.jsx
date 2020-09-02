// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';
import * as SyntaxHighlighting from 'utils/syntax_highlighting';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import FileInfoPreview from 'components/file_info_preview';

export default class CodePreview extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            code: '',
            lang: '',
            loading: true,
            success: true,
        };
    }

    componentDidMount() {
        this.getCode();
    }

    static getDerivedStateFromProps(props, state) {
        if (props.fileUrl !== state.prevFileUrl) {
            const usedLanguage = SyntaxHighlighting.getLanguageFromFileExtension(props.fileInfo.extension);

            if (!usedLanguage || props.fileInfo.size > Constants.CODE_PREVIEW_MAX_FILE_SIZE) {
                return {
                    code: '',
                    lang: '',
                    loading: false,
                    success: false,
                    prevFileUrl: props.fileUrl,
                };
            }

            return {
                code: '',
                lang: usedLanguage,
                loading: true,
                prevFileUrl: props.fileUrl,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.fileUrl !== prevProps.fileUrl) {
            this.getCode();
        }
    }

    getCode = () => {
        if (!this.state.lang || this.props.fileInfo.size > Constants.CODE_PREVIEW_MAX_FILE_SIZE) {
            return;
        }
        $.ajax({ // eslint-disable-line jquery/no-ajax
            async: true,
            url: this.props.fileUrl,
            type: 'GET',
            dataType: 'text',
            error: this.handleReceivedError,
            success: this.handleReceivedCode,
        });
    }

    handleReceivedCode = (data) => {
        let code = data;
        if (data.nodeName === '#document') {
            code = new XMLSerializer().serializeToString(data);
        }
        this.setState({
            code,
            loading: false,
            success: true,
        });
    }

    handleReceivedError = () => {
        this.setState({loading: false, success: false});
    }

    static supports(fileInfo) {
        return Boolean(SyntaxHighlighting.getLanguageFromFileExtension(fileInfo.extension));
    }

    render() {
        if (this.state.loading) {
            return (
                <div className='view-image__loading'>
                    <LoadingSpinner/>
                </div>
            );
        }

        if (!this.state.success) {
            return (
                <FileInfoPreview
                    fileInfo={this.props.fileInfo}
                    fileUrl={this.props.fileUrl}
                />
            );
        }

        const language = SyntaxHighlighting.getLanguageName(this.state.lang);

        const highlighted = SyntaxHighlighting.highlight(this.state.lang, this.state.code);

        return (
            <div className='post-code'>
                <span className='post-code__language'>
                    {`${this.props.fileInfo.name} - ${language}`}
                </span>
                <div className='hljs'>
                    <div className='post-code__line-numbers'>
                        {SyntaxHighlighting.renderLineNumbers(this.state.code)}
                    </div>
                    <code dangerouslySetInnerHTML={{__html: highlighted}}/>
                </div>
            </div>
        );
    }
}

CodePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
    fileUrl: PropTypes.string.isRequired,
};
