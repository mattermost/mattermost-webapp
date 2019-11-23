// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    children: React.ReactChild;
    tag: 'ol' | 'ul';
};

export default class MarkdownList extends React.PureComponent<Props> {
    // getMaxOrdinal returns the largest ordinal number for items in this list. Returns -1 if the list isn't numbered.
    getMaxOrdinal = () => {
        if (this.props.tag !== 'ol') {
            return -1;
        }

        // Filter out all non-li children like newline characters
        const items = this.props.children.filter((child) => typeof child === 'object' && child.type === 'li');

        const start = parseInt(items[0].props.value, 10);

        return start + (items.length - 1);
    }

    render() {
        const {children, tag, ...props} = this.props;

        if (tag === 'ol') {
            // Figure out how much space to leave for the numbers on the left
            const maxOrdinal = this.getMaxOrdinal();

            // Leave space for the numbers in the bullet plus the period
            let characters = Math.ceil(Math.log(maxOrdinal) * Math.LOG10E);
            characters += 1;

            // And add a bit more space so that the bullets line up better with unordered lists
            characters += 2;

            props.style = {paddingLeft: `${characters}ch`};
        }

        return React.createElement(tag, props, children);
    }
}
