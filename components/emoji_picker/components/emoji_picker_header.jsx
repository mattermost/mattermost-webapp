// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class EmojiPickerHeader extends React.PureComponent {
    static propTypes = {
        handleEmojiPickerClose: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div className='emoji-picker__header modal-header'>
                <button
                    type='button'
                    className='close emoji-picker__header-close-button'
                    onClick={this.props.handleEmojiPickerClose}
                >
                    <span aria-hidden='true'>{'×'}</span>
                    <span className='sr-only'>
                        <FormattedMessage
                            id={'emoji_picker.close'}
                            defaultMessage={'Close'}
                        />
                    </span>
                </button>
                <h4 className='modal-title emoji-picker__header-title'>
                    <FormattedMessage
                        id={'emoji_picker.header'}
                        defaultMessage={'Emoji Picker'}
                    />
                </h4>
            </div>
        );
    }
}
