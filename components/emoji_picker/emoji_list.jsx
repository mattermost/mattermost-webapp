// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import EmojiListManager from './emoji_list_manager';

const SCROLL_STOP_DELAY = 50;
const STYLE_WRAPPER = {
    willChange: 'transform',
    WebkitOverflowScrolling: 'touch'
};
const STYLE_INNER = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    minHeight: '100%'
};
const STYLE_ITEM = {position: 'absolute', left: 0, width: '100%'};

export default class EmojiList extends PureComponent {
    static defaultProps = {
        width: '100%',
        loadedItems: []
    };

    static propTypes = {
        height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        loadedItems: PropTypes.array.isRequired,
        itemCount: PropTypes.number.isRequired,
        itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.func]).isRequired,
        renderItem: PropTypes.func.isRequired,
        scrollOffset: PropTypes.number,
        onScroll: PropTypes.func.isRequired,
        width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        onLoadedItems: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.emojiListManager = new EmojiListManager({
            itemCount: props.itemCount,
            itemSizeGetter: ({index}) => this.getSize(index),
            itemSize: props.itemSize
        });

        const items = this.filterItems(props.loadedItems, props.itemCount);
        this.state = {
            offset: props.scrollOffset || 0,
            bottom: 0,
            stop: 0,
            items
        };

        this.styleCache = {};
        this.isScrolling = {};
    }

    componentDidMount() {
        const {scrollOffset} = this.props;

        if (scrollOffset != null) {
            this.scrollTo(scrollOffset);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {itemCount, itemSize, scrollOffset, loadedItems} = this.props;

        let recompute = false;
        const itemPropsHaveChanged = nextProps.itemCount !== itemCount || nextProps.itemSize !== itemSize;
        if (itemPropsHaveChanged) {
            recompute = true;
            this.recomputeSizes();
        }

        let offset = 0;
        let {items} = this.state;
        if (nextProps.itemCount !== itemCount) {
            items = [];
            if (nextProps.itemCount > loadedItems.length) {
                items = loadedItems;
            }

            this.emojiListManager.updateConfig({
                itemCount: nextProps.itemCount,
                itemSize: nextProps.itemSize
            });

            this.scrollTo(offset);
        } else if (nextProps.scrollOffset !== scrollOffset) {
            offset = nextProps.scrollOffset;
            this.setState({offset});
        }

        this.setStopAndBottom(items, offset, recompute);
    }

    componentDidUpdate(nextProps, nextState) {
        const {offset} = this.state;

        if (nextState.offset !== offset) {
            this.scrollTo(offset);
        }
    }

    getRef = (node) => {
        this.rootNode = node;
    };

    handleScroll = (e) => {
        e.preventDefault();

        this.scrollStop(e);
    };

    scrollStop(e) {
        const self = this;
        const target = e.target;

        clearTimeout(self.isScrolling);

        self.isScrolling = setTimeout(() => {
            self.setOnScrollStop(target);
        }, SCROLL_STOP_DELAY);
    }

    setOnScrollStop(target) {
        const offset = this.getNodeOffset();
        if (offset < 0 || this.state.offset === offset || target !== this.rootNode) {
            return;
        }

        this.setState({offset});

        const {items} = this.state;
        this.setStopAndBottom(items, offset, false);

        setTimeout(() => {
            this.props.onScroll(offset);
        }, 0);
    }

    handleLoadedItems(items) {
        this.props.onLoadedItems(items);
    }

    filterItems(items, itemCount) {
        return items.filter((item) => item < itemCount);
    }

    setStopAndBottom(items, offset, recompute) {
        const {bottom} = this.state;
        const containerSize = this.props.height;
        const nextStop = this.emojiListManager.getNextStop({
            containerSize,
            offset
        });

        const {start, stop} = this.emojiListManager.getVisibleRange({containerSize, offset});
        for (let i = start; i <= stop; i++) {
            if (i <= this.props.itemCount && items.indexOf(i) === -1) {
                items.push(i);
            }
        }

        this.handleLoadedItems(items);

        this.setState({
            stop: nextStop,
            bottom: nextStop > bottom || recompute ? nextStop : bottom,
            items
        });
    }

    getNodeOffset() {
        return this.rootNode.scrollTop;
    }

    scrollTo(value) {
        this.rootNode.scrollTop = value;
    }

    getSize(index) {
        const {itemSize} = this.props;

        if (typeof itemSize === 'function') {
            return itemSize(index);
        }

        return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    }

    getStyle(index) {
        const style = this.styleCache[index];
        if (style) {
            return style;
        }

        const {size, offset} = this.emojiListManager.getSizeAndPositionForIndex(index);

        this.styleCache[index] = {
            ...STYLE_ITEM,
            height: size,
            top: offset
        };

        return this.styleCache[index];
    }

    recomputeSizes(startIndex = 0) {
        this.styleCache = {};
        this.emojiListManager.resetItem(startIndex);
    }

    render() {
        const {height, renderItem, width} = this.props;
        const renderItems = this.state.items.map((item) => {
            return renderItem({index: item, style: this.getStyle(item)});
        });

        return (
            <div
                ref={this.getRef}
                onScroll={this.handleScroll}
                style={{...STYLE_WRAPPER, height, width}}
                className={'emoji-picker__items'}
            >
                <div
                    style={{
                        ...STYLE_INNER,
                        height: this.emojiListManager.getTotalSize()
                    }}
                >
                    {renderItems}
                </div>
            </div>
        );
    }
}
