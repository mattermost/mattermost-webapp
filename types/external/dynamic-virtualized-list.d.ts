// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare module 'dynamic-virtualized-list' {
    interface DynamicSizeListProps {
        canLoadMorePosts: (id?: string) => void;
        children: ({data: any, itemId: any, style: any}) => JSX.Element;
        correctScrollToBottom: boolean;
        height: number;
        initRangeToRender: number[];
        initScrollToIndex: () => any;
        initialScrollOffset?: number;
        innerRef: React.Ref<any>;
        itemData: string[];
        onItemsRendered: (args: any) => void;
        onScroll: (scrollArgs: any) => void;
        overscanCountBackward: number;
        overscanCountForward: number;
        scrollToFailed: (index: number) => void;
        style: CSSProperties;
        width: number;

        className?: string;
        innerListStyle?: CSSProperties;
        loaderId?: string;
        scrollToFailed?: (index: number) => void;
    }

    export class DynamicSizeList extends React.PureComponent<DynamicSizeListProps> {
        scrollTo(scrollOffset: number, scrollByValue?: number, useAnimationFrame?: boolean): void;
        scrollToItem(index: number, align: string, offset?: number): void;
    }
}
