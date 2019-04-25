// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * These matchers will retain only the inserted nodes or text. All formatting captured by a cut/copy will be
 * ignored (eg, background color).
 */
export const initializeMatchers = (quill) => {
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        delta.ops = delta.ops.map((op) => {
            return {
                insert: op.insert,
            };
        });
        return delta;
    });

    quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
        delta.ops = delta.ops.map((op) => {
            return {
                insert: op.insert,
            };
        });
        return delta;
    });
};
