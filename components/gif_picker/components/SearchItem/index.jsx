// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import PropTypes from 'prop-types';

import './SearchItem.scss';
import * as PostUtils from 'utils/post_utils.jsx';

function mapStateToProps(state) {
    return {
        hasImageProxy: state.entities.general.config.HasImageProxy,
    };
}

export class SearchItem extends PureComponent {
    static propTypes = {
        gfyItem: PropTypes.object,
        top: PropTypes.string,
        left: PropTypes.string,
        itemWidth: PropTypes.number,
        itemClickHandler: PropTypes.func,
        hasImageProxy: PropTypes.string,
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
        const {hasImageProxy} = this.props;
        const url = PostUtils.getImageSrc(max1mbGif, hasImageProxy === 'true');

        const backgroundImage = {backgroundImage: `url(${url})`};
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

export default connect(mapStateToProps)(SearchItem);
