// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import marked from 'marked';

import {intlShape} from 'utils/react_intl';

const TARGET_BLANK_URL_PREFIX = '!';

export class CustomRenderer extends marked.Renderer {
    constructor(disableLinks = false) {
        super();
        this.disableLinks = disableLinks;
    }

    link(href, title, text) {
        if (this.disableLinks) {
            return text;
        }
        if (href[0] === TARGET_BLANK_URL_PREFIX) {
            return `<a href="${href.substring(1, href.length)}" rel="noopener noreferrer" target="_blank">${text}</a>`;
        }
        return `<a href="${href}">${text}</a>`;
    }

    paragraph(text) {
        return text;
    }
}

/*
* Translations component with the same API as react-intl's <FormattedMessage> component except the message string
* accepts markdown. It supports the following non-block-level markdown:
* - *italic*
* - **bold**
* - `inline code`
* - ~~strikethrough~~
* - [link](http://example.com/)
* - [link in new tab](!http://example.com/)
* - line\nbreaks
*
* Note: Line breaks (\n) in a defaultMessage parameter string must be surrounded by curly brackets {} in JSX. Example:
* <FormattedMarkdownMessage id='my.example' defaultMessage={'first line\nsecond line'} />
*/
class FormattedMarkdownMessage extends React.PureComponent {
    static defaultProps = {
        disableLinks: false,
    };

    static get propTypes() {
        return {
            intl: intlShape.isRequired,
            id: PropTypes.string.isRequired,
            defaultMessage: PropTypes.string.isRequired,
            values: PropTypes.object,
            disableLinks: PropTypes.bool,
        };
    }

    render() {
        const {
            intl,
            id,
            defaultMessage,
            values,
            disableLinks,
        } = this.props;

        const origMsg = intl.formatMessage({id, defaultMessage}, values);

        const markedUpMessage = marked(origMsg, {
            breaks: true,
            sanitize: true,
            renderer: new CustomRenderer(disableLinks),
        });

        return (<span dangerouslySetInnerHTML={{__html: markedUpMessage}}/>);
    }
}

export default injectIntl(FormattedMarkdownMessage);
