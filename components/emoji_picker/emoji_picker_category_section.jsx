// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class EmojiPickerCategorySection extends React.PureComponent {
    static propTypes = {
        categoryName: PropTypes.string.isRequired,
        children: PropTypes.any,
        updateCategoryOffset: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.updateCategoryOffset(this.props.categoryName, this.div.offsetTop);
    }
    divRef = (div) => {
        this.div = div;
    };

    render() {
        return (
            <div
                ref={this.divRef}
            >
                <div className='emoji-picker-items__container'>
                    <div
                        className='emoji-picker__category-header'
                        id={`emojipickercat-${this.props.categoryName}`}
                    >
                        <FormattedMessage id={'emoji_picker.' + this.props.categoryName}/>
                    </div>
                </div>
                <div className='emoji-picker-items__container'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
