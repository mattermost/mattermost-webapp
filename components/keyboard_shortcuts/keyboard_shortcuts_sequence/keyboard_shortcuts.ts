// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MessageDescriptor} from 'react-intl';

import {t} from 'utils/i18n';

export type KeyboardShortcutDescriptor = MessageDescriptor | {default: MessageDescriptor; mac?: MessageDescriptor};

export function isMessageDescriptor(descriptor: KeyboardShortcutDescriptor): descriptor is MessageDescriptor {
    return Boolean((descriptor as MessageDescriptor).id);
}

export const KEYBOARD_SHORTCUTS = {
    mainHeader: {
        default: {
            id: t('shortcuts.header'),
            defaultMessage: 'Keyboard Shortcuts\tCtrl|/',
        },
        mac: {
            id: t('shortcuts.header.mac'),
            defaultMessage: 'Keyboard Shortcuts\t⌘|/',
        },
    },
    navPrev: {
        default: {
            id: t('shortcuts.nav.prev'),
            defaultMessage: 'Previous channel:\tAlt|Up',
        },
        mac: {
            id: t('shortcuts.nav.prev.mac'),
            defaultMessage: 'Previous channel:\t⌥|Up',
        },
    },
    navNext: {
        default: {
            id: t('shortcuts.nav.next'),
            defaultMessage: 'Next channel:\tAlt|Down',
        },
        mac: {
            id: t('shortcuts.nav.next.mac'),
            defaultMessage: 'Next channel:\t⌥|Down',
        },
    },
    navUnreadPrev: {
        default: {
            id: t('shortcuts.nav.unread_prev'),
            defaultMessage: 'Previous unread channel:\tAlt|Shift|Up',
        },
        mac: {
            id: t('shortcuts.nav.unread_prev.mac'),
            defaultMessage: 'Previous unread channel:\t⌥|Shift|Up',
        },
    },
    navUnreadNext: {
        default: {
            id: t('shortcuts.nav.unread_next'),
            defaultMessage: 'Next unread channel:\tAlt|Shift|Down',
        },
        mac: {
            id: t('shortcuts.nav.unread_next.mac'),
            defaultMessage: 'Next unread channel:\t⌥|Shift|Down',
        },
    },
    teamNavPrev: {
        default: {
            id: t('shortcuts.team_nav.prev'),
            defaultMessage: 'Previous team:\tCtrl|Alt|Up',
        },
        mac: {
            id: t('shortcuts.team_nav.prev.mac'),
            defaultMessage: 'Previous team:\t⌘|⌥|Up',
        },
    },
    teamNavNext: {
        default: {
            id: t('shortcuts.team_nav.next'),
            defaultMessage: 'Next team:\tCtrl|Alt|Down',
        },
        mac: {
            id: t('shortcuts.team_nav.next.mac'),
            defaultMessage: 'Next team:\t⌘|⌥|Down',
        },
    },
    teamNavSwitcher: {
        default: {
            id: t('shortcuts.team_nav.switcher'),
            defaultMessage: 'Switch to a specific team:\tCtrl|Alt|[1-9]',
        },
        mac: {
            id: t('shortcuts.team_nav.switcher.mac'),
            defaultMessage: 'Switch to a specific team:\t⌘|⌥|[1-9]',
        },
    },
    teamNavigation: {
        default: {
            id: t('team.button.tooltip'),
            defaultMessage: 'Ctrl|Alt|{order}',
        },
        mac: {
            id: t('team.button.tooltip.mac'),
            defaultMessage: '⌘|⌥|{order}',
        },
    },
    navSwitcher: {
        default: {
            id: t('shortcuts.nav.switcher'),
            defaultMessage: 'Quick channel switcher:\tCtrl|K',
        },
        mac: {
            id: t('shortcuts.nav.switcher.mac'),
            defaultMessage: 'Quick channel switcher:\t⌘|K',
        },
    },
    navDMMenu: {
        default: {
            id: t('shortcuts.nav.direct_messages_menu'),
            defaultMessage: 'Direct messages menu:\tCtrl|Shift|K',
        },
        mac: {
            id: t('shortcuts.nav.direct_messages_menu.mac'),
            defaultMessage: 'Direct messages menu:\t⌘|Shift|K',
        },
    },
    navSettings: {
        default: {
            id: t('shortcuts.nav.settings'),
            defaultMessage: 'Account settings:\tCtrl|Shift|A',
        },
        mac: {
            id: t('shortcuts.nav.settings.mac'),
            defaultMessage: 'Account settings:\t⌘|Shift|A',
        },
    },
    navMentions: {
        default: {
            id: t('shortcuts.nav.recent_mentions'),
            defaultMessage: 'Recent mentions:\tCtrl|Shift|M',
        },
        mac: {
            id: t('shortcuts.nav.recent_mentions.mac'),
            defaultMessage: 'Recent mentions:\t⌘|Shift|M',
        },
    },
    navFocusCenter: {
        default: {
            id: t('shortcuts.nav.focus_center'),
            defaultMessage: 'Set focus to input field:\tCtrl|Shift|L',
        },
        mac: {
            id: t('shortcuts.nav.focus_center.mac'),
            defaultMessage: 'Set focus to input field:\t⌘|Shift|L',
        },
    },
    navOpenCloseSidebar: {
        default: {
            id: t('shortcuts.nav.open_close_sidebar'),
            defaultMessage: 'Open or close the right sidebar\tCtrl|.',
        },
        mac: {
            id: t('shortcuts.nav.open_close_sidebar.mac'),
            defaultMessage: 'Open or close the right sidebar\t⌘|.',
        },
    },
    msgEdit: {
        id: t('shortcuts.msgs.edit'),
        defaultMessage: 'Edit last message in channel:\tUp',
    },
    msgReply: {
        id: t('shortcuts.msgs.reply'),
        defaultMessage: 'Reply to last message in channel:\tShift|Up',
    },
    msgReprintPrev: {
        default: {
            id: t('shortcuts.msgs.reprint_prev'),
            defaultMessage: 'Reprint previous message:\tCtrl|Up',
        },
        mac: {
            id: t('shortcuts.msgs.reprint_prev.mac'),
            defaultMessage: 'Reprint previous message:\t⌘|Up',
        },
    },
    msgReprintNext: {
        default: {
            id: t('shortcuts.msgs.reprint_next'),
            defaultMessage: 'Reprint next message:\tCtrl|Down',
        },
        mac: {
            id: t('shortcuts.msgs.reprint_next.mac'),
            defaultMessage: 'Reprint next message:\t⌘|Down',
        },
    },
    msgCompUsername: {
        id: t('shortcuts.msgs.comp.username'),
        defaultMessage: 'Username:\t@|[a-z]|Tab',
    },
    msgCompChannel: {
        id: t('shortcuts.msgs.comp.channel'),
        defaultMessage: 'Channel:\t~|[a-z]|Tab',
    },
    msgCompEmoji: {
        id: t('shortcuts.msgs.comp.emoji'),
        defaultMessage: 'Emoji:\t:|[a-z]|Tab',
    },
    msgLastReaction: {
        default: {
            id: t('shortcuts.msgs.comp.last_reaction'),
            defaultMessage: 'React to last message:\tCtrl|Shift|\u29F5',
        },
        mac: {
            id: t('shortcuts.msgs.comp.last_reaction.mac'),
            defaultMessage: 'React to last message:\t⌘|Shift|\u29F5',
        },
    },
    msgMarkdownBold: {
        default: {
            id: t('shortcuts.msgs.markdown.bold'),
            defaultMessage: 'Bold:\tCtrl|B',
        },
        mac: {
            id: t('shortcuts.msgs.markdown.bold.mac'),
            defaultMessage: 'Bold:\t⌘|B',
        },
    },
    msgMarkdownItalic: {
        default: {
            id: t('shortcuts.msgs.markdown.italic'),
            defaultMessage: 'Italic:\tCtrl|I',
        },
        mac: {
            id: t('shortcuts.msgs.markdown.italic.mac'),
            defaultMessage: 'Italic:\t⌘|I',
        },
    },
    msgMarkdownLink: {
        default: {
            id: t('shortcuts.msgs.markdown.link'),
            defaultMessage: 'Link:\tCtrl|Alt|K',
        },
        mac: {
            id: t('shortcuts.msgs.markdown.link.mac'),
            defaultMessage: 'Link:\t⌘|Alt|K',
        },
    },
    filesUpload: {
        default: {
            id: t('shortcuts.files.upload'),
            defaultMessage: 'Upload files:\tCtrl|U',
        },
        mac: {
            id: t('shortcuts.files.upload.mac'),
            defaultMessage: 'Upload files:\t⌘|U',
        },
    },
    browserChannelPrev: {
        default: {
            id: t('shortcuts.browser.channel_prev'),
            defaultMessage: 'Back in history:\tAlt|Left',
        },
        mac: {
            id: t('shortcuts.browser.channel_prev.mac'),
            defaultMessage: 'Back in history:\t⌘|[',
        },
    },
    browserChannelNext: {
        default: {
            id: t('shortcuts.browser.channel_next'),
            defaultMessage: 'Forward in history:\tAlt|Right',
        },
        mac: {
            id: t('shortcuts.browser.channel_next.mac'),
            defaultMessage: 'Forward in history:\t⌘|]',
        },
    },
    browserFontIncrease: {
        default: {
            id: t('shortcuts.browser.font_increase'),
            defaultMessage: 'Zoom in:\tCtrl|+',
        },
        mac: {
            id: t('shortcuts.browser.font_increase.mac'),
            defaultMessage: 'Zoom in:\t⌘|+',
        },
    },
    browserFontDecrease: {
        default: {
            id: t('shortcuts.browser.font_decrease'),
            defaultMessage: 'Zoom out:\tCtrl|-',
        },
        mac: {
            id: t('shortcuts.browser.font_decrease.mac'),
            defaultMessage: 'Zoom out:\t⌘|-',
        },
    },
    browserHighlightPrev: {
        id: t('shortcuts.browser.highlight_prev'),
        defaultMessage: 'Highlight text to the previous line:\tShift|Up',
    },
    browserHighlightNext: {
        id: t('shortcuts.browser.highlight_next'),
        defaultMessage: 'Highlight text to the next line:\tShift|Down',
    },
    browserNewline: {
        id: t('shortcuts.browser.newline'),
        defaultMessage: 'Create a new line:\tShift|Enter',
    },
};
