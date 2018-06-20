// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './SearchItem.scss';

export default class SearchItem extends Component {
    static propTypes = {
        gfyItem: PropTypes.object,
        top: PropTypes.string,
        left: PropTypes.string,
        itemWidth: PropTypes.number,
        itemClickHandler: PropTypes.func,
    }

    render() {
        const {
            gfyItem,
            top,
            left,
            itemWidth,
            itemClickHandler,
        } = this.props;

        const {width, height, max1mbGif, avgColor} = gfyItem;

        const backgroundImage = {backgroundImage: `url(${max1mbGif})`};
        const backgroundColor = {backgroundColor: avgColor};
        const paddingBottom = {paddingBottom: ((itemWidth / width) * height) + 'px'};

        return (
            <div
                className='search-item-wrapper'
                style={{top, left, width: itemWidth ? `${itemWidth}px` : ''}}
            >
                <div
                    className='search-item'
                    style={{...backgroundImage, ...backgroundColor, ...paddingBottom}}
                    onClick={() => itemClickHandler(gfyItem)}
                />
            </div>
        );
    }
}
