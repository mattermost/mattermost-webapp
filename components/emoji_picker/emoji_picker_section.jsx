// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {FormattedMessage} from 'react-intl';

export default class EmojiPickerSection extends React.Component {
    static propTypes = {
        categoryName: PropTypes.string.isRequired,
        children: PropTypes.any,
        updateCategoryOffset: PropTypes.func.isRequired
    };

    static defaultProps = {
    };

    constructor(props) {
        super(props);

        // All props are primitives or treated as immutable
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    }
    componentDidMount() {
        this.props.updateCategoryOffset(this.props.categoryName, this.div.offsetTop);
    }
    render() {
        return (
            <div
                ref={(div) => {
                    this.div = div;
                }}
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
