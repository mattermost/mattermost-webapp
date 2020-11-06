// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactRouterEnzymeContext from 'react-router-enzyme-context';

import {isMobile} from 'utils/user_agent';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';
import {Constants, ModalIdentifiers} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import EditPostModal from 'components/edit_post_modal/edit_post_modal.jsx';
import {testComponentForMarkdownHotkeys, makeSelectionEvent} from 'tests/helpers/markdown_hotkey_helpers.js';
import Textbox from 'components/textbox';

jest.mock('actions/global_actions.jsx', () => ({
    emitClearSuggestions: jest.fn(),
}));

jest.mock('utils/user_agent', () => ({
    ...jest.requireActual('utils/user_agent'),
    isMobile: jest.fn().mockReturnValue(false),
}));

function createEditPost({canEditPost, canDeletePost, useChannelMentions, ctrlSend, config, license, editingPost, actions} = {canEditPost: true, canDeletePost: true}) { //eslint-disable-line react/prop-types
    const canEditPostProp = canEditPost === undefined ? true : canEditPost;
    const canDeletePostProp = canDeletePost === undefined ? true : canDeletePost;
    const useChannelMentionsProp = useChannelMentions === undefined ? true : useChannelMentions;
    const ctrlSendProp = ctrlSend || false;
    const configProp = config || {
        PostEditTimeLimit: 300,
        EnableEmojiPicker: 'true',
    };
    const licenseProp = license || {
        IsLicensed: 'false',
    };
    const editingPostProp = editingPost || {
        postId: '123',
        post: {
            id: '123',
            message: 'test',
            channel_id: '5',
        },
        commentCount: 3,
        refocusId: 'test',
        show: true,
        title: 'test',
    };
    const actionsProp = actions || {
        editPost: jest.fn(),
        addMessageIntoHistory: jest.fn(),
        hideEditPostModal: jest.fn(),
        openModal: jest.fn(),
        setShowPreview: jest.fn(),
    };
    return (
        <EditPostModal
            canEditPost={canEditPostProp}
            shouldShowPreview={false}
            canDeletePost={canDeletePostProp}
            ctrlSend={ctrlSendProp}
            config={configProp}
            license={licenseProp}
            editingPost={editingPostProp}
            actions={actionsProp}
            maxPostSize={Constants.DEFAULT_CHARACTER_LIMIT}
            useChannelMentions={useChannelMentionsProp}
        />
    );
}

describe('components/EditPostModal', () => {
    it('should match with default config', () => {
        const wrapper = shallowWithIntl(createEditPost());
        expect(wrapper).toMatchSnapshot();
    });

    it('should match without emoji picker', () => {
        const config = {
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false',
        };
        const wrapper = shallowWithIntl(createEditPost({config}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should not call openModal on empty edited message but with attachment', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const editingPost = {
            postId: '123',
            post: {
                id: '123',
                message: 'test',
                channel_id: '5',
                file_ids: ['file_id_1'],
            },
            commentCount: 3,
            refocusId: 'test',
            show: true,
            title: 'test',
        };

        var wrapper = shallowWithIntl(createEditPost({actions, editingPost}));
        var instance = wrapper.instance();
        wrapper.setState({editText: ''});
        instance.handleEdit();

        expect(actions.openModal).not.toHaveBeenCalled();
        expect(actions.addMessageIntoHistory).toBeCalled();
        expect(actions.editPost).toBeCalled();
    });

    it('should call editPost, addMessageIntoHistory and hideEditPostModal on save', async () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({actions}));

        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();

        wrapper.setState({editText: 'new message'});
        await wrapper.find('.btn-primary').simulate('click');

        expect(actions.addMessageIntoHistory).toBeCalledWith('new message');
        expect(actions.editPost).toBeCalledWith({
            message: 'new message',
            id: '123',
            channel_id: '5',
        });
        expect(actions.hideEditPostModal).toBeCalled();
    });

    it('should show emojis on emojis click', () => {
        const wrapper = shallowWithIntl(createEditPost());
        wrapper.find('.post-action').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    it('should set the postError state when error happens', () => {
        const wrapper = shallowWithIntl(createEditPost());
        const instance = wrapper.instance();
        expect(wrapper.state().postError).toBe('');
        instance.handlePostError('Test error message');
        expect(wrapper.state().postError).toBe('Test error message');
        instance.setState = jest.fn();
        instance.handlePostError('Test error message');
        expect(instance.setState).not.toBeCalled();
    });

    it('should show errors when it is set in the state', () => {
        const wrapper = shallowWithIntl(createEditPost());
        wrapper.setState({postError: 'Test error message'});
        expect(wrapper).toMatchSnapshot();
    });

    it('should set the errorClass to animate when try to edit with an error', () => {
        const wrapper = shallowWithIntl(createEditPost());
        wrapper.setState({postError: 'Test error message'});
        expect(wrapper.state().errorClass).toBe(null);
        wrapper.instance().handleEdit('Test error message');
        expect(wrapper.state().errorClass).toBe('animation--highlight');
        jest.runOnlyPendingTimers();
        expect(wrapper.state().errorClass).toBe(null);
    });

    it('should hide and toggle the emoji picker on correctly on (toggle/hide)EmojiPicker', () => {
        const wrapper = shallowWithIntl(createEditPost());
        expect(wrapper.state().showEmojiPicker).toBe(false);
        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(true);
        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(false);
        wrapper.instance().toggleEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(true);
        wrapper.instance().hideEmojiPicker();
        expect(wrapper.state().showEmojiPicker).toBe(false);
    });

    it('should add emoji to editText when an emoji is clicked', () => {
        const wrapper = shallowWithIntl(createEditPost());
        const instance = wrapper.instance();
        const mockImpl = () => {
            return {
                setSelectionRange: jest.fn(),
                focus: jest.fn(),
            };
        };
        instance.editbox = {getInputBox: jest.fn(mockImpl), focus: jest.fn()};
        wrapper.setState({editText: ''});
        instance.handleEmojiClick(null);
        instance.handleEmojiClick({});
        instance.handleEmojiClick({aliases: []});
        expect(wrapper.state().editText).toBe('');

        wrapper.setState({editText: ''});
        instance.handleEmojiClick({name: '+1', aliases: ['thumbsup']});
        expect(wrapper.state().editText).toBe(':+1: ');

        wrapper.setState(
            {
                editText: 'test',
                caretPosition: 'test'.length,
            });
        instance.handleEmojiClick({name: '-1', aliases: ['thumbsdown']});
        expect(wrapper.state().editText).toBe('test :-1: ');

        wrapper.setState({editText: 'test '});
        instance.handleEmojiClick({name: '-1', aliases: ['thumbsdown']});
        expect(wrapper.state().editText).toBe('test  :-1: ');
    });

    it('should set the focus and recalculate the size of the edit box after entering', () => {
        const wrapper = shallowWithIntl(createEditPost());
        const instance = wrapper.instance();
        instance.editbox = {focus: jest.fn(), recalculateSize: jest.fn()};

        const ref = instance.editbox;
        expect(ref.focus).not.toBeCalled();
        expect(ref.recalculateSize).not.toBeCalled();
        instance.handleEntered();
        expect(ref.focus).toBeCalled();
        expect(ref.recalculateSize).toBeCalled();
    });

    it('should hide the preview when exiting', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };

        const wrapper = shallowWithIntl(createEditPost({actions}));
        const instance = wrapper.instance();

        instance.setShowPreview(true);
        expect(actions.setShowPreview).toHaveBeenCalledWith(true);
        instance.handleExit();
        expect(actions.setShowPreview).toHaveBeenCalledWith(false);
    });

    it('should close without saving when post text is not changed', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({actions}));
        const instance = wrapper.instance();

        expect(actions.hideEditPostModal).not.toBeCalled();

        instance.handleEdit();

        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        expect(actions.hideEditPostModal).toBeCalled();
    });

    it('should close and show delete confirmation modal when message is empty', async () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        var wrapper = shallowWithIntl(createEditPost({actions}));
        var instance = wrapper.instance();

        expect(actions.hideEditPostModal).not.toBeCalled();

        wrapper.setState({editText: ''});
        instance.handleEdit();

        expect(actions.hideEditPostModal).toBeCalled();
        expect(actions.openModal).toHaveBeenCalledWith({
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: {
                    id: '123',
                    message: 'test',
                    channel_id: '5',
                },
                commentCount: 3,
            },
        });
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();

        actions.hideEditPostModal.mockClear();

        wrapper = shallowWithIntl(createEditPost({actions}));
        instance = wrapper.instance();

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
            editPost: jest.fn((data) => {
                return {data};
            }),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        global.scrollTo = jest.fn();
        const wrapper = shallowWithIntl(createEditPost({actions}));
        const instance = wrapper.instance();

        wrapper.setState({editText: 'new text'});
        await instance.handleEdit();

        expect(global.scrollTo).toBeCalledWith(0, 0);
    });

    it('should update state after changing value in textbox', () => {
        const wrapper = shallowWithIntl(createEditPost());
        const instance = wrapper.instance();

        wrapper.setState({editText: ''});
        instance.handleChange({target: {value: 'test'}});

        expect(wrapper.state().editText).toBe('test');
    });

    it('should clear data on exit', () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const editingPost = {show: false};
        const wrapper = shallowWithIntl(createEditPost({actions, editingPost}));
        const instance = wrapper.instance();

        wrapper.setState({editText: 'test', postError: 'test', errorClass: 'test', showEmojiPicker: true});
        instance.handleExited();

        expect(wrapper.state()).toEqual({
            editText: '',
            caretPosition: 0,
            postError: '',
            errorClass: null,
            showEmojiPicker: false,
            prevShowState: false,
            renderScrollbar: false,
            scrollbarWidth: 0,
        });
    });

    it('should focus element on exit based on refocusId', () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({actions}));
        const instance = wrapper.instance();

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
        const eventMethods = {preventDefault: jest.fn(), stopPropagation: jest.fn()};
        var wrapper = shallowWithIntl(createEditPost({ctrlSend: true}), {context: options.get()});
        var instance = wrapper.instance();
        instance.handleEdit = jest.fn();

        // Test with Control Key (Windows)
        instance.handleKeyDown({keyCode: 1, ctrlKey: true, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: true, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).toBeCalled();

        wrapper = shallowWithIntl(createEditPost({ctrlSend: true}));
        instance = wrapper.instance();
        instance.handleEdit = jest.fn();

        // Test with Command Key (Mac)
        instance.handleKeyDown({keyCode: 1, ctrlKey: false, metaKey: true, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false, metaKey: true, ...eventMethods});
        expect(instance.handleEdit).toBeCalled();

        wrapper = shallowWithIntl(createEditPost({ctrlSend: false}));
        instance = wrapper.instance();
        instance.handleEdit = jest.fn();

        // Test with Control Key (Windows)
        instance.handleKeyDown({keyCode: 1, ctrlKey: true, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: true, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();

        wrapper = shallowWithIntl(createEditPost({ctrlSend: false}));
        instance = wrapper.instance();
        instance.handleEdit = jest.fn();

        // Test with Command Key (Mac)
        instance.handleKeyDown({keyCode: 1, ctrlKey: false, metaKey: true, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false, metaKey: false, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false, metaKey: true, ...eventMethods});
        expect(instance.handleEdit).not.toBeCalled();
    });

    describe('should handle edition on key press enter depending on the conditions', () => {
        it('for Mobile, ctrlSend true', () => {
            isMobile.mockReturnValue(true);
            const wrapper = shallowWithIntl(createEditPost({ctrlSend: true}));
            const instance = wrapper.instance();
            instance.setState({caretPosition: 3});
            instance.editbox = {blur: jest.fn()};

            const preventDefault = jest.fn();
            instance.handleEdit = jest.fn();
            instance.handleEditKeyPress({which: 1, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: false, preventDefault, shiftKey: false, altKey: false});
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
        });

        it('for Chrome, ctrlSend false', () => {
            isMobile.mockReturnValue(false);
            const wrapper = shallowWithIntl(createEditPost({ctrlSend: false}));
            const instance = wrapper.instance();
            instance.editbox = {blur: jest.fn()};

            const preventDefault = jest.fn();
            instance.handleEdit = jest.fn();
            instance.handleEditKeyPress({which: 1, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: true, preventDefault, shiftKey: true, altKey: false});
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: true, preventDefault, shiftKey: false, altKey: true});
            expect(instance.handleEdit).not.toBeCalled();
            expect(preventDefault).not.toBeCalled();
            instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
            expect(instance.handleEdit).toBeCalled();
            expect(preventDefault).toBeCalled();
        });
    });

    it('should handle the escape key manually to hide the modal', () => {
        const wrapper = shallowWithIntl(createEditPost({ctrlSend: true}));
        const instance = wrapper.instance();
        instance.handleHide = jest.fn();
        instance.handleExit = jest.fn();

        instance.handleKeyDown({keyCode: 1});
        expect(instance.handleHide).not.toBeCalled();

        instance.handleKeyDown({key: Constants.KeyCodes.ESCAPE[0], keyCode: Constants.KeyCodes.ESCAPE[1]});
        expect(instance.handleHide).toBeCalled();
    });

    it('should handle the escape key manually to hide the modal, unless the emoji picker is shown', () => {
        const wrapper = shallowWithIntl(createEditPost({ctrlSend: true}));
        const instance = wrapper.instance();
        instance.handleHide = jest.fn();
        instance.handleExit = jest.fn();

        instance.setState({showEmojiPicker: true});

        instance.handleKeyDown({key: Constants.KeyCodes.ESCAPE[0], keyCode: Constants.KeyCodes.ESCAPE[1]});
        expect(instance.handleHide).not.toBeCalled();
    });

    it('should disable the button on not canEditPost and text in it', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({actions, canEditPost: false}));
        wrapper.setState({editText: 'new message'});
        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance();
        instance.handleEdit();
        expect(actions.hideEditPostModal).not.toBeCalled();
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        expect(actions.hideEditPostModal).not.toBeCalled();
    });

    it('should not disable the button on not canEditPost and no text in it with canDeletePost', () => {
        const wrapper = shallowWithIntl(createEditPost({canEditPost: false}));
        wrapper.setState({editText: ''});
        expect(wrapper).toMatchSnapshot();
    });

    it('should disable the button on not canDeletePost and empty text in it', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
            setShowPreview: jest.fn(),
        };
        const wrapper = shallowWithIntl(createEditPost({actions, canDeletePost: false}));
        wrapper.setState({editText: ''});
        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance();
        instance.handleEdit();
        expect(actions.hideEditPostModal).not.toBeCalled();
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        expect(actions.hideEditPostModal).not.toBeCalled();
    });

    it('should not disable the button on not canDeletePost and text in it with canEditPost', () => {
        const wrapper = shallowWithIntl(createEditPost({canDeletePost: false}));
        wrapper.setState({editText: 'new message'});
        expect(wrapper).toMatchSnapshot();
    });

    it('should not disable the save button on not canDeletePost and no text when edited message has attachments', () => {
        const editingPost = {
            postId: '123',
            post: {
                id: '123',
                message: 'test',
                channel_id: '5',
                file_ids: ['file_id_1'],
            },
            commentCount: 3,
            refocusId: 'test',
            show: true,
            title: 'test',
        };
        var wrapper = shallowWithIntl(createEditPost({canDeletePost: false, editingPost}));
        wrapper.setState({editText: ''});
        expect(wrapper).toMatchSnapshot();
    });

    testComponentForLineBreak((value) => {
        return createEditPost({
            editingPost: {
                postId: '123',
                post: {
                    id: '123',
                    message: value,
                    channel_id: '5',
                },
                commentCount: 3,
                refocusId: 'test',
                show: true,
                title: 'test',
            },
        });
    }, (instance) => instance.state().editText);

    it('should match snapshot with useChannelMentions set to false', () => {
        var wrapper = shallowWithIntl(createEditPost({useChannelMentions: false}));
        expect(wrapper).toMatchSnapshot();
    });

    testComponentForMarkdownHotkeys(
        (value) => {
            return createEditPost({
                editingPost: {
                    postId: '123',
                    post: {
                        id: '123',
                        message: value,
                        channel_id: '5',
                    },
                    commentCount: 3,
                    refocusId: 'test',
                    show: true,
                    title: 'test',
                },
            });
        },
        (wrapper, setSelectionRangeFn) => {
            wrapper.instance().editbox = {
                getInputBox: jest.fn(() => {
                    return {
                        setSelectionRange: setSelectionRangeFn,
                        focus: jest.fn(),
                    };
                }),
            };
        },
        (instance) => instance.find(Textbox),
        (instance) => instance.state().editText,
    );

    it('should adjust selection to correct text', () => {
        const value = 'Jalebi _Fafda_ and Sambharo';
        const wrapper = shallowWithIntl(
            createEditPost({
                editingPost: {
                    postId: '123',
                    post: {
                        id: '123',
                        message: value,
                        channel_id: '5',
                    },
                    commentCount: 3,
                    refocusId: 'test',
                    show: true,
                    title: 'test',
                },
            }),
        );

        const setSelectionRangeFn = jest.fn();
        wrapper.instance().editbox = {
            getInputBox: jest.fn(() => {
                return {
                    setSelectionRange: setSelectionRangeFn,
                    focus: jest.fn(),
                };
            }),
        };

        const textbox = wrapper.find(Textbox);
        const e = makeSelectionEvent(value, 7, 14);
        textbox.props().onSelect(e);
        expect(setSelectionRangeFn).toHaveBeenCalledWith(8, 13);
    });
});
