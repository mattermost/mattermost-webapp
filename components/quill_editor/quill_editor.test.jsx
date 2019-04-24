// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import QuillEditor from 'components/quill_editor/quill_editor.jsx';
import EmojiMap from 'utils/emoji_map.js';
import Quill from 'quill';

const createQuillEditor = (props) => {
    const baseProps = {
        className: 'custom-textarea',
        onKeyDown: jest.fn(),
        value: '',
        onChange: jest.fn(),
        onCompositionStart: jest.fn(),
        onCompositionUpdate: jest.fn(),
        onCompositionEnd: jest.fn(),
        config: {},
        emojiMap: new EmojiMap(new Map([['mattermost', 1447]])),
    };

    const wrapper = shallow(
        <QuillEditor
            {...baseProps}
            {...props}
        />,
    );

    wrapper.instance().editor = new Quill('test',
        {
            modules: {toolbar: false},
            theme: null,
        });

    return wrapper;
};

const insertTextAndCheck = (instance, existingTextInLeaf, text, previousContents = null, lengthOfPreviousContents = null, previousMarkdown = null) => {
    const localCaret = existingTextInLeaf.length + 1;
    const newText = existingTextInLeaf + text;
    const contents = previousContents ? {ops: [{insert: previousContents}, {insert: newText + '\n'}]} : {ops: [{insert: newText + '\n'}]};
    instance.editor.getContents.mockReturnValue(contents);
    const globalCaret = lengthOfPreviousContents ? lengthOfPreviousContents + localCaret : localCaret;
    instance.editor.getSelection.mockReturnValue({index: globalCaret});
    instance.editor.getLeaf.mockReturnValue([{text: newText + '\n'}, localCaret]);
    instance.handleChange({ops: [{insert: text}]}); // just finished inserting the text
    const newValue = previousMarkdown ? previousMarkdown + newText : newText;
    expect(instance.props.onChange).toBeCalledWith(newValue, newText + '\n', localCaret);
};

describe('components/QuillEditor', () => {
    test('should call constructor functions and match snapshot', () => {
        const wrapper = createQuillEditor();

        expect(wrapper).toMatchSnapshot();
    });

    test('should call mount and unmount lifecycle with calls to editor', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        wrapper.unmount();

        expect(instance.editor.off).toBeCalledTimes(1);
    });

    test('should update editor when parent passes new value', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        wrapper.setProps({value: 'new text'});

        expect(instance.editor.setContents).toBeCalledTimes(1);
        expect(instance.editor.setContents).toBeCalledWith([{insert: 'new text'}]);
    });

    test('should not update, whether with a new value in props or a state change', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // with new props
        let shouldUpdate = instance.shouldComponentUpdate({value: 'new text'}, {valueInMarkdown: ''});
        expect(shouldUpdate).toBe(false);
        expect(instance.editor.setContents).toBeCalledTimes(1);
        expect(instance.editor.setContents).toHaveBeenLastCalledWith([{insert: 'new text'}]);

        // with repeated props
        shouldUpdate = instance.shouldComponentUpdate({value: 'new text'}, {valueInMarkdown: ''});
        expect(shouldUpdate).toBe(false);
        expect(instance.editor.setContents).toBeCalledTimes(1);

        // with new state
        shouldUpdate = instance.shouldComponentUpdate({value: 'new text'}, {valueInMarkdown: 'random state'});
        expect(shouldUpdate).toBe(false);
        expect(instance.editor.setContents).toBeCalledTimes(1);

        // with old state
        shouldUpdate = instance.shouldComponentUpdate({value: 'new text'}, {valueInMarkdown: 'random state'});
        expect(shouldUpdate).toBe(false);
        expect(instance.editor.setContents).toBeCalledTimes(1);
    });

    test('should prevent a loop from create_comment -- create_comment updates with old props after a typing event', () => {
        const wrapper = createQuillEditor({id: 'reply_textbox', value: 'prev value'});
        wrapper.setState({valueInMarkdown: 'prev value'});
        const instance = wrapper.instance();

        // insert new text:
        instance.editor.getContents.mockReturnValue({ops: [{insert: 'new text\n'}]});
        instance.editor.getSelection.mockReturnValue({index: 8});
        instance.editor.getLeaf.mockReturnValue([{text: 'new text\n'}, 8]);
        instance.handleChange({ops: [{insert: 't'}]}); // just finished inserting the text

        expect(wrapper.state('prevValue')).toBe('prev value');
        expect(wrapper.state('valueInMarkdown')).toBe('new text');
        expect(instance.editor.setContents).toBeCalledTimes(0);

        // now, if this is create comment, it will update with old props after a typing event
        const shouldUpdate = instance.shouldComponentUpdate({value: 'prev value'}, {valueInMarkdown: 'new text'});
        expect(shouldUpdate).toBe(false);

        // nextProps.value is !== state.valueInMarkdown, but it should have returned false before calling setContents,
        // thereby preventing a loop:
        expect(instance.editor.setContents).toBeCalledTimes(0);
    });

    test('entering text is sent to the props.onChange', () => {
        const wrapper = createQuillEditor();
        wrapper.setState({valueInMarkdown: 'prev value'});
        const instance = wrapper.instance();
        expect(instance.editor.setContents).toBeCalledTimes(0);

        // insert new text:
        insertTextAndCheck(instance, 'new tex', 't');

        // state should be updated
        expect(wrapper.state('prevValue')).toBe('prev value');
        expect(wrapper.state('valueInMarkdown')).toBe('new text');

        // and parent components notified
        expect(instance.props.onChange).toBeCalledTimes(1);
        expect(instance.props.onChange).toBeCalledWith('new text', 'new text\n', 8);
    });

    test('after typing : should find and insert a valid emoji', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // insert new text on character at a time:
        insertTextAndCheck(instance, '', ':');
        insertTextAndCheck(instance, ':', 'a');
        insertTextAndCheck(instance, ':a', 'b');
        expect(instance.editor.updateContents).toBeCalledTimes(0);
        insertTextAndCheck(instance, ':ab', ':');

        expect(instance.editor.updateContents).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledWith({
            ops: [{
                insert: {
                    emoji: {
                        imageUrl: '/static/emoji/1f18e.png',
                        name: 'ab',
                    },
                },
            }, {insert: ' '}, {delete: 4}],
        });
    });

    test('after typing : should fail to find an invalid emoji', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // insert new text on character at a time:
        insertTextAndCheck(instance, '', ':');
        insertTextAndCheck(instance, ':', 'a');
        insertTextAndCheck(instance, ':a', 'f');
        expect(instance.editor.updateContents).toBeCalledTimes(0);
        insertTextAndCheck(instance, ':af', ':');

        expect(instance.editor.updateContents).toBeCalledTimes(0);
        expect(instance.editor.insertEmbed).toBeCalledTimes(0);
        expect(instance.editor.setSelection).toBeCalledTimes(0);
        expect(instance.editor.insertText).toBeCalledTimes(0);
    });

    test('after typing : should fail to find an emoji if there are only 2 characters total: eg, `::`', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // insert new text on character at a time:
        insertTextAndCheck(instance, '', ':');
        insertTextAndCheck(instance, ':', ':');

        expect(instance.editor.updateContents).toBeCalledTimes(0);
        expect(instance.editor.insertEmbed).toBeCalledTimes(0);
        expect(instance.editor.setSelection).toBeCalledTimes(0);
        expect(instance.editor.insertText).toBeCalledTimes(0);
    });

    test('after typing : should insert an emoji immediately after a previous emoji', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // insert new text on character at a time:
        insertTextAndCheck(instance, '', ':', {emoji: {name: 'smile'}}, 1, ':smile: ');
        insertTextAndCheck(instance, ':', 'a', {emoji: {name: 'smile'}}, 1, ':smile: ');
        insertTextAndCheck(instance, ':a', 'b', {emoji: {name: 'smile'}}, 1, ':smile: ');
        expect(instance.editor.updateContents).toBeCalledTimes(0);
        insertTextAndCheck(instance, ':ab', ':', {emoji: {name: 'smile'}}, 1, ':smile: ');

        expect(instance.editor.updateContents).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledWith({
            ops: [{retain: 1}, {
                insert: {
                    emoji: {
                        imageUrl: '/static/emoji/1f18e.png',
                        name: 'ab',
                    },
                },
            }, {insert: ' '}, {delete: 4}],
        });
    });

    test('after typing : should insert an emoji immediately before an existing emoji', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        instance.editor.getContents.mockReturnValue({ops: [{insert: ':ab:'}, {insert: {emoji: {name: 'smile'}}}, {insert: '\n'}]});
        instance.editor.getSelection.mockReturnValue({index: 4});
        instance.editor.getLeaf.mockReturnValue([{text: ':ab:'}, 4]);

        expect(instance.editor.updateContents).toBeCalledTimes(0);
        instance.handleChange({ops: [{insert: ':'}]}); // just finished inserting the text
        expect(instance.props.onChange).toBeCalledWith(':ab: :smile:', ':ab:', 4);

        expect(instance.editor.updateContents).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledWith({
            ops: [{
                insert: {
                    emoji: {
                        imageUrl: '/static/emoji/1f18e.png',
                        name: 'ab',
                    },
                },
            }, {insert: ' '}, {delete: 4}],
        });
    });

    test('after typing space should find and insert a valid literal emoji', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // insert new text on character at a time:
        insertTextAndCheck(instance, '', ':');
        insertTextAndCheck(instance, ':', ')');
        expect(instance.editor.updateContents).toBeCalledTimes(0);
        insertTextAndCheck(instance, ':)', ' ');

        expect(instance.editor.updateContents).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledWith({
            ops: [{
                insert: {
                    emoji: {
                        imageUrl: '/static/emoji/1f642.png',
                        name: 'slightly_smiling_face',
                    },
                },
            }, {insert: ' '}, {delete: 3}],
        });
    });

    test('after typing space should fail to find an invalid literal emoji', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // insert new text on character at a time:
        insertTextAndCheck(instance, '', ':');
        insertTextAndCheck(instance, ':', '%');
        expect(instance.editor.updateContents).toBeCalledTimes(0);
        insertTextAndCheck(instance, ':%', ' ');

        expect(instance.editor.updateContents).toBeCalledTimes(0);
        expect(instance.editor.insertEmbed).toBeCalledTimes(0);
        expect(instance.editor.setSelection).toBeCalledTimes(0);
        expect(instance.editor.insertText).toBeCalledTimes(0);
    });

    test('should insert a /slash command (or @mention, etc.) with trailing space after clicking', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();
        instance.editor.getSelection.mockReturnValue({index: 3});
        instance.editor.getContents.mockReturnValue({ops: [{insert: '/away \n'}]});

        const newValue = instance.addTextAtCaret('/away', '/aw', false);

        expect(instance.editor.updateContents).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledWith({ops: [{delete: 3}]});
        expect(instance.editor.insertText).toBeCalledTimes(2);
        expect(instance.editor.insertText).toHaveBeenNthCalledWith(1, 0, '/away');
        expect(instance.editor.insertText).toHaveBeenLastCalledWith(5, ' ');
        expect(instance.editor.setSelection).toBeCalledTimes(1);
        expect(instance.editor.setSelection).toBeCalledWith(5);
        expect(newValue).toBe('/away ');
    });

    test('should insert a /slash command (or @mention, etc.) with trailing space after completing with tab/enter; tab/enter should not be inserted', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();
        instance.editor.getSelection.mockReturnValue({index: 4});

        // contents are received /after/ the tab/enter has been removed and the pretext replaced by the full text
        instance.editor.getContents.mockReturnValue({ops: [{insert: '/away \n'}]});

        const newValue = instance.addTextAtCaret('/away', '/aw', true);

        expect(instance.editor.updateContents).toBeCalledTimes(2);
        expect(instance.editor.updateContents).toHaveBeenNthCalledWith(1, {ops: [{retain: 3}, {delete: 1}]});
        expect(instance.editor.updateContents).toHaveBeenLastCalledWith({ops: [{delete: 3}]});
        expect(instance.editor.insertText).toBeCalledTimes(2);
        expect(instance.editor.insertText).toHaveBeenNthCalledWith(1, 0, '/away');
        expect(instance.editor.insertText).toHaveBeenLastCalledWith(5, ' ');
        expect(instance.editor.setSelection).toBeCalledTimes(1);
        expect(instance.editor.setSelection).toBeCalledWith(5);
        expect(newValue).toBe('/away ');
    });

    test('should insert an emoji + space from suggestion box after pressing tab/enter; tab/enter should not be inserted', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // after typing :sm and then pressing tab
        instance.editor.getSelection.mockReturnValueOnce({index: 4}).mockReturnValueOnce({index: 3});

        // contents are received /after/ the tab/enter has been removed and the pretext replaced by the full text
        instance.editor.getContents.mockReturnValue({ops: [{insert: ':smile: \n'}]});

        const newValue = instance.addEmojiAtCaret(':smile:', ':sm', true);

        expect(instance.editor.focus).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledTimes(2);
        expect(instance.editor.updateContents).toHaveBeenNthCalledWith(1, {ops: [{retain: 3}, {delete: 1}]});
        expect(instance.editor.updateContents).toHaveBeenLastCalledWith({
            ops: [{
                insert: {
                    emoji: {
                        imageUrl: '/static/emoji/1f604.png',
                        name: 'smile',
                    },
                },
            }, {insert: ' '}, {delete: 3}],
        });
        expect(newValue).toBe(':smile: ');
    });

    test('after an existing tab: should insert an emoji + space from suggestion box after pressing tab; tab should not be inserted, prev tab should not be deleted', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // after typing \t:sm and then pressing tab
        instance.editor.getSelection.mockReturnValueOnce({index: 5}).mockReturnValueOnce({index: 4});

        // contents are received /after/ the tab/enter has been removed and the pretext replaced by the full text
        instance.editor.getContents.mockReturnValue({ops: [{insert: '\t:smile: \n'}]});

        const newValue = instance.addEmojiAtCaret(':smile:', ':sm', true);

        expect(instance.editor.focus).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledTimes(2);
        expect(instance.editor.updateContents).toHaveBeenNthCalledWith(1, {ops: [{retain: 4}, {delete: 1}]});
        expect(instance.editor.updateContents).toHaveBeenLastCalledWith({
            ops: [{retain: 1},
                {
                    insert: {
                        emoji: {
                            imageUrl: '/static/emoji/1f604.png',
                            name: 'smile',
                        },
                    },
                }, {insert: ' '}, {delete: 3}],
        });
        expect(newValue).toBe('\t:smile: ');
    });

    test('after an existing newline: should insert an emoji + space from suggestion box after pressing enter; enter should not be inserted, prev newline should not be deleted', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // after typing \n:sm and then pressing tab
        instance.editor.getSelection.mockReturnValueOnce({index: 5}).mockReturnValueOnce({index: 4});

        // contents are received /after/ the enter has been removed and the pretext replaced by the full text
        instance.editor.getContents.mockReturnValue({ops: [{insert: '\n:smile: \n'}]});

        const newValue = instance.addEmojiAtCaret(':smile:', ':sm', true);

        expect(instance.editor.focus).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledTimes(2);
        expect(instance.editor.updateContents).toHaveBeenNthCalledWith(1, {ops: [{retain: 4}, {delete: 1}]});
        expect(instance.editor.updateContents).toHaveBeenLastCalledWith({
            ops: [{retain: 1},
                {
                    insert: {
                        emoji: {
                            imageUrl: '/static/emoji/1f604.png',
                            name: 'smile',
                        },
                    },

                }, {insert: ' '}, {delete: 3}],
        });
        expect(newValue).toBe('\n:smile: ');
    });

    test('should insert an emoji + space from suggestion box after clicking', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        // after typing :sm and then clicking
        instance.editor.getSelection.mockReturnValueOnce({index: 3}).mockReturnValueOnce({index: 3}).mockReturnValueOnce({index: 1});

        // contents are received /after/ the enter has been removed and the pretext replaced by the full text
        instance.editor.getContents.mockReturnValue({ops: [{insert: ':smile: \n'}]});

        const newValue = instance.addEmojiAtCaret(':smile:', ':sm', false);

        expect(instance.editor.focus).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledTimes(1);
        expect(instance.editor.updateContents).toBeCalledWith({
            ops: [{
                insert: {
                    emoji: {
                        imageUrl: '/static/emoji/1f604.png',
                        name: 'smile',
                    },
                },
            }, {insert: ' '}, {delete: 3}],
        });
        expect(newValue).toBe(':smile: ');
    });

    test('should replace all text when replaceText is called', () => {
        const wrapper = createQuillEditor();
        const instance = wrapper.instance();

        expect(instance.editor.focus).toBeCalledTimes(0);
        insertTextAndCheck(instance, 'old tex', 't');

        const newText = 'completely new text';
        instance.replaceText(newText);

        expect(instance.editor.focus).toBeCalledTimes(1);
        expect(instance.editor.setContents).toBeCalledTimes(1);
        expect(instance.editor.setContents).toHaveBeenLastCalledWith([{insert: newText}]);
        expect(wrapper.state('valueInMarkdown')).toBe(newText);
        expect(wrapper.state('prevValue')).toBe('old text');
    });
});
