import { Channel } from "mattermost-redux/types/channels";
import { ActionResult } from "mattermost-redux/types/actions";
import { ChannelMemberCountsByGroup } from "mattermost-redux/types/channels";
import { FileInfo } from "mattermost-redux/types/files";
import { CommandArgs } from "mattermost-redux/types/integrations";
import { Post } from "mattermost-redux/types/posts";
import { PreferenceType } from "mattermost-redux/types/preferences";
import { ServerError } from "mattermost-redux/types/errors";
import { IntlShape } from "react-intl";
import { Group } from "mattermost-redux/types/groups";
import { ModalData } from "types/actions";
import { PostDraft } from "types/store/rhs";
import EmojiMap from "utils/emoji_map";
import { FilePreviewInfo } from "components/file_preview/file_preview";

export type Props = {
    /**
     *  ref passed from channelView for EmojiPickerOverlay
     */
    getChannelView?: () => void;

    /**
     *  Data used in notifying user for @all and @channel
     */
    currentChannelMembersCount: number;

    /**
     *  Data used in multiple places of the component
     */
    currentChannel: Channel;

    /**
     *  Data used for DM prewritten messages
     */
    currentChannelTeammateUsername?: string;

    /**
     *  Data used in executing commands for channel actions passed down to client4 function
     */
    currentTeamId: string;

    /**
     *  Data used for posting message
     */
    currentUserId: string;

    /**
     * Force message submission on CTRL/CMD + ENTER
     */
    codeBlockOnCtrlEnter?: boolean;

    /**
     *  Flag used for handling submit
     */
    ctrlSend?: boolean;

    /**
     *  Flag used for adding a class center to Postbox based on user pref
     */
    fullWidthTextBox?: boolean;

    /**
     *  Data used for deciding if tutorial tip is to be shown
     */
    showTutorialTip: boolean;

    /**
     *  Data used for advancing from create post tip
     */
    tutorialStep: number;

    /**
     *  Data used populating message state when triggered by shortcuts
     */
    messageInHistoryItem?: string;

    /**
     *  Data used for populating message state from previous draft
     */
    draft: PostDraft;

    /**
     *  Data used dispatching handleViewAction ex: edit post
     */
    latestReplyablePostId?: string;
    locale: string;

    /**
     *  Data used for calling edit of post
     */
    currentUsersLatestPost?: Post | null;

    /**
     * Whether or not file upload is allowed.
     */
    canUploadFiles: boolean;

    /**
     * Whether to show the emoji picker.
     */
    enableEmojiPicker: boolean;

    /**
     * Whether to show the gif picker.
     */
    enableGifPicker: boolean;

    /**
     * Whether to check with the user before notifying the whole channel.
     */
    enableConfirmNotificationsToChannel: boolean;

    /**
     * The maximum length of a post
     */
    maxPostSize: number;
    emojiMap: EmojiMap;

    /**
     * If our connection is bad
     */
    badConnection: boolean;

    /**
     * Whether to display a confirmation modal to reset status.
     */
    userIsOutOfOffice: boolean;
    rhsExpanded: boolean;

    /**
     * To check if the timezones are enable on the server.
     */
    isTimezoneEnabled: boolean;

    canPost: boolean;

    /**
     * To determine if the current user can send special channel mentions
     */
    useChannelMentions: boolean;

    intl: IntlShape;

    /**
     * Should preview be showed
     */
    shouldShowPreview: boolean;

    actions: {
        /**
         * Set show preview for textbox
         */
        setShowPreview: (showPreview: boolean) => void;

        /**
         *  func called after message submit.
         */
        addMessageIntoHistory: (message: string) => void;

        /**
         *  func called for navigation through messages by Up arrow
         */
        moveHistoryIndexBack: (index: string) => Promise<void>;

        /**
         *  func called for navigation through messages by Down arrow
         */
        moveHistoryIndexForward: (index: string) => Promise<void>;

        /**
         *  func called for adding a reaction
         */
        addReaction: (postId: string, emojiName: string) => void;

        /**
         *  func called for posting message
         */
        onSubmitPost: (post: Post, fileInfos: FileInfo[]) => void;

        /**
         *  func called for removing a reaction
         */
        removeReaction: (postId: string, emojiName: string) => void;

        /**
         *  func called on load of component to clear drafts
         */
        clearDraftUploads: () => void;

        /**
         * hooks called before a message is sent to the server
         */
        runMessageWillBePostedHooks: (originalPost: Post) => ActionResult;

        /**
         * hooks called before a slash command is sent to the server
         */
        runSlashCommandWillBePostedHooks: (
            originalMessage: string,
            originalArgs: CommandArgs
        ) => ActionResult;

        /**
         *  func called for setting drafts
         */
        setDraft: (name: string, value: PostDraft | null) => void;

        /**
         *  func called for editing posts
         */
        setEditingPost: (
            postId?: string,
            refocusId?: string,
            title?: string,
            isRHS?: boolean
        ) => void;

        /**
         *  func called for opening the last replayable post in the RHS
         */
        selectPostFromRightHandSideSearchByPostId: (postId: string) => void;

        /**
         * Function to open a modal
         */
        openModal: <P>(modalData: ModalData<P>) => void;

        executeCommand: (message: string, args: CommandArgs) => ActionResult;

        /**
         * Function to get the users timezones in the channel
         */
        getChannelTimezones: (channelId: string) => ActionResult;
        scrollPostListToBottom: () => void;

        /**
         * Function to set or unset emoji picker for last message
         */
        emitShortcutReactToLastPostFrom: (emittedFrom: string) => void;

        getChannelMemberCountsByGroup: (
            channelId: string,
            includeTimezones: boolean
        ) => void;

        /**
         * Function used to advance the tutorial forward
         */
        savePreferences: (
            userId: string,
            preferences: PreferenceType[]
        ) => ActionResult;
    };

    groupsWithAllowReference: Map<string, Group> | null;
    channelMemberCountsByGroup: ChannelMemberCountsByGroup;
    useGroupMentions: boolean;
};

export type State = {
    message: string;
    caretPosition: number;
    submitting: boolean;
    showEmojiPicker: boolean;
    uploadsProgressPercent: { [clientID: string]: FilePreviewInfo };
    renderScrollbar: boolean;
    scrollbarWidth: number;
    currentChannel: Channel;
    errorClass: string | null;
    serverError: (ServerError & { submittedMessage?: string }) | null;
    postError?: React.ReactNode;
    showFormat: boolean;
    isFormattingBarVisible: boolean;
};