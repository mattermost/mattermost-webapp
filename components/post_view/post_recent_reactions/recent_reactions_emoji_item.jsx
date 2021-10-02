// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

// eslint-disable-next-line react/require-optimization
class EmojiItem extends React.Component {
    static propTypes = {
        emoji: PropTypes.object.isRequired,
        onItemClick: PropTypes.func.isRequired,
        order: PropTypes.number,
    };

    handleClick = () => {
        this.props.onItemClick(this.props.emoji);
    };

    render() {
        const {
            emoji,
            order,
        } = this.props;
        const itemClassName = 'post-menu__item';

        return (
            <div
                className={itemClassName}
            >
                <button
                    id={`recent_reaction_${order}`}
                    data-testid={itemClassName + '_emoji'}
                    className='Reaction__emoji--post-menu emoticon'
                    style={{backgroundImage: 'url(' + getEmojiImageUrl(emoji) + ')', backgroundColor: 'transparent'}}
                    onClick={this.handleClick}
                />
            </div>
        );
    }
}

export default injectIntl(EmojiItem);
