// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import classNames from 'classnames';

import {Emoji, SystemEmoji} from 'mattermost-redux/types/emojis';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {
    splitMessageBasedOnCaretPosition,
    postMessageOnKeyPress,
} from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import {
    getTable,
    formatMarkdownTableMessage,
    isGitHubCodeBlock,
    formatGithubCodePaste,
} from 'utils/paste';

import DeletePostModal from 'components/delete_post_modal';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Textbox from 'components/textbox';
import TextboxClass from 'components/textbox/textbox';
import TextboxLinks from 'components/textbox/textbox_links';

import type {PropsFromRedux, OwnProps} from './index';

const KeyCodes = Constants.KeyCodes;
const TOP_OFFSET = 0;
const RIGHT_OFFSET = 10;

export type Props = PropsFromRedux & OwnProps & WrappedComponentProps;

export type State = {
    show: boolean;
    editText: string;
    caretPosition: number;
    postError: React.ReactNode;
    errorClass: string | null;
    showEmojiPicker: boolean;
    renderScrollbar: boolean;
    scrollbarWidth: number;
    shouldShowPreview: boolean;
};

export class EditPostModal extends React.PureComponent<Props, State> {
    private editModalBodyRef: React.RefObject<Modal>;
    private editPostEmojiRef: React.RefObject<HTMLButtonElement>;
    private editbox: TextboxClass | null;

    constructor(props: Props) {
        super(props);

        let editText = '';
        if (props.post) {
            if (props.post.message_source) {
                editText = props.post.message_source;
            }
            if (props.post.message) {
                editText = props.post.message;
            }
        }

        this.state = {
            show: true,
            editText,
            caretPosition: 0,
            postError: null,
            errorClass: null,
            showEmojiPicker: false,
            renderScrollbar: false,
            scrollbarWidth: 0,
            shouldShowPreview: false,
        };

        this.editModalBodyRef = React.createRef();
        this.editPostEmojiRef = React.createRef();
        this.editbox = null;
    }

    componentDidMount() {
        document.addEventListener('paste', this.handlePaste);
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.handlePaste);
    }

    setShowPreview = (newPreviewValue: boolean) => {
        this.setState({shouldShowPreview: newPreviewValue});
    };

    getContainer = () => {
        return this.editModalBodyRef.current;
    };

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
        if (!this.state.showEmojiPicker && this.editbox) {
            this.editbox.focus();
        }
    };

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
        if (this.editbox) {
            this.editbox.focus();
        }
    };

    handleEmojiClick = (emoji?: Emoji) => {
        const emojiAlias =
      emoji &&
        (((emoji as SystemEmoji).short_names && (emoji as SystemEmoji).short_names[0]) || emoji.name);

        if (!emojiAlias) {
            //Oops.. There went something wrong
            return;
        }

        if (this.state.editText === '') {
            const newMessage = ':' + emojiAlias + ': ';
            const textbox = this.editbox && this.editbox.getInputBox();

            this.setState(
                {
                    editText: newMessage,
                    caretPosition: newMessage.length,
                },
                () => {
                    Utils.setCaretPosition(textbox, newMessage.length);
                },
            );
        } else {
            const {editText} = this.state;
            const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(
                this.state.caretPosition,
                editText,
            );

            // check whether the first piece of the message is empty when cursor
            // is placed at beginning of message and avoid adding an empty string at the beginning of the message
            const newMessage = firstPiece === '' ? `:${emojiAlias}: ${lastPiece}` : `${firstPiece} :${emojiAlias}: ${lastPiece}`;
            const newCaretPosition = firstPiece === '' ? `:${emojiAlias}: `.length : `${firstPiece} :${emojiAlias}: `.length;

            const textbox = this.editbox && this.editbox.getInputBox();

            this.setState(
                {
                    editText: newMessage,
                    caretPosition: newCaretPosition,
                },
                () => {
                    Utils.setCaretPosition(textbox, newCaretPosition);
                },
            );
        }

        this.setState({showEmojiPicker: false});

        this.editbox?.focus();
    };

    handleGifClick = (gif: string) => {
        if (this.state.editText === '') {
            this.setState({editText: gif});
        } else {
            const newMessage = (/\s+$/).test(this.state.editText) ? this.state.editText + gif : this.state.editText + ' ' + gif;
            this.setState({editText: newMessage});
        }
        this.setState({showEmojiPicker: false});
        this.editbox?.focus();
    };

    getEmojiPickerTarget = () => {
        return this.editPostEmojiRef.current;
    };

    handlePostError = (postError: React.ReactNode) => {
        if (this.state.postError !== postError) {
            this.setState({postError});
        }
    };

    handleEdit = async (): Promise<void> => {
        const {actions, post} = this.props;
        if (this.isSaveDisabled() || !post) {
            return;
        }

        let updatedPost = {
            ...post,
            message: this.state.editText,
        };

        const hookResult = await actions.runMessageWillBeUpdatedHooks(updatedPost, post);
        if (hookResult.error) {
            this.setState({
                postError: hookResult.error,
            });
        }

        updatedPost = hookResult.data;

        if (this.state.postError) {
            this.setState({errorClass: 'animation--highlight'});
            setTimeout(() => {
                this.setState({errorClass: null});
            }, Constants.ANIMATION_TIMEOUT);
            return;
        }

        if (updatedPost.message === (post?.message_source || post.message)) {
            // no changes so just close the modal
            this.handleHide();
            return;
        }

        const hasAttachment = Boolean(post?.file_ids && post?.file_ids.length > 0);
        if (updatedPost.message.trim().length === 0 && !hasAttachment) {
            this.handleHide();

            actions.openModal({
                modalId: ModalIdentifiers.DELETE_POST,
                dialogType: DeletePostModal,
                dialogProps: {
                    post,
                    isRHS: this.props.isRHS,
                },
            });
            return;
        }

        actions.addMessageIntoHistory(updatedPost.message);

        const data = await actions.editPost(updatedPost);
        if (data) {
            window.scrollTo(0, 0);
        }

        this.handleHide();
    };

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const message = e.target.value;
        this.setState({
            editText: message,
        });
    };

    handlePaste = (e: ClipboardEvent) => {
        if (
            !e.clipboardData ||
            !e.clipboardData.items ||
            !this.props.canEditPost ||
            (e.target as HTMLTextAreaElement).id !== 'edit_textbox'
        ) {
            return;
        }
        const {clipboardData} = e;
        const table = getTable(clipboardData);
        if (!table) {
            return;
        }

        e.preventDefault();

        const {editText} = this.state;
        let message = editText;
        let newCaretPosition = this.state.caretPosition;

        if (table && isGitHubCodeBlock(table.className)) {
            const {formattedMessage, formattedCodeBlock} = formatGithubCodePaste(
                this.state.caretPosition,
                message,
                clipboardData,
            );
            newCaretPosition = this.state.caretPosition + formattedCodeBlock.length;
            message = formattedMessage;
        } else if (table) {
            message = formatMarkdownTableMessage(
                table,
                editText.trim(),
                newCaretPosition,
            );
            newCaretPosition = message.length - (editText.length - newCaretPosition);
        }

        this.setState(
            {
                editText: message,
                caretPosition: newCaretPosition,
            },
            () => {
                if (this.editbox) {
                    Utils.setCaretPosition(this.editbox.getInputBox(), newCaretPosition);
                }
            },
        );
    };

    handleEditKeyPress = (e: React.KeyboardEvent) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const {allowSending, ignoreKeyPress} = postMessageOnKeyPress(e, this.state.editText, ctrlSend, codeBlockOnCtrlEnter, Date.now(), 0, this.state.caretPosition) as {allowSending: boolean; ignoreKeyPress?: boolean};

        if (ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending && this.editbox) {
            e.preventDefault();
            this.editbox.blur();
            this.handleEdit();
        }
    };

    handleMouseUpKeyUp = (e: React.MouseEvent<Element> | React.KeyboardEvent<Element>) => {
        const caretPosition = Utils.getCaretPosition(e.target as HTMLElement);
        this.setState({
            caretPosition,
        });
    };

    handleSelect = (e: React.SyntheticEvent) => {
        if (this.editbox) {
            Utils.adjustSelection(this.editbox.getInputBox(), e);
        }
    };

    handleKeyDown = (e: React.KeyboardEvent) => {
        const {ctrlSend, codeBlockOnCtrlEnter} = this.props;

        const ctrlOrMetaKeyPressed =
            e.ctrlKey ||
            e.metaKey;
        const ctrlKeyCombo =
            Utils.cmdOrCtrlPressed(e) &&
            !e.altKey &&
            !e.shiftKey;
        const ctrlAltCombo =
            Utils.cmdOrCtrlPressed(e, true) &&
            e.altKey;
        const ctrlEnterKeyCombo =
            (ctrlSend || codeBlockOnCtrlEnter) &&
            Utils.isKeyPressed(e, KeyCodes.ENTER) &&
            ctrlOrMetaKeyPressed;
        const markdownHotkey =
            Utils.isKeyPressed(e, KeyCodes.B) ||
            Utils.isKeyPressed(e, KeyCodes.I);
        const markdownLinkKey =
            Utils.isKeyPressed(e, KeyCodes.K);

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            e.stopPropagation(); // perhaps this should happen in all of these cases? or perhaps Modal should not be listening?
            this.setState({editText: Utils.insertLineBreakFromKeyEvent(e)});
        } else if (ctrlEnterKeyCombo) {
            this.handleEdit();
        } else if (
            Utils.isKeyPressed(e, KeyCodes.ESCAPE) &&
            !this.state.showEmojiPicker
        ) {
            this.handleHide();
        } else if (
            (ctrlKeyCombo && markdownHotkey) ||
            (ctrlAltCombo && markdownLinkKey)
        ) {
            this.applyHotkeyMarkdown(e);
        }
    };

    applyHotkeyMarkdown = (e: React.KeyboardEvent) => {
        const res = Utils.applyHotkeyMarkdown(e);

        this.setState(
            {
                editText: res.message,
            },
            () => {
                if (this.editbox) {
                    const textbox = this.editbox.getInputBox();
                    Utils.setSelectionRange(
                        textbox,
                        res.selectionStart,
                        res.selectionEnd,
                    );
                }
            },
        );
    };

    handleHide = () => {
        this.setState({
            show: false,
        });
    };

    handleCheckForChangesHide = () => {
        if (this.state.editText !== this.props.post?.message) {
            return;
        }

        this.handleHide();
    };

    handleEntered = () => {
        if (this.editbox) {
            this.editbox.focus();
            this.editbox.recalculateSize();
        }
    };

    handleHeightChange = (height: number, maxHeight: number) => {
        if (this.editbox) {
            this.setState({
                renderScrollbar: height > maxHeight,
                scrollbarWidth: Utils.scrollbarWidth(this.editbox.getInputBox()),
            });
        }
    };

    handleExited = () => {
        if (this.props.refocusId) {
            setTimeout(() => {
                document.getElementById(this.props.refocusId)?.focus();
            });
        }

        this.props.onExited();
    };

    setEditboxRef = (ref: TextboxClass) => {
        this.editbox = ref;

        if (this.editbox) {
            this.editbox.focus();
        }
    };

    isSaveDisabled = () => {
        const post = this.props.post;
        const hasAttachments = post && post.file_ids && post.file_ids.length > 0;
        if (hasAttachments) {
            return !this.props.canEditPost;
        }

        if (this.state.editText.trim() !== '') {
            return !this.props.canEditPost;
        }

        return !this.props.canDeletePost;
    };

    render() {
        const {formatMessage} = this.props.intl;
        const errorBoxClass = 'edit-post-footer' + (this.state.postError ? ' has-error' : '');
        let postError = null;
        if (this.state.postError) {
            const postErrorClass = 'post-error' + (this.state.errorClass ? ' ' + this.state.errorClass : '');
            postError = (
                <label className={postErrorClass}>{this.state.postError}</label>
            );
        }

        let emojiPicker = null;
        const emojiButtonAriaLabel = formatMessage({
            id: 'emoji_picker.emojiPicker',
            defaultMessage: 'Emoji Picker',
        }).toLowerCase();
        if (
            this.props.config.EnableEmojiPicker === 'true' &&
            !this.state.shouldShowPreview
        ) {
            emojiPicker = (
                <div>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        container={this.getContainer}
                        target={this.getEmojiPickerTarget}
                        onHide={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        onGifClick={this.handleGifClick}
                        enableGifPicker={this.props.config.EnableGifPicker === 'true'}
                        topOffset={TOP_OFFSET}
                        rightOffset={RIGHT_OFFSET}
                    />
                    <button
                        aria-label={emojiButtonAriaLabel}
                        id='editPostEmoji'
                        ref={this.editPostEmojiRef}
                        className='style--none post-action'
                        onClick={this.toggleEmojiPicker}
                    >
                        <EmojiIcon className='icon icon--emoji'/>
                    </button>
                </div>
            );
        }

        return (
            <Modal
                id='editPostModal'
                dialogClassName='a11y__modal edit-modal'
                show={this.state.show}
                onHide={this.handleCheckForChangesHide}
                onEntered={this.handleEntered}
                onExited={this.handleExited}
                keyboard={false}
                role='dialog'
                aria-labelledby='editPostModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                    onHide={this.handleHide}
                >
                    <Modal.Title
                        componentClass='h1'
                        id='editPostModalLabel'
                    >
                        <FormattedMessage
                            id='edit_post.edit'
                            defaultMessage='Edit {title}'
                            values={{
                                title: this.props.title,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    bsClass={classNames('modal-body edit-modal-body', {
                        'edit-modal-body--add-reaction': this.state.showEmojiPicker,
                    })}
                    ref={this.editModalBodyRef}
                >
                    <div className='post-create__container'>
                        <div
                            className={classNames('textarea-wrapper', {
                                scroll: this.state.renderScrollbar,
                            })}
                            style={
                                this.state.renderScrollbar && this.state.scrollbarWidth ? ({
                                    '--detected-scrollbar-width': `${this.state.scrollbarWidth}px`,
                                } as React.CSSProperties) : undefined
                            }
                        >
                            <Textbox
                                tabIndex={0}
                                rootId={this.props.post ? Utils.getRootId(this.props.post) : ''}
                                onChange={this.handleChange}
                                onKeyPress={this.handleEditKeyPress}
                                onKeyDown={this.handleKeyDown}
                                onSelect={this.handleSelect}
                                onMouseUp={this.handleMouseUpKeyUp}
                                onKeyUp={this.handleMouseUpKeyUp}
                                onHeightChange={this.handleHeightChange}
                                handlePostError={this.handlePostError}
                                value={this.state.editText}
                                channelId={this.props.channelId}
                                emojiEnabled={this.props.config.EnableEmojiPicker === 'true'}
                                createMessage={Utils.localizeMessage(
                                    'edit_post.editPost',
                                    'Edit the post...',
                                )}
                                supportsCommands={false}
                                suggestionListPosition='bottom'
                                id='edit_textbox'
                                ref={this.setEditboxRef}
                                characterLimit={this.props.maxPostSize}
                                preview={this.state.shouldShowPreview}
                                useChannelMentions={this.props.useChannelMentions}
                            />
                            <div className='post-body__actions'>{emojiPicker}</div>
                        </div>
                        <div className='post-create-footer'>
                            <TextboxLinks
                                characterLimit={this.props.maxPostSize}
                                showPreview={this.state.shouldShowPreview}
                                updatePreview={this.setShowPreview}
                                message={this.state.editText}
                            />
                            <div className={errorBoxClass}>{postError}</div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.handleHide}
                    >
                        <FormattedMessage
                            id='edit_post.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        id='editButton'
                        type='button'
                        className='btn btn-primary'
                        disabled={this.isSaveDisabled()}
                        onClick={this.handleEdit}
                    >
                        <FormattedMessage
                            id='edit_post.save'
                            defaultMessage='Save'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default injectIntl(EditPostModal);
