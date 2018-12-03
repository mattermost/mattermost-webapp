// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class PostEmoji extends React.PureComponent {
    static propTypes = {

        /*
         * True if emoji name is not included either in the list of known and non-existent custom emojis
         */
        shouldCheckEmojiName: PropTypes.bool.isRequired,

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

        actions: PropTypes.shape({
            getCustomEmojiByName: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        name: '',
        imageUrl: '',
        displayTextOnly: false,
    }

    componentDidMount() {
        if (this.props.shouldCheckEmojiName) {
            this.props.actions.getCustomEmojiByName(this.props.name);
        }
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
