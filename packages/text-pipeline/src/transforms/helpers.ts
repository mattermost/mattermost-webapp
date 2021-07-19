// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Node} from 'commonmark';

/* eslint-disable no-underscore-dangle */

// Wraps a given node in another node of the given type. The wrapper will take the place of the node in the AST
// relative to its parents and siblings, and it will have the node as its only child.
//
// TODO either make this non-destructive or find a way to do this without mutating the Nodes
// so we can fix the typing.
export function wrapNode(wrapper: any, node: any): Node {
    // Set parent and update parent's children if necessary
    wrapper._parent = node._parent;
    if (node._parent._firstChild === node) {
        node._parent._firstChild = wrapper;
    }
    if (node._parent._lastChild === node) {
        node._parent._lastChild = wrapper;
    }

    // Set siblings and update those if necessary
    wrapper._prev = node._prev;
    node._prev = null;
    if (wrapper._prev) {
        wrapper._prev._next = wrapper;
    }

    wrapper._next = node._next;
    node._next = null;
    if (wrapper._next) {
        wrapper._next._prev = wrapper;
    }

    // Make node a child of wrapper
    wrapper._firstChild = node;
    wrapper._lastChild = node;
    node._parent = wrapper;

    return wrapper;
}

// escapeRegex escapes any special characters in a string so that it can be used literally in a regular expression.
export function escapeRegex(s: string): string {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
