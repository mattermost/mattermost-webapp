// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked from 'marked';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

// CustomRenderer renders Markdown text without <p> tags, matching the output of FormattedMarkdownMessage.
class CustomRenderer extends marked.Renderer {
    paragraph(text) {
        return text;
    }
}

export default class HelpText extends React.PureComponent {
    static propTypes = {
        isMarkdown: PropTypes.bool,
        isTranslated: PropTypes.bool,
        text: PropTypes.string.isRequired,
        textDefault: PropTypes.string,
        textValues: PropTypes.object,
    };

    static defaultProps = {
        isTranslated: true,
    };

    renderTranslated = () => {
        if (this.props.isMarkdown) {
            return (
                <FormattedMarkdownMessage
                    id={this.props.text}
                    defaultMessage={this.props.textDefault}
                    values={this.props.textValues}
                />
            );
        }

        return (
            <FormattedMessage
                id={this.props.text}
                values={this.props.textValues}
                defaultMessage={this.props.textDefault}
            />
        );
    };

    renderUntranslated = () => {
        if (this.props.isMarkdown) {
            const html = marked(this.props.text, {
                breaks: true,
                sanitize: true,
                renderer: new CustomRenderer(),
            });

            return <span dangerouslySetInnerHTML={{__html: html}}/>;
        }

        return <span>{this.props.text}</span>;
    };

    render() {
        return this.props.isTranslated ? this.renderTranslated() : this.renderUntranslated();
    }
}
