// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare module 'flexsearch/dist/flexsearch.es5' {
    export type Index = {

        /**
         * Adds an element to the index.
         *
         * @param id if of element to be added
         * @param element string to be added
         */
        add(id: string, element: string): void;

        /**
         * Searches for a list of elements matching the query.
         *
         * @param query string to be used for search.
         */
        search(query: string): string[];
    }
}
