// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    onClick?: (term: string, matchedPretext: string, e?: any) => boolean;
    onMouseMove?: (term: string) => void;
    term: string;
    matchedPretext: string;
    isSelection?: boolean;
    item?: any;
    teammate?: any;
    currentUser?: any;
    locale?: string;
    currentDate?: any;
};

export default class Suggestion extends React.PureComponent<Props> {
    static baseProps = {
        role: 'button',
        tabIndex: -1,
    };
    

    handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        this.props.onClick?.(this.props.term, this.props.matchedPretext);
    };

    handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        this.props.onMouseMove?.(this.props.term);
    };
}
