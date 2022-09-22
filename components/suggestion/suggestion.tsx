// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

type Props = typeof Suggestion.baseProps & {
    role: string;
    tabIndex: number;
    onClick: (term: string, matchedPretext: string) => void;
    onMouseMove: (term: string) => void;
    term: string;
    matchedPretext: string;
    isSelection: boolean;
}

export default class Suggestion extends React.PureComponent<Props> {
    static get propTypes() {
        return {
            item: PropTypes.oneOfType([
                PropTypes.object,
                PropTypes.string,
            ]).isRequired,
            term: PropTypes.string.isRequired,
            matchedPretext: PropTypes.string.isRequired,
            isSelection: PropTypes.bool,
            onClick: PropTypes.func,
            onMouseMove: PropTypes.func,
        };
    }

    static baseProps = {
        role: 'button',
        tabIndex: -1,
    };

    handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        this.props.onClick!(this.props.term, this.props.matchedPretext);
    }

    handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        this.props.onMouseMove!(this.props.term);
    }

    
}
