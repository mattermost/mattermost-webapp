// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';

import classNames from 'classnames';

import {intlShape} from 'utils/react_intl';

import * as Emoji from 'utils/emoji.jsx';

import imgTrans from 'images/img_trans.gif';

const skinsList = [['raised_hand_with_fingers_splayed', 'default'],
    ['raised_hand_with_fingers_splayed_light_skin_tone', '1F3FB'],
    ['raised_hand_with_fingers_splayed_medium_light_skin_tone', '1F3FC'],
    ['raised_hand_with_fingers_splayed_medium_skin_tone', '1F3FD'],
    ['raised_hand_with_fingers_splayed_medium_dark_skin_tone', '1F3FE'],
    ['raised_hand_with_fingers_splayed_dark_skin_tone', '1F3FF']];

const skinToneEmojis = new Map(skinsList.map((pair) => [pair[1], Emoji.Emojis[Emoji.EmojiIndicesByAlias.get(pair[0])]]));

export class EmojiPickerSkin extends React.PureComponent {
    static propTypes = {
        recentSkin: PropTypes.string.isRequired,
        onSkinSelected: PropTypes.func.isRequired,
        intl: intlShape.isRequired,
    };

    constructor() {
        super();

        this.state = {
            pickerExtended: false,
        };
    }

    ariaLabel(skin) {
        return this.props.intl.formatMessage({
            id: 'emoji_skin_item.emoji_aria_label',
            defaultMessage: '{skinName} emoji',
        },
        {
            skinName: Emoji.SkinTranslations.get(skin),
        });
    }

    hideSkinTonePicker(skin) {
        if (skin !== this.props.recentSkin) {
            this.props.onSkinSelected(skin);
        }
        this.setState({pickerExtended: false});
    }

    showSkinTonePicker() {
        this.setState({pickerExtended: true});
    }

    extended() {
        const choices = skinsList.map((skinPair) => {
            const skin = skinPair[1];
            const emoji = skinToneEmojis.get(skin);
            const spriteClassName = classNames('emojisprite', `emoji-category-${emoji.category}`, `emoji-${emoji.image}`);

            return (
                <img
                    data-testid={`skin-pick-${skin}`}
                    key={skin}
                    src={imgTrans}
                    className={spriteClassName}
                    onClick={() => this.hideSkinTonePicker(skin)}
                    aria-label={this.ariaLabel(skin)}
                    role='button'
                />
            );
        });
        return (
            <>
                <div className='skin-tones__close'>
                    <button
                        className='skin-tones__close-icon'
                        onClick={this.hideSkinTonePicker}
                    >
                        <i className='icon-close icon--no-spacing icon-16'/>
                    </button>
                    <div className='skin-tones__close-text'>
                        {'Default'}<br/>{'Skin Tone'}
                    </div>
                </div>
                {choices}
            </>
        );
    }
    collapsed() {
        const emoji = skinToneEmojis.get(this.props.recentSkin);
        const spriteClassName = classNames('emojisprite', `emoji-category-${emoji.category}`, `emoji-${emoji.image}`);
        return (
            <div className='skin-tones__icon'>
                <img
                    alt={'emoji skin tone picker'}
                    data-testid={`skin-picked-${this.props.recentSkin}`}
                    src={imgTrans}
                    className={spriteClassName}
                    onClick={this.showSkinTonePicker}
                    aria-label={this.ariaLabel(this.props.recentSkin)}
                    role='button'
                />
            </div>);
    }

    render() {
        return (
            <div className={classNames('skin-tones', {'skin-tones--active': this.state.skinPicker})}>
                <div className='skin-tones__content'>
                    {this.collapsed()}
                </div>
            </div>
        );
    }
}

export default injectIntl(EmojiPickerSkin);
