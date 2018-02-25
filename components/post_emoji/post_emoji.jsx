// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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

        /*
         * Set to display the emoji text instead of the image.
         */
        displayTextOnly: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        name: '',
        imageUrl: '',
        displayTextOnly: false,
    }

    render() {
        const emojiText = ':' + this.props.name + ':';

        if (this.props.displayTextOnly) {
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
