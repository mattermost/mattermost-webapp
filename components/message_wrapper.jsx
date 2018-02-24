// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as TextFormatting from 'utils/text_formatting.jsx';
import {getSiteURL} from 'utils/url.jsx';
import * as Utils from 'utils/utils.jsx';
import {messageHtmlToComponent} from 'utils/post_utils.jsx';

export default class MessageWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.message) {
            const options = Object.assign({}, this.props.options, {
                siteURL: getSiteURL(),
            });

            const formattedText = TextFormatting.formatText(this.props.message, options);

            return (
                <div onClick={Utils.handleFormattedTextClick}>
                    {messageHtmlToComponent(formattedText, false, {mentions: false})}
                </div>
            );
        }

        return <div/>;
    }
}

MessageWrapper.defaultProps = {
    message: '',
};
MessageWrapper.propTypes = {
    message: PropTypes.string,
    options: PropTypes.object,
};
