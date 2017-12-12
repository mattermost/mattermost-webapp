// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

/* eslint-disable no-magic-numbers */

import keyMirror from 'key-mirror';

import audioIcon from 'images/icons/audio.png';
import codeIcon from 'images/icons/code.png';
import excelIcon from 'images/icons/excel.png';
import genericIcon from 'images/icons/generic.png';
import patchIcon from 'images/icons/patch.png';
import pdfIcon from 'images/icons/pdf.png';
import pptIcon from 'images/icons/ppt.png';
import videoIcon from 'images/icons/video.png';
import wordIcon from 'images/icons/word.png';
import logoImage from 'images/logo_compact.png';
import githubIcon from 'images/themes/code_themes/github.png';
import monokaiIcon from 'images/themes/code_themes/monokai.png';
import solarizedDarkIcon from 'images/themes/code_themes/solarized-dark.png';
import solarizedLightIcon from 'images/themes/code_themes/solarized-light.png';
import mattermostThemeImage from 'images/themes/mattermost.png';
import mattermostDarkThemeImage from 'images/themes/mattermost_dark.png';
import defaultThemeImage from 'images/themes/organization.png';
import windows10ThemeImage from 'images/themes/windows_dark.png';
import logoWebhook from 'images/webhook_icon.jpg';

import githubCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/github.css'; // eslint-disable-line import/order
import monokaiCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/monokai.css'; // eslint-disable-line import/order
import solarizedDarkCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/solarized-dark.css'; // eslint-disable-line import/order
import solarizedLightCSS from '!!file-loader?name=files/code_themes/[hash].[ext]!highlight.js/styles/solarized-light.css'; // eslint-disable-line import/order

export const PluginSettings = {
    TYPE_TEXT: 'text',
    TYPE_BOOL: 'bool',
    TYPE_RADIO: 'radio',
    TYPE_DROPDOWN: 'dropdown',
    TYPE_GENERATED: 'generated',
    TYPE_USERNAME: 'username'
};

export const Preferences = {
    CATEGORY_CHANNEL_OPEN_TIME: 'channel_open_time',
    CATEGORY_DIRECT_CHANNEL_SHOW: 'direct_channel_show',
    CATEGORY_GROUP_CHANNEL_SHOW: 'group_channel_show',
    CATEGORY_DISPLAY_SETTINGS: 'display_settings',
    CATEGORY_SIDEBAR_SETTINGS: 'sidebar_settings',
    CATEGORY_ADVANCED_SETTINGS: 'advanced_settings',
    TUTORIAL_STEP: 'tutorial_step',
    CHANNEL_DISPLAY_MODE: 'channel_display_mode',
    CHANNEL_DISPLAY_MODE_CENTERED: 'centered',
    CHANNEL_DISPLAY_MODE_FULL_SCREEN: 'full',
    CHANNEL_DISPLAY_MODE_DEFAULT: 'full',
    MESSAGE_DISPLAY: 'message_display',
    MESSAGE_DISPLAY_CLEAN: 'clean',
    MESSAGE_DISPLAY_COMPACT: 'compact',
    MESSAGE_DISPLAY_DEFAULT: 'clean',
    LINK_PREVIEW_DISPLAY: 'link_previews',
    LINK_PREVIEW_DISPLAY_DEFAULT: 'true',
    COLLAPSE_DISPLAY: 'collapse_previews',
    COLLAPSE_DISPLAY_DEFAULT: 'false',
    USE_MILITARY_TIME: 'use_military_time',
    CATEGORY_THEME: 'theme',
    CATEGORY_FLAGGED_POST: 'flagged_post',
    CATEGORY_NOTIFICATIONS: 'notifications',
    CATEGORY_FAVORITE_CHANNEL: 'favorite_channel',
    EMAIL_INTERVAL: 'email_interval',
    INTERVAL_IMMEDIATE: 30, // "immediate" is a 30 second interval
    INTERVAL_FIFTEEN_MINUTES: 15 * 60,
    INTERVAL_HOUR: 60 * 60,
    INTERVAL_NEVER: 0
};

export const ActionTypes = keyMirror({
    RECEIVED_ERROR: null,

    CLICK_CHANNEL: null,
    CREATE_CHANNEL: null,
    CREATE_POST: null,
    CREATE_COMMENT: null,
    POST_DELETED: null,
    POST_UPDATED: null,
    REMOVE_POST: null,

    RECEIVED_CHANNELS: null,
    RECEIVED_CHANNEL: null,
    RECEIVED_CHANNEL_MEMBER: null,
    RECEIVED_MORE_CHANNELS: null,
    RECEIVED_CHANNEL_STATS: null,
    RECEIVED_MY_CHANNEL_MEMBERS: null,
    RECEIVED_MEMBERS_IN_CHANNEL: null,

    FOCUS_POST: null,
    RECEIVED_POSTS: null,
    RECEIVED_FOCUSED_POST: null,
    RECEIVED_POST: null,
    RECEIVED_EDIT_POST: null,
    SET_EDITING_POST: null,
    EDIT_POST: null,
    SELECT_POST: null,
    RECEIVED_POST_SELECTED: null,
    RECEIVED_MENTION_DATA: null,
    RECEIVED_ADD_MENTION: null,
    RECEIVED_POST_PINNED: null,
    RECEIVED_POST_UNPINNED: null,
    INCREASE_POST_VISIBILITY: null,
    LOADING_POSTS: null,

    UPDATE_RHS_STATE: null,
    UPDATE_RHS_SEARCH_TERMS: null,

    RECEIVED_PROFILES: null,
    RECEIVED_PROFILES_IN_TEAM: null,
    RECEIVED_PROFILES_NOT_IN_TEAM: null,
    RECEIVED_PROFILE: null,
    RECEIVED_PROFILES_IN_CHANNEL: null,
    RECEIVED_PROFILES_NOT_IN_CHANNEL: null,
    RECEIVED_PROFILES_WITHOUT_TEAM: null,
    RECEIVED_ME: null,
    RECEIVED_SESSIONS: null,
    RECEIVED_AUDITS: null,
    RECEIVED_TEAMS: null,
    RECEIVED_STATUSES: null,
    RECEIVED_PREFERENCE: null,
    RECEIVED_PREFERENCES: null,
    DELETED_PREFERENCES: null,
    RECEIVED_FILE_INFOS: null,
    RECEIVED_ANALYTICS: null,

    RECEIVED_INCOMING_WEBHOOKS: null,
    RECEIVED_INCOMING_WEBHOOK: null,
    UPDATED_INCOMING_WEBHOOK: null,
    REMOVED_INCOMING_WEBHOOK: null,
    RECEIVED_OUTGOING_WEBHOOKS: null,
    RECEIVED_OUTGOING_WEBHOOK: null,
    UPDATED_OUTGOING_WEBHOOK: null,
    REMOVED_OUTGOING_WEBHOOK: null,
    RECEIVED_COMMANDS: null,
    RECEIVED_COMMAND: null,
    UPDATED_COMMAND: null,
    REMOVED_COMMAND: null,
    RECEIVED_OAUTHAPPS: null,
    RECEIVED_OAUTHAPP: null,
    REMOVED_OAUTHAPP: null,

    RECEIVED_CUSTOM_EMOJIS: null,
    RECEIVED_CUSTOM_EMOJI: null,
    UPDATED_CUSTOM_EMOJI: null,
    REMOVED_CUSTOM_EMOJI: null,

    RECEIVED_REACTIONS: null,
    ADDED_REACTION: null,
    REMOVED_REACTION: null,

    RECEIVED_MSG: null,

    RECEIVED_TEAM: null,
    RECEIVED_MY_TEAM: null,
    CREATED_TEAM: null,
    UPDATE_TEAM: null,

    SET_NAVIGATION_BLOCKED: null,
    DEFER_NAVIGATION: null,
    CANCEL_NAVIGATION: null,
    CONFIRM_NAVIGATION: null,
    RECEIVED_CONFIG: null,
    RECEIVED_LOGS: null,
    RECEIVED_SERVER_AUDITS: null,
    RECEIVED_SERVER_COMPLIANCE_REPORTS: null,
    RECEIVED_ALL_TEAMS: null,
    RECEIVED_ALL_TEAM_LISTINGS: null,
    RECEIVED_MY_TEAM_MEMBERS: null,
    RECEIVED_MY_TEAMS_UNREAD: null,
    RECEIVED_MEMBERS_IN_TEAM: null,
    RECEIVED_TEAM_STATS: null,

    RECEIVED_LOCALE: null,

    UPDATE_OPEN_GRAPH_METADATA: null,
    RECIVED_OPEN_GRAPH_METADATA: null,

    SHOW_SEARCH: null,

    USER_TYPING: null,

    TOGGLE_ACCOUNT_SETTINGS_MODAL: null,
    TOGGLE_SHORTCUTS_MODAL: null,
    TOGGLE_IMPORT_THEME_MODAL: null,
    TOGGLE_INVITE_MEMBER_MODAL: null,
    TOGGLE_LEAVE_TEAM_MODAL: null,
    TOGGLE_DELETE_POST_MODAL: null,
    TOGGLE_GET_POST_LINK_MODAL: null,
    TOGGLE_GET_TEAM_INVITE_LINK_MODAL: null,
    TOGGLE_GET_PUBLIC_LINK_MODAL: null,
    TOGGLE_DM_MODAL: null,
    TOGGLE_QUICK_SWITCH_MODAL: null,
    TOGGLE_CHANNEL_HEADER_UPDATE_MODAL: null,
    TOGGLE_CHANNEL_PURPOSE_UPDATE_MODAL: null,
    TOGGLE_CHANNEL_NAME_UPDATE_MODAL: null,
    TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL: null,

    SUGGESTION_PRETEXT_CHANGED: null,
    SUGGESTION_RECEIVED_SUGGESTIONS: null,
    SUGGESTION_CLEAR_SUGGESTIONS: null,
    SUGGESTION_COMPLETE_WORD: null,
    SUGGESTION_SELECT_NEXT: null,
    SUGGESTION_SELECT_PREVIOUS: null,

    BROWSER_CHANGE_FOCUS: null,

    EMOJI_POSTED: null,

    RECEIVED_PLUGIN_COMPONENTS: null,
    RECEIVED_PLUGIN_POST_TYPES: null,
    RECEIVED_WEBAPP_PLUGINS: null,
    RECEIVED_WEBAPP_PLUGIN: null,
    REMOVED_WEBAPP_PLUGIN: null,

    MODAL_OPEN: null,
    MODAL_CLOSE: null,

    POPOVER_MENTION_KEY_CLICK: null
});

export const WebrtcActionTypes = keyMirror({
    INITIALIZE: null,
    NOTIFY: null,
    CHANGED: null,
    ANSWER: null,
    DECLINE: null,
    CANCEL: null,
    NO_ANSWER: null,
    BUSY: null,
    FAILED: null,
    UNSUPPORTED: null,
    MUTED: null,
    IN_PROGRESS: null,
    DISABLED: null,
    RHS: null
});

export const ModalIdentifiers = {
    CHANNEL_INFO: 'channel_info',
    DELETE_CHANNEL: 'delete_channel',
    CHANNEL_NOTIFICATIONS: 'channel_notifications',
    CHANNEL_INVITE: 'channel_invite',
    EDIT_CHANNEL_HEADER: 'edit_channel_header'
};

export const UserStatuses = {
    OFFLINE: 'offline',
    AWAY: 'away',
    ONLINE: 'online',
    DND: 'dnd'
};

export const UserSearchOptions = {
    ALLOW_INACTIVE: 'allow_inactive',
    WITHOUT_TEAM: 'without_team'
};

export const SocketEvents = {
    POSTED: 'posted',
    POST_EDITED: 'post_edited',
    POST_DELETED: 'post_deleted',
    POST_UPDATED: 'post_updated',
    CHANNEL_CREATED: 'channel_created',
    CHANNEL_DELETED: 'channel_deleted',
    CHANNEL_UPDATED: 'channel_updated',
    CHANNEL_VIEWED: 'channel_viewed',
    DIRECT_ADDED: 'direct_added',
    NEW_USER: 'new_user',
    ADDED_TO_TEAM: 'added_to_team',
    LEAVE_TEAM: 'leave_team',
    UPDATE_TEAM: 'update_team',
    USER_ADDED: 'user_added',
    USER_REMOVED: 'user_removed',
    USER_UPDATED: 'user_updated',
    USER_ROLE_UPDATED: 'user_role_updated',
    MEMBERROLE_UPDATED: 'memberrole_updated',
    TYPING: 'typing',
    PREFERENCE_CHANGED: 'preference_changed',
    PREFERENCES_CHANGED: 'preferences_changed',
    PREFERENCES_DELETED: 'preferences_deleted',
    EPHEMERAL_MESSAGE: 'ephemeral_message',
    STATUS_CHANGED: 'status_change',
    HELLO: 'hello',
    WEBRTC: 'webrtc',
    REACTION_ADDED: 'reaction_added',
    REACTION_REMOVED: 'reaction_removed',
    EMOJI_ADDED: 'emoji_added',
    PLUGIN_ACTIVATED: 'plugin_activated',
    PLUGIN_DEACTIVATED: 'plugin_deactivated'
};

export const TutorialSteps = {
    INTRO_SCREENS: 0,
    POST_POPOVER: 1,
    CHANNEL_POPOVER: 2,
    MENU_POPOVER: 3
};

export const PostTypes = {
    JOIN_LEAVE: 'system_join_leave',
    JOIN_CHANNEL: 'system_join_channel',
    LEAVE_CHANNEL: 'system_leave_channel',
    ADD_TO_CHANNEL: 'system_add_to_channel',
    REMOVE_FROM_CHANNEL: 'system_remove_from_channel',
    ADD_REMOVE: 'system_add_remove',
    HEADER_CHANGE: 'system_header_change',
    DISPLAYNAME_CHANGE: 'system_displayname_change',
    PURPOSE_CHANGE: 'system_purpose_change',
    CHANNEL_DELETED: 'system_channel_deleted',
    FAKE_PARENT_DELETED: 'system_fake_parent_deleted',
    EPHEMERAL: 'system_ephemeral',
    REMOVE_LINK_PREVIEW: 'remove_link_preview'
};

export const StatTypes = keyMirror({
    TOTAL_USERS: null,
    TOTAL_PUBLIC_CHANNELS: null,
    TOTAL_PRIVATE_GROUPS: null,
    TOTAL_POSTS: null,
    TOTAL_TEAMS: null,
    TOTAL_FILE_POSTS: null,
    TOTAL_HASHTAG_POSTS: null,
    TOTAL_IHOOKS: null,
    TOTAL_OHOOKS: null,
    TOTAL_COMMANDS: null,
    TOTAL_SESSIONS: null,
    POST_PER_DAY: null,
    USERS_WITH_POSTS_PER_DAY: null,
    RECENTLY_ACTIVE_USERS: null,
    NEWLY_CREATED_USERS: null,
    TOTAL_WEBSOCKET_CONNECTIONS: null,
    TOTAL_MASTER_DB_CONNECTIONS: null,
    TOTAL_READ_DB_CONNECTIONS: null,
    DAILY_ACTIVE_USERS: null,
    MONTHLY_ACTIVE_USERS: null
});

export const StorageTypes = keyMirror({
    SET_ITEM: null,
    REMOVE_ITEM: null,
    SET_GLOBAL_ITEM: null,
    REMOVE_GLOBAL_ITEM: null,
    CLEAR: null,
    ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX: null,
    ACTION_ON_ITEMS_WITH_PREFIX: null,
    STORAGE_REHYDRATE: null
});

export const StoragePrefixes = {
    EMBED_VISIBLE: 'isVisible_',
    COMMENT_DRAFT: 'comment_draft_',
    DRAFT: 'draft_',
    LOGOUT: '__logout__',
    LOGIN: '__login__',
    ANNOUNCEMENT: '__announcement__'
};

export const ErrorPageTypes = {
    LOCAL_STORAGE: 'local_storage',
    OAUTH_MISSING_CODE: 'oauth_missing_code',
    PAGE_NOT_FOUND: 'page_not_found',
    PERMALINK_NOT_FOUND: 'permalink_not_found'
};

export const JobTypes = {
    DATA_RETENTION: 'data_retention',
    ELASTICSEARCH_POST_INDEXING: 'elasticsearch_post_indexing',
    LDAP_SYNC: 'ldap_sync',
    MESSAGE_EXPORT: 'message_export'
};

export const JobStatuses = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    SUCCESS: 'success',
    ERROR: 'error',
    CANCEL_REQUESTED: 'cancel_requested',
    CANCELED: 'canceled'
};

export const ErrorBarTypes = {
    LICENSE_EXPIRING: 'error_bar.license_expiring',
    LICENSE_EXPIRED: 'error_bar.license_expired',
    LICENSE_PAST_GRACE: 'error_bar.past_grace',
    PREVIEW_MODE: 'error_bar.preview_mode',
    SITE_URL: 'error_bar.site_url',
    WEBSOCKET_PORT_ERROR: 'channel_loader.socketError'
};

export const NotificationLevels = {
    DEFAULT: 'default',
    ALL: 'all',
    MENTION: 'mention',
    NONE: 'none'
};

export const RHSStates = {
    MENTION: 'mention',
    SEARCH: 'search',
    FLAG: 'flag',
    PIN: 'pin'
};

export const Constants = {
    PluginSettings,
    Preferences,
    SocketEvents,
    ActionTypes,
    WebrtcActionTypes,
    UserStatuses,
    UserSearchOptions,
    TutorialSteps,
    PostTypes,
    ErrorPageTypes,
    ErrorBarTypes,

    MAX_POST_VISIBILITY: 1000000,

    IGNORE_POST_TYPES: [PostTypes.JOIN_LEAVE, PostTypes.JOIN_CHANNEL, PostTypes.LEAVE_CHANNEL, PostTypes.REMOVE_FROM_CHANNEL, PostTypes.ADD_TO_CHANNEL, PostTypes.ADD_REMOVE],

    PayloadSources: keyMirror({
        SERVER_ACTION: null,
        VIEW_ACTION: null
    }),

    StatTypes,
    STAT_MAX_ACTIVE_USERS: 20,
    STAT_MAX_NEW_USERS: 20,

    ScrollTypes: {
        FREE: 1,
        BOTTOM: 2,
        SIDEBBAR_OPEN: 3,
        NEW_MESSAGE: 4,
        POST: 5
    },

    SPECIAL_MENTIONS: ['all', 'channel', 'here'],
    NOTIFY_ALL_MEMBERS: 5,
    CHARACTER_LIMIT: 4000,
    IMAGE_TYPE_GIF: 'gif',
    IMAGE_TYPES: ['jpg', 'gif', 'bmp', 'png', 'jpeg'],
    AUDIO_TYPES: ['mp3', 'wav', 'wma', 'm4a', 'flac', 'aac', 'ogg', 'm4r'],
    VIDEO_TYPES: ['mp4', 'avi', 'webm', 'mkv', 'wmv', 'mpg', 'mov', 'flv'],
    PRESENTATION_TYPES: ['ppt', 'pptx'],
    SPREADSHEET_TYPES: ['xlsx', 'csv'],
    WORD_TYPES: ['doc', 'docx'],
    CODE_TYPES: ['as', 'applescript', 'osascript', 'scpt', 'bash', 'sh', 'zsh', 'clj', 'boot', 'cl2', 'cljc', 'cljs', 'cljs.hl', 'cljscm', 'cljx', 'hic', 'coffee', '_coffee', 'cake', 'cjsx', 'cson', 'iced', 'cpp', 'c', 'cc', 'h', 'c++', 'h++', 'hpp', 'cs', 'csharp', 'css', 'd', 'di', 'dart', 'delphi', 'dpr', 'dfm', 'pas', 'pascal', 'freepascal', 'lazarus', 'lpr', 'lfm', 'diff', 'django', 'jinja', 'dockerfile', 'docker', 'erl', 'f90', 'f95', 'fsharp', 'fs', 'gcode', 'nc', 'go', 'groovy', 'handlebars', 'hbs', 'html.hbs', 'html.handlebars', 'hs', 'hx', 'java', 'jsp', 'js', 'jsx', 'json', 'jl', 'kt', 'ktm', 'kts', 'less', 'lisp', 'lua', 'mk', 'mak', 'md', 'mkdown', 'mkd', 'matlab', 'm', 'mm', 'objc', 'obj-c', 'ml', 'perl', 'pl', 'php', 'php3', 'php4', 'php5', 'php6', 'ps', 'ps1', 'pp', 'py', 'gyp', 'r', 'ruby', 'rb', 'gemspec', 'podspec', 'thor', 'irb', 'rs', 'scala', 'scm', 'sld', 'scss', 'st', 'styl', 'sql', 'swift', 'tex', 'txt', 'vbnet', 'vb', 'bas', 'vbs', 'v', 'veo', 'xml', 'html', 'xhtml', 'rss', 'atom', 'xsl', 'plist', 'yaml'],
    PDF_TYPES: ['pdf'],
    PATCH_TYPES: ['patch'],
    SVG_TYPES: ['svg'],
    ICON_FROM_TYPE: {
        audio: audioIcon,
        video: videoIcon,
        spreadsheet: excelIcon,
        presentation: pptIcon,
        pdf: pdfIcon,
        code: codeIcon,
        word: wordIcon,
        patch: patchIcon,
        other: genericIcon
    },
    ICON_NAME_FROM_TYPE: {
        audio: 'audio',
        video: 'video',
        spreadsheet: 'excel',
        presentation: 'ppt',
        pdf: 'pdf',
        code: 'code',
        word: 'word',
        patch: 'patch',
        other: 'generic'
    },
    MAX_DISPLAY_FILES: 5,
    MAX_UPLOAD_FILES: 5,
    THUMBNAIL_WIDTH: 128,
    THUMBNAIL_HEIGHT: 100,
    PROFILE_WIDTH: 128,
    PROFILE_HEIGHT: 128,
    WEB_VIDEO_WIDTH: 640,
    WEB_VIDEO_HEIGHT: 480,
    MOBILE_VIDEO_WIDTH: 480,
    MOBILE_VIDEO_HEIGHT: 360,
    MOBILE_SCREEN_WIDTH: 768,
    SCROLL_DELAY: 2000,
    SCROLL_PAGE_FRACTION: 3,
    DEFAULT_CHANNEL: 'town-square',
    DEFAULT_CHANNEL_UI_NAME: 'Town Square',
    OFFTOPIC_CHANNEL: 'off-topic',
    OFFTOPIC_CHANNEL_UI_NAME: 'Off-Topic',
    GITLAB_SERVICE: 'gitlab',
    GOOGLE_SERVICE: 'google',
    OFFICE365_SERVICE: 'office365',
    EMAIL_SERVICE: 'email',
    LDAP_SERVICE: 'ldap',
    SAML_SERVICE: 'saml',
    USERNAME_SERVICE: 'username',
    SIGNIN_CHANGE: 'signin_change',
    PASSWORD_CHANGE: 'password_change',
    SIGNIN_VERIFIED: 'verified',
    SESSION_EXPIRED: 'expired',
    POST_CHUNK_SIZE: 60,
    PROFILE_CHUNK_SIZE: 100,
    POST_FOCUS_CONTEXT_RADIUS: 10,
    POST_LOADING: 'loading',
    POST_FAILED: 'failed',
    POST_DELETED: 'deleted',
    POST_UPDATED: 'updated',
    SYSTEM_MESSAGE_PREFIX: 'system_',
    SYSTEM_MESSAGE_PROFILE_IMAGE: logoImage,
    RESERVED_TEAM_NAMES: [
        'signup',
        'login',
        'admin',
        'channel',
        'post',
        'api',
        'oauth'
    ],
    RESERVED_USERNAMES: [
        'valet',
        'all',
        'channel',
        'here',
        'matterbot'
    ],
    MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    MAX_DMS: 20,
    MAX_USERS_IN_GM: 8,
    MIN_USERS_IN_GM: 3,
    MAX_CHANNEL_POPOVER_COUNT: 100,
    DM_CHANNEL: 'D',
    GM_CHANNEL: 'G',
    OPEN_CHANNEL: 'O',
    PRIVATE_CHANNEL: 'P',
    INVITE_TEAM: 'I',
    OPEN_TEAM: 'O',
    SHOW_NEW_CHANNEL: 1,
    SHOW_EDIT_URL: 2,
    MAX_POST_LEN: 4000,
    EMOJI_SIZE: 16,
    TEAM_INFO_SVG: "<svg width='100%' height='100%' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;'> <g transform='matrix(1.17647,0,0,1.17647,-1.55431e-15,-1.00573e-14)'> <path d='M8.5,0C3.797,0 0,3.797 0,8.5C0,13.203 3.797,17 8.5,17C13.203,17 17,13.203 17,8.5C17,3.797 13.203,0 8.5,0ZM10,8.5C10,7.672 9.328,7 8.5,7C7.672,7 7,7.672 7,8.5L7,12.45C7,13.278 7.672,13.95 8.5,13.95C9.328,13.95 10,13.278 10,12.45L10,8.5ZM8.5,3C9.328,3 10,3.672 10,4.5C10,5.328 9.328,6 8.5,6C7.672,6 7,5.328 7,4.5C7,3.672 7.672,3 8.5,3Z'/> </g> </svg>",
    ONLINE_AVATAR_SVG: "<svg version='1.1'id='Layer_1' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:cc='http://creativecommons.org/ns#' inkscape:version='0.48.4 r9939' sodipodi:docname='TRASH_1_4.svg'xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='-243 245 12 12'style='enable-background:new -243 245 12 12;' xml:space='preserve'> <sodipodi:namedview  inkscape:cx='26.358185' inkscape:zoom='1.18' bordercolor='#666666' pagecolor='#ffffff' borderopacity='1' objecttolerance='10' inkscape:cy='139.7898' gridtolerance='10' guidetolerance='10' showgrid='false' showguides='true' id='namedview6' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:guide-bbox='true' inkscape:window-width='1366' inkscape:current-layer='Layer_1' inkscape:window-height='705' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:window-x='-8'> <sodipodi:guide  position='50.036793,85.991376' orientation='1,0' id='guide2986'></sodipodi:guide> <sodipodi:guide  position='58.426196,66.216355' orientation='0,1' id='guide3047'></sodipodi:guide> </sodipodi:namedview> <g> <path class='online--icon' d='M-236,250.5C-236,250.5-236,250.5-236,250.5C-236,250.5-236,250.5-236,250.5C-236,250.5-236,250.5-236,250.5z'/> <ellipse class='online--icon' cx='-238.5' cy='248' rx='2.5' ry='2.5'/> </g> <path class='online--icon' d='M-238.9,253.8c0-0.4,0.1-0.9,0.2-1.3c-2.2-0.2-2.2-2-2.2-2s-1,0.1-1.2,0.5c-0.4,0.6-0.6,1.7-0.7,2.5c0,0.1-0.1,0.5,0,0.6 c0.2,1.3,2.2,2.3,4.4,2.4c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0C-238.7,255.7-238.9,254.8-238.9,253.8z'/> <g> <g> <path class='online--icon' d='M-232.3,250.1l1.3,1.3c0,0,0,0.1,0,0.1l-4.1,4.1c0,0,0,0-0.1,0c0,0,0,0,0,0l-2.7-2.7c0,0,0-0.1,0-0.1l1.2-1.2 c0,0,0.1,0,0.1,0l1.4,1.4l2.9-2.9C-232.4,250.1-232.3,250.1-232.3,250.1z'/> </g> </g> </svg>",
    AWAY_AVATAR_SVG: "<svg width='100%' height='100%' viewBox='0 0 12 12' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;'> <path class='away--icon' d='M9.081,5.712C9.267,5.712 9.417,5.863 9.417,6.048L9.417,9.086L11.864,10.499C12.025,10.592 12.08,10.797 11.987,10.958L11.482,11.832C11.39,11.993 11.184,12.048 11.023,11.955L7.904,10.154C7.788,10.087 7.727,9.961 7.737,9.836C7.736,9.827 7.736,9.818 7.736,9.809L7.736,6.048C7.736,5.863 7.886,5.712 8.072,5.712L9.081,5.712ZM4.812,11.513L4.605,11.513C2.325,11.41 0.253,10.374 0.046,9.027C-0.058,8.923 0.046,8.509 0.046,8.405C0.15,7.576 0.357,6.437 0.771,5.815C0.978,5.401 2.015,5.297 2.015,5.297C2.015,5.297 2.015,7.369 4.605,7.369L5.019,7.369C4.915,7.784 4.812,8.198 4.812,8.612C4.812,9.648 5.226,10.581 5.848,11.41C5.537,11.513 5.123,11.513 4.812,11.513ZM4.605,0.117C6.034,0.117 7.195,1.277 7.195,2.707C7.195,4.136 6.034,5.297 4.605,5.297C3.175,5.297 2.015,4.136 2.015,2.707C2.015,1.277 3.175,0.117 4.605,0.117Z'/> </svg>",
    DND_AVATAR_SVG: "<svg version='1.1'id='Layer_1' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:cc='http://creativecommons.org/ns#' inkscape:version='0.48.4 r9939' sodipodi:docname='TRASH_1_4.svg'xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='-299 391 12 12'style='enable-background:new -299 391 12 12;' xml:space='preserve'> <sodipodi:namedview  inkscape:cx='26.358185' inkscape:zoom='1.18' bordercolor='#666666' pagecolor='#ffffff' borderopacity='1' objecttolerance='10' inkscape:cy='139.7898' gridtolerance='10' guidetolerance='10' showgrid='false' showguides='true' id='namedview6' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:guide-bbox='true' inkscape:window-width='1366' inkscape:current-layer='Layer_1' inkscape:window-height='705' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:window-x='-8'> <sodipodi:guide  position='50.036793,85.991376' orientation='1,0' id='guide2986'></sodipodi:guide> <sodipodi:guide  position='58.426196,66.216355' orientation='0,1' id='guide3047'></sodipodi:guide> </sodipodi:namedview> <g> <ellipse class='dnd--icon' cx='-294.6' cy='394' rx='2.5' ry='2.5'/> <path class='dnd--icon' d='M-293.8,399.4c0-0.4,0.1-0.7,0.2-1c-0.3,0.1-0.6,0.2-1,0.2c-2.5,0-2.5-2-2.5-2s-1,0.1-1.2,0.5c-0.4,0.6-0.6,1.7-0.7,2.5 c0,0.1-0.1,0.5,0,0.6c0.2,1.3,2.2,2.3,4.4,2.4c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0.7,0,1.4-0.1,2-0.3 C-293.3,401.5-293.8,400.5-293.8,399.4z'/> </g> <path class='dnd--icon' d='M-287,400c0,0.1-0.1,0.1-0.1,0.1l-4.9,0c-0.1,0-0.1-0.1-0.1-0.1v-1.6c0-0.1,0.1-0.1,0.1-0.1l4.9,0c0.1,0,0.1,0.1,0.1,0.1 V400z'/> </svg>",
    OFFLINE_AVATAR_SVG: "<svg version='1.1'id='Layer_1' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:cc='http://creativecommons.org/ns#' inkscape:version='0.48.4 r9939' sodipodi:docname='TRASH_1_4.svg'xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='-299 391 12 12'style='enable-background:new -299 391 12 12;' xml:space='preserve'> <sodipodi:namedview  inkscape:cx='26.358185' inkscape:zoom='1.18' bordercolor='#666666' pagecolor='#ffffff' borderopacity='1' objecttolerance='10' inkscape:cy='139.7898' gridtolerance='10' guidetolerance='10' showgrid='false' showguides='true' id='namedview6' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:guide-bbox='true' inkscape:window-width='1366' inkscape:current-layer='Layer_1' inkscape:window-height='705' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:window-x='-8'> <sodipodi:guide  position='50.036793,85.991376' orientation='1,0' id='guide2986'></sodipodi:guide> <sodipodi:guide  position='58.426196,66.216355' orientation='0,1' id='guide3047'></sodipodi:guide> </sodipodi:namedview> <g> <g> <ellipse class='offline--icon' cx='-294.5' cy='394' rx='2.5' ry='2.5'/> <path class='offline--icon' d='M-294.3,399.7c0-0.4,0.1-0.8,0.2-1.2c-0.1,0-0.2,0-0.4,0c-2.5,0-2.5-2-2.5-2s-1,0.1-1.2,0.5c-0.4,0.6-0.6,1.7-0.7,2.5 c0,0.1-0.1,0.5,0,0.6c0.2,1.3,2.2,2.3,4.4,2.4h0.1h0.1c0.3,0,0.7,0,1-0.1C-293.9,401.6-294.3,400.7-294.3,399.7z'/> </g> </g> <g> <path class='offline--icon' d='M-288.9,399.4l1.8-1.8c0.1-0.1,0.1-0.3,0-0.3l-0.7-0.7c-0.1-0.1-0.3-0.1-0.3,0l-1.8,1.8l-1.8-1.8c-0.1-0.1-0.3-0.1-0.3,0 l-0.7,0.7c-0.1,0.1-0.1,0.3,0,0.3l1.8,1.8l-1.8,1.8c-0.1,0.1-0.1,0.3,0,0.3l0.7,0.7c0.1,0.1,0.3,0.1,0.3,0l1.8-1.8l1.8,1.8 c0.1,0.1,0.3,0.1,0.3,0l0.7-0.7c0.1-0.1,0.1-0.3,0-0.3L-288.9,399.4z'/> </g> </svg>",
    ONLINE_ICON_SVG: "<div class='icon__container'><svg width='100%' height='100%' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;'><path class='online--icon' d='M10,0c5.519,0 10,4.481 10,10c0,5.519 -4.481,10 -10,10c-5.519,0 -10,-4.481 -10,-10c0,-5.519 4.481,-10 10,-10Zm6.19,7.18c0,0.208 -0.075,0.384 -0.224,0.53l-5.782,5.64l-1.087,1.059c-0.149,0.146 -0.33,0.218 -0.543,0.218c-0.213,0 -0.394,-0.072 -0.543,-0.218l-1.086,-1.059l-2.891,-2.82c-0.149,-0.146 -0.224,-0.322 -0.224,-0.53c0,-0.208 0.075,-0.384 0.224,-0.53l1.086,-1.059c0.149,-0.146 0.33,-0.218 0.543,-0.218c0.213,0 0.394,0.072 0.543,0.218l2.348,2.298l5.24,-5.118c0.149,-0.146 0.33,-0.218 0.543,-0.218c0.213,0 0.394,0.072 0.543,0.218l1.086,1.059c0.149,0.146 0.224,0.322 0.224,0.53Z'/></svg></div>",
    AWAY_ICON_SVG: "<div class='icon__container'><svg width='100%' height='100%' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;'> <path class='away--icon' d='M10,0C15.519,0 20,4.481 20,10C20,15.519 15.519,20 10,20C4.481,20 0,15.519 0,10C0,4.481 4.481,0 10,0ZM10.27,3C10.949,3 11.5,3.586 11.5,4.307L11.5,9.379L15.002,12.881C15.492,13.37 15.499,14.158 15.019,14.638L14.638,15.019C14.158,15.499 13.37,15.492 12.881,15.002L8.887,11.008C8.739,10.861 8.636,10.686 8.576,10.501C8.528,10.402 8.5,10.299 8.5,10.193L8.5,4.307C8.5,3.586 9.051,3 9.73,3L10.27,3Z'/></svg></div>",
    DND_ICON_SVG: "<div class='icon__container'><svg width='100%' height='100%' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;'><path class='dnd--icon' d='M10,0c5.519,0 10,4.481 10,10c0,5.519 -4.481,10 -10,10c-5.519,0 -10,-4.481 -10,-10c0,-5.519 4.481,-10 10,-10Zm5.25,8.5l-10.5,0c-0.414,0 -0.75,0.336 -0.75,0.75l0,1.5c0,0.414 0.336,0.75 0.75,0.75l10.5,0c0.414,0 0.75,-0.336 0.75,-0.75l0,-1.5c0,-0.414 -0.336,-0.75 -0.75,-0.75Z'/></svg></div>",
    OFFLINE_ICON_SVG: "<svg class='offline--icon' width='100%' height='100%' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;'><path d='M10,0c5.519,0 10,4.481 10,10c0,5.519 -4.481,10 -10,10c-5.519,0 -10,-4.481 -10,-10c0,-5.519 4.481,-10 10,-10Zm0,2c4.415,0 8,3.585 8,8c0,4.415 -3.585,8 -8,8c-4.415,0 -8,-3.585 -8,-8c0,-4.415 3.585,-8 8,-8Z'/></svg>",
    COMMENT_ICON: "<svg version='1.1' id='Layer_2' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'width='15px' height='15px' viewBox='1 1.5 15 15' enable-background='new 1 1.5 15 15' xml:space='preserve'> <g> <g> <path fill='#211B1B' d='M14,1.5H3c-1.104,0-2,0.896-2,2v8c0,1.104,0.896,2,2,2h1.628l1.884,3l1.866-3H14c1.104,0,2-0.896,2-2v-8 C16,2.396,15.104,1.5,14,1.5z M15,11.5c0,0.553-0.447,1-1,1H8l-1.493,2l-1.504-1.991L5,12.5H3c-0.552,0-1-0.447-1-1v-8 c0-0.552,0.448-1,1-1h11c0.553,0,1,0.448,1,1V11.5z'/> </g> </g> </svg>",
    SCROLL_BOTTOM_ICON: "<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'viewBox='-239 239 21 23' style='enable-background:new -239 239 21 23;' xml:space='preserve'> <path d='M-239,241.4l2.4-2.4l8.1,8.2l8.1-8.2l2.4,2.4l-10.5,10.6L-239,241.4z M-228.5,257.2l8.1-8.2l2.4,2.4l-10.5,10.6l-10.5-10.6 l2.4-2.4L-228.5,257.2z'/> </svg>",
    LEAVE_TEAM_SVG: "<svg width='100%' height='100%' viewBox='0 0 164 164' version='1.1' xmlns='http://www.w3.org/2000/svg'    xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round; stroke-miterlimit:1.41421;'> <path d='M26.023,164L26.023,7.035L26.022,0.32L137.658,0.32L137.658,164L124.228,164L124.228, 13.749L39.452,13.749L39.452,164L26.023, 164ZM118.876,164L118.876,18.619L58.137,32.918L58.137,149.701L118.876,164Z'/></svg>",
    MENU_ICON_SVG: "<svg width='16px' height='10px' viewBox='0 0 16 10' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <g stroke='none' stroke-width='1' fill='inherit' fill-rule='evenodd'> <g transform='translate(-26.000000, -24.000000)' fill-rule='nonzero' fill='inherit'> <g transform='translate(26.000000, 24.000000)'> <path d='M1.5,0 L0.5,0 C0.224,0 0,0.224 0,0.5 L0,1.5 C0,1.776 0.224,2 0.5,2 L1.5,2 C1.776,2 2,1.776 2,1.5 L2,0.5 C2,0.224 1.776,0 1.5,0 Z'></path> <path d='M15.5,0 L3.5,0 C3.224,0 3,0.224 3,0.5 L3,1.5 C3,1.776 3.224,2 3.5,2 L15.5,2 C15.776,2 16,1.776 16,1.5 L16,0.5 C16,0.224 15.776,0 15.5,0 Z'></path> <path d='M1.5,4 L0.5,4 C0.224,4 0,4.224 0,4.5 L0,5.5 C0,5.776 0.224,6 0.5,6 L1.5,6 C1.776,6 2,5.776 2,5.5 L2,4.5 C2,4.224 1.776,4 1.5,4 Z'></path> <path d='M3.5,6 L11.5,6 C11.776,6 12,5.776 12,5.5 L12,4.5 C12,4.224 11.776,4 11.5,4 L3.5,4 C3.224,4 3,4.224 3,4.5 L3,5.5 C3,5.776 3.224,6 3.5,6 Z'></path> <path d='M1.5,8 L0.5,8 C0.224,8 0,8.224 0,8.5 L0,9.5 C0,9.776 0.224,10 0.5,10 L1.5,10 C1.776,10 2,9.776 2,9.5 L2,8.5 C2,8.224 1.776,8 1.5,8 Z'></path> <path d='M13.5,8 L3.5,8 C3.224,8 3,8.224 3,8.5 L3,9.5 C3,9.776 3.224,10 3.5,10 L13.5,10 C13.776,10 14,9.776 14,9.5 L14,8.5 C14,8.224 13.776,8 13.5,8 Z'></path> </g> </g> </g> </svg>",
    SWITCH_CHANNEL_ICON_SVG: "<svg width='24px' height='24px' viewBox='0 0 24 24' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <g stroke='none' stroke-width='1' fill='inherit' fill-rule='evenodd'> <g transform='translate(-32.000000, -982.000000)' fill-rule='nonzero' fill='inherit'> <g> <g transform='translate(0.000000, 961.000000)'> <g transform='translate(32.000000, 21.000000)'> <path d='M21.5,0.5 L2.5,0.5 C1.121,0.5 0,1.622 0,3 L0,21 C0,22.378 1.121,23.5 2.5,23.5 L21.5,23.5 C22.879,23.5 24,22.378 24,21 L24,3 C24,1.622 22.879,0.5 21.5,0.5 Z M2.5,1.5 L21.5,1.5 C22.327,1.5 23,2.173 23,3 L23,4.5 L1,4.5 L1,3 C1,2.173 1.673,1.5 2.5,1.5 Z M21.5,22.5 L2.5,22.5 C1.673,22.5 1,21.827 1,21 L1,5.5 L23,5.5 L23,21 C23,21.827 22.327,22.5 21.5,22.5 Z'></path> <circle cx='2.5' cy='3' r='1'></circle> <circle cx='4.5' cy='3' r='1'></circle> <circle cx='6.5' cy='3' r='1'></circle> <path d='M19.146,16.94 C19.673,16.263 20,15.423 20,14.5 C20,12.294 18.206,10.5 16,10.5 C13.794,10.5 12,12.294 12,14.5 C12,16.706 13.794,18.5 16,18.5 C16.922,18.5 17.762,18.174 18.439,17.647 L21.146,20.354 C21.244,20.451 21.372,20.5 21.5,20.5 C21.628,20.5 21.756,20.451 21.853,20.354 C22.048,20.159 22.048,19.842 21.853,19.647 L19.146,16.94 Z M13,14.5 C13,12.846 14.346,11.5 16,11.5 C17.654,11.5 19,12.846 19,14.5 C19,16.154 17.654,17.5 16,17.5 C14.346,17.5 13,16.154 13,14.5 Z'></path> <path d='M2.5,8.5 L7.5,8.5 C7.776,8.5 8,8.276 8,8 C8,7.724 7.776,7.5 7.5,7.5 L2.5,7.5 C2.224,7.5 2,7.724 2,8 C2,8.276 2.224,8.5 2.5,8.5 Z'></path> <path d='M10.5,8.5 L13.5,8.5 C13.776,8.5 14,8.276 14,8 C14,7.724 13.776,7.5 13.5,7.5 L10.5,7.5 C10.224,7.5 10,7.724 10,8 C10,8.276 10.224,8.5 10.5,8.5 Z'></path> <path d='M21.5,7.5 L16.5,7.5 C16.224,7.5 16,7.724 16,8 C16,8.276 16.224,8.5 16.5,8.5 L21.5,8.5 C21.776,8.5 22,8.276 22,8 C22,7.724 21.776,7.5 21.5,7.5 Z'></path> <path d='M2.5,11.5 L5.5,11.5 C5.776,11.5 6,11.276 6,11 C6,10.724 5.776,10.5 5.5,10.5 L2.5,10.5 C2.224,10.5 2,10.724 2,11 C2,11.276 2.224,11.5 2.5,11.5 Z'></path> <path d='M8.5,11.5 L12.5,11.5 C12.776,11.5 13,11.276 13,11 C13,10.724 12.776,10.5 12.5,10.5 L8.5,10.5 C8.224,10.5 8,10.724 8,11 C8,11.276 8.224,11.5 8.5,11.5 Z'></path> <path d='M10.5,13.5 L7.5,13.5 C7.224,13.5 7,13.724 7,14 C7,14.276 7.224,14.5 7.5,14.5 L10.5,14.5 C10.776,14.5 11,14.276 11,14 C11,13.724 10.776,13.5 10.5,13.5 Z'></path> <path d='M2.5,14.5 L4.5,14.5 C4.776,14.5 5,14.276 5,14 C5,13.724 4.776,13.5 4.5,13.5 L2.5,13.5 C2.224,13.5 2,13.724 2,14 C2,14.276 2.224,14.5 2.5,14.5 Z'></path> <path d='M2.5,17.5 L8.5,17.5 C8.776,17.5 9,17.276 9,17 C9,16.724 8.776,16.5 8.5,16.5 L2.5,16.5 C2.224,16.5 2,16.724 2,17 C2,17.276 2.224,17.5 2.5,17.5 Z'></path> <path d='M10.5,19.5 L2.5,19.5 C2.224,19.5 2,19.724 2,20 C2,20.276 2.224,20.5 2.5,20.5 L10.5,20.5 C10.776,20.5 11,20.276 11,20 C11,19.724 10.776,19.5 10.5,19.5 Z'></path> </g> </g> </g> </g> </g> </svg>",
    ARCHIVE_ICON_SVG: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='14' height='14' viewBox='0 0 14 14'><path d='M8.5 6.5q0-0.203-0.148-0.352t-0.352-0.148h-2q-0.203 0-0.352 0.148t-0.148 0.352 0.148 0.352 0.352 0.148h2q0.203 0 0.352-0.148t0.148-0.352zM13 5v7.5q0 0.203-0.148 0.352t-0.352 0.148h-11q-0.203 0-0.352-0.148t-0.148-0.352v-7.5q0-0.203 0.148-0.352t0.352-0.148h11q0.203 0 0.352 0.148t0.148 0.352zM13.5 1.5v2q0 0.203-0.148 0.352t-0.352 0.148h-12q-0.203 0-0.352-0.148t-0.148-0.352v-2q0-0.203 0.148-0.352t0.352-0.148h12q0.203 0 0.352 0.148t0.148 0.352z'></path></svg>",
    THEMES: {
        default: {
            type: 'Mattermost',
            sidebarBg: '#145dbf',
            sidebarText: '#ffffff',
            sidebarUnreadText: '#ffffff',
            sidebarTextHoverBg: '#4578bf',
            sidebarTextActiveBorder: '#579eff',
            sidebarTextActiveColor: '#ffffff',
            sidebarHeaderBg: '#1153ab',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#06d6a0',
            awayIndicator: '#ffbc42',
            dndIndicator: '#f74343',
            mentionBg: '#ffffff',
            mentionColor: '#145dbf',
            centerChannelBg: '#ffffff',
            centerChannelColor: '#3d3c40',
            newMessageSeparator: '#ff8800',
            linkColor: '#2389d7',
            buttonBg: '#166de0',
            buttonColor: '#ffffff',
            errorTextColor: '#fd5960',
            mentionHighlightBg: '#ffe577',
            mentionHighlightLink: '#166de0',
            codeTheme: 'github',
            image: mattermostThemeImage
        },
        organization: {
            type: 'Organization',
            sidebarBg: '#2071a7',
            sidebarText: '#ffffff',
            sidebarUnreadText: '#ffffff',
            sidebarTextHoverBg: '#136197',
            sidebarTextActiveBorder: '#7ab0d6',
            sidebarTextActiveColor: '#ffffff',
            sidebarHeaderBg: '#2f81b7',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#7dbe00',
            awayIndicator: '#dcbd4e',
            dndIndicator: '#ff6a6a',
            mentionBg: '#fbfbfb',
            mentionColor: '#2071f7',
            centerChannelBg: '#f2f4f8',
            centerChannelColor: '#333333',
            newMessageSeparator: '#ff8800',
            linkColor: '#2f81b7',
            buttonBg: '#1dacfc',
            buttonColor: '#ffffff',
            errorTextColor: '#a94442',
            mentionHighlightBg: '#f3e197',
            mentionHighlightLink: '#2f81b7',
            codeTheme: 'github',
            image: defaultThemeImage
        },
        mattermostDark: {
            type: 'Mattermost Dark',
            sidebarBg: '#1b2c3e',
            sidebarText: '#ffffff',
            sidebarUnreadText: '#ffffff',
            sidebarTextHoverBg: '#4a5664',
            sidebarTextActiveBorder: '#66b9a7',
            sidebarTextActiveColor: '#ffffff',
            sidebarHeaderBg: '#1b2c3e',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#65dcc8',
            awayIndicator: '#c1b966',
            dndIndicator: '#e81023',
            mentionBg: '#b74a4a',
            mentionColor: '#ffffff',
            centerChannelBg: '#2f3e4e',
            centerChannelColor: '#dddddd',
            newMessageSeparator: '#5de5da',
            linkColor: '#a4ffeb',
            buttonBg: '#4cbba4',
            buttonColor: '#ffffff',
            errorTextColor: '#ff6461',
            mentionHighlightBg: '#984063',
            mentionHighlightLink: '#a4ffeb',
            codeTheme: 'solarized-dark',
            image: mattermostDarkThemeImage
        },
        windows10: {
            type: 'Windows Dark',
            sidebarBg: '#171717',
            sidebarText: '#ffffff',
            sidebarUnreadText: '#ffffff',
            sidebarTextHoverBg: '#302e30',
            sidebarTextActiveBorder: '#196caf',
            sidebarTextActiveColor: '#ffffff',
            sidebarHeaderBg: '#1f1f1f',
            sidebarHeaderTextColor: '#ffffff',
            onlineIndicator: '#399fff',
            awayIndicator: '#c1b966',
            dndIndicator: '#e81023',
            mentionBg: '#0177e7',
            mentionColor: '#ffffff',
            centerChannelBg: '#1f1f1f',
            centerChannelColor: '#dddddd',
            newMessageSeparator: '#cc992d',
            linkColor: '#0d93ff',
            buttonBg: '#0177e7',
            buttonColor: '#ffffff',
            errorTextColor: '#ff6461',
            mentionHighlightBg: '#784098',
            mentionHighlightLink: '#a4ffeb',
            codeTheme: 'monokai',
            image: windows10ThemeImage
        }
    },
    THEME_ELEMENTS: [
        {
            group: 'sidebarElements',
            id: 'sidebarBg',
            uiName: 'Sidebar BG'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarText',
            uiName: 'Sidebar Text'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarHeaderBg',
            uiName: 'Sidebar Header BG'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarHeaderTextColor',
            uiName: 'Sidebar Header Text'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarUnreadText',
            uiName: 'Sidebar Unread Text'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarTextHoverBg',
            uiName: 'Sidebar Text Hover BG'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarTextActiveBorder',
            uiName: 'Sidebar Text Active Border'
        },
        {
            group: 'sidebarElements',
            id: 'sidebarTextActiveColor',
            uiName: 'Sidebar Text Active Color'
        },
        {
            group: 'sidebarElements',
            id: 'onlineIndicator',
            uiName: 'Online Indicator'
        },
        {
            group: 'sidebarElements',
            id: 'awayIndicator',
            uiName: 'Away Indicator'
        },
        {
            group: 'sidebarElements',
            id: 'dndIndicator',
            uiName: 'Away Indicator'
        },
        {
            group: 'sidebarElements',
            id: 'mentionBg',
            uiName: 'Mention Jewel BG'
        },
        {
            group: 'sidebarElements',
            id: 'mentionColor',
            uiName: 'Mention Jewel Text'
        },
        {
            group: 'centerChannelElements',
            id: 'centerChannelBg',
            uiName: 'Center Channel BG'
        },
        {
            group: 'centerChannelElements',
            id: 'centerChannelColor',
            uiName: 'Center Channel Text'
        },
        {
            group: 'centerChannelElements',
            id: 'newMessageSeparator',
            uiName: 'New Message Separator'
        },
        {
            group: 'centerChannelElements',
            id: 'errorTextColor',
            uiName: 'Error Text Color'
        },
        {
            group: 'centerChannelElements',
            id: 'mentionHighlightBg',
            uiName: 'Mention Highlight BG'
        },
        {
            group: 'linkAndButtonElements',
            id: 'linkColor',
            uiName: 'Link Color'
        },
        {
            group: 'centerChannelElements',
            id: 'mentionHighlightLink',
            uiName: 'Mention Highlight Link'
        },
        {
            group: 'linkAndButtonElements',
            id: 'buttonBg',
            uiName: 'Button BG'
        },
        {
            group: 'linkAndButtonElements',
            id: 'buttonColor',
            uiName: 'Button Text'
        },
        {
            group: 'centerChannelElements',
            id: 'codeTheme',
            uiName: 'Code Theme',
            themes: [
                {
                    id: 'solarized-dark',
                    uiName: 'Solarized Dark',
                    cssURL: solarizedDarkCSS,
                    iconURL: solarizedDarkIcon
                },
                {
                    id: 'solarized-light',
                    uiName: 'Solarized Light',
                    cssURL: solarizedLightCSS,
                    iconURL: solarizedLightIcon
                },
                {
                    id: 'github',
                    uiName: 'GitHub',
                    cssURL: githubCSS,
                    iconURL: githubIcon
                },
                {
                    id: 'monokai',
                    uiName: 'Monokai',
                    cssURL: monokaiCSS,
                    iconURL: monokaiIcon
                }
            ]
        }
    ],
    DEFAULT_CODE_THEME: 'github',
    KeyCodes: {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        CAPS_LOCK: 20,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        INSERT: 45,
        DELETE: 46,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        CMD: 91,
        MENU: 93,
        NUMPAD_0: 96,
        NUMPAD_1: 97,
        NUMPAD_2: 98,
        NUMPAD_3: 99,
        NUMPAD_4: 100,
        NUMPAD_5: 101,
        NUMPAD_6: 102,
        NUMPAD_7: 103,
        NUMPAD_8: 104,
        NUMPAD_9: 105,
        MULTIPLY: 106,
        ADD: 107,
        SUBTRACT: 109,
        DECIMAL: 110,
        DIVIDE: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUM_LOCK: 144,
        SEMICOLON: 186,
        EQUAL: 187,
        COMMA: 188,
        DASH: 189,
        PERIOD: 190,
        FORWARD_SLASH: 191,
        TILDE: 192,
        OPEN_BRACKET: 219,
        BACK_SLASH: 220,
        CLOSE_BRACKET: 221
    },
    CODE_PREVIEW_MAX_FILE_SIZE: 500000, // 500 KB
    HighlightedLanguages: {
        actionscript: {name: 'ActionScript', extensions: ['as'], aliases: ['as', 'as3']},
        applescript: {name: 'AppleScript', extensions: ['applescript', 'osascript', 'scpt']},
        bash: {name: 'Bash', extensions: ['bash', 'sh', 'zsh']},
        clojure: {name: 'Clojure', extensions: ['clj', 'boot', 'cl2', 'cljc', 'cljs', 'cljs.hl', 'cljscm', 'cljx', 'hic']},
        coffeescript: {name: 'CoffeeScript', extensions: ['coffee', '_coffee', 'cake', 'cjsx', 'cson', 'iced'], aliases: ['coffee', 'coffee-script']},
        cpp: {name: 'C/C++', extensions: ['cpp', 'c', 'cc', 'h', 'c++', 'h++', 'hpp'], aliases: ['c++']},
        cs: {name: 'C#', extensions: ['cs', 'csharp'], aliases: ['c#', 'csharp']},
        css: {name: 'CSS', extensions: ['css']},
        d: {name: 'D', extensions: ['d', 'di'], aliases: ['dlang']},
        dart: {name: 'Dart', extensions: ['dart']},
        delphi: {name: 'Delphi', extensions: ['delphi', 'dpr', 'dfm', 'pas', 'pascal', 'freepascal', 'lazarus', 'lpr', 'lfm']},
        diff: {name: 'Diff', extensions: ['diff', 'patch'], aliases: ['patch', 'udiff']},
        django: {name: 'Django', extensions: ['django', 'jinja']},
        dockerfile: {name: 'Dockerfile', extensions: ['dockerfile', 'docker'], aliases: ['docker']},
        erlang: {name: 'Erlang', extensions: ['erl'], aliases: ['erl']},
        fortran: {name: 'Fortran', extensions: ['f90', 'f95']},
        fsharp: {name: 'F#', extensions: ['fsharp', 'fs']},
        gcode: {name: 'G-Code', extensions: ['gcode', 'nc']},
        go: {name: 'Go', extensions: ['go'], aliases: ['golang']},
        groovy: {name: 'Groovy', extensions: ['groovy']},
        handlebars: {name: 'Handlebars', extensions: ['handlebars', 'hbs', 'html.hbs', 'html.handlebars'], aliases: ['hbs', 'mustache']},
        haskell: {name: 'Haskell', extensions: ['hs'], aliases: ['hs']},
        haxe: {name: 'Haxe', extensions: ['hx']},
        java: {name: 'Java', extensions: ['java', 'jsp']},
        javascript: {name: 'JavaScript', extensions: ['js', 'jsx'], aliases: ['js']},
        json: {name: 'JSON', extensions: ['json']},
        julia: {name: 'Julia', extensions: ['jl'], aliases: ['jl']},
        kotlin: {name: 'Kotlin', extensions: ['kt', 'ktm', 'kts']},
        less: {name: 'Less', extensions: ['less']},
        lisp: {name: 'Lisp', extensions: ['lisp']},
        lua: {name: 'Lua', extensions: ['lua']},
        makefile: {name: 'Makefile', extensions: ['mk', 'mak'], aliases: ['make', 'mf', 'gnumake', 'bsdmake']},
        markdown: {name: 'Markdown', extensions: ['md', 'mkdown', 'mkd'], aliases: ['md', 'mkd']},
        matlab: {name: 'Matlab', extensions: ['matlab', 'm'], aliases: ['m']},
        objectivec: {name: 'Objective C', extensions: ['mm', 'objc', 'obj-c'], aliases: ['objective_c', 'objc']},
        ocaml: {name: 'OCaml', extensions: ['ml']},
        perl: {name: 'Perl', extensions: ['perl', 'pl'], aliases: ['pl']},
        php: {name: 'PHP', extensions: ['php', 'php3', 'php4', 'php5', 'php6'], aliases: ['php3', 'php4', 'php5']},
        powershell: {name: 'PowerShell', extensions: ['ps', 'ps1'], aliases: ['posh']},
        puppet: {name: 'Puppet', extensions: ['pp'], aliases: ['pp']},
        python: {name: 'Python', extensions: ['py', 'gyp'], aliases: ['py']},
        r: {name: 'R', extensions: ['r'], aliases: ['r', 's']},
        ruby: {name: 'Ruby', extensions: ['ruby', 'rb', 'gemspec', 'podspec', 'thor', 'irb'], aliases: ['rb']},
        rust: {name: 'Rust', extensions: ['rs'], aliases: ['rs']},
        scala: {name: 'Scala', extensions: ['scala']},
        scheme: {name: 'Scheme', extensions: ['scm', 'sld']},
        scss: {name: 'SCSS', extensions: ['scss']},
        smalltalk: {name: 'Smalltalk', extensions: ['st'], aliases: ['st', 'squeak']},
        sql: {name: 'SQL', extensions: ['sql']},
        stylus: {name: 'Stylus', extensions: ['styl'], aliases: ['styl']},
        swift: {name: 'Swift', extensions: ['swift']},
        tex: {name: 'TeX', extensions: ['tex'], aliases: ['latex']},
        text: {name: 'Text', extensions: ['txt']},
        vbnet: {name: 'VB.Net', extensions: ['vbnet', 'vb', 'bas'], aliases: ['vb', 'visualbasic']},
        vbscript: {name: 'VBScript', extensions: ['vbs']},
        verilog: {name: 'Verilog', extensions: ['v', 'veo']},
        xml: {name: 'HTML, XML', extensions: ['xml', 'html', 'xhtml', 'rss', 'atom', 'xsl', 'plist']},
        yaml: {name: 'YAML', extensions: ['yaml'], aliases: ['yml']}
    },
    PostsViewJumpTypes: {
        BOTTOM: 1,
        POST: 2,
        SIDEBAR_OPEN: 3
    },
    NotificationPrefs: {
        MENTION: 'mention'
    },
    Integrations: {
        COMMAND: 'commands',
        PAGE_SIZE: '10000',
        START_PAGE_NUM: 0,
        INCOMING_WEBHOOK: 'incoming_webhooks',
        OUTGOING_WEBHOOK: 'outgoing_webhooks',
        OAUTH_APP: 'oauth2-apps'
    },
    FeatureTogglePrefix: 'feature_enabled_',
    PRE_RELEASE_FEATURES: {
        MARKDOWN_PREVIEW: {
            label: 'markdown_preview', // github issue: https://github.com/mattermost/platform/pull/1389
            description: 'Show markdown preview option in message input box'
        },
        WEBRTC_PREVIEW: {
            label: 'webrtc_preview',
            description: 'Enable WebRTC one on one calls'
        }
    },
    OVERLAY_TIME_DELAY_SMALL: 100,
    OVERLAY_TIME_DELAY: 400,
    WEBRTC_TIME_DELAY: 750,
    WEBRTC_CLEAR_ERROR_DELAY: 15000,
    DEFAULT_MAX_USERS_PER_TEAM: 50,
    DEFAULT_MAX_CHANNELS_PER_TEAM: 2000,
    DEFAULT_MAX_NOTIFICATIONS_PER_CHANNEL: 1000,
    MIN_TEAMNAME_LENGTH: 2,
    MAX_TEAMNAME_LENGTH: 15,
    MAX_TEAMDESCRIPTION_LENGTH: 50,
    MIN_CHANNELNAME_LENGTH: 2,
    MAX_CHANNELNAME_LENGTH: 22,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 22,
    MAX_NICKNAME_LENGTH: 22,
    MIN_PASSWORD_LENGTH: 5,
    MAX_PASSWORD_LENGTH: 64,
    MAX_POSITION_LENGTH: 35,
    MIN_TRIGGER_LENGTH: 1,
    MAX_TRIGGER_LENGTH: 128,
    MAX_SITENAME_LENGTH: 30,
    MIN_HASHTAG_LINK_LENGTH: 3,
    CHANNEL_SCROLL_ADJUSTMENT: 100,
    EMOJI_PATH: '/static/emoji',
    RECENT_EMOJI_KEY: 'recentEmojis',
    DEFAULT_WEBHOOK_LOGO: logoWebhook,
    MHPNS: 'https://push.mattermost.com',
    MTPNS: 'http://push-test.mattermost.com',
    BOT_NAME: 'BOT',
    MAX_PREV_MSGS: 100,
    POST_COLLAPSE_TIMEOUT: 1000 * 60 * 5, // five minutes
    PERMISSIONS_ALL: 'all',
    PERMISSIONS_CHANNEL_ADMIN: 'channel_admin',
    PERMISSIONS_TEAM_ADMIN: 'team_admin',
    PERMISSIONS_SYSTEM_ADMIN: 'system_admin',
    PERMISSIONS_DELETE_POST_ALL: 'all',
    PERMISSIONS_DELETE_POST_TEAM_ADMIN: 'team_admin',
    PERMISSIONS_DELETE_POST_SYSTEM_ADMIN: 'system_admin',
    ALLOW_EDIT_POST_ALWAYS: 'always',
    ALLOW_EDIT_POST_NEVER: 'never',
    ALLOW_EDIT_POST_TIME_LIMIT: 'time_limit',
    DEFAULT_POST_EDIT_TIME_LIMIT: 300,
    MENTION_CHANNELS: 'mention.channels',
    MENTION_MORE_CHANNELS: 'mention.morechannels',
    MENTION_MEMBERS: 'mention.members',
    MENTION_NONMEMBERS: 'mention.nonmembers',
    MENTION_SPECIAL: 'mention.special',
    DEFAULT_NOTIFICATION_DURATION: 5000,
    STATUS_INTERVAL: 60000,
    AUTOCOMPLETE_TIMEOUT: 100,
    ANIMATION_TIMEOUT: 1000,
    SEARCH_TIMEOUT_MILLISECONDS: 100,
    DIAGNOSTICS_SEGMENT_KEY: 'fwb7VPbFeQ7SKp3wHm1RzFUuXZudqVok',
    TEST_ID_COUNT: 0,
    CENTER: 'center',
    RHS: 'rhs',
    RHS_ROOT: 'rhsroot',
    TEAMMATE_NAME_DISPLAY: {
        SHOW_USERNAME: 'username',
        SHOW_NICKNAME_FULLNAME: 'nickname_full_name',
        SHOW_FULLNAME: 'full_name'
    },
    SEARCH_POST: 'searchpost',
    CHANNEL_ID_LENGTH: 26
};

export default Constants;
