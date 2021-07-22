// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';
import {Constants} from 'utils/constants';

class EmojiPickerCategory extends React.Component {
    static propTypes = {
        category: PropTypes.object.isRequired,
        icon: PropTypes.node.isRequired,
        onCategoryClick: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
        enable: PropTypes.bool.isRequired,
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.selected !== this.props.selected ||
            nextProps.enable !== this.props.enable;
    }

    handleClick = (e) => {
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
