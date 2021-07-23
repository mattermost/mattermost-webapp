// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

// Since SuggestionLists contain items of different types without any common properties, I don't know of any good way
// to define a shared type for them. Confirming that a SuggestionItem matches what its component expects will be left
// up to the component.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SuggestionItem {}

interface Props {
    ariaLiveRef?: React.Ref<HTMLDivElement>;
    open: boolean;
    location?: 'top' | 'bottom';
    renderDividers?: boolean;
    renderNoResults?: boolean;
    onCompleteWord: (term: string, matchedPretext, e?: MouseEvent<HTMLDivElement>) => boolean;
    preventClose?: () => void;
    onItemHover: (term: string) => void;
    pretext: string;
    cleared: boolean;
    matchedPretext: string[];
    items: SuggestionItem[];
    terms: string[];
    selection: string;
    components: Array<React.Component<{item: SuggestionItem}>>;
    wrapperHeight?: number;

    // suggestionBoxAlgn is an optional object that can be passed to align the SuggestionList with the keyboard caret
    // as the user is typing.
    suggestionBoxAlgn?: {
        lineHeight: number;
        pixelsToMoveX: number;
        pixelsToMoveY: number;
    };
}

declare module 'components/suggestion/suggestion_list' {
    declare class SuggestionList extends React.PureComponent<Props> {}
}

export default SuggestionList;
