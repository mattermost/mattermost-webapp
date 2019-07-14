// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function runMessageWillBePostedHooks(originalPost) {
    return async (dispatch, getState) => {
        const hooks = getState().plugins.components.MessageWillBePosted;
        if (!hooks || hooks.length === 0) {
            return {data: originalPost};
        }

        let post = originalPost;

        for (const hook of hooks) {
            const result = await hook.hook(post); // eslint-disable-line no-await-in-loop

            if (result) {
                if (result.error) {
                    return {
                        error: result.error,
                    };
                }

                post = result.post;
            }
        }

        return {data: post};
    };
}

export function runSlashCommandWillBePostedHooks(originalMessage, originalArgs) {
    return async (dispatch, getState) => {
        const hooks = getState().plugins.components.SlashCommandWillBePosted;
        if (!hooks || hooks.length === 0) {
            return {data: {message: originalMessage, args: originalArgs}};
        }

        let message = originalMessage;
        let args = originalArgs;

        for (const hook of hooks) {
            const result = await hook.hook(message, args); // eslint-disable-line no-await-in-loop

            if (result) {
                if (result.error) {
                    return {
                        error: result.error,
                    };
                }

                message = result.message;
                args = result.args;
            }
        }

        return {data: {message, args}};
    };
}
