// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, FormattedMessage, IntlShape} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';
import {Constants} from 'utils/constants';

type Category = {
    name: string;
    id: string;
    className: string;
    message: string;
    offset: number;
};

type Props = {
    intl: IntlShape;
    category: Category;
    icon: React.ReactNode;
    onCategoryClick: (categoryName: string) => void;
    selected: boolean;
    enable: boolean;
}

class EmojiPickerCategory extends React.Component<Props> {
    shouldComponentUpdate(nextProps: Props) {
        return nextProps.selected !== this.props.selected ||
            nextProps.enable !== this.props.enable;
    }

    handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.onCategoryClick(this.props.category.name);
    }

    render() {
        let className = 'emoji-picker__category';
        if (this.props.selected) {
            className += ' emoji-picker__category--selected';
        }

        if (!this.props.enable) {
            className += ' disable';
        }

        const tooltip = (
            <Tooltip
                id='skinTooltip'
                className='emoji-tooltip'
            >
                <span>
                    <FormattedMessage
                        id={`emoji_picker.${this.props.category.name}`}
                        defaultMessage={this.props.category.message}
                    />
                </span>
            </Tooltip>);

        return (
            <OverlayTrigger
                trigger={['hover']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={tooltip}
            >
                <a
                    className={className}
                    href='#'
                    onClick={this.handleClick}
                    aria-label={this.props.category.id}
                >
                    {this.props.icon}
                </a>
            </OverlayTrigger>
        );
    }
}

export default injectIntl(EmojiPickerCategory);
