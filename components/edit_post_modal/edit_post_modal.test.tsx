// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactRouterEnzymeContext from 'react-router-enzyme-context';
import {ShallowWrapper} from 'enzyme';
import {IntlShape} from 'react-intl';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';
import {Constants, ModalIdentifiers} from 'utils/constants';
import * as UserAgentUtils from 'utils/user_agent';
import DeletePostModal from 'components/delete_post_modal';
import EditPostModal, {Props, EditPostModal as EditPostModalClass, State as EditPostModalState} from 'components/edit_post_modal/edit_post_modal';
import {
    testComponentForMarkdownHotkeys,
    makeSelectionEvent,
} from 'tests/helpers/markdown_hotkey_helpers.js';
import Textbox from 'components/textbox';
import {Post} from 'mattermost-redux/types/posts';

jest.mock('actions/global_actions', () => ({
    emitClearSuggestions: jest.fn(),
}));

const isMobileSpy = jest.spyOn(UserAgentUtils, 'isMobile');

jest.useFakeTimers();

const defaultPost: Post = {
    id: '123',
    create_at: 1620568159640,
    update_at: -1,
    edit_at: -1,
    delete_at: -1,
    is_pinned: false,
    user_id: '1',
    channel_id: '5',
    root_id: '123',
    parent_id: '123',
    original_id: '123',
    message: 'test',
    type: 'system_add_remove',
    props: {},
    hashtags: 'hashtag',
    pending_post_id: '123',
    reply_count: 0,
    metadata: {
        embeds: [],
        emojis: [],
        files: [],
        images: {},
        reactions: [],
    },
};

const defaultProps = {
    intl: jest.genMockFromModule<IntlShape>('react-intl'),
    canEditPost: true,
    canDeletePost: true,
    useChannelMentions: true,
    shouldShowPreview: true,
    maxPostSize: 100,
    channelId: '5',
    config: {EnableEmojiPicker: 'true', EnableGifPicker: 'false'},
    editingPost: {
        postId: '123',
        post: {
            ...defaultPost,
        },
        refocusId: 'test',
        show: true,
        title: 'test',
    },
    actions: {
        editPost: jest.fn((data) => (Promise.resolve(data))),
        addMessageIntoHistory: jest.fn(),
        hideEditPostModal: jest.fn(),
        openModal: jest.fn(),
        setShowPreview: jest.fn(),
    },
};

function createEditPost(
    {
        canEditPost = true,
        canDeletePost = true,
        useChannelMentions = true,
        ctrlSend = undefined,
        channelId,
        config = {EnableEmojiPicker: 'true', EnableGifPicker: 'true'},
        editingPost = {post: {...defaultPost}, show: false, postId: '1'},
        actions = {
            editPost: jest.fn((data) => (Promise.resolve({...defaultPost, ...data}))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        },
    }: Props,
) {
    return (
        <EditPostModal
            canEditPost={canEditPost}
            shouldShowPreview={false}
            canDeletePost={canDeletePost}
            channelId={channelId}
            ctrlSend={ctrlSend || false}
            config={config}
            editingPost={editingPost}
            actions={actions}
            maxPostSize={Constants.DEFAULT_CHARACTER_LIMIT}
            useChannelMentions={useChannelMentions}
        />
    );
}

describe('components/EditPostModal', () => {
    it('should match when editing post is undefined', () => {
        const editingPost = {
            ...defaultProps.editingPost,
            post: undefined,
        };
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, editingPost}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should match with default config', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should match without emoji picker', () => {
        const config = {
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false',
        };
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, config}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should not call openModal on empty edited message but with attachment', () => {
        global.scrollTo = jest.fn();
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const editingPost = {
            postId: '123',
            post: {
                ...defaultPost,
                file_ids: ['file_id_1'],
            },
            refocusId: 'test',
            show: true,
            title: 'test',
        };

        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions, editingPost}));
        const instance = wrapper.instance() as EditPostModalClass;
        wrapper.setState({editText: ''});
        instance.handleEdit();

        expect(actions.openModal).not.toHaveBeenCalled();
        expect(actions.addMessageIntoHistory).toBeCalled();
        expect(actions.editPost).toBeCalled();
    });

    it('should call editPost, addMessageIntoHistory and hideEditPostModal on save', async () => {
        global.scrollTo = jest.fn();
        const actions = {
            editPost: jest.fn((data) => Promise.resolve(data)),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));

        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();

        wrapper.setState({editText: 'new message'});
        wrapper.find('.btn-primary').simulate('click');

        await Promise.resolve();
        expect(actions.addMessageIntoHistory).toBeCalledWith('new message');
        expect(actions.editPost).toBeCalledWith({
            id: defaultProps.editingPost.post.id,
            channel_id: defaultProps.editingPost.post.channel_id,
            message: 'new message',
        });
        expect(actions.hideEditPostModal).toBeCalled();
    });

    it('should show emojis on emojis click', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        wrapper.find('.post-action').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    it('should set the postError state when error happens', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        const instance = wrapper.instance() as EditPostModalClass;
        expect((wrapper.state() as EditPostModalState).postError).toBe(null);
        const error = <div>{'Error'}</div>;
        instance.handlePostError(error);
        expect((wrapper.state() as EditPostModalState).postError).toBe(error);
        instance.setState = jest.fn();
        instance.handlePostError(error);
        expect(instance.setState).not.toBeCalled();
    });

    it('should show errors when it is set in the state', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        wrapper.setState({postError: 'Test error message'});
        expect(wrapper).toMatchSnapshot();
    });

    it('should set the errorClass to animate when try to edit with an error', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        wrapper.setState({postError: 'Test error message'});
        expect((wrapper.state() as EditPostModalState).errorClass).toBe(null);
        (wrapper.instance() as EditPostModalClass).handleEdit();
        expect((wrapper.state() as EditPostModalState).errorClass).toBe('animation--highlight');
        jest.runOnlyPendingTimers();
        expect((wrapper.state() as EditPostModalState).errorClass).toBe(null);
    });

    it('should hide and toggle the emoji picker on correctly on (toggle/hide)EmojiPicker', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        expect((wrapper.state() as EditPostModalState).showEmojiPicker).toBe(false);
        (wrapper.instance() as EditPostModalClass).toggleEmojiPicker();
        expect((wrapper.state() as EditPostModalState).showEmojiPicker).toBe(true);
        (wrapper.instance() as EditPostModalClass).toggleEmojiPicker();
        expect((wrapper.state() as EditPostModalState).showEmojiPicker).toBe(false);
        (wrapper.instance() as EditPostModalClass).toggleEmojiPicker();
        expect((wrapper.state() as EditPostModalState).showEmojiPicker).toBe(true);
        (wrapper.instance() as EditPostModalClass).hideEmojiPicker();
        expect((wrapper.state() as EditPostModalState).showEmojiPicker).toBe(false);
    });

    it('should add emoji to editText when an emoji is clicked', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        const instance = wrapper.instance() as EditPostModalClass;
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                focus: jest.fn(),
            };
        };
        (instance as any).editbox = {getInputBox: jest.fn(mockImpl), focus: jest.fn()};
        wrapper.setState({editText: ''});
        instance.handleEmojiClick();
        instance.handleEmojiClick({} as any);
        instance.handleEmojiClick({short_names: []} as any);
        expect((wrapper.state() as EditPostModalState).editText).toBe('');

        wrapper.setState({editText: ''});
        instance.handleEmojiClick({id: '5', name: '+1', short_names: [], create_at: 1, update_at: 1, delete_at: 1, creator_id: '1', category: 'custom'});
        expect((wrapper.state() as EditPostModalState).editText).toBe(':+1: ');

        wrapper.setState({
            editText: 'test',
            caretPosition: 'test'.length,
        });
        instance.handleEmojiClick({id: '5', create_at: 1, update_at: 1, delete_at: 1, creator_id: '1', category: 'custom', name: '-1', short_names: []});
        expect((wrapper.state() as EditPostModalState).editText).toBe('test :-1: ');

        wrapper.setState({editText: 'test '});
        instance.handleEmojiClick({id: '5', create_at: 1, update_at: 1, delete_at: 1, creator_id: '1', category: 'custom', name: '-1', short_names: []});
        expect((wrapper.state() as EditPostModalState).editText).toBe('test  :-1: ');

        wrapper.setState({editText: 'test '});
        instance.handleEmojiClick({id: '5', create_at: 1, update_at: 1, delete_at: 1, creator_id: '1', category: 'custom', name: '-1', short_names: ['thumbsup']});
        expect((wrapper.state() as EditPostModalState).editText).toBe('test  :thumbsup: ');
    });

    it('should set the focus and recalculate the size of the edit box after entering', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        const instance = wrapper.instance() as EditPostModalClass;
        (instance as any).editbox = {focus: jest.fn(), recalculateSize: jest.fn()};

        const ref = (instance as any).editbox;
        expect(ref.focus).not.toBeCalled();
        expect(ref.recalculateSize).not.toBeCalled();
        instance.handleEntered();
        expect(ref.focus).toBeCalled();
        expect(ref.recalculateSize).toBeCalled();
    });

    it('should hide the preview when exiting', () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };

        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));
        const instance = wrapper.instance() as EditPostModalClass;

        instance.setShowPreview(true);
        expect(actions.setShowPreview).toHaveBeenCalledWith(true);
        instance.handleExit();
        expect(actions.setShowPreview).toHaveBeenCalledWith(false);
    });

    it('should close without saving when post text is not changed', () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));
        const instance = wrapper.instance() as EditPostModalClass;

        expect(actions.hideEditPostModal).not.toBeCalled();

        instance.handleEdit();

        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        expect(actions.hideEditPostModal).toBeCalled();
    });

    it('should close and show delete confirmation modal when message is empty', async () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        let wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));
        let instance = wrapper.instance() as EditPostModalClass;

        expect(actions.hideEditPostModal).not.toBeCalled();

        wrapper.setState({editText: ''});
        instance.handleEdit();

        expect(actions.hideEditPostModal).toBeCalled();
        expect(actions.openModal).toHaveBeenCalledWith({
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: {
                    ...defaultPost,
                },
                isRHS: undefined,
            },
        });
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();

        actions.hideEditPostModal.mockClear();

        wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));
        instance = wrapper.instance() as EditPostModalClass;

        expect(actions.hideEditPostModal).not.toBeCalled();

        wrapper.setState({editText: '    '});
        await instance.handleEdit();

        expect(actions.hideEditPostModal).toBeCalled();
        expect(actions.openModal).toHaveBeenCalled();
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
    });

    it('should scroll page after successfully editing post', async () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        global.scrollTo = jest.fn();
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));
        const instance = wrapper.instance() as EditPostModalClass;

        wrapper.setState({editText: 'new text'});
        await instance.handleEdit();

        expect(global.scrollTo).toBeCalledWith(0, 0);
    });

    it('should update state after changing value in textbox', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps}));
        const instance = wrapper.instance() as EditPostModalClass;
        const event = {target: {value: 'test'}} as unknown as React.ChangeEvent<HTMLInputElement>;

        wrapper.setState({editText: ''});
        instance.handleChange(event);

        expect((wrapper.state() as EditPostModalState).editText).toBe('test');
    });

    it('should clear data on exit', () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const editingPost = {
            show: false,
            post: {...defaultPost},
            postId: '1',
        };
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions, editingPost}));
        const instance = wrapper.instance() as EditPostModalClass;

        wrapper.setState({
            editText: 'test_edit_text',
            postError: 'test_post_error',
            errorClass: 'test_error_class',
            showEmojiPicker: true,
        });
        instance.handleExited();

        expect(wrapper.state()).toEqual({
            editText: '',
            caretPosition: 0,
            postError: null,
            errorClass: null,
            showEmojiPicker: false,
            prevShowState: false,
            renderScrollbar: false,
            scrollbarWidth: 0,
        });
    });

    it('should focus element on exit based on refocusId', () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, actions}));
        const instance = wrapper.instance() as EditPostModalClass;

        const elem = document.createElement('INPUT');
        elem.setAttribute('id', 'test');
        elem.focus = jest.fn();
        document.body.appendChild(elem);

        instance.handleHide();
        instance.handleExited();

        jest.runOnlyPendingTimers();
        expect(elem.focus).toBeCalled();
    });

    it('should handle edition on key down enter depending on the conditions', () => {
        const options = new ReactRouterEnzymeContext();
        const eventMethods = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        };
        let wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: true}), {
            context: options.get(),
        });
        let instance = wrapper.instance() as EditPostModalClass;
        instance.handleEdit = jest.fn();

        // Test with Control Key (Windows)
        instance.handleKeyDown({
            keyCode: 1,
            ctrlKey: true,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0] as any,
            keyCode: Constants.KeyCodes.ENTER[1] as any,
            ctrlKey: true,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).toBeCalled();

        wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: true}));
        instance = wrapper.instance() as EditPostModalClass;
        instance.handleEdit = jest.fn();

        // Test with Command Key (Mac)
        instance.handleKeyDown({
            keyCode: 1,
            ctrlKey: false,
            metaKey: true,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
            metaKey: true,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).toBeCalled();

        wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: false}));
        instance = wrapper.instance() as EditPostModalClass;
        instance.handleEdit = jest.fn();

        // Test with Control Key (Windows)
        instance.handleKeyDown({
            keyCode: 1,
            ctrlKey: true,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: true,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();

        wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: false}));
        instance = wrapper.instance() as EditPostModalClass;
        instance.handleEdit = jest.fn();

        // Test with Command Key (Mac)
        instance.handleKeyDown({
            keyCode: 1,
            ctrlKey: false,
            metaKey: true,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
            metaKey: false,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
            metaKey: true,
            ...eventMethods,
        } as any);
        expect(instance.handleEdit).not.toBeCalled();
    });

    describe('should handle edition on key press enter depending on the conditions', () => {
        it('for Mobile, ctrlSend true', () => {
            isMobileSpy.mockReturnValue(true);
            const wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: true}));
            const instance = wrapper.instance() as EditPostModalClass;
            instance.setState({caretPosition: 3});
            (instance as any).editbox = {blur: jest.fn()};

            const preventDefault = jest.fn();
            instance.handleEdit = jest.fn();
            instance.handleEditKeyPress({
                which: 1,
                ctrlKey: true,
                preventDefault,
                shiftKey: false,
                altKey: false,
            } as any);
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({
                key: Constants.KeyCodes.ENTER[0],
                which: Constants.KeyCodes.ENTER[1],
                ctrlKey: false,
                preventDefault,
                shiftKey: false,
                altKey: false,
            } as any);
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
        });

        it('for Chrome, ctrlSend false', () => {
            isMobileSpy.mockReturnValue(false);
            const wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: false}));
            const instance = wrapper.instance() as EditPostModalClass;
            (instance as any).editbox = {blur: jest.fn()};

            const preventDefault = jest.fn();
            instance.handleEdit = jest.fn();
            instance.handleEditKeyPress({
                which: 1,
                ctrlKey: true,
                preventDefault,
                shiftKey: false,
                altKey: false,
            } as any);
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({
                key: Constants.KeyCodes.ENTER[0],
                which: Constants.KeyCodes.ENTER[1],
                ctrlKey: true,
                preventDefault,
                shiftKey: true,
                altKey: false,
            } as any);
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({
                key: Constants.KeyCodes.ENTER[0],
                which: Constants.KeyCodes.ENTER[1],
                ctrlKey: true,
                preventDefault,
                shiftKey: false,
                altKey: true,
            } as any);
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({
                key: Constants.KeyCodes.ENTER[0],
                ctrlKey: true,
                preventDefault,
                shiftKey: false,
                altKey: false,
            } as any);
            expect(instance.handleEdit).toBeCalled();
            expect(preventDefault).toBeCalled();
        });
    });

    it('should handle the escape key manually to hide the modal', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: true}));
        const instance = wrapper.instance() as EditPostModalClass;
        instance.handleHide = jest.fn();
        instance.handleExit = jest.fn();

        instance.handleKeyDown({keyCode: 1} as any);
        expect(instance.handleHide).not.toBeCalled();

        instance.handleKeyDown({
            key: Constants.KeyCodes.ESCAPE[0],
            keyCode: Constants.KeyCodes.ESCAPE[1],
        } as any);
        expect(instance.handleHide).toBeCalled();
    });

    it('should handle the escape key manually to hide the modal, unless the emoji picker is shown', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, ctrlSend: true}));
        const instance = wrapper.instance() as EditPostModalClass;
        instance.handleHide = jest.fn();
        instance.handleExit = jest.fn();

        instance.setState({showEmojiPicker: true});

        instance.handleKeyDown({
            key: Constants.KeyCodes.ESCAPE[0],
            keyCode: Constants.KeyCodes.ESCAPE[1],
        } as any);
        expect(instance.handleHide).not.toBeCalled();
    });

    it('should disable the button on not canEditPost and text in it', () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(
            createEditPost({...defaultProps, actions, canEditPost: false}),
        );
        wrapper.setState({editText: 'new message'});
        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance() as EditPostModalClass;
        instance.handleEdit();
        expect(actions.hideEditPostModal).not.toBeCalled();
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        expect(actions.hideEditPostModal).not.toBeCalled();
    });

    it('should not disable the button on not canEditPost and no text in it with canDeletePost', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, canEditPost: false}));
        wrapper.setState({editText: ''});
        expect(wrapper).toMatchSnapshot();
    });

    it('should disable the button on not canDeletePost and empty text in it', () => {
        const actions = {
            editPost: jest.fn((data) => (Promise.resolve(data))),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(
            createEditPost({...defaultProps, actions, canDeletePost: false}),
        );
        wrapper.setState({editText: ''});
        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance() as EditPostModalClass;
        instance.handleEdit();
        expect(actions.hideEditPostModal).not.toBeCalled();
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        expect(actions.hideEditPostModal).not.toBeCalled();
    });

    it('should not disable the button on not canDeletePost and text in it with canEditPost', () => {
        const wrapper = shallowWithIntl(createEditPost({...defaultProps, canDeletePost: false}));
        wrapper.setState({editText: 'new message'});
        expect(wrapper).toMatchSnapshot();
    });

    it('should not disable the save button on not canDeletePost and no text when edited message has attachments', () => {
        const editingPost = {
            postId: '123',
            post: {
                ...defaultPost,
                file_ids: ['file_id_1'],
            },
            refocusId: 'test',
            show: true,
            title: 'test',
        };
        const wrapper = shallowWithIntl(
            createEditPost({...defaultProps, canDeletePost: false, editingPost}),
        );
        wrapper.setState({editText: ''});
        expect(wrapper).toMatchSnapshot();
    });

    testComponentForLineBreak(
        (value: string) => {
            return createEditPost({...defaultProps,
                editingPost: {
                    postId: '123',
                    post: {
                        ...defaultPost,
                        message: value,
                    },
                    refocusId: 'test',
                    show: true,
                    title: 'test',
                },
            });
        },
        (instance: {state: () => {editText: string}}) => instance.state().editText,
    );

    it('should match snapshot with useChannelMentions set to false', () => {
        const wrapper = shallowWithIntl(
            createEditPost({...defaultProps, useChannelMentions: false}),
        );
        expect(wrapper).toMatchSnapshot();
    });

    testComponentForMarkdownHotkeys(
        (value: string) => {
            return createEditPost({...defaultProps,
                editingPost: {
                    postId: '123',
                    post: {
                        ...defaultPost,
                        message: value,
                    },
                    refocusId: 'test',
                    show: true,
                    title: 'test',
                },
            });
        },
        (wrapper: ShallowWrapper<any, any, any>, setSelectionRangeFn: any) => {
            wrapper.instance().editbox = {
                getInputBox: jest.fn(() => {
                    return {
                        setSelectionRange: setSelectionRangeFn,
                        focus: jest.fn(),
                    };
                }),
            };
        },
        (instance: ShallowWrapper<any, any, any>) => instance.find(Textbox),
        (instance: ShallowWrapper<any, any, any>) => instance.state().editText,
    );

    it('should adjust selection to correct text', () => {
        const value = 'Jalebi _Fafda_ and Sambharo';
        const wrapper = shallowWithIntl(
            createEditPost({...defaultProps,
                editingPost: {
                    postId: '123',
                    post: {
                        ...defaultPost,
                        message: value,
                    },
                    refocusId: 'test',
                    show: true,
                    title: 'test',
                },
            }),
        );

        const setSelectionRangeFn = jest.fn();
        (wrapper.instance() as any).editbox = {
            getInputBox: jest.fn(() => {
                return {
                    setSelectionRange: setSelectionRangeFn,
                    focus: jest.fn(),
                };
            }),
        };

        const textbox = wrapper.find(Textbox);
        const e = makeSelectionEvent(value, 7, 14) as React.SyntheticEvent<Element, Event>;
        const onSelect = textbox.props().onSelect;
        if (onSelect) {
            onSelect(e);
        }
        expect(setSelectionRangeFn).toHaveBeenCalledWith(8, 13);
    });
});
