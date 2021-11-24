// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {Constants} from 'utils/constants';

import * as Emoji from 'utils/emoji.jsx';

import imgTrans from 'images/img_trans.gif';

const skinsList = [['raised_hand_with_fingers_splayed', 'default'],
    ['raised_hand_with_fingers_splayed_light_skin_tone', '1F3FB'],
    ['raised_hand_with_fingers_splayed_medium_light_skin_tone', '1F3FC'],
    ['raised_hand_with_fingers_splayed_medium_skin_tone', '1F3FD'],
    ['raised_hand_with_fingers_splayed_medium_dark_skin_tone', '1F3FE'],
    ['raised_hand_with_fingers_splayed_dark_skin_tone', '1F3FF']];

const skinToneEmojis = new Map(skinsList.map((pair) => [pair[1], Emoji.Emojis[Emoji.EmojiIndicesByAlias.get(pair[0])!]]));

type Props = {
    userSkinTone: string;
    onSkinSelected: (skin: string) => void;
    intl: IntlShape;
};

type State = {
    pickerExtended: boolean;
}

export class EmojiPickerSkin extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            pickerExtended: false,
        };
    }

    ariaLabel = (skin: string) => {
        return this.props.intl.formatMessage({
            id: 'emoji_skin_item.emoji_aria_label',
            defaultMessage: '{skinName} emoji',
        },
        {
            skinName: Emoji.SkinTranslations.get(skin),
        });
    }

    hideSkinTonePicker = (skin: string) => {
        this.setState({pickerExtended: false});
        if (skin !== this.props.userSkinTone) {
            this.props.onSkinSelected(skin);
        }
    }

    showSkinTonePicker = () => {
        this.setState({pickerExtended: true});
    }

    extended() {
        const choices = skinsList.map((skinPair) => {
            const skin = skinPair[1];
            const emoji = skinToneEmojis.get(skin);
            const spriteClassName = classNames('emojisprite', `emoji-category-${emoji.category}`, `emoji-${emoji.image}`);

            return (
                <div
                    className='skin-tones__icon'
                    key={skin}
                    onClick={() => this.hideSkinTonePicker(skin)}
                >
                    <img
                        data-testid={`skin-pick-${skin}`}
                        src={imgTrans}
                        className={spriteClassName}
                        aria-label={this.ariaLabel(skin)}
                        role='button'
                    />
                </div>
            );
        });
        return (
            <>
                <div className='skin-tones__close'>
                    <button
                        className='skin-tones__close-icon'
                        onClick={() => this.hideSkinTonePicker(this.props.userSkinTone)}
                    >
                        <i className='icon-close icon--no-spacing icon-16'/>
                    </button>
                    <div className='skin-tones__close-text'>
                        <FormattedMessage
                            id={Emoji.SkinTranslations.get('default')}
                        />
                    </div>
                </div>
                <div className='skin-tones__icons'>
                    {choices}
                </div>
            </>
        );
    }
    collapsed() {
        const emoji = skinToneEmojis.get(this.props.userSkinTone);
        const spriteClassName = classNames('emojisprite', `emoji-category-${emoji.category}`, `emoji-${emoji.image}`);
        const tooltip = (
            <Tooltip
                id='skinTooltip'
                className='emoji-tooltip'
            >
                <span>
                    <FormattedMessage
                        id={'emoji_picker.skin_tone'}
                        defaultMessage={'Skin tone'}
                    />
                </span>
            </Tooltip>);
        return (
            <OverlayTrigger
                trigger={['hover']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={tooltip}
            >
                <div className='skin-tones__icon'>
                    <img
                        alt={'emoji skin tone picker'}
                        data-testid={`skin-picked-${this.props.userSkinTone}`}
                        src={imgTrans}
                        className={spriteClassName}
                        onClick={this.showSkinTonePicker}
                        aria-label={this.ariaLabel(this.props.userSkinTone)}
                        role='button'
                    />
                </div>
            </OverlayTrigger>);
    }

    render() {
        return (
            <div className={classNames('skin-tones', {'skin-tones--active': this.state.pickerExtended})}>
                <div className={classNames('skin-tones__content', {'skin-tones__content__single': !this.state.pickerExtended})}>
                    {this.state.pickerExtended ? this.extended() : this.collapsed()}
                </div>
            </div>
        );
    }
}

export default injectIntl(EmojiPickerSkin);
