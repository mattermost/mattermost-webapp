// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Store} from 'redux';

import store from 'stores/redux_store';

import PluginRegistry from './registry';

export abstract class ProductPlugin {
    abstract initialize(registry: PluginRegistry, store: Store): void;
    abstract uninitialize(): void;
}

export function initializeProducts() {
    /* eslint-disable no-console */
    return async (/*dispatch, getState*/) => {
        /**
         * products contains a map of product IDs to a function that will load all of their parts. Calling that
         * function will return an object where each field is a Promise that will resolve to that module.
         *
         * Note that these import paths must be statically defined or else they won't be found at runtime.
         *
         * Since this file doesn't use TypeScript yet, the type definition for it is:
         *
         * const products: Array<{
         *     id: string;
         *     load: () => {
         *         index: Promise<{default: ProductPlugin}>;
         *         manifest: Promise<{default: PluginManifest}>;
         *     };
         * }>;
         */
        const products = [
            {
                id: 'focalboard',
                load: () => ({
                    index: import('focalboard'),
                    manifest: import('focalboard/manifest'),
                }),
            },
        ];

        await Promise.all(products.map(async (product) => {
            if (!REMOTE_MODULES[product.id]) {
                console.log(`Product ${product.id} not found. Not loading it.`);
                return;
            }

            console.log(`Loading product ${product.id}...`);

            try {
                // Start loading the product
                const imports = product.load();

                // Wait for the individual parts to load
                const index = await imports.index;

                // const manifest = await imports.manifest;
                // const actualIndex = index.default;
                // const actualManifest = manifest.default;

                // Initialize the previously loaded data
                console.log(`Initializing product ${product.id}...`);
                initializeProduct(product.id, index.default);
                console.log(`Product ${product.id} initialized!`);
            } catch (e) {
                console.error(`Error loading and initializing product ${product.id}`, e);
            }
        }));

        return {data: true};
    };

    /* eslint-enable no-console */
}

function initializeProduct(id: string, Product: new () => ProductPlugin) {
    const plugin = new Product();
    const registry = new PluginRegistry(id);

    plugin.initialize(registry, store);
}
