import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Constants from 'utils/constants';
import EditPostModal from 'components/edit_post_modal/edit_post_modal.jsx';

jest.useFakeTimers();

jest.mock('actions/global_actions.jsx', () => ({
    emitClearSuggestions: jest.fn(),
}));

function createEditPost({ctrlSend, config, license, editingPost, actions} = {}) {
    const ctrlSendProp = ctrlSend || false;
    const configProp = config || {
        AllowEditPost: 'allways',
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
        commentsCount: 3,
        refocusId: 'test',
        show: true,
        title: 'test',
    };
    const actionsProp = actions || {
        editPost: jest.fn(),
        addMessageIntoHistory: jest.fn(),
        hideEditPostModal: jest.fn(),
        openModal: jest.fn(),
    };
    return (
        <EditPostModal
            ctrlSend={ctrlSendProp}
            config={configProp}
            license={licenseProp}
            editingPost={editingPostProp}
            actions={actionsProp}
            maxPostSize={Constants.DEFAULT_CHARACTER_LIMIT}
        />
    );
}

describe('components/EditPostModal', () => {
    it('should match with default config', () => {
        const wrapper = shallow(createEditPost());
        expect(wrapper).toMatchSnapshot();
    });

    it('should match without emoji picker', () => {
        const config = {
            AllowEditPost: 'allways',
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false',
        };
        const wrapper = shallow(createEditPost({config}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should not call openModal on empty edited message but with attachment', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
        };
        const editingPost = {
            postId: '123',
            post: {
                id: '123',
                message: 'test',
                channel_id: '5',
                file_ids: ['file_id_1'],
            },
            commentsCount: 3,
            refocusId: 'test',
            show: true,
            title: 'test',
        };

        var wrapper = shallow(createEditPost({actions, editingPost}));
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
        };
        const wrapper = shallow(createEditPost({actions}));

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
        const wrapper = shallow(createEditPost());
        wrapper.find('.edit-post__actions .icon--emoji').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    it('should set the postError state when error happens', () => {
        const wrapper = shallow(createEditPost());
        const instance = wrapper.instance();
        expect(wrapper.state().postError).toBe('');
        instance.handlePostError('Test error message');
        expect(wrapper.state().postError).toBe('Test error message');
        instance.setState = jest.fn();
        instance.handlePostError('Test error message');
        expect(instance.setState).not.toBeCalled();
    });

    it('should show errors when it is set in the state', () => {
        const wrapper = shallow(createEditPost());
        wrapper.setState({postError: 'Test error message'});
        expect(wrapper).toMatchSnapshot();
    });

    it('should set the errorClass to animate when try to edit with an error', () => {
        const wrapper = shallow(createEditPost());
        wrapper.setState({postError: 'Test error message'});
        expect(wrapper.state().errorClass).toBe(null);
        wrapper.instance().handleEdit('Test error message');
        expect(wrapper.state().errorClass).toBe('animation--highlight');
        jest.runAllTimers();
        expect(wrapper.state().errorClass).toBe(null);
    });

    it('should hide and toggle the emoji picker on correctly on (toggle/hide)EmojiPicker', () => {
        const wrapper = shallow(createEditPost());
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
        const wrapper = mountWithIntl(createEditPost());
        wrapper.setState({editText: ''});
        wrapper.instance().handleEmojiClick(null);
        wrapper.instance().handleEmojiClick({});
        wrapper.instance().handleEmojiClick({aliases: []});
        expect(wrapper.state().editText).toBe('');

        wrapper.setState({editText: ''});
        wrapper.instance().handleEmojiClick({name: '+1', aliases: ['thumbsup']});
        expect(wrapper.state().editText).toBe(':+1: ');

        wrapper.setState({editText: 'test'});
        wrapper.instance().handleEmojiClick({name: '-1', aliases: ['thumbsdown']});
        expect(wrapper.state().editText).toBe('test :-1: ');

        wrapper.setState({editText: 'test '});
        wrapper.instance().handleEmojiClick({name: '-1', aliases: ['thumbsdown']});
        expect(wrapper.state().editText).toBe('test :-1: ');
    });

    it('should set the focus and recalculate the size of the edit box after entering', () => {
        const wrapper = mountWithIntl(createEditPost());
        const instance = wrapper.instance();
        const ref = wrapper.ref('editbox');
        ref.focus = jest.fn();
        ref.recalculateSize = jest.fn();
        expect(ref.focus).not.toBeCalled();
        expect(ref.recalculateSize).not.toBeCalled();
        instance.handleEntered();
        expect(ref.focus).toBeCalled();
        expect(ref.recalculateSize).toBeCalled();
    });

    it('should hide the preview when exiting', () => {
        const wrapper = mountWithIntl(createEditPost());
        const instance = wrapper.instance();
        const ref = wrapper.ref('editbox');
        ref.hidePreview = jest.fn();
        expect(ref.hidePreview).not.toBeCalled();
        instance.handleExit();
        expect(ref.hidePreview).toBeCalled();
    });

    it('should close without saving when post text is not changed', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
        };
        const wrapper = shallow(createEditPost({actions}));
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
        };
        var wrapper = shallow(createEditPost({actions}));
        var instance = wrapper.instance();

        expect(actions.hideEditPostModal).not.toBeCalled();

        wrapper.setState({editText: ''});
        instance.handleEdit();

        expect(actions.hideEditPostModal).toBeCalled();
        expect(actions.openModal).toHaveBeenCalled();
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();

        actions.hideEditPostModal.mockClear();

        wrapper = shallow(createEditPost({actions}));
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
        };
        global.scrollTo = jest.fn();
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();

        wrapper.setState({editText: 'new text'});
        await instance.handleEdit();

        expect(global.scrollTo).toBeCalledWith(0, 0);
    });

    it('should update state after changing value in textbox', () => {
        const wrapper = shallow(createEditPost());
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
        };
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();

        wrapper.setState({editText: 'test', postError: 'test', errorClass: 'test', showEmojiPicker: true});
        instance.handleExited();

        jest.runAllTimers();
        expect(wrapper.state()).toEqual({editText: '', postError: '', errorClass: null, showEmojiPicker: false});
    });

    it('should focus element on exit based on refocusId', () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            hideEditPostModal: jest.fn(),
            openModal: jest.fn(),
        };
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();

        const elem = document.createElement('INPUT');
        elem.setAttribute('id', 'test');
        elem.focus = jest.fn();
        document.body.appendChild(elem);

        instance.handleHide();
        instance.handleExited();

        jest.runAllTimers();
        expect(elem.focus).toBeCalled();
    });

    it('should handle edition on key down enter depending on the conditions', () => {
        var wrapper = shallow(createEditPost({ctrlSend: true}));
        var instance = wrapper.instance();
        instance.handleEdit = jest.fn();
        instance.handleKeyDown({keyCode: 1, ctrlKey: true});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: true});
        expect(instance.handleEdit).toBeCalled();

        wrapper = shallow(createEditPost({ctrlSend: false}));
        instance = wrapper.instance();
        instance.handleEdit = jest.fn();
        instance.handleKeyDown({keyCode: 1, ctrlKey: true});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({key: Constants.KeyCodes.ENTER[0], keyCode: Constants.KeyCodes.ENTER[1], ctrlKey: true});
        expect(instance.handleEdit).not.toBeCalled();
    });

    it('should handle edition on key press enter depending on the conditions', () => {
        global.navigator = {userAgent: 'Android'};
        var wrapper = mountWithIntl(createEditPost({ctrlSend: true}));
        var instance = wrapper.instance();
        const preventDefault = jest.fn();
        instance.handleEdit = jest.fn();
        instance.handleEditKeyPress({which: 1, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: false, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).toBeCalled();
        expect(preventDefault).toBeCalled();

        global.navigator = {userAgent: 'Chrome'};
        wrapper = mountWithIntl(createEditPost({ctrlSend: false}));
        instance = wrapper.instance();
        preventDefault.mockClear();
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
