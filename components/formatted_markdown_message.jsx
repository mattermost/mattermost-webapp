// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import marked from 'marked';

const UNESCAPED_TAGS = ['BR'];
const TARGET_BLANK_URL_PREFIX = '!';

class MarkdownRenderer extends marked.Renderer {
    link(href, title, text) {
        if (href[0] === TARGET_BLANK_URL_PREFIX) {
            return `<a href="${href.substring(1, href.length)}" target="_blank">${text}</a>`;
        }
        return `<a href="${href}">${text}</a>`;
    }
}

class FormattedMarkdownMessage extends React.PureComponent {
    static get propTypes() {
        return {
            intl: intlShape.isRequired,
            id: PropTypes.string.isRequired,
            defaultMessage: PropTypes.string.isRequired,
            values: PropTypes.object,
        };
    }

    static escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    static sanitizer(p1) {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(p1, 'text/html');
        const childNodes = htmlDoc.getElementsByTagName('body')[0].childNodes;
        if (childNodes.length > 0) {
            const {tagName} = childNodes[0];
            if (UNESCAPED_TAGS.includes(tagName)) {
                return p1;
            }
        }
        return FormattedMarkdownMessage.escapeHtml(p1);
    }

    render() {
        const origMsg = this.props.intl.formatMessage({
            id: this.props.id,
            defaultMessage: this.props.defaultMessage,
        }, this.props.values);

        const markedUpMessage = marked(origMsg, {
            sanitize: true,
            sanitizer: FormattedMarkdownMessage.sanitizer,
            renderer: new MarkdownRenderer(),
        });

        return (<span dangerouslySetInnerHTML={{__html: markedUpMessage}}/>);
    }
}

export default injectIntl(FormattedMarkdownMessage);