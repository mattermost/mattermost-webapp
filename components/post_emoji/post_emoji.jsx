// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class PostEmoji extends React.PureComponent {
    static propTypes = {

        /*
         * Emoji name.
         */
        name: PropTypes.string.isRequired,

        /*
         * Emoji image URL.
         */
        imageUrl: PropTypes.string.isRequired,
    };

    render() {
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }

        return (
            <span
                alt={emojiText}
                className='emoticon'
                title={emojiText}
                style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
            />
        );
    }
}
