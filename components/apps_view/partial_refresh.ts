// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppBinding} from '@mattermost/types/apps';

export const lookForBindingLocation = (binding: AppBinding, location: string, path: number[]): number[] | null => {
    if (binding.location === location) {
        return path;
    }

    if (!binding.bindings) {
        return null;
    }

    for (let i = 0; i < binding.bindings.length; i++) {
        const newPath = [...path, i];
        const found = lookForBindingLocation(binding.bindings[i], location, newPath);
        if (found) {
            return found;
        }
    }

    return null;
};

export const treeReplace = (tree: AppBinding, newChild: AppBinding, path: number[]): AppBinding => {
    if (!path.length) {
        return newChild;
    }

    const newBindings = tree.bindings?.map((b, i) => {
        if (path[0] !== i) {
            return b;
        }

        return treeReplace(b, newChild, path.slice(1));
    });

    return {...tree, bindings: newBindings};
};
