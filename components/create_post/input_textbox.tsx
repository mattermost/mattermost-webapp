import EmojiPickerOverlay from "components/emoji_picker/emoji_picker_overlay";
import classNames from "classnames";
import EmojiIcon from "components/widgets/icons/emoji_icon";
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Emoji } from "mattermost-redux/types/emojis";
import { postMessageOnKeyPress, splitMessageBasedOnCaretPosition } from "utils/post_utils";
import { useDispatch, useSelector } from "react-redux";
import { GlobalState } from "types/store";
import { getConfig } from "mattermost-redux/selectors/entities/general";
import { useIntl } from "react-intl";
import Textbox, { TextboxClass } from "components/textbox";
import { getBool } from "mattermost-redux/selectors/entities/preferences";
import {Permissions, Posts, Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {Constants, Locations, Preferences, StoragePrefixes, UserStatuses} from 'utils/constants';
import { setShowPreviewOnCreateComment, setShowPreviewOnCreatePost } from "actions/views/textbox";
import * as GlobalActions from 'actions/global_actions';
import * as Utils from 'utils/utils.jsx';
import { emitShortcutReactToLastPostFrom, setEditingPost } from "actions/post_actions";
import { getCurrentUsersLatestPost, getLatestReplyablePostId, getPostsInCurrentChannel, makeGetPostsForThread } from "mattermost-redux/selectors/entities/posts";
import { Post, PostWithFormatData } from "mattermost-redux/types/posts";
import { getCurrentUser } from "mattermost-redux/selectors/entities/common";
import { isPostPendingOrFailed, isSystemMessage } from "mattermost-redux/utils/post_utils";
import { selectPostFromRightHandSideSearchByPostId } from "actions/views/rhs";
import { moveHistoryIndexBack, moveHistoryIndexForward } from "mattermost-redux/actions/posts";
import { haveIChannelPermission } from "mattermost-redux/selectors/entities/roles";
import { Channel } from "mattermost-redux/types/channels";
import { getChannel } from "mattermost-redux/selectors/entities/channels";
import { showPreviewOnCreateComment, showPreviewOnCreatePost } from "selectors/views/textbox";
import RhsSuggestionList from "components/suggestion/rhs_suggestion_list";
import { connectionErrorCount } from "selectors/views/system";

const KeyCodes = Constants.KeyCodes;
const getPostsForThread = makeGetPostsForThread();

type Props = {
    submit: (message: string) => void;
    draftMessage: string,
    channelId: string,
    rootId: string,
    onHeightChanged: (height: number, maxHeight: number) => void;
    onPostError: (postError: React.ReactNode) => void;
    onBlur: () => void;
};

export type InputTextboxRef = {
    blur: () => void;
    focus: () => void;
    getInputBox: () => any;
    getValue: () => string;
    getCaretPosition: () => number;
    setValue: (v: string) => void;
    setCaretPosition: (p: number) => void;
}

const InputTextbox = React.forwardRef<InputTextboxRef, Props>(({
    submit,
    draftMessage,
    channelId,
    rootId,
    onHeightChanged,
    onPostError,
    onBlur,
}, ref) => {
    const intl = useIntl();
    
    const codeBlockOnCtrlEnter = useSelector<GlobalState, boolean>((state) => getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true));
    const ctrlSend = useSelector<GlobalState, boolean>((state) => getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'))
    const latestReplyablePostId = useSelector<GlobalState, string>((state) => getLatestReplyablePostId(state));
    const currentUsersLatestPost = useSelector<GlobalState, Post | undefined>((state) => {
        const posts = rootId ? getPostsForThread(state, rootId) : getPostsInCurrentChannel(state);
        const currentUser = getCurrentUser(state);
        return posts?.find((post) => {
            // don't edit webhook posts, deleted posts, or system messages
            if (post.user_id !== currentUser.id || (post.props && post.props.from_webhook) || post.state === Posts.POST_DELETED || isSystemMessage(post) || Utils.isPostEphemeral(post) || isPostPendingOrFailed(post)) {
                return false;
            }

            if (rootId) {
                return post.root_id === rootId || post.id === rootId;
            }

            return true;
        })
    });
    const messageInHistoryItem = useSelector<GlobalState, string>((state) => {
        const history = state.entities.posts.messagesHistory;
        const index = rootId ? history.index.comment : history.index.post;
        const messages = history.messages;
        if (index >= 0 && messages && messages.length > index) {
            return messages[index];
        }
        return '';
    })
    const readOnlyChannel = useSelector<GlobalState, boolean>((state) => {
        const channel = getChannel(state, channelId)
        return !haveIChannelPermission(state, channel.team_id, channel.id, Permissions.CREATE_POST)
    })
    const enableEmojiPicker = useSelector<GlobalState, boolean>((state) => getConfig(state).EnableEmojiPicker === 'true')
    const channelDisplayName = useSelector<GlobalState, string>((state) => getChannel(state, channelId).display_name)
    const maxPostSize = useSelector<GlobalState, number>((state) => {
        const config = getConfig(state);
        return parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT;
    })
    const shouldShowPreview = useSelector<GlobalState, boolean>((state) => rootId? showPreviewOnCreateComment(state) : showPreviewOnCreatePost(state))
    const badConnection = useSelector<GlobalState, boolean>((state) => connectionErrorCount(state) > 1)
    const useChannelMentions = useSelector<GlobalState, boolean>((state) => {
        const channel = getChannel(state, channelId)
        return haveIChannelPermission(state, channel.team_id, channel.id, Permissions.USE_CHANNEL_MENTIONS);
    })

    const dispatch = useDispatch()

    const textboxRef = useRef<TextboxClass>(null)
    const lastChannelSwitchAt = useRef(0);
    const [value, setValue] = useState(draftMessage);
    const [caretPosition, setCaretPosition] = useState(draftMessage.length);
    const mounted = useRef(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const message = e.target.value;
        setValue(message)
    }, [])

    useEffect(() => {
        lastChannelSwitchAt.current = Date.now();
    }, [channelId])

    const emitTypingEvent = useCallback(() => {
        GlobalActions.emitLocalUserTypingEvent(channelId, rootId);
    }, [channelId]);
    
    const postMsgKeyPress = useCallback((e: React.KeyboardEvent<Element>) => {
        const {
            allowSending,
            withClosedCodeBlock,
            ignoreKeyPress,
            message,
        } = postMessageOnKeyPress(
            e,
            value,
            Boolean(ctrlSend),
            Boolean(codeBlockOnCtrlEnter),
            Date.now(),
            lastChannelSwitchAt.current,
            caretPosition,
        ) as {
            allowSending: boolean;
            withClosedCodeBlock?: boolean;
            ignoreKeyPress?: boolean;
            message?: string;
        };

        if (!rootId && ignoreKeyPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (allowSending) {
            if (e.persist) {
                e.persist();
            }
            if (textboxRef.current) {
                textboxRef.current.blur();
            }

            e.preventDefault();
            if (withClosedCodeBlock && message) {
                submit(message)
            } else {
                submit(value);
            }

            dispatch(rootId ? setShowPreviewOnCreateComment(false) : setShowPreviewOnCreatePost(false));
        }

        emitTypingEvent();
    }, [value, ctrlSend, codeBlockOnCtrlEnter, caretPosition, Boolean(rootId), dispatch])

    const editLastPost = useCallback((e: React.KeyboardEvent) => {
        console.log('foo')
        e.preventDefault();

        const lastPost = currentUsersLatestPost;
        if (!lastPost) {
            return;
        }

        let type;
        if (lastPost.root_id && lastPost.root_id.length > 0) {
            type = Utils.localizeMessage('create_post.comment', Posts.MESSAGE_TYPES.COMMENT);
        } else {
            type = Utils.localizeMessage('create_post.post', Posts.MESSAGE_TYPES.POST);
        }
        if (textboxRef.current) {
            textboxRef.current.blur();
        }
        dispatch(setEditingPost(lastPost.id, rootId ? 'reply_textbox' : 'post_textbox', type, Boolean(rootId)));
    }, [currentUsersLatestPost]);

    const replyToLastPost = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        const replyBox = document.getElementById('reply_textbox');
        if (replyBox) {
            replyBox.focus();
        }
        if (latestReplyablePostId) {
            dispatch(selectPostFromRightHandSideSearchByPostId(latestReplyablePostId));
        }
    }, [latestReplyablePostId])

    const loadPrevMessage = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        dispatch(moveHistoryIndexBack(rootId ? Posts.MESSAGE_TYPES.COMMENT : Posts.MESSAGE_TYPES.POST))
    },[Boolean(rootId), dispatch]);

    const loadNextMessage = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        dispatch(moveHistoryIndexForward(rootId ? Posts.MESSAGE_TYPES.COMMENT : Posts.MESSAGE_TYPES.POST))
    },[Boolean(rootId), dispatch]);

    const applyHotkeyMarkdown = useCallback((e: React.KeyboardEvent) => {
        const res = Utils.applyHotkeyMarkdown(e);

        setValue(res.message);
        const textbox = textboxRef.current?.getInputBox();
        Utils.setSelectionRange(textbox, res.selectionStart, res.selectionEnd);
    }, []);

    const reactToLastMessage = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        // Here we are not handling conditions such as check for modals,  popups etc as shortcut is only trigger on
        // textbox input focus. Since all of them will already be closed as soon as they loose focus.
        dispatch(emitShortcutReactToLastPostFrom(rootId? Locations.RHS_ROOT : Locations.CENTER));
    }, [Boolean(rootId)])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const ctrlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
        const messageIsEmpty = value.length === 0;
        const ctrlEnterKeyCombo = (ctrlSend || codeBlockOnCtrlEnter) && Utils.isKeyPressed(e, KeyCodes.ENTER) && ctrlOrMetaKeyPressed;
        const upKeyOnly = !ctrlOrMetaKeyPressed && !e.altKey && !e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const shiftUpKeyCombo = !ctrlOrMetaKeyPressed && !e.altKey && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.UP);
        const ctrlKeyCombo = Utils.cmdOrCtrlPressed(e) && !e.altKey && !e.shiftKey;
        const markdownHotkey = Utils.isKeyPressed(e, KeyCodes.B) || Utils.isKeyPressed(e, KeyCodes.I);
        const ctrlAltCombo = Utils.cmdOrCtrlPressed(e, true) && e.altKey;
        const markdownLinkKey = Utils.isKeyPressed(e, KeyCodes.K);
        const lastMessageReactionKeyCombo = ctrlOrMetaKeyPressed && e.shiftKey && Utils.isKeyPressed(e, KeyCodes.BACK_SLASH);

        // listen for line break key combo and insert new line character
        if (Utils.isUnhandledLineBreakKeyCombo(e)) {
            setValue(Utils.insertLineBreakFromKeyEvent(e))
        } else if (ctrlEnterKeyCombo) {
            postMsgKeyPress(e);
        } else if (upKeyOnly && messageIsEmpty) {
            editLastPost(e);
        } else if (!rootId && shiftUpKeyCombo && messageIsEmpty) {
            replyToLastPost(e);
        } else if (ctrlKeyCombo && messageIsEmpty && Utils.isKeyPressed(e, KeyCodes.UP)) {
            loadPrevMessage(e);
        } else if (ctrlKeyCombo && messageIsEmpty && Utils.isKeyPressed(e, KeyCodes.DOWN)) {
            loadNextMessage(e);
        } else if ((ctrlKeyCombo && markdownHotkey) || (ctrlAltCombo && markdownLinkKey)) {
            applyHotkeyMarkdown(e);
        } else if (rootId && Utils.isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
            textboxRef.current?.blur();
        } else if (lastMessageReactionKeyCombo) {
            reactToLastMessage(e)
        }
    }, []);

    const handleSelect = useCallback((e: React.SyntheticEvent) => {
        Utils.adjustSelection(textboxRef.current?.getInputBox(), e);
    }, []);

    const handleMouseUpKeyUp = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
        const newCaretPosition = Utils.getCaretPosition(e.target as HTMLElement);
        setCaretPosition(newCaretPosition);
    }, []);

    useImperativeHandle(ref, () => ({
        blur: () => textboxRef.current?.blur(),
        focus: () => textboxRef.current?.focus(),
        getInputBox: () => textboxRef.current?.getInputBox(),
        getValue: () => value,
        getCaretPosition: () => caretPosition,
        setValue,
        setCaretPosition: (p: number) => {
            Utils.setCaretPosition(textboxRef.current?.getInputBox(), p);
            setCaretPosition(p)
        },
    }))

    useEffect(() => {
        // Did update
        if (mounted.current) {
            setValue(messageInHistoryItem);
        }
        mounted.current = true;
    }, [messageInHistoryItem])

    let createMessage;
    if (readOnlyChannel) {
        createMessage = intl.formatMessage({id:'create_post.read_only', defaultMessage: 'This channel is read-only. Only members with permission can post here.'});
    } else if (rootId) {
        createMessage = intl.formatMessage({id:'create_comment.addComment', defaultMessage: 'Reply to this thread...'});
    } else {
        createMessage = intl.formatMessage(
            {id: 'create_post.write', defaultMessage: 'Write to {channelDisplayName}'},
            {channelDisplayName: channelDisplayName},
        );
    }

    return (
        <Textbox
            onChange={handleChange}
            onKeyPress={postMsgKeyPress}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onMouseUp={handleMouseUpKeyUp}
            onKeyUp={handleMouseUpKeyUp}
            onComposition={emitTypingEvent}
            onHeightChange={onHeightChanged}
            handlePostError={onPostError}
            value={readOnlyChannel ? '' : value}
            onBlur={onBlur}
            emojiEnabled={enableEmojiPicker}
            createMessage={createMessage}
            channelId={channelId}
            id={rootId ? 'reply_textbox' : 'post_textbox'}
            ref={textboxRef}
            disabled={readOnlyChannel}
            characterLimit={maxPostSize}
            preview={shouldShowPreview}
            suggestionList={rootId ? RhsSuggestionList : undefined}
            badConnection={badConnection}
            listenForMentionKeyClick={true}
            useChannelMentions={useChannelMentions}
        />
    )
});

export default InputTextbox;
