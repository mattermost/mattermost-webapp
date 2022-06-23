// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

type BaseElementProps = {
    className?: string;
}

type InfiniteScrollDefaultProps = {
    element: keyof JSX.IntrinsicElements;
    hasMore: boolean;
    initialLoad: boolean;
    pageStart: number;
    threshold: number;
    useWindow: boolean;
    isReverse: boolean;
    containerHeight: number | null;
    scrollPosition: number | null;
}

type InfiniteScrollProps = BaseElementProps & InfiniteScrollDefaultProps & {
    children: React.ReactNode;
    loader?: React.ReactNode;
    loadMore: (page: number) => void;
}

type InfiniteScrollElementProps = BaseElementProps & {
    ref: (node: HTMLElement) => void;
}

const isHtmlElement = (data: HTMLElement | Element | null | undefined): data is HTMLElement => {
    return data != null;
};

export default class InfiniteScroll extends PureComponent<InfiniteScrollProps> {
    scrollComponent: HTMLElement | undefined;
    defaultLoader: React.ReactNode = null;
    pageLoaded = 0;

    static defaultProps: InfiniteScrollDefaultProps = {
        element: 'div' as keyof JSX.IntrinsicElements,
        hasMore: false,
        initialLoad: true,
        pageStart: 0,
        threshold: 250,
        useWindow: true,
        isReverse: false,
        containerHeight: null,
        scrollPosition: null,
    }

    componentDidMount() {
        this.pageLoaded = this.props.pageStart ?? 0;
        this.attachScrollListener();
        this.setScrollPosition();
    }

    componentDidUpdate() {
        this.attachScrollListener();
    }

    render() {
        const {
            children,
            element,
            hasMore,
            initialLoad, // eslint-disable-line @typescript-eslint/no-unused-vars
            loader,
            loadMore, // eslint-disable-line @typescript-eslint/no-unused-vars
            pageStart, // eslint-disable-line @typescript-eslint/no-unused-vars
            threshold, // eslint-disable-line @typescript-eslint/no-unused-vars
            useWindow, // eslint-disable-line @typescript-eslint/no-unused-vars
            isReverse, // eslint-disable-line @typescript-eslint/no-unused-vars
            scrollPosition, // eslint-disable-line @typescript-eslint/no-unused-vars
            containerHeight,
            ...rest
        } = this.props;

        const baseElementProps: InfiniteScrollElementProps = {
            ref: (node) => {
                this.scrollComponent = node;
            },
            ...rest,
        };

        const elementProps = containerHeight ? {...baseElementProps, style: {height: containerHeight}} : baseElementProps;

        return React.createElement(element, elementProps, children, hasMore && (loader || this.defaultLoader));
    }

    calculateTopPosition(el: HTMLElement | Element | null | undefined): number {
        if (!isHtmlElement(el)) {
            return 0;
        }

        return el.offsetTop + this.calculateTopPosition(el.offsetParent);
    }

    setScrollPosition() {
        const {scrollPosition} = this.props;
        if (scrollPosition != null) {
            window.scrollTo(0, scrollPosition);
        }
    }

    scrollListener = () => {
        const el = this.scrollComponent;
        const scrollEl = window;

        if (!el) {
            return;
        }

        let offset = 0;
        if (this.props.useWindow) {
            const scrollTop = ('pageYOffset' in scrollEl) ? scrollEl.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            if (this.props.isReverse) {
                offset = scrollTop;
            } else {
                offset = this.calculateTopPosition(el) + (el.offsetHeight - scrollTop - window.innerHeight);
            }
        } else if (this.props.isReverse) {
            offset = el.parentElement?.scrollTop ?? 0;
        } else {
            offset = el.scrollHeight - (el.parentElement?.scrollTop ?? 0) - (el.parentElement?.clientHeight ?? 0);
        }

        if (offset < Number(this.props.threshold)) {
            this.detachScrollListener();

            // Call loadMore after detachScrollListener to allow for non-async loadMore functions
            if (typeof this.props.loadMore === 'function') {
                this.props.loadMore(this.pageLoaded += 1);
            }
        }
    }

    attachScrollListener() {
        if (!this.props.hasMore) {
            return;
        }

        if (!this.scrollComponent) {
            return;
        }

        let scrollEl: Window | HTMLElement | null = window;
        if (this.props.useWindow === false) {
            scrollEl = this.scrollComponent.parentElement;
        }

        if (!scrollEl) {
            return;
        }

        scrollEl.addEventListener('scroll', this.scrollListener);
        scrollEl.addEventListener('resize', this.scrollListener);

        if (this.props.initialLoad) {
            this.scrollListener();
        }
    }

    detachScrollListener() {
        let scrollEl: Window | HTMLElement | null = window;
        if (this.props.useWindow === false && this.scrollComponent) {
            scrollEl = this.scrollComponent.parentElement;
        }

        if (!scrollEl) {
            return;
        }

        scrollEl.removeEventListener('scroll', this.scrollListener);
        scrollEl.removeEventListener('resize', this.scrollListener);
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    // Set a defaut loader for all your `InfiniteScroll` components
    setDefaultLoader(loader: React.ReactNode) {
        this.defaultLoader = loader;
    }
}
