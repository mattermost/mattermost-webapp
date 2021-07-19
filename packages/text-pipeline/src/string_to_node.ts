// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Node} from 'commonmark';

export function stringToNode(s: string): Node {
    const text = new Node('text', [[0, 0], [0, s.length]]);
    text.literal = s;

    const document = new Node('document', [[0, 0], [0, s.length]]);
    document.appendChild(text);

    return document;
}
