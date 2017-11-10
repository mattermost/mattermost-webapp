import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import Constants from 'utils/constants';

import EditPostModal from 'components/edit_post_modal/edit_post_modal.jsx';

jest.useFakeTimers();

function createEditPost({ctrlSend, config, license, editingPost, actions} = {}) {
    const ctrlSendProp = ctrlSend || false;
    const configProp = config || {
        AllowEditPost: 'allways',
        PostEditTimeLimit: 300,
        EnableEmojiPicker: 'true'
    };
    const licenseProp = license || {
        IsLicensed: 'false'
    };
    const editingPostProp = editingPost || {
        postId: '123',
        post: {
            id: '123',
            message: 'test',
            channel_id: '5'
        },
        commentsCount: 3,
        refocusId: 'test',
        title: 'test'
    };
    const actionsProp = actions || {
        editPost: jest.fn(),
        addMessageIntoHistory: jest.fn(),
        setEditingPost: jest.fn()
    };
    return (
        <EditPostModal
            ctrlSend={ctrlSendProp}
            config={configProp}
            license={licenseProp}
            editingPost={editingPostProp}
            actions={actionsProp}
        />
    );
}

describe('comoponents/edit_post_modal/edit_post_modal.jsx', () => {
    it('should match with default config', () => {
        const wrapper = shallow(createEditPost());
        expect(wrapper).toMatchSnapshot();
    });

    it('should match without emoji picker', () => {
        const config = {
            AllowEditPost: 'allways',
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false'
        };
        const wrapper = shallow(createEditPost({config}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should match without editingPost', () => {
        const wrapper = shallow(createEditPost({editingPost: {}}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should call editPost, addMessageIntoHistory and setEditingPost on save actions', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        const wrapper = shallow(createEditPost({actions}));

        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
        wrapper.setState({editText: 'new message'});
        wrapper.find('.btn-primary').simulate('click');
        expect(actions.addMessageIntoHistory).toBeCalledWith('new message');
        expect(actions.editPost).toBeCalledWith({
            message: 'new message',
            id: '123',
            channel_id: '5'
        });
    });

    it('should not allow to edit when config and license restrict edition', () => {
        const config = {
            AllowEditPost: 'never',
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false'
        };
        const license = {
            IsLicensed: 'true'
        };

        const wrapper = shallow(createEditPost({config, license}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should not allow to edit when have license and the post is after the editing time limit', () => {
        const config = {
            AllowEditPost: 'time_limit',
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false'
        };
        const license = {
            IsLicensed: 'true'
        };
        const editingPost = {
            postId: '123',
            post: {
                id: '123',
                message: 'test',
                channel_id: '5',
                create_at: new Date() - (350 * 1000)
            },
            commentsCount: 3,
            refocusId: '#test',
            title: 'test'
        };
        const wrapper = shallow(createEditPost({config, license, editingPost}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should allow to edit when have license and the post is before the editing time limit', () => {
        const config = {
            AllowEditPost: 'time_limit',
            PostEditTimeLimit: 300,
            EnableEmojiPicker: 'false'
        };
        const license = {
            IsLicensed: 'true'
        };
        const editingPost = {
            postId: '123',
            post: {
                id: '123',
                message: 'test',
                channel_id: '5',
                create_at: new Date() - (150 * 1000)
            },
            commentsCount: 3,
            refocusId: '#test',
            title: 'test'
        };
        const wrapper = shallow(createEditPost({config, license, editingPost}));
        expect(wrapper).toMatchSnapshot();
    });

    it('should allow to edit when have license and always allow to edit', () => {
        const license = {
            IsLicensed: 'true'
        };
        const editingPost = {
            postId: '123',
            post: {
                id: '123',
                message: 'test',
                channel_id: '5',
                create_at: new Date() - (150 * 1000)
            },
            commentsCount: 3,
            refocusId: '#test',
            title: 'test'
        };
        const wrapper = shallow(createEditPost({license, editingPost}));
        expect(wrapper).toMatchSnapshot();
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

    it('should set the focus and recalcule the size of the edit box enter end', () => {
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

    it('should hide the preview on exit start', () => {
        const wrapper = mountWithIntl(createEditPost());
        const instance = wrapper.instance();
        const ref = wrapper.ref('editbox');
        ref.hidePreview = jest.fn();
        expect(ref.hidePreview).not.toBeCalled();
        instance.handleExit();
        expect(ref.hidePreview).toBeCalled();
    });

    it('should hide when confirm the edition and the message is not edited', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();
        expect(wrapper.state().hidding).toBe(false);
        wrapper.setState({editText: 'test'});
        instance.handleEdit();
        expect(wrapper.state().hidding).toBe(true);
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
    });

    it('should hide when confirm the edition and the message is empty', () => {
        const actions = {
            editPost: jest.fn(),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        var wrapper = shallow(createEditPost({actions}));
        var instance = wrapper.instance();
        expect(wrapper.state().hidding).toBe(false);
        wrapper.setState({editText: ''});
        instance.handleEdit();
        expect(wrapper.state().hidding).toBe(true);
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();

        wrapper = shallow(createEditPost({actions}));
        instance = wrapper.instance();
        expect(wrapper.state().hidding).toBe(false);
        wrapper.setState({editText: '    '});
        instance.handleEdit();
        expect(wrapper.state().hidding).toBe(true);
        expect(actions.addMessageIntoHistory).not.toBeCalled();
        expect(actions.editPost).not.toBeCalled();
    });

    it('should scroll up when editPost return data', async () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        global.scrollTo = jest.fn();
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();
        expect(wrapper.state().hidding).toBe(false);
        wrapper.setState({editText: 'new text'});
        await instance.handleEdit();
        expect(global.scrollTo).toBeCalledWith(0, 0);
    });

    it('should on change value in the textbox set the state', () => {
        const wrapper = shallow(createEditPost());
        const instance = wrapper.instance();
        expect(wrapper.state().hidding).toBe(false);
        wrapper.setState({editText: ''});
        instance.handleChange({target: {value: 'test'}});
        expect(wrapper.state().editText).toBe('test');
    });

    it('should on change value in the textbox set the state', () => {
        const wrapper = shallow(createEditPost());
        const instance = wrapper.instance();
        expect(wrapper.state().hidding).toBe(false);
        wrapper.setState({editText: ''});
        instance.handleChange({target: {value: 'test'}});
        expect(wrapper.state().editText).toBe('test');
    });

    it('should clear data on exit', () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();
        wrapper.setState({editText: 'test', postError: 'test', errorClass: 'test', hidding: true, showEmojiPicker: true});
        instance.handleExited();
        expect(wrapper.state()).toEqual({editText: '', postError: '', errorClass: null, hidding: false, showEmojiPicker: false});
        expect(actions.setEditingPost).toBeCalledWith();
    });

    it('should clear data on exit', () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();
        wrapper.setState({editText: 'test', postError: 'test', errorClass: 'test', hidding: true, showEmojiPicker: true});
        instance.handleExited();
        jest.runAllTimers();
        expect(wrapper.state()).toEqual({editText: '', postError: '', errorClass: null, hidding: false, showEmojiPicker: false});
        expect(actions.setEditingPost).toBeCalledWith();
    });

    it('should focus element on exit based on refocusId', () => {
        const actions = {
            editPost: jest.fn((data) => data),
            addMessageIntoHistory: jest.fn(),
            setEditingPost: jest.fn()
        };
        const wrapper = shallow(createEditPost({actions}));
        const instance = wrapper.instance();
        const elem = document.createElement('INPUT');
        elem.setAttribute('id', 'test');
        elem.focus = jest.fn();
        document.body.appendChild(elem);
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
        instance.handleKeyDown({keyCode: Constants.KeyCodes.ENTER, ctrlKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({keyCode: Constants.KeyCodes.ENTER, ctrlKey: true});
        expect(instance.handleEdit).toBeCalled();

        wrapper = shallow(createEditPost({ctrlSend: false}));
        instance = wrapper.instance();
        instance.handleEdit = jest.fn();
        instance.handleKeyDown({keyCode: 1, ctrlKey: true});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({keyCode: Constants.KeyCodes.ENTER, ctrlKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        instance.handleKeyDown({keyCode: Constants.KeyCodes.ENTER, ctrlKey: true});
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
        instance.handleEditKeyPress({which: Constants.KeyCodes.ENTER, ctrlKey: false, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({which: Constants.KeyCodes.ENTER, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
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
        instance.handleEditKeyPress({which: Constants.KeyCodes.ENTER, ctrlKey: true, preventDefault, shiftKey: true, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({which: Constants.KeyCodes.ENTER, ctrlKey: true, preventDefault, shiftKey: false, altKey: true});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({which: Constants.KeyCodes.ENTER, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).toBeCalled();
        expect(preventDefault).toBeCalled();
    });
});
