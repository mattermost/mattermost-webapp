// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import * as Markdown from 'utils/markdown';
import {getSiteURL} from 'utils/url';

export default class DialogIntroductionText extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        value: PropTypes.string.isRequired,
        emojiMap: PropTypes.object.isRequired,
    };

    render() {
        const formattedMessage = Markdown.format(
            this.props.value,
            {
                breaks: true,
                sanitize: true,
                gfm: true,
                siteURL: getSiteURL(),
            },
            this.props.emojiMap,
        );

        return (
            <span
                id={this.props.id}
                dangerouslySetInnerHTML={{__html: formattedMessage}}
            />
        );
    }
}
