// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {runMessageWillBePostedHooks, runSlashCommandWillBePostedHooks} from './hooks';

const mockStore = configureStore([thunk]);

describe('runMessageWillBePostedHooks', () => {
    test('should do nothing when no hooks are registered', async () => {
        const store = mockStore({
            plugins: {
                components: {},
            },
        });
        const post = {message: 'test'};

        const result = await store.dispatch(runMessageWillBePostedHooks(post));

        expect(result).toEqual({data: post});
    });

    test('should pass the post through every hook', async () => {
        const hook1 = jest.fn((post) => ({post}));
        const hook2 = jest.fn((post) => ({post}));
        const hook3 = jest.fn((post) => ({post}));

        const store = mockStore({
            plugins: {
                components: {
                    MessageWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                        {hook: hook3},
                    ],
                },
            },
        });
        const post = {message: 'test'};

        const result = await store.dispatch(runMessageWillBePostedHooks(post));

        expect(result).toEqual({data: post});
        expect(hook1).toHaveBeenCalledWith(post);
        expect(hook2).toHaveBeenCalledWith(post);
        expect(hook3).toHaveBeenCalledWith(post);
    });

    test('should return an error when a hook rejects the post', async () => {
        const hook1 = jest.fn((post) => ({post}));
        const hook2 = jest.fn(() => ({error: {message: 'an error occurred'}}));
        const hook3 = jest.fn((post) => ({post}));

        const store = mockStore({
            plugins: {
                components: {
                    MessageWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                        {hook: hook3},
                    ],
                },
            },
        });
        const post = {message: 'test'};

        const result = await store.dispatch(runMessageWillBePostedHooks(post));

        expect(result).toEqual({error: {message: 'an error occurred'}});
        expect(hook1).toHaveBeenCalledWith(post);
        expect(hook2).toHaveBeenCalledWith(post);
        expect(hook3).not.toHaveBeenCalled();
    });

    test('should pass the result of each hook to the next', async () => {
        const hook1 = jest.fn((post) => ({post: {...post, message: post.message + 'a'}}));
        const hook2 = jest.fn((post) => ({post: {...post, message: post.message + 'b'}}));
        const hook3 = jest.fn((post) => ({post: {...post, message: post.message + 'c'}}));

        const store = mockStore({
            plugins: {
                components: {
                    MessageWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                        {hook: hook3},
                    ],
                },
            },
        });
        const post = {message: 'test'};

        const result = await store.dispatch(runMessageWillBePostedHooks(post));

        expect(result).toEqual({data: {message: 'testabc'}});
        expect(hook1).toHaveBeenCalledWith(post);
        expect(hook2).toHaveBeenCalled();
        expect(hook2).not.toHaveBeenCalledWith(post);
        expect(hook3).toHaveBeenCalled();
        expect(hook3).not.toHaveBeenCalledWith(post);
    });

    test('should wait for async hooks', async () => {
        jest.useFakeTimers();

        const hook = jest.fn((post) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({post: {...post, message: post.message + 'async'}});
                }, 100);

                jest.runOnlyPendingTimers();
            });
        });

        const store = mockStore({
            plugins: {
                components: {
                    MessageWillBePosted: [
                        {hook},
                    ],
                },
            },
        });
        const post = {message: 'test'};

        const result = await store.dispatch(runMessageWillBePostedHooks(post));

        expect(result).toEqual({data: {message: 'testasync'}});
        expect(hook).toHaveBeenCalledWith(post);
    });

    test('should assume post is unchanged if a hook returns undefined', async () => {
        const hook1 = jest.fn();
        const hook2 = jest.fn((post) => ({post: {...post, message: post.message + 'b'}}));

        const store = mockStore({
            plugins: {
                components: {
                    MessageWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                    ],
                },
            },
        });
        const post = {message: 'test'};

        const result = await store.dispatch(runMessageWillBePostedHooks(post));

        expect(result).toEqual({data: {message: 'testb'}});
        expect(hook1).toHaveBeenCalledWith(post);
        expect(hook2).toHaveBeenCalled();
        expect(hook2).toHaveBeenCalledWith(post);
    });
});

describe('runSlashCommandWillBePostedHooks', () => {
    test('should do nothing when no hooks are registered', async () => {
        const store = mockStore({
            plugins: {
                components: {},
            },
        });
        const message = '/test';
        const args = {channelId: 'abcdefg'};

        const result = await store.dispatch(runSlashCommandWillBePostedHooks(message, args));

        expect(result.data).toEqual({message, args});
    });

    test('should pass the command through every hook', async () => {
        const hook1 = jest.fn((message, args) => ({message, args}));
        const hook2 = jest.fn((message, args) => ({message, args}));
        const hook3 = jest.fn((message, args) => ({message, args}));

        const store = mockStore({
            plugins: {
                components: {
                    SlashCommandWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                        {hook: hook3},
                    ],
                },
            },
        });
        const message = '/test';
        const args = {channelId: 'abcdefg'};

        const result = await store.dispatch(runSlashCommandWillBePostedHooks(message, args));

        expect(result.data).toEqual({message, args});
        expect(hook1).toHaveBeenCalledWith(message, args);
        expect(hook2).toHaveBeenCalledWith(message, args);
        expect(hook3).toHaveBeenCalledWith(message, args);
    });

    test('should return an error when a hook rejects the command', async () => {
        const hook1 = jest.fn((message, args) => ({message, args}));
        const hook2 = jest.fn(() => ({error: {message: 'an error occurred'}}));
        const hook3 = jest.fn((message, args) => ({message, args}));

        const store = mockStore({
            plugins: {
                components: {
                    SlashCommandWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                        {hook: hook3},
                    ],
                },
            },
        });
        const message = '/test';
        const args = {channelId: 'abcdefg'};

        const result = await store.dispatch(runSlashCommandWillBePostedHooks(message, args));

        expect(result).toEqual({error: {message: 'an error occurred'}});
        expect(hook1).toHaveBeenCalledWith(message, args);
        expect(hook2).toHaveBeenCalledWith(message, args);
        expect(hook3).not.toHaveBeenCalled();
    });

    test('should pass the result of each hook to the next', async () => {
        const hook1 = jest.fn((message, args) => ({message: message + 'a', args}));
        const hook2 = jest.fn((message, args) => ({message: message + 'b', args}));
        const hook3 = jest.fn((message, args) => ({message: message + 'c', args}));

        const store = mockStore({
            plugins: {
                components: {
                    SlashCommandWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                        {hook: hook3},
                    ],
                },
            },
        });
        const message = '/test';
        const args = {channelId: 'abcdefg'};

        const result = await store.dispatch(runSlashCommandWillBePostedHooks(message, args));

        expect(result.data).toEqual({message: '/testabc', args});
        expect(hook1).toHaveBeenCalledWith(message, args);
        expect(hook2).toHaveBeenCalled();
        expect(hook2).not.toHaveBeenCalledWith(message, args);
        expect(hook3).toHaveBeenCalled();
        expect(hook3).not.toHaveBeenCalledWith(message, args);
    });

    test('should wait for async hooks', async () => {
        jest.useFakeTimers();

        const hook = jest.fn((message, args) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({message: message + 'async', args});
                }, 100);

                jest.runOnlyPendingTimers();
            });
        });

        const store = mockStore({
            plugins: {
                components: {
                    SlashCommandWillBePosted: [
                        {hook},
                    ],
                },
            },
        });
        const message = '/test';
        const args = {channelId: 'abcdefg'};

        const result = await store.dispatch(runSlashCommandWillBePostedHooks(message, args));

        expect(result.data).toEqual({message: '/testasync', args});
        expect(hook).toHaveBeenCalledWith(message, args);
    });

    test('should assume command is unchanged if a hook returns undefined', async () => {
        const hook1 = jest.fn();
        const hook2 = jest.fn((message, args) => ({message: message + 'b', args}));

        const store = mockStore({
            plugins: {
                components: {
                    SlashCommandWillBePosted: [
                        {hook: hook1},
                        {hook: hook2},
                    ],
                },
            },
        });
        const message = '/test';
        const args = {channelId: 'abcdefg'};

        const result = await store.dispatch(runSlashCommandWillBePostedHooks(message, args));

        expect(result.data).toEqual({message: '/testb', args});
        expect(hook1).toHaveBeenCalledWith(message, args);
        expect(hook2).toHaveBeenCalled();
        expect(hook2).toHaveBeenCalledWith(message, args);
    });
});
