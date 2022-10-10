// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

type Props = {
    children: React.ReactNode;
    element?: string;
    hasMore?: boolean;
    initialLoad?: boolean;
    loader?: Record<string, unknown>;
    loadMore: (loadMore: number) => void;
    pageStart?: number;
    threshold?: number;
    useWindow?: boolean;
    isReverse?: boolean;
    containerHeight?: number;
    scrollPosition?: number;
    ref?: React.ReactNode;
    className?: string;
}

export default class InfiniteScroll extends PureComponent<Props> {
    private pageLoaded: number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private scrollComponent: any;
    private defaultLoader: Record<string, unknown> | undefined;
    componentDidMount() {
        this.pageLoaded = this.props.pageStart;
        this.attachScrollListener();
        this.setScrollPosition();
    }

    componentDidUpdate() {
        this.attachScrollListener();
    }

    render() {
        const {
            children,
            element = 'div',
            hasMore = false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            initialLoad = true,
            loader,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            loadMore,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            pageStart = 0,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            threshold = 250,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            useWindow = true,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            isReverse = false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            scrollPosition = null,
            containerHeight = null,
            ...props
        } = this.props;

        props.ref = (node: React.ReactNode) => {
            this.scrollComponent = node;
        };

        const elementProps = containerHeight ? {...props, style: {height: containerHeight}} : props;

        return React.createElement(element, elementProps, children, hasMore && (loader || this.defaultLoader));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calculateTopPosition = (el: { offsetTop?: any; offsetParent?: any }): any => {
        if (!el) {
            return 0;
        }
        return el.offsetTop + this.calculateTopPosition(el.offsetParent);
    }

    setScrollPosition() {
        const {scrollPosition} = this.props;
        if (scrollPosition !== null) {
            window.scrollTo(0, scrollPosition!);
        }
    }

    scrollListener = () => {
        const el = this.scrollComponent;
        const scrollEl = window;

        let offset;
        if (this.props.useWindow) {
            const scrollTop = ('pageYOffset' in scrollEl) ? scrollEl.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            if (this.props.isReverse) {
                offset = scrollTop;
            } else {
                offset = this.calculateTopPosition(el) + (el.offsetHeight - scrollTop - window.innerHeight);
            }
        } else if (this.props.isReverse) {
            offset = el.parentNode.scrollTop;
        } else {
            offset = el.scrollHeight - el.parentNode.scrollTop - el.parentNode.clientHeight;
        }

        if (offset < Number(this.props.threshold)) {
            this.detachScrollListener();

            // Call loadMore after detachScrollListener to allow for non-async loadMore functions
            if (typeof this.props.loadMore === 'function') {
                this.props.loadMore(this.pageLoaded! += 1);
            }
        }
    }

    attachScrollListener() {
        if (!this.props.hasMore) {
            return;
        }

        let scrollEl = window;
        if (this.props.useWindow === false) {
            scrollEl = this.scrollComponent.parentNode;
        }

        scrollEl.addEventListener('scroll', this.scrollListener);
        scrollEl.addEventListener('resize', this.scrollListener);

        if (this.props.initialLoad) {
            this.scrollListener();
        }
    }

    detachScrollListener() {
        let scrollEl = window;
        if (this.props.useWindow === false) {
            scrollEl = this.scrollComponent.parentNode;
        }

        scrollEl.removeEventListener('scroll', this.scrollListener);
        scrollEl.removeEventListener('resize', this.scrollListener);
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    // Set a defaut loader for all your `InfiniteScroll` components
    setDefaultLoader(loader: Record<string, unknown> | undefined) {
        this.defaultLoader = loader;
    }
}
