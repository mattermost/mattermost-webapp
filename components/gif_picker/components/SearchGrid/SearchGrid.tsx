// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import {GfycatAPIItem, GifsResult} from '@mattermost/types/gifs';
import {saveSearchScrollPosition} from 'mattermost-redux/actions/gifs';

import {trackEvent} from 'actions/telemetry_actions';
import {GlobalState} from 'types/store';

import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';
import {NoResultsVariant} from 'components/no_results_indicator/types';

import InfiniteScroll from 'components/gif_picker/components/InfiniteScroll';
import SearchItem from 'components/gif_picker/components/SearchItem';

import './SearchGrid.scss';

const ITEMS_PADDING = 8;
const NUMBER_OF_COLUMNS_PORTRAIT = 2;
const NUMBER_OF_COLUMNS_LANDSCAPE = 2;
const WEBKIT_SCROLLBAR_WIDTH = 8;

function mapStateToProps(state: GlobalState) {
    return {
        ...state.entities.gifs.cache,
        ...state.entities.gifs.search,
        appProps: state.entities.gifs.app,
    };
}

const mapDispatchToProps = ({
    saveSearchScrollPosition,
});

type Props = {
    keyword: string; // searchText, tagName
    scrollPosition: number;
    gifs: Record<string, GfycatAPIItem>;
    resultsByTerm: Record<string, GifsResult>;
    loadMore: (page: number) => void;
    handleItemClick: (gif: GfycatAPIItem) => void;
    onCategories: () => void;
    containerClassName?: string;
    numberOfColumns?: number;
    saveSearchScrollPosition?: (scrollPosition: number) => void;
};

type State = {
    containerWidth: number;
}

export class SearchGrid extends PureComponent<Props, State> {
    private scrollPosition: number;
    private columnsHeights: number[];
    private padding: number;
    private numberOfColumns: number
    private container: HTMLElement | null;

    constructor(props: Props) {
        super(props);
        this.state = {containerWidth: 0};

        this.scrollPosition = this.props.scrollPosition;
        this.numberOfColumns = this.props.numberOfColumns ?? 0;
        this.container = null; // initialize dummy container
        this.setNumberOfColumns();

        /**
         * Inital values for columns heights
         */
        this.columnsHeights = Array(this.numberOfColumns).fill(0);

        /**
         * Items padding value
         */
        this.padding = ITEMS_PADDING;
    }

    componentDidMount() {
        this.container = document.getElementById('search-grid-container');
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            ...this.state,
            containerWidth: this.container!.offsetWidth - WEBKIT_SCROLLBAR_WIDTH,
        });
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('scroll', this.scrollHandler);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.keyword !== this.props.keyword) {
            window.scrollTo(0, 0);
        }
    }

    componentWillUnmount() {
        const {keyword} = this.props;
        if (keyword !== 'trending') {
            this.props.saveSearchScrollPosition?.(this.scrollPosition);
        }

        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('scroll', this.scrollHandler);
    }

    setNumberOfColumns = () => {
        if (window.matchMedia('(orientation: portrait)').matches) {
            this.numberOfColumns = NUMBER_OF_COLUMNS_PORTRAIT;
        } else {
            this.numberOfColumns = NUMBER_OF_COLUMNS_LANDSCAPE;
        }
    }

    itemClickHandler = (gfyItem: GfycatAPIItem) => {
        const {keyword, handleItemClick} = this.props;
        this.props.saveSearchScrollPosition?.(this.scrollPosition);

        trackEvent('gfycat', 'shares', {gfyid: gfyItem.gfyId, keyword});
        handleItemClick(gfyItem);
    }

    minHeightColumnIndex = () => {
        return this.columnsHeights.indexOf(Math.min(...this.columnsHeights));
    }

    maxHeightColumnIndex = () => {
        return this.columnsHeights.indexOf(Math.max(...this.columnsHeights));
    }

    maxColumnHeight = () => {
        return Math.max(...this.columnsHeights);
    }

    resizeHandler = () => {
        if (this.state.containerWidth !== this.container!.offsetWidth - WEBKIT_SCROLLBAR_WIDTH) {
            this.setNumberOfColumns();
            this.setState({
                ...this.state,
                containerWidth: this.container!.offsetWidth - WEBKIT_SCROLLBAR_WIDTH,
            });
            this.columnsHeights = Array(this.numberOfColumns).fill(0);
        }
    }

    scrollHandler = () => {
        this.scrollPosition = window.scrollY;
    }

    render() {
        const {
            containerClassName,
            gifs,
            keyword,
            resultsByTerm,
            scrollPosition,
            loadMore,
        } = this.props;

        const {containerWidth} = this.state;
        const {moreRemaining, items, isEmpty, isFetching } = resultsByTerm[keyword] ?? {
            moreRemaining: false,
            items: [], 
            isEmpty: false, 
            isFetching: false};

        /**
         * Columns 'left' values
         */
        const columnWidth = Math.floor(containerWidth / this.numberOfColumns);
        const leftPosition = Array(this.numberOfColumns).fill(0).map((item, index) => this.padding + ((index * columnWidth) - (index * (this.padding / 2))));

        this.columnsHeights = Array(this.numberOfColumns).fill(this.padding);

        // Item width in %
        //const itemWidth = this.numberOfColumns === NUMBER_OF_COLUMNS_PORTRAIT ? 100 / NUMBER_OF_COLUMNS_PORTRAIT : 100 / this.numberOfColumns;
        const itemWidth = 140;

        const searchItems = containerWidth && items?.length > 0 ?
            items.map((item: string, index: number) => {
                const gfyItem = gifs[item];
                const {gfyId} = gfyItem;

                // Position calculation
                const colIndex = this.minHeightColumnIndex();
                const top = this.columnsHeights[colIndex] + 'px';
                const left = leftPosition[colIndex] + 'px';
                const itemHeight = ((itemWidth / gfyItem.width) * gfyItem.height) + this.padding;
                this.columnsHeights[colIndex] += itemHeight;

                return (
                    <SearchItem
                        gfyItem={gfyItem}
                        top={top}
                        left={left}
                        itemWidth={itemWidth}
                        itemClickHandler={this.itemClickHandler}
                        key={`${index}-${gfyId}`}
                    />
                );
            }) : null;

        const containerHeight = this.maxColumnHeight();

        const content = searchItems ? (
            <InfiniteScroll
                className='search-grid-infinite-scroll'
                pageStart={0}
                loadMore={loadMore}
                initialLoad={false}
                hasMore={moreRemaining}
                threshold={1}
                containerHeight={containerHeight}
                scrollPosition={scrollPosition}
                useWindow={false}
            >
                {searchItems}
            </InfiniteScroll>
        ) : null;

        const emptySearch = !isFetching && isEmpty ? (
            <NoResultsIndicator
                variant={NoResultsVariant.ChannelSearch}
                titleValues={{channelName: `"${keyword}"`}}
            />
        ) : null;

        return (
            <div
                id='search-grid-container'
                className={`search-grid-container ${containerClassName}`}
            >
                {content}
                {emptySearch}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchGrid);
