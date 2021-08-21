// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent} from 'react';

// import {Channel} from 'mattermost-redux/types/channels';

export interface SuggestionProps {
    item: any;
    term: string;
    matchedPretext: string;
    isSelection?: boolean;
    onClick?: (term: string, matchedPretext: string) => void;
    onMouseMove?: (term: string) => void;
}

interface BaseProps {
    role: string;
    tabIndex: number;
}

export default class Suggestion<T extends SuggestionProps> extends React.PureComponent<T> {
    static baseProps: BaseProps = {
        role: 'button',
        tabIndex: -1,
    };

    handleClick(e: MouseEvent): void {
        e.preventDefault();

        if (this.props.onClick) {
            this.props.onClick(this.props.term, this.props.matchedPretext);
        }
    }

    handleMouseMove(e: MouseEvent): void {
        e.preventDefault();

        if (this.props.onMouseMove) {
            this.props.onMouseMove(this.props.term);
        }
    }
}
