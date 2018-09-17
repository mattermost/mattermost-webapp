// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';
import {Posts} from 'mattermost-redux/constants';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {
    blendColors,
    changeOpacity,
} from 'mattermost-redux/utils/theme_utils';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {browserHistory} from 'utils/browser_history';
import {searchForTerm} from 'actions/post_actions';
import UserStore from 'stores/user_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import LocalizationStore from 'stores/localization_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import Constants, {FileTypes, UserStatuses} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import bing from 'images/bing.mp3';
import icon50 from 'images/icon50x50.png';
import iconWS from 'images/icon_WS.png';
import {getSiteURL} from 'utils/url';
import store from 'stores/redux_store.jsx';

export function isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function createSafeId(prop) {
    if (prop === null) {
        return null;
    }

    var str = '';

    if (prop.props && prop.props.defaultMessage) {
        str = prop.props.defaultMessage;
    } else {
        str = prop.toString();
    }

    return str.replace(new RegExp(' ', 'g'), '_');
}

export function cmdOrCtrlPressed(e, allowAlt = false) {
    if (allowAlt) {
        return (isMac() && e.metaKey) || (!isMac() && e.ctrlKey);
    }
    return (isMac() && e.metaKey) || (!isMac() && e.ctrlKey && !e.altKey);
}

export function isKeyPressed(event, key) {
    // There are two types of keyboards
    // 1. English with different layouts(Ex: Dvorak)
    // 2. Different language keyboards(Ex: Russian)

    if (event.keyCode === Constants.KeyCodes.COMPOSING[1]) {
        return false;
    }
    if (typeof event.code !== 'undefined' && event.code !== 'Unidentified' && key[2]) {
        const isPressedByCode = typeof key[2] === 'function' ? key[2](event.code) : event.code === key[2];

        // Returns true if the position of the key is validated. i.e Key K position irrespective of language.
        // Works consistently across different languages keyboards.
        // Do not return false because Layouts such as Dvorak will have Key k will be in different position.
        if (isPressedByCode) {
            return true;
        }
    }

    // checks for event.key for older browsers and also for the case of different English layout keyboards.
    if (typeof event.key !== 'undefined' && event.key !== 'Unidentified' && event.key !== 'Dead') {
        return event.key === key[0] || event.key === key[0].toUpperCase();
    }
    return event.keyCode === key[1];
}

export function isInRole(roles, inRole) {
    if (roles) {
        var parts = roles.split(' ');
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === inRole) {
                return true;
            }
        }
    }

    return false;
}

export function isChannelAdmin(isLicensed, roles) {
    if (!isLicensed) {
        return false;
    }

    if (isInRole(roles, 'channel_admin')) {
        return true;
    }

    return false;
}

export function isAdmin(roles) {
    if (isInRole(roles, 'team_admin')) {
        return true;
    }

    if (isInRole(roles, 'system_admin')) {
        return true;
    }

    return false;
}

export function isSystemAdmin(roles) {
    if (isInRole(roles, 'system_admin')) {
        return true;
    }

    return false;
}

var requestedNotificationPermission = false;

export function notifyMe(title, body, channel, teamId, silent) {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted' || (Notification.permission === 'default' && !requestedNotificationPermission)) {
        requestedNotificationPermission = true;

        if (typeof Notification.requestPermission === 'function') {
            Notification.requestPermission((permission) => {
                if (permission === 'granted') {
                    try {
                        let icon = icon50;
                        if (UserAgent.isEdge()) {
                            icon = iconWS;
                        }

                        const notification = new Notification(title, {body, tag: body, icon, requireInteraction: false, silent});
                        notification.onclick = () => {
                            window.focus();
                            if (channel && (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL)) {
                                browserHistory.push(TeamStore.getCurrentTeamRelativeUrl() + '/channels/' + channel.name);
                            } else if (channel) {
                                browserHistory.push(TeamStore.getTeamRelativeUrl(teamId) + '/channels/' + channel.name);
                            } else if (teamId) {
                                browserHistory.push(TeamStore.getTeamRelativeUrl(teamId) + `/channels/${Constants.DEFAULT_CHANNEL}`);
                            } else {
                                browserHistory.push(TeamStore.getCurrentTeamRelativeUrl() + `/channels/${Constants.DEFAULT_CHANNEL}`);
                            }
                        };

                        setTimeout(() => {
                            notification.close();
                        }, Constants.DEFAULT_NOTIFICATION_DURATION);
                    } catch (e) {
                        console.error(e); //eslint-disable-line no-console
                    }
                }
            });
        }
    }
}

var canDing = true;

export function ding() {
    if (hasSoundOptions() && canDing) {
        var audio = new Audio(bing);
        audio.play();
        canDing = false;
        setTimeout(() => {
            canDing = true;
        }, 3000);
    }
}

export function hasSoundOptions() {
    return (!(UserAgent.isFirefox()) && !(UserAgent.isEdge()));
}

export function getDateForUnixTicks(ticks) {
    return new Date(ticks);
}

export function displayDate(ticks) {
    var d = new Date(ticks);
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

export function displayTime(ticks, utc) {
    const d = new Date(ticks);
    let hours;
    let minutes;
    let ampm = '';
    let timezone = '';

    if (utc) {
        hours = d.getUTCHours();
        minutes = d.getUTCMinutes();
        timezone = ' UTC';
    } else {
        hours = d.getHours();
        minutes = d.getMinutes();
    }

    if (minutes <= 9) {
        minutes = '0' + minutes;
    }

    const useMilitaryTime = PreferenceStore.getBool(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time');
    if (!useMilitaryTime) {
        ampm = ' AM';
        if (hours >= 12) {
            ampm = ' PM';
        }

        hours %= 12;
        if (!hours) {
            hours = '12';
        }
    }

    return hours + ':' + minutes + ampm + timezone;
}

// returns Unix timestamp in milliseconds
export function getTimestamp() {
    return Date.now();
}

// Replaces all occurrences of a pattern
export function loopReplacePattern(text, pattern, replacement) {
    let result = text;

    let match = pattern.exec(result);
    while (match) {
        result = result.replace(pattern, replacement);
        match = pattern.exec(result);
    }

    return result;
}

// extracts the first link from the text
export function extractFirstLink(text) {
    const pattern = /(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/i;
    let inText = text;

    // strip out code blocks
    inText = inText.replace(/`[^`]*`/g, '');

    // strip out inline markdown images
    inText = inText.replace(/!\[[^\]]*]\([^)]*\)/g, '');

    // remove markdown *, ~~ and _ characters
    inText = loopReplacePattern(inText, /(\*|~~)(.*?)\1/, '$2');
    inText = loopReplacePattern(inText, /([\s\n]|^)_(.*?)_([\s\n]|$)/, '$1$2$3');

    const match = pattern.exec(inText);
    if (match) {
        return match[0].trim();
    }

    return '';
}

// Taken from http://stackoverflow.com/questions/1068834/object-comparison-in-javascript and modified slightly
export function areObjectsEqual(x, y) {
    let p;
    const leftChain = [];
    const rightChain = [];

    // Remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    if (x instanceof Map && y instanceof Map) {
        return areMapsEqual(x, y);
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false;
    }

    // Quick checking of one object being a subset of another.
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        } else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) { //eslint-disable-line guard-for-in
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        } else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
        case 'object':
        case 'function':

            leftChain.push(x);
            rightChain.push(y);

            if (!areObjectsEqual(x[p], y[p])) {
                return false;
            }

            leftChain.pop();
            rightChain.pop();
            break;

        default:
            if (x[p] !== y[p]) {
                return false;
            }
            break;
        }
    }

    return true;
}

export function areMapsEqual(a, b) {
    if (a.size !== b.size) {
        return false;
    }

    for (const [key, value] of a) {
        if (!b.has(key)) {
            return false;
        }

        if (!areObjectsEqual(value, b.get(key))) {
            return false;
        }
    }

    return true;
}

export function replaceHtmlEntities(text) {
    var tagsToReplace = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
    };
    var newtext = text;
    for (var tag in tagsToReplace) {
        if (Reflect.apply({}.hasOwnProperty, this, [tagsToReplace, tag])) {
            var regex = new RegExp(tag, 'g');
            newtext = newtext.replace(regex, tagsToReplace[tag]);
        }
    }
    return newtext;
}

export function insertHtmlEntities(text) {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
    };
    var newtext = text;
    for (var tag in tagsToReplace) {
        if (Reflect.apply({}.hasOwnProperty, this, [tagsToReplace, tag])) {
            var regex = new RegExp(tag, 'g');
            newtext = newtext.replace(regex, tagsToReplace[tag]);
        }
    }
    return newtext;
}

export function isGIFImage(extin) {
    return extin.toLowerCase() === Constants.IMAGE_TYPE_GIF;
}

const removeQuerystringOrHash = (extin) => {
    return extin.split(/[?#]/)[0];
};

export const getFileType = (extin) => {
    const ext = removeQuerystringOrHash(extin.toLowerCase());

    if (Constants.IMAGE_TYPES.indexOf(ext) > -1) {
        return FileTypes.IMAGE;
    }

    if (Constants.AUDIO_TYPES.indexOf(ext) > -1) {
        return FileTypes.AUDIO;
    }

    if (Constants.VIDEO_TYPES.indexOf(ext) > -1) {
        return FileTypes.VIDEO;
    }

    if (Constants.SPREADSHEET_TYPES.indexOf(ext) > -1) {
        return FileTypes.SPREADSHEET;
    }

    if (Constants.CODE_TYPES.indexOf(ext) > -1) {
        return FileTypes.CODE;
    }

    if (Constants.WORD_TYPES.indexOf(ext) > -1) {
        return FileTypes.WORD;
    }

    if (Constants.PRESENTATION_TYPES.indexOf(ext) > -1) {
        return FileTypes.PRESENTATION;
    }

    if (Constants.PDF_TYPES.indexOf(ext) > -1) {
        return FileTypes.PDF;
    }

    if (Constants.PATCH_TYPES.indexOf(ext) > -1) {
        return FileTypes.PATCH;
    }

    if (Constants.SVG_TYPES.indexOf(ext) > -1) {
        return FileTypes.SVG;
    }

    return FileTypes.OTHER;
};

export function getFileIconPath(fileInfo) {
    const fileType = getFileType(fileInfo.extension);

    var icon;
    if (fileType in Constants.ICON_FROM_TYPE) {
        icon = Constants.ICON_FROM_TYPE[fileType];
    } else {
        icon = Constants.ICON_FROM_TYPE.other;
    }

    return icon;
}

export function getIconClassName(fileTypeIn) {
    var fileType = fileTypeIn.toLowerCase();

    if (fileType in Constants.ICON_NAME_FROM_TYPE) {
        return Constants.ICON_NAME_FROM_TYPE[fileType];
    }

    return 'generic';
}

export function sortFilesByName(files) {
    const locale = LocalizationStore.getLocale();
    return Array.from(files).sort((a, b) => a.name.localeCompare(b.name, locale, {numeric: true}));
}

export function toTitleCase(str) {
    function doTitleCase(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
    return str.replace(/\w\S*/g, doTitleCase);
}

export function isHexColor(value) {
    return value && (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i).test(value);
}

export function applyTheme(theme) {
    if (theme.sidebarBg) {
        changeCss('.app__body .sidebar--left .sidebar__switcher, .sidebar--left, .sidebar--left .sidebar__divider .sidebar__divider__text, .app__body .modal .settings-modal .settings-table .settings-links, .app__body .sidebar--menu', 'background:' + theme.sidebarBg);
        changeCss('body.app__body', 'scrollbar-face-color:' + theme.sidebarBg);
        changeCss('@media(max-width: 768px){.app__body .modal .settings-modal:not(.settings-modal--tabless):not(.display--content) .modal-content', 'background:' + theme.sidebarBg);
    }

    if (theme.sidebarText) {
        changeCss('.app__body .ps-container > .ps-scrollbar-y-rail > .ps-scrollbar-y', 'background:' + theme.sidebarText);
        changeCss('.app__body .ps-container:hover .ps-scrollbar-y-rail:hover, .app__body .sidebar__switcher button:hover', 'background:' + changeOpacity(theme.sidebarText, 0.15));
        changeCss('.app__body .sidebar--left .nav-pills__container li > h4, .app__body .sidebar--left .nav-pills__container li .sidebar-item, .app__body .sidebar--left .nav-pills__container li > .nav-more, .app__body .sidebar--right, .app__body .modal .settings-modal .nav-pills>li button', 'color:' + changeOpacity(theme.sidebarText, 0.6));
        changeCss('@media(max-width: 768px){.app__body .modal .settings-modal .settings-table .nav>li>a, .app__body .sidebar--menu', 'color:' + changeOpacity(theme.sidebarText, 0.8));
        changeCss('.app__body .sidebar--left .add-channel-btn', 'color:' + changeOpacity(theme.sidebarText, 0.8));
        changeCss('.sidebar--left .add-channel-btn:hover, .sidebar--left .add-channel-btn:focus', 'color:' + theme.sidebarText);
        changeCss('.sidebar--left .status .offline--icon, .app__body .sidebar--menu svg, .app__body .sidebar-item .icon', 'fill:' + theme.sidebarText);
        changeCss('.sidebar--left .status.status--group', 'background:' + changeOpacity(theme.sidebarText, 0.3));
        changeCss('@media(max-width: 768px){.app__body .modal .settings-modal .settings-table .nav>li>button, .app__body .sidebar--menu .divider', 'border-color:' + changeOpacity(theme.sidebarText, 0.2));
        changeCss('@media(max-width: 768px){.app__body .modal .settings-modal .settings-table .nav>li>button, .app__body .modal .settings-modal .settings-table .nav>li.active>button', 'color:' + theme.sidebarText);
        changeCss('.app__body .sidebar--left .sidebar__switcher', 'border-color:' + changeOpacity(theme.sidebarText, 0.2));
        changeCss('@media(max-width: 768px){.sidebar--left .add-channel-btn:hover, .sidebar--left .add-channel-btn:focus', 'color:' + changeOpacity(theme.sidebarText, 0.6));
        changeCss('@media(max-width: 768px){.app__body .search__icon svg', 'stroke:' + theme.sidebarText);
        changeCss('.app__body .sidebar--left .sidebar__switcher span', 'color:' + theme.sidebarText);
        changeCss('.app__body .sidebar--left .sidebar__switcher button svg', 'fill:' + theme.sidebarText);
        changeCss('.channel-header .channel-header_plugin-dropdown a, .app__body .sidebar__switcher button', 'background:' + changeOpacity(theme.sidebarText, 0.08));
    }

    if (theme.sidebarUnreadText) {
        changeCss('.sidebar--left .nav-pills__container li .sidebar-item.unread-title', 'color:' + theme.sidebarUnreadText);
    }

    if (theme.sidebarTextHoverBg) {
        changeCss('.sidebar--left .nav-pills__container li .sidebar-item:hover, .sidebar--left .nav-pills__container li > .nav-more:hover, .app__body .modal .settings-modal .nav-pills>li:hover button', 'background:' + theme.sidebarTextHoverBg);
    }

    if (theme.sidebarTextActiveBorder) {
        changeCss('.sidebar--left .nav li.active .sidebar-item:before, .app__body .modal .settings-modal .nav-pills>li.active button:before', 'background:' + theme.sidebarTextActiveBorder);
        changeCss('.sidebar--left .sidebar__divider:before', 'background:' + changeOpacity(theme.sidebarTextActiveBorder, 0.5));
        changeCss('.sidebar--left .sidebar__divider', 'color:' + theme.sidebarTextActiveBorder);
        changeCss('.multi-teams .team-sidebar .team-wrapper .team-container.active:before', 'background:' + theme.sidebarTextActiveBorder);
        changeCss('.multi-teams .team-sidebar .team-wrapper .team-container.unread:before', 'background:' + theme.sidebarTextActiveBorder);
    }

    if (theme.sidebarTextActiveColor) {
        changeCss('.sidebar--left .nav-pills__container li.active .sidebar-item, .sidebar--left .nav-pills__container li.active .sidebar-item:hover, .sidebar--left .nav-pills__container li.active .sidebar-item:focus, .app__body .modal .settings-modal .nav-pills>li.active button, .app__body .modal .settings-modal .nav-pills>li.active button:hover, .app__body .modal .settings-modal .nav-pills>li.active button:active', 'color:' + theme.sidebarTextActiveColor);
        changeCss('.sidebar--left .nav li.active .sidebar-item, .sidebar--left .nav li.active .sidebar-item:hover, .sidebar--left .nav li.active .sidebar-item:focus', 'background:' + changeOpacity(theme.sidebarTextActiveColor, 0.1));
        changeCss('@media(max-width: 768px){.app__body .modal .settings-modal .nav-pills > li.active button', 'color:' + changeOpacity(theme.sidebarText, 0.8));
    }

    if (theme.sidebarHeaderBg) {
        changeCss('.app__body #status-dropdown .status-wrapper .status, .app__body #status-dropdown .status-wrapper .status-edit, .sidebar--left .team__header, .app__body .sidebar--menu .team__header, .app__body .post-list__timestamp > div', 'background:' + theme.sidebarHeaderBg);
        changeCss('.app__body .modal .modal-header', 'background:' + theme.sidebarHeaderBg);
        changeCss('.app__body .multi-teams .team-sidebar, .app__body #navbar .navbar-default', 'background:' + theme.sidebarHeaderBg);
        changeCss('@media(max-width: 768px){.app__body .search-bar__container', 'background:' + theme.sidebarHeaderBg);
        changeCss('.app__body .attachment .attachment__container', 'border-left-color:' + theme.sidebarHeaderBg);
    }

    if (theme.sidebarHeaderTextColor) {
        changeCss('.app__body #status-dropdown .status-wrapper .status, .app__body #status-dropdown .status-wrapper .status-edit, .multi-teams .team-sidebar .team-wrapper .team-container .team-btn, .sidebar--left .team__header .header__info, .app__body .sidebar--menu .team__header .header__info, .app__body .post-list__timestamp > div', 'color:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body .icon--sidebarHeaderTextColor svg, .app__body .sidebar-header-dropdown__icon svg', 'fill:' + theme.sidebarHeaderTextColor);
        changeCss('.sidebar--left .team__header .user__name, .app__body .sidebar--menu .team__header .user__name', 'color:' + changeOpacity(theme.sidebarHeaderTextColor, 0.8));
        changeCss('.sidebar--left .team__header:hover .user__name, .app__body .sidebar--menu .team__header:hover .user__name', 'color:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body .modal .modal-header .modal-title, .app__body .modal .modal-header .modal-title .name, .app__body .modal .modal-header button.close', 'color:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body #navbar .navbar-default .navbar-brand .dropdown-toggle', 'color:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body #navbar .navbar-default .navbar-toggle .icon-bar', 'background:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body .post-list__timestamp > div, .app__body .multi-teams .team-sidebar .team-wrapper .team-container a:hover .team-btn__content, .app__body .multi-teams .team-sidebar .team-wrapper .team-container.active .team-btn__content', 'border-color:' + changeOpacity(theme.sidebarHeaderTextColor, 0.5));
        changeCss('.app__body .team-btn', 'border-color:' + changeOpacity(theme.sidebarHeaderTextColor, 0.3));
        changeCss('@media(max-width: 768px){.app__body .search-bar__container', 'color:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body .navbar-right__icon', 'background:' + changeOpacity(theme.sidebarHeaderTextColor, 0.2));
        changeCss('.app__body .navbar-right__icon:hover, .app__body .navbar-right__icon:focus', 'background:' + changeOpacity(theme.sidebarHeaderTextColor, 0.3));
        changeCss('.app__body .navbar-right__icon svg', 'fill:' + theme.sidebarHeaderTextColor);
        changeCss('.app__body .navbar-right__icon svg', 'stroke:' + theme.sidebarHeaderTextColor);
        changeCss('.team-sidebar .fa', 'color:' + theme.sidebarHeaderTextColor);
    }

    if (theme.onlineIndicator) {
        changeCss('.app__body .status.status--online', 'color:' + theme.onlineIndicator);
        changeCss('.app__body .status .online--icon', 'fill:' + theme.onlineIndicator);
    }

    if (theme.awayIndicator) {
        changeCss('.app__body .status.status--away', 'color:' + theme.awayIndicator);
        changeCss('.app__body .status .away--icon', 'fill:' + theme.awayIndicator);
    }

    let dndIndicator;
    if (theme.dndIndicator) {
        dndIndicator = theme.dndIndicator;
    } else {
        switch (theme.type) {
        case 'Organization':
            dndIndicator = Constants.THEMES.organization.dndIndicator;
            break;
        case 'Mattermost Dark':
            dndIndicator = Constants.THEMES.mattermostDark.dndIndicator;
            break;
        case 'Windows Dark':
            dndIndicator = Constants.THEMES.windows10.dndIndicator;
            break;
        default:
            dndIndicator = Constants.THEMES.default.dndIndicator;
            break;
        }
    }
    changeCss('.app__body .status.status--dnd', 'color:' + dndIndicator);
    changeCss('.app__body .status .dnd--icon', 'fill:' + dndIndicator);

    // Including 'mentionBj' for backwards compatability (old typo)
    const mentionBg = theme.mentionBg || theme.mentionBj;
    if (mentionBg) {
        changeCss('.sidebar--left .nav-pills__unread-indicator', 'background:' + mentionBg);
        changeCss('.app__body .sidebar--left .badge, .app__body .list-group-item.active > .badge, .nav-pills > .active > a > .badge', 'background:' + mentionBg);
        changeCss('.multi-teams .team-sidebar .badge, .app__body .list-group-item.active > .badge, .nav-pills > .active > a > .badge', 'background:' + mentionBg);
    }

    if (theme.mentionColor) {
        changeCss('.sidebar--left .nav-pills__unread-indicator svg', 'fill:' + theme.mentionColor);
        changeCss('.app__body .sidebar--left .nav-pills__unread-indicator', 'color:' + theme.mentionColor);
        changeCss('.app__body .sidebar--left .badge, .app__body .list-group-item.active > .badge, .nav-pills > .active > a > .badge', 'color:' + theme.mentionColor);
        changeCss('.app__body .multi-teams .team-sidebar .badge, .app__body .list-group-item.active > .badge, .nav-pills > .active > a > .badge', 'color:' + theme.mentionColor);
    }

    if (theme.centerChannelBg) {
        changeCss('@media(max-width: 640px){.app__body .post .dropdown .dropdown-menu button', 'background:' + theme.centerChannelBg);
        changeCss('@media(min-width: 768px){.app__body .post:hover .post__header .col__reply, .app__body .post.post--hovered .post__header .col__reply', 'background:' + theme.centerChannelBg);
        changeCss('@media(max-width: 320px){.tutorial-steps__container', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .bg--white, .app__body .system-notice, .app__body .channel-header__info .channel-header__description:before, .app__body .app__content, .app__body .markdown__table, .app__body .markdown__table tbody tr, .app__body .suggestion-list__content, .app__body .modal .modal-content, .app__body .modal .modal-footer, .app__body .post.post--compact .post-image__column, .app__body .suggestion-list__divider > span, .app__body .status-wrapper .status, .app__body .alert.alert-transparent, .app__body .post-image__column', 'background:' + theme.centerChannelBg);
        changeCss('#post-list .post-list-holder-by-time, .app__body .post .dropdown-menu a', 'background:' + theme.centerChannelBg);
        changeCss('#post-create, .app__body .emoji-picker__preview', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .date-separator .separator__text, .app__body .new-separator .separator__text', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .post-image__details, .app__body .search-help-popover .search-autocomplete__divider span', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .sidebar--right, .app__body .dropdown-menu, .app__body .popover, .app__body .tip-overlay', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .popover.bottom>.arrow:after', 'border-bottom-color:' + theme.centerChannelBg);
        changeCss('.app__body .popover.right>.arrow:after, .app__body .tip-overlay.tip-overlay--sidebar .arrow, .app__body .tip-overlay.tip-overlay--header .arrow', 'border-right-color:' + theme.centerChannelBg);
        changeCss('.app__body .popover.left>.arrow:after', 'border-left-color:' + theme.centerChannelBg);
        changeCss('.app__body .popover.top>.arrow:after, .app__body .tip-overlay.tip-overlay--chat .arrow', 'border-top-color:' + theme.centerChannelBg);
        changeCss('@media(min-width: 768px){.app__body .form-control', 'background:' + theme.centerChannelBg);
        changeCss('@media(min-width: 768px){.app__body .sidebar--right.sidebar--right--expanded .sidebar-right-container', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .attachment__content, .app__body .attachment-actions button', 'background:' + theme.centerChannelBg);
        changeCss('body.app__body', 'scrollbar-face-color:' + theme.centerChannelBg);
        changeCss('body.app__body', 'scrollbar-track-color:' + theme.centerChannelBg);
        changeCss('.app__body .shortcut-key, .app__body .post-list__new-messages-below', 'color:' + theme.centerChannelBg);
        changeCss('.app__body .emoji-picker, .app__body .emoji-picker__search', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .nav-tabs, .app__body .nav-tabs > li.active > a', 'background:' + theme.centerChannelBg);
        changeCss('.app__body .post .file-view--single', `background:${theme.centerChannelBg}`);

        // Fade out effect for collapsed posts (not hovered, not from current user)
        changeCss(
            '.app__body .post-list__table .post:not(.current--user) .post-collapse__gradient, ' +
            '.app__body .sidebar-right__body .post:not(.current--user) .post-collapse__gradient, ' +
            '.app__body .post-list__table .post.post--compact .post-collapse__gradient, ' +
            '.app__body .sidebar-right__body .post.post--compact .post-collapse__gradient',
            `background:linear-gradient(${changeOpacity(theme.centerChannelBg, 0)}, ${theme.centerChannelBg})`,
        );
        changeCss(
            '.app__body .post-list__table .post-attachment-collapse__gradient, ' +
            '.app__body .sidebar-right__body .post-attachment-collapse__gradient',
            `background:linear-gradient(${changeOpacity(theme.centerChannelBg, 0)}, ${theme.centerChannelBg})`,
        );

        changeCss(
            '.app__body .post-list__table .post:not(.current--user) .post-collapse__show-more, ' +
            '.app__body .sidebar-right__body .post:not(.current--user) .post-collapse__show-more, ' +
            '.app__body .post-list__table .post.post--compact .post-collapse__show-more, ' +
            '.app__body .sidebar-right__body .post.post--compact .post-collapse__show-more',
            `background-color:${theme.centerChannelBg}`,
        );
        changeCss(
            '.app__body .post-list__table .post-attachment-collapse__show-more, ' +
            '.app__body .sidebar-right__body .post-attachment-collapse__show-more',
            `background-color:${theme.centerChannelBg}`,
        );

        changeCss('.app__body .post-collapse__show-more-button:hover', `color:${theme.centerChannelBg}`);
        changeCss('.app__body .post-collapse__show-more-button', `background:${theme.centerChannelBg}`);
    }

    if (theme.centerChannelColor) {
        changeCss('.app__body .svg-text-color', 'fill:' + theme.centerChannelColor);
        changeCss('.app__body .mentions__name .status.status--group, .app__body .multi-select__note', 'background:' + changeOpacity(theme.centerChannelColor, 0.12));
        changeCss('.app__body .system-notice, .app__body .file-view--single .file__image .image-loaded, .app__body .post .dropdown .dropdown-menu button, .app__body .member-list__popover .more-modal__body, .app__body .alert.alert-transparent, .app__body .channel-header .channel-header__icon, .app__body .search-bar__container .search__form, .app__body .table > thead > tr > th, .app__body .table > tbody > tr > td', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.12));
        changeCss('.app__body .post-list__arrows, .app__body .post .flag-icon__container', 'fill:' + changeOpacity(theme.centerChannelColor, 0.3));
        changeCss('@media(min-width: 768px){.app__body .search__icon svg', 'stroke:' + changeOpacity(theme.centerChannelColor, 0.4));
        changeCss('.app__body .post-image__details .post-image__download svg', 'stroke:' + changeOpacity(theme.centerChannelColor, 0.4));
        changeCss('.app__body .post-image__details .post-image__download svg', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.35));
        changeCss('.app__body .channel-header__icon svg', 'fill:' + changeOpacity(theme.centerChannelColor, 0.4));
        changeCss('.app__body .channel-header__icon .icon--stroke svg', 'stroke:' + changeOpacity(theme.centerChannelColor, 0.4));
        changeCss('.app__body .channel-header__icon .icon--stroke.icon__search svg', 'stroke:' + changeOpacity(theme.centerChannelColor, 0.55));
        changeCss('.app__body .modal .status .offline--icon, .app__body .channel-header__links .icon, .app__body .sidebar--right .sidebar--right__subheader .usage__icon, .app__body .more-modal__header svg, .app__body .icon--body', 'fill:' + theme.centerChannelColor);
        changeCss('@media(min-width: 768px){.app__body .post:hover .post__header .col__reply, .app__body .post.post--hovered .post__header .col__reply', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .DayPicker .DayPicker-Caption, .app__body .modal .settings-modal .team-img-preview div, .app__body .modal .settings-modal .team-img__container div, .app__body .system-notice__footer, .app__body .system-notice__footer .btn:last-child, .app__body .modal .shortcuts-modal .subsection, .app__body .sidebar--right .sidebar--right__header, .app__body .channel-header, .app__body .nav-tabs > li > a:hover, .app__body .nav-tabs, .app__body .nav-tabs > li.active > a, .app__body .nav-tabs, .app__body .nav-tabs > li.active > a:focus, .app__body .nav-tabs, .app__body .nav-tabs > li.active > a:hover, .app__body .post .dropdown-menu a, .sidebar--left, .app__body .suggestion-list__content .command, .app__body .channel-archived__message', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .post.post--system .post__body, .app__body .modal .channel-switch-modal .modal-header .close', 'color:' + changeOpacity(theme.centerChannelColor, 0.6));
        changeCss('.app__body .nav-tabs, .app__body .nav-tabs > li.active > a, pp__body .input-group-addon, .app__body .app__content, .app__body .post-create__container .post-create-body .btn-file, .app__body .post-create__container .post-create-footer .msg-typing, .app__body .suggestion-list__content .command, .app__body .modal .modal-content, .app__body .dropdown-menu, .app__body .popover, .app__body .mentions__name, .app__body .tip-overlay, .app__body .form-control[disabled], .app__body .form-control[readonly], .app__body fieldset[disabled] .form-control', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .post .post__link', 'color:' + changeOpacity(theme.centerChannelColor, 0.65));
        changeCss('.app__body #archive-link-home, .video-div .video-thumbnail__error', 'background:' + changeOpacity(theme.centerChannelColor, 0.15));
        changeCss('.app__body #post-create', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .mentions--top, .app__body .suggestion-list', 'box-shadow:' + changeOpacity(theme.centerChannelColor, 0.2) + ' 1px -3px 12px');
        changeCss('.app__body .mentions--top, .app__body .suggestion-list', '-webkit-box-shadow:' + changeOpacity(theme.centerChannelColor, 0.2) + ' 1px -3px 12px');
        changeCss('.app__body .mentions--top, .app__body .suggestion-list', '-moz-box-shadow:' + changeOpacity(theme.centerChannelColor, 0.2) + ' 1px -3px 12px');
        changeCss('.app__body .dropdown-menu, .app__body .popover ', 'box-shadow: 0 17px 50px 0 ' + changeOpacity(theme.centerChannelColor, 0.1) + ', 0 12px 15px 0 ' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .dropdown-menu, .app__body .popover ', '-moz-box-shadow: 0 17px 50px 0 ' + changeOpacity(theme.centerChannelColor, 0.1) + ', 0 12px 15px 0 ' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .dropdown-menu, .app__body .popover ', '-webkit-box-shadow: 0 17px 50px 0 ' + changeOpacity(theme.centerChannelColor, 0.1) + ', 0 12px 15px 0 ' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .shadow--2', 'box-shadow: 0 20px 30px 0' + changeOpacity(theme.centerChannelColor, 0.1) + ', 0 14px 20px 0 ' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .shadow--2', '-moz-box-shadow: 0  20px 30px 0 ' + changeOpacity(theme.centerChannelColor, 0.1) + ', 0 14px 20px 0 ' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .shadow--2', '-webkit-box-shadow: 0  20px 30px 0 ' + changeOpacity(theme.centerChannelColor, 0.1) + ', 0 14px 20px 0 ' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .shortcut-key, .app__body .post__body hr, .app__body .loading-screen .loading__content .round, .app__body .tutorial__circles .circle', 'background:' + theme.centerChannelColor);
        changeCss('.app__body .channel-header .heading', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .col__reply > button:hover, .app__body .col__reply > a:hover, .app__body .col__reply > div:hover, .app__body .markdown__table tbody tr:nth-child(2n)', 'background:' + changeOpacity(theme.centerChannelColor, 0.07));
        changeCss('.app__body .channel-header__info .header-dropdown__icon', 'color:' + changeOpacity(theme.centerChannelColor, 0.8));
        changeCss('.app__body .post-create__container .post-create-body .send-button.disabled i, .app__body .channel-header #member_popover', 'color:' + changeOpacity(theme.centerChannelColor, 0.4));
        changeCss('.app__body .channel-header .pinned-posts-button svg', 'fill:' + changeOpacity(theme.centerChannelColor, 0.6));
        changeCss('.app__body .channel-header .channel-header_plugin-dropdown svg', 'fill:' + changeOpacity(theme.centerChannelColor, 0.6));
        changeCss('.app__body .custom-textarea, .app__body .custom-textarea:focus, .app__body .file-preview, .app__body .post-image__details, .app__body .sidebar--right .sidebar-right__body, .app__body .markdown__table th, .app__body .markdown__table td, .app__body .suggestion-list__content, .app__body .modal .modal-content, .app__body .modal .settings-modal .settings-table .settings-content .divider-light, .app__body .webhooks__container, .app__body .dropdown-menu, .app__body .modal .modal-header', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .popover.bottom>.arrow', 'border-bottom-color:' + changeOpacity(theme.centerChannelColor, 0.25));
        changeCss('.app__body .btn.btn-transparent, .app__body .search-help-popover .search-autocomplete__divider span, .app__body .suggestion-list__divider > span', 'color:' + changeOpacity(theme.centerChannelColor, 0.7));
        changeCss('.app__body .popover.right>.arrow', 'border-right-color:' + changeOpacity(theme.centerChannelColor, 0.25));
        changeCss('.app__body .popover.left>.arrow', 'border-left-color:' + changeOpacity(theme.centerChannelColor, 0.25));
        changeCss('.app__body .popover.top>.arrow', 'border-top-color:' + changeOpacity(theme.centerChannelColor, 0.25));
        changeCss('.app__body .suggestion-list__content .command, .app__body .popover .popover-title', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .suggestion-list__content .command, .app__body .popover .popover__row', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .suggestion-list__divider:before, .app__body .dropdown-menu .divider, .app__body .search-help-popover .search-autocomplete__divider:before', 'background:' + theme.centerChannelColor);
        changeCss('body.app__body, .app__body .custom-textarea', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .post-image__column', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .post-image__details', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .post-image__column a, .app__body .post-image__column a:hover, .app__body .post-image__column a:focus', 'color:' + theme.centerChannelColor);
        changeCss('@media(min-width: 768px){.app__body .search-bar__container .search__form .search-bar, .app__body .form-control', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .input-group-addon, .app__body .form-control, .app__body .post-create__container .post-body__actions > span, .app__body .post-create__container .post-body__actions > a', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('@media(min-width: 768px){.app__body .post-list__table .post-list__content .dropdown-menu a:hover, .dropdown-menu > li > button:hover', 'background:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .dropdown-menu div > a:focus, .app__body .dropdown-menu div > a:hover, .dropdown-menu li > a:focus, .app__body .dropdown-menu li > a:hover', 'background:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .form-control:focus', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .attachment .attachment__content, .app__body .attachment-actions button', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.3));
        changeCss('.app__body .attachment-actions button:focus, .app__body .attachment-actions button:hover', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.5));
        changeCss('.app__body .attachment-actions button:focus, .app__body .attachment-actions button:hover', 'background:' + changeOpacity(theme.centerChannelColor, 0.03));
        changeCss('.app__body .input-group-addon, .app__body .channel-intro .channel-intro__content, .app__body .webhooks__container', 'background:' + changeOpacity(theme.centerChannelColor, 0.05));
        changeCss('.app__body .date-separator .separator__text', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .date-separator .separator__hr, .app__body .modal-footer, .app__body .modal .custom-textarea', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .search-item-container, .app__body .post-right__container .post.post--root', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .modal .custom-textarea:focus', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.3));
        changeCss('.app__body .channel-intro, .app__body .modal .settings-modal .settings-table .settings-content .divider-dark, .app__body hr, .app__body .modal .settings-modal .settings-table .settings-links, .app__body .modal .settings-modal .settings-table .settings-content .appearance-section .theme-elements__header, .app__body .user-settings .authorized-app:not(:last-child)', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .post.current--user .post__body, .app__body .post.post--comment.other--root.current--user .post-comment, .app__body pre, .app__body .post-right__container .post.post--root', 'background:' + changeOpacity(theme.centerChannelColor, 0.05));
        changeCss('.app__body .post.post--comment.other--root.current--user .post-comment, .app__body .more-modal__list .more-modal__row, .app__body .member-div:first-child, .app__body .member-div, .app__body .access-history__table .access__report, .app__body .activity-log__table', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('@media(max-width: 1800px){.app__body .inner-wrap.move--left .post.post--comment.same--root', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.07));
        changeCss('.app__body .post.post--hovered', 'background:' + changeOpacity(theme.centerChannelColor, 0.08));
        changeCss('.app__body .attachment__body__wrap.btn-close', 'background:' + changeOpacity(theme.centerChannelColor, 0.08));
        changeCss('.app__body .attachment__body__wrap.btn-close', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('@media(min-width: 768px){.app__body .post:hover, .app__body .more-modal__list .more-modal__row:hover, .app__body .modal .settings-modal .settings-table .settings-content .section-min:hover', 'background:' + changeOpacity(theme.centerChannelColor, 0.08));
        changeCss('@media(min-width: 768px){.app__body .post.current--user:hover .post__body ', 'background: none;');
        changeCss('.app__body .more-modal__row.more-modal__row--selected, .app__body .date-separator.hovered--before:after, .app__body .date-separator.hovered--after:before, .app__body .new-separator.hovered--after:before, .app__body .new-separator.hovered--before:after', 'background:' + changeOpacity(theme.centerChannelColor, 0.07));
        changeCss('@media(min-width: 768px){.app__body .suggestion-list__content .command:hover, .app__body .mentions__name:hover, .app__body .dropdown-menu>li>a:focus, .app__body .dropdown-menu>li>a:hover', 'background:' + changeOpacity(theme.centerChannelColor, 0.15));
        changeCss('.app__body .suggestion--selected, .app__body .emoticon-suggestion:hover, .app__body .bot-indicator', 'background:' + changeOpacity(theme.centerChannelColor, 0.15));
        changeCss('code, .app__body .form-control[disabled], .app__body .form-control[readonly], .app__body fieldset[disabled] .form-control', 'background:' + changeOpacity(theme.centerChannelColor, 0.1));
        changeCss('.app__body .sidebar--right', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .search-help-popover .search-autocomplete__item:hover, .app__body .modal .settings-modal .settings-table .settings-content .appearance-section .theme-elements__body', 'background:' + changeOpacity(theme.centerChannelColor, 0.05));
        changeCss('.app__body .search-help-popover .search-autocomplete__item.selected', 'background:' + changeOpacity(theme.centerChannelColor, 0.15));
        if (!UserAgent.isFirefox() && !UserAgent.isInternetExplorer() && !UserAgent.isEdge()) {
            changeCss('body.app__body ::-webkit-scrollbar-thumb', 'background:' + changeOpacity(theme.centerChannelColor, 0.4));
        }
        changeCss('body', 'scrollbar-arrow-color:' + theme.centerChannelColor);
        changeCss('.app__body .post-create__container .post-create-body .btn-file svg, .app__body .post.post--compact .post-image__column .post-image__details svg, .app__body .modal .about-modal .about-modal__logo svg, .app__body .post .post__img svg, .app__body .post-body__actions svg, .app__body .edit-post__actions .icon svg', 'fill:' + theme.centerChannelColor);
        changeCss('.app__body .scrollbar--horizontal, .app__body .scrollbar--vertical', 'background:' + changeOpacity(theme.centerChannelColor, 0.5));
        changeCss('.app__body .post-list__new-messages-below', 'background:' + changeColor(theme.centerChannelColor, 0.5));
        changeCss('.app__body .post.post--comment .post__body', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('@media(min-width: 768px){.app__body .post.post--compact.same--root.post--comment .post__content', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .post.post--comment.current--user .post__body', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .channel-header__info .status .offline--icon', 'fill:' + theme.centerChannelColor);
        changeCss('.app__body .navbar .status .offline--icon', 'fill:' + theme.centerChannelColor);
        changeCss('.app__body .post-reaction:not(.post-reaction--current-user)', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.25));
        changeCss('.app__body .post-reaction:not(.post-reaction--current-user)', 'color:' + changeOpacity(theme.centerChannelColor, 0.7));
        changeCss('.app__body .emoji-picker', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .emoji-picker', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.app__body .emoji-picker__search-icon', 'color:' + changeOpacity(theme.centerChannelColor, 0.4));
        changeCss('.app__body .emoji-picker__preview, .app__body .emoji-picker__items, .app__body .emoji-picker__search-container', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.2));
        changeCss('.emoji-picker__category .fa:hover', 'color:' + changeOpacity(theme.centerChannelColor, 0.8));
        changeCss('.app__body .emoji-picker__category, .app__body .emoji-picker__category:focus, .app__body .emoji-picker__category:hover', 'color:' + changeOpacity(theme.centerChannelColor, 0.3));
        changeCss('.app__body .emoji-picker__category--selected, .app__body .emoji-picker__category--selected:focus, .app__body .emoji-picker__category--selected:hover', 'color:' + theme.centerChannelColor);
        changeCss('.app__body .emoji-picker__item-wrapper:hover', 'background-color:' + changeOpacity(theme.centerChannelColor, 0.8));
        changeCss('.app__body .emoji-picker-items__container .emoji-picker__item.selected', 'background-color:' + changeOpacity(theme.centerChannelColor, 0.8));
        changeCss('.app__body .icon__postcontent_picker:hover', 'color:' + changeOpacity(theme.centerChannelColor, 0.8));
        changeCss('.app__body .popover', 'border-color:' + changeOpacity(theme.centerChannelColor, 0.07));
        changeCss('.app__body .emoji-picker .nav-tabs li a', 'fill:' + theme.centerChannelColor);
        changeCss('.app__body .post .post-collapse__show-more-button', `border-color:${changeOpacity(theme.centerChannelColor, 0.1)}`);
        changeCss('.app__body .post .post-collapse__show-more-line', `background-color:${changeOpacity(theme.centerChannelColor, 0.1)}`);

        if (theme.centerChannelBg) {
            const ownPostBg = blendColors(theme.centerChannelBg, theme.centerChannelColor, 0.05);
            const hoveredPostBg = blendColors(theme.centerChannelBg, theme.centerChannelColor, 0.08);
            const hoveredPostBgLight = blendColors(theme.centerChannelBg, theme.centerChannelColor, 0.05);

            // Fade out effect for collapsed posts made by the current user
            changeCss(
                '.app__body .post-list__table .post.current--user:not(.post--compact):not(:hover):not(.post--hovered):not(.post--highlight) .post-collapse__gradient, ' +
                '.app__body .sidebar-right__body .post.current--user:not(.post--compact):not(:hover):not(.post--hovered):not(.post--highlight) .post-collapse__gradient, ' +
                '.app__body #thread--root .post-collapse__gradient',
                `background:linear-gradient(${changeOpacity(ownPostBg, 0)}, ${ownPostBg})`,
            );
            changeCss(
                '@media(max-width: 768px){.app__body .post-list__table .post.current--user:hover .post-collapse__gradient',
                `background:linear-gradient(${changeOpacity(ownPostBg, 0)}, ${ownPostBg}) !important`,
            );
            changeCss(
                '.app__body .post-list__table .post.current--user:not(.post--compact):not(:hover):not(.post--hovered):not(.post--highlight) .post-collapse__show-more, ' +
                '.app__body .sidebar-right__body .post.current--user:not(.post--compact):not(:hover):not(.post--hovered):not(.post--highlight) .post-collapse__show-more, ' +
                '.app__body #thread--root .post-collapse__show-more',
                `background:${ownPostBg}`,
            );

            // Fade out effect for collapsed posts that are being hovered over
            changeCss(
                '@media(min-width: 768px){.app__body .post-list__table .post:hover .post-collapse__gradient, ' +
                '.app__body .sidebar-right__body .post:hover .post-collapse__gradient',
                `background:linear-gradient(${changeOpacity(hoveredPostBg, 0)}, ${hoveredPostBg})`,
            );
            changeCss(
                '@media(min-width: 768px){.app__body .post-list__table .post:hover .post-collapse__show-more, ' +
                '.app__body .sidebar-right__body .post:hover .post-collapse__show-more',
                `background:${hoveredPostBg}`,
            );
            changeCss(
                '@media(max-width: 768px){.app__body .post-list__table .post.current--user:hover .post-collapse__show-more',
                `background:${hoveredPostBgLight}`,
            );
            changeCss(
                '.app__body .post-list__table .post.post--hovered .post-collapse__gradient, ' +
                '.app__body .sidebar-right__body .post.post--hovered .post-collapse__gradient',
                `background:linear-gradient(${changeOpacity(hoveredPostBg, 0)}, ${hoveredPostBg})`,
            );
            changeCss(
                '.app__body .post-list__table .post.post--hovered .post-collapse__show-more, ' +
                '.app__body .sidebar-right__body .post.post--hovered .post-collapse__show-more',
                `background:${hoveredPostBg}`,
            );

            // Apply a background behind the file attachments to cover any overflowing text in a collapsed post
            changeCss(
                '.app__body .post.current--user:not(.post--compact) .post-image__columns, ' +
                '.app__body .post.current--user:not(.post--compact) .file-view--single, ' +
                '.app__body .post--root.post--thread .post-image__columns, ' +
                '.app__body .post--root.post--thread .file-view--single',
                `background:${ownPostBg}`
            );

            changeCss(
                '@media(min-width: 768px){.app__body .post-list__table .post:hover .post-image__columns, ' +
                '.app__body .post-list__table .post:hover .file-view--single, ' +
                '.app__body .post-right-comments-container .post:hover .post-image__columns, ' +
                '.app__body .post-right-comments-container .post:hover .file-view--single, ' +
                '.app__body .search-items-container .post:hover .post-image__columns, ' +
                '.app__body .search-items-container .post:hover .file-view--single',
                `background:${hoveredPostBg}`
            );
            changeCss(
                '.app__body .post-list__table .post.post--hovered .post-image__columns, ' +
                '.app__body .post-list__table .post.post--hovered .file-view--single, ' +
                '.app__body .post-right-comments-container .post.post--hovered .post-image__columns, ' +
                '.app__body .post-right-comments-container .post.post--hovered .file-view--single, ' +
                '.app__body .search-items-container .post.post--hovered .post-image__columns, ' +
                '.app__body .search-items-container .post.post--hovered .file-view--single',
                `background:${hoveredPostBg}`
            );

            // Fade out effect for permalinked posts
            if (theme.mentionHighlightBg) {
                const highlightBg = blendColors(theme.centerChannelBg, theme.mentionHighlightBg, 0.5);
                const ownPostHighlightBg = blendColors(highlightBg, theme.centerChannelColor, 0.05);

                // For permalinked posts made by another user
                changeCss(
                    '.app__body .post-list__table .post:not(.current--user).post--highlight .post-collapse__gradient, ' +
                    '.app__body .post-list__table .post.post--compact.post--highlight .post-collapse__gradient',
                    `background:linear-gradient(${changeOpacity(highlightBg, 0)}, ${highlightBg})`,
                );
                changeCss(
                    '.app__body .post-list__table .post:not(.current--user).post--highlight .post-collapse__show-more, ' +
                    '.app__body .post-list__table .post.post--compact.post--highlight .post-collapse__show-more, ' +
                    '.app__body .post-list__table .post:not(.current--user).post--highlight .post-image__columns, ' +
                    '.app__body .post-list__table .post.post--compact.post--highlight .post-image__columns, ' +
                    '.app__body .post-list__table .post:not(.current--user).post--highlight .file-view--single, ' +
                    '.app__body .post-list__table .post.post--compact.post--highlight .file-view--single',
                    `background:${highlightBg}`,
                );

                // For permalinked posts made by the current user
                changeCss(
                    '.app__body .post-list__table .post.current--user.post--highlight:not(.post--compact) .post-collapse__gradient',
                    `background:linear-gradient(${changeOpacity(ownPostHighlightBg, 0)}, ${ownPostHighlightBg})`,
                );
                changeCss(
                    '.app__body .post-list__table .post.current--user.post--highlight:not(.post--compact) .post-collapse__show-more, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight:not(.post--compact) .post-image__columns, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight:not(.post--compact) .file-view--single',
                    `background:${ownPostHighlightBg}`,
                );

                // For hovered posts
                changeCss(
                    '.app__body .post-list__table .post.current--user.post--highlight:hover .post-collapse__gradient, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight.post--hovered .post-collapse__gradient',
                    `background:linear-gradient(${changeOpacity(highlightBg, 0)}, ${highlightBg})`,
                );
                changeCss(
                    '.app__body .post-list__table .post.current--user.post--highlight:hover .post-collapse__show-more, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight.post--hovered .post-collapse__show-more, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight:hover .post-image__columns, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight.post--hovered .post-image__columns, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight:hover .file-view--single, ' +
                    '.app__body .post-list__table .post.current--user.post--highlight.post--hovered .file-view--single',
                    `background:${highlightBg}`,
                );
            }
        }
    }

    if (theme.newMessageSeparator) {
        changeCss('.app__body .new-separator .separator__text', 'color:' + theme.newMessageSeparator);
        changeCss('.app__body .new-separator .separator__hr', 'border-color:' + changeOpacity(theme.newMessageSeparator, 0.5));
    }

    if (theme.linkColor) {
        changeCss('.app__body .DayPicker-Day--today, .app__body .channel-header .channel-header__icon.active, .app__body .channel-header .channel-header__icon:hover, .app__body .webrtc__header:not(.offline) button:hover, .app__body .post-add-reaction:hover .post-reaction, .app__body .channel-header .channel-header__favorites.inactive:hover, .app__body .channel-header__links > a.active, .app__body a, .app__body a:focus, .app__body a:hover, .app__body .channel-header__links > .color--link.active, .app__body .color--link, .app__body a:focus, .app__body .color--link:hover, .app__body .btn, .app__body .btn:focus, .app__body .btn:hover', 'color:' + theme.linkColor);
        changeCss('.app__body .attachment .attachment__container', 'border-left-color:' + changeOpacity(theme.linkColor, 0.5));
        changeCss('.app__body .channel-header .channel-header_plugin-dropdown a:hover, .app__body .member-list__popover .more-modal__list .more-modal__row:hover', 'background:' + changeOpacity(theme.linkColor, 0.08));
        changeCss('.app__body .channel-header__links .icon:hover, .app__body .channel-header__links > a.active .icon, .app__body .post .flag-icon__container.visible, .app__body .post .reacticon__container, .app__body .post .comment-icon__container, .app__body .post .post__reply', 'fill:' + theme.linkColor);
        changeCss('@media(min-width: 768px){.app__body .search__form.focused .search__icon svg, .app__body .search__form:hover .search__icon svg', 'stroke:' + theme.linkColor);
        changeCss('.app__body .channel-header__links .icon:hover, .app__body .post .flag-icon__container.visible, .app__body .post .comment-icon__container, .app__body .post .post__reply', 'fill:' + theme.linkColor);
        changeCss('.app__body .channel-header .channel-header__icon:hover #member_popover, .app__body .channel-header .channel-header__icon.active #member_popover', 'color:' + theme.linkColor);
        changeCss('.app__body .channel-header .pinned-posts-button:hover svg', 'fill:' + changeOpacity(theme.linkColor, 0.6));
        changeCss('.app__body .member-list__popover .more-modal__actions svg, .app__body .channel-header .channel-header__icon:hover svg, .app__body .channel-header .channel-header__icon.active svg', 'fill:' + theme.linkColor);
        changeCss('.app__body .channel-header .channel-header__icon:hover .icon--stroke svg', 'stroke:' + theme.linkColor);
        changeCss('.app__body .post-reaction.post-reaction--current-user', 'background:' + changeOpacity(theme.linkColor, 0.1));
        changeCss('.app__body .post-add-reaction:hover .post-reaction, .app__body .post-reaction.post-reaction--current-user', 'border-color:' + changeOpacity(theme.linkColor, 0.4));
        changeCss('.app__body .channel-header .channel-header_plugin-dropdown a:hover, .app__body .member-list__popover .more-modal__list .more-modal__row:hover, .app__body .channel-header .channel-header__icon:hover, .app__body .channel-header .channel-header__icon.active, .app__body .search-bar__container .search__form.focused, .app__body .search-bar__container .search__form:hover', 'border-color:' + theme.linkColor);
        changeCss('.app__body .channel-header .channel-header_plugin-dropdown a:hover svg', 'fill:' + theme.linkColor);
        changeCss('.app__body .post-reaction.post-reaction--current-user', 'color:' + theme.linkColor);
        changeCss('.app__body .channel-header .dropdown-toggle:hover .heading, .app__body .channel-header .dropdown-toggle:hover .header-dropdown__icon, .app__body .channel-header__title .open .heading, .app__body .channel-header__info .channel-header__title .open .header-dropdown__icon, .app__body .channel-header__title .open .heading, .app__body .channel-header__info .channel-header__title .open .heading', 'color:' + theme.linkColor);
        changeCss('.emoji-picker__container .icon--emoji.active svg', 'fill:' + theme.linkColor);
        changeCss('.app__body .channel-header .channel-header_plugin-dropdown a:hover .fa, .sidebar--right--expanded .sidebar--right__expand', 'color:' + theme.linkColor);
        changeCss('.app__body .post .post-collapse__show-more', `color:${theme.linkColor}`);
        changeCss('.app__body .post .post-attachment-collapse__show-more', `color:${theme.linkColor}`);
        changeCss('.app__body .post .post-collapse__show-more-button:hover', `background-color:${theme.linkColor}`);
    }

    if (theme.buttonBg) {
        changeCss('.app__body .DayPicker:not(.DayPicker--interactionDisabled) .DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover, .app__body .modal .settings-modal .team-img__remove:hover, .app__body .btn.btn-transparent:hover, .app__body .btn.btn-transparent:active, .app__body .post-image__details .post-image__download svg:hover, .app__body .file-view--single .file__download:hover, .app__body .new-messages__button div, .app__body .btn.btn-primary, .app__body .tutorial__circles .circle.active, .app__body .post__pinned-badge', 'background:' + theme.buttonBg);
        changeCss('.app__body .system-notice__logo svg', 'fill:' + theme.buttonBg);
        changeCss('.app__body .post-image__details .post-image__download svg:hover', 'border-color:' + theme.buttonBg);
        changeCss('.app__body .btn.btn-primary:hover, .app__body .btn.btn-primary:active, .app__body .btn.btn-primary:focus', 'background:' + changeColor(theme.buttonBg, -0.15));
        changeCss('.app__body .emoji-picker .nav-tabs li.active a, .app__body .emoji-picker .nav-tabs li a:hover', 'fill:' + theme.buttonBg);
        changeCss('.app__body .emoji-picker .nav-tabs > li.active > a', 'border-bottom-color:' + theme.buttonBg + '!important;');
    }

    if (theme.buttonColor) {
        changeCss('.app__body .DayPicker:not(.DayPicker--interactionDisabled) .DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover, .app__body .modal .settings-modal .team-img__remove:hover, .app__body .btn.btn-transparent:hover, .app__body .btn.btn-transparent:active, .app__body .new-messages__button div, .app__body .btn.btn-primary, .app__body .post__pinned-badge', 'color:' + theme.buttonColor);
        changeCss('.app__body .new-messages__button svg', 'fill:' + theme.buttonColor);
        changeCss('.app__body .post-image__details .post-image__download svg:hover, .app__body .file-view--single .file__download svg', 'stroke:' + theme.buttonColor);
    }

    if (theme.errorTextColor) {
        changeCss('.app__body .modal .settings-modal .settings-table .settings-content .has-error, .app__body .modal .form-horizontal .input__help.error, .app__body .color--error, .app__body .has-error .help-block, .app__body .has-error .control-label, .app__body .has-error .radio, .app__body .has-error .checkbox, .app__body .has-error .radio-inline, .app__body .has-error .checkbox-inline, .app__body .has-error.radio label, .app__body .has-error.checkbox label, .app__body .has-error.radio-inline label, .app__body .has-error.checkbox-inline label', 'color:' + theme.errorTextColor);
    }

    if (theme.mentionHighlightBg) {
        changeCss('.app__body .mention--highlight, .app__body .search-highlight', 'background:' + theme.mentionHighlightBg);
        changeCss('.app__body .post.post--comment .post__body.mention-comment', 'border-color:' + theme.mentionHighlightBg);
        changeCss('.app__body .post.post--highlight', 'background:' + changeOpacity(theme.mentionHighlightBg, 0.5));
    }

    if (theme.mentionHighlightLink) {
        changeCss('.app__body .mention--highlight .mention-link, .app__body .mention--highlight, .app__body .search-highlight', 'color:' + theme.mentionHighlightLink);
    }

    if (!theme.codeTheme) {
        theme.codeTheme = Constants.DEFAULT_CODE_THEME;
    }
    updateCodeTheme(theme.codeTheme);
}

export function resetTheme() {
    applyTheme(Constants.THEMES.default);
}

export function changeCss(className, classValue) {
    let styleEl = document.querySelector('style[data-class="' + className + '"]');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.setAttribute('data-class', className);

        // Append style element to head
        document.head.appendChild(styleEl);
    }

    // Grab style sheet
    const styleSheet = styleEl.sheet;
    const rules = styleSheet.cssRules || styleSheet.rules;
    const style = classValue.substr(0, classValue.indexOf(':'));
    const value = classValue.substr(classValue.indexOf(':') + 1).replace(/!important[;]/g, '');
    const priority = (classValue.match(/!important/) ? 'important' : null);

    for (let i = 0; i < rules.length; i++) {
        if (rules[i].selectorText === className) {
            rules[i].style.setProperty(style, value, priority);
            return;
        }
    }

    let mediaQuery = '';
    if (className.indexOf('@media') >= 0) {
        mediaQuery = '}';
    }
    try {
        styleSheet.insertRule(className + '{' + classValue + '}' + mediaQuery, styleSheet.cssRules.length);
    } catch (e) {
        console.error(e); // eslint-disable-line no-console
    }
}

export function updateCodeTheme(userTheme) {
    let cssPath = '';
    Constants.THEME_ELEMENTS.forEach((element) => {
        if (element.id === 'codeTheme') {
            element.themes.forEach((theme) => {
                if (userTheme === theme.id) {
                    cssPath = theme.cssURL;
                }
            });
        }
    });
    const $link = $('link.code_theme');
    if (cssPath !== $link.attr('href')) {
        changeCss('code.hljs', 'visibility: hidden');
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.open('GET', cssPath, true);
        xmlHTTP.onload = function onLoad() {
            $link.attr('href', cssPath);
            if (UserAgent.isFirefox()) {
                $link.one('load', () => {
                    changeCss('code.hljs', 'visibility: visible');
                });
            } else {
                changeCss('code.hljs', 'visibility: visible');
            }
        };
        xmlHTTP.send();
    }
}

export function placeCaretAtEnd(el) {
    el.focus();
    el.selectionStart = el.value.length;
    el.selectionEnd = el.value.length;
}

export function getCaretPosition(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();

        var r = document.selection.createRange();
        if (r == null) {
            return 0;
        }

        var re = el.createTextRange();
        var rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
    }
    return 0;
}

export function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

export function setCaretPosition(input, pos) {
    setSelectionRange(input, pos, pos);
}

export function isValidUsername(name) {
    var error = '';
    if (!name) {
        error = 'This field is required';
    } else if (name.length < Constants.MIN_USERNAME_LENGTH || name.length > Constants.MAX_USERNAME_LENGTH) {
        error = 'Must be between ' + Constants.MIN_USERNAME_LENGTH + ' and ' + Constants.MAX_USERNAME_LENGTH + ' characters';
    } else if (!(/^[a-z0-9.\-_]+$/).test(name)) {
        error = "Must contain only letters, numbers, and the symbols '.', '-', and '_'.";
    } else if (!(/[a-z]/).test(name.charAt(0))) { //eslint-disable-line no-negated-condition
        error = 'First character must be a letter.';
    } else {
        for (var i = 0; i < Constants.RESERVED_USERNAMES.length; i++) {
            if (name === Constants.RESERVED_USERNAMES[i]) {
                error = 'Cannot use a reserved word as a username.';
                break;
            }
        }
    }

    return error;
}

export function isMobile() {
    return window.innerWidth <= Constants.MOBILE_SCREEN_WIDTH;
}

export function getDirectTeammate(channelId) {
    let teammate = {};

    const channel = ChannelStore.get(channelId);
    if (!channel) {
        return teammate;
    }

    const userIds = channel.name.split('__');
    const curUserId = UserStore.getCurrentId();

    if (userIds.length !== 2 || userIds.indexOf(curUserId) === -1) {
        return teammate;
    }

    if (userIds[0] === userIds[1]) {
        return UserStore.getProfile(userIds[0]);
    }

    for (var idx in userIds) {
        if (userIds[idx] !== curUserId) {
            teammate = UserStore.getProfile(userIds[idx]);
            break;
        }
    }

    return teammate;
}

export function loadImage(url, onLoad, onProgress) {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = onLoad;
    request.onprogress = (e) => {
        if (onProgress) {
            const completedPercentage = Math.round((e.loaded / e.total) * 100);

            onProgress(completedPercentage);
        }
    };

    request.send();
}

export function changeColor(colourIn, amt) {
    var hex = colourIn;
    var lum = amt;

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = '#';
    var c;
    var i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00' + c).substr(c.length);
    }

    return rgb;
}

export function getFullName(user) {
    if (user.first_name && user.last_name) {
        return user.first_name + ' ' + user.last_name;
    } else if (user.first_name) {
        return user.first_name;
    } else if (user.last_name) {
        return user.last_name;
    }

    return '';
}

export function getDisplayName(user) {
    if (user.nickname && user.nickname.trim().length > 0) {
        return user.nickname;
    }
    var fullName = getFullName(user);

    if (fullName) {
        return fullName;
    }

    return user.username;
}

/**
 * Gets the display name of the user with the specified id, respecting the TeammateNameDisplay configuration setting
 */
export function getDisplayNameByUserId(userId) {
    return getDisplayNameByUser(UserStore.getProfile(userId));
}

/**
 * Gets the display name of the specified user, respecting the TeammateNameDisplay configuration setting
 */
export function getDisplayNameByUser(user) {
    const state = store.getState();
    const teammateNameDisplay = getTeammateNameDisplaySetting(state);
    if (user) {
        return displayUsername(user, teammateNameDisplay);
    }

    return '';
}

const UserStatusesWeight = {
    online: 0,
    away: 1,
    dnd: 2,
    offline: 3,
    ooo: 3,
};

/**
 * Sort users by status then by display name, respecting the TeammateNameDisplay configuration setting
 */
export function sortUsersByStatusAndDisplayName(users, statusesByUserId) {
    function compareUsers(a, b) {
        const aStatus = statusesByUserId[a.id] || UserStatuses.OFFLINE;
        const bStatus = statusesByUserId[b.id] || UserStatuses.OFFLINE;

        if (UserStatusesWeight[aStatus] !== UserStatusesWeight[bStatus]) {
            return UserStatusesWeight[aStatus] - UserStatusesWeight[bStatus];
        }

        const aName = getDisplayNameByUser(a);
        const bName = getDisplayNameByUser(b);

        return aName.localeCompare(bName);
    }

    return users.sort(compareUsers);
}

/**
 * Gets the entire name, including username, full name, and nickname, of the user with the specified id
 */
export function displayEntireName(userId) {
    return displayEntireNameForUser(UserStore.getProfile(userId));
}

/**
 * Gets the entire name, including username, full name, and nickname, of the specified user
 */
export function displayEntireNameForUser(user) {
    if (!user) {
        return '';
    }

    let displayName = '@' + user.username;
    const fullName = getFullName(user);

    if (fullName && user.nickname) {
        displayName = (
            <span>
                {'@' + user.username}
                {' - '}
                <span className='light'>{fullName + ' (' + user.nickname + ')'}</span>
            </span>
        );
    } else if (fullName) {
        displayName = (
            <span>
                {'@' + user.username}
                {' - '}
                <span className='light'>{fullName}</span>
            </span>
        );
    } else if (user.nickname) {
        displayName = (
            <span>
                {'@' + user.username}
                {' - '}
                <span className='light'>{'(' + user.nickname + ')'}</span>
            </span>
        );
    }

    return displayName;
}

export function imageURLForUser(userIdOrObject) {
    if (typeof userIdOrObject == 'string') {
        const profile = UserStore.getProfile(userIdOrObject);
        if (profile) {
            return imageURLForUser(profile);
        }
        return Constants.TRANSPARENT_PIXEL;
    }
    return Client4.getUsersRoute() + '/' + userIdOrObject.id + '/image?_=' + (userIdOrObject.last_picture_update || 0);
}

// in contrast to Client4.getTeamIconUrl, for ui logic this function returns null if last_team_icon_update is unset
export function imageURLForTeam(teamIdOrObject) {
    if (typeof teamIdOrObject == 'string') {
        const team = TeamStore.get(teamIdOrObject);
        if (team) {
            return imageURLForTeam(team);
        }
        return null;
    }

    return teamIdOrObject.last_team_icon_update ? Client4.getTeamIconUrl(teamIdOrObject.id, teamIdOrObject.last_team_icon_update) : null;
}

// Converts a file size in bytes into a human-readable string of the form '123MB'.
export function fileSizeToString(bytes) {
    // it's unlikely that we'll have files bigger than this
    if (bytes > 1024 * 1024 * 1024 * 1024) {
        return Math.floor(bytes / (1024 * 1024 * 1024 * 1024)) + 'TB';
    } else if (bytes > 1024 * 1024 * 1024) {
        return Math.floor(bytes / (1024 * 1024 * 1024)) + 'GB';
    } else if (bytes > 1024 * 1024) {
        return Math.floor(bytes / (1024 * 1024)) + 'MB';
    } else if (bytes > 1024) {
        return Math.floor(bytes / 1024) + 'KB';
    }

    return bytes + 'B';
}

// Generates a RFC-4122 version 4 compliant globally unique identifier.
export function generateId() {
    // implementation taken from http://stackoverflow.com/a/2117523
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

    id = id.replace(/[xy]/g, (c) => {
        var r = Math.floor(Math.random() * 16);

        var v;
        if (c === 'x') {
            v = r;
        } else {
            v = (r & 0x3) | 0x8;
        }

        return v.toString(16);
    });

    return id;
}

export function getDirectChannelName(id, otherId) {
    let handle;

    if (otherId > id) {
        handle = id + '__' + otherId;
    } else {
        handle = otherId + '__' + id;
    }

    return handle;
}

// Used to get the id of the other user from a DM channel
export function getUserIdFromChannelName(channel) {
    return getUserIdFromChannelId(channel.name);
}

// Used to get the id of the other user from a DM channel id (id1_id2)
export function getUserIdFromChannelId(channelId) {
    var ids = channelId.split('__');
    var otherUserId = '';
    if (ids[0] === UserStore.getCurrentId()) {
        otherUserId = ids[1];
    } else {
        otherUserId = ids[0];
    }

    return otherUserId;
}

export function importSlack(file, success, error) {
    Client4.importTeam(TeamStore.getCurrent().id, file, 'slack').then(success).catch(error);
}

export function windowWidth() {
    return $(window).width();
}

export function windowHeight() {
    return $(window).height();
}

export function isFeatureEnabled(feature) {
    return PreferenceStore.getBool(Constants.Preferences.CATEGORY_ADVANCED_SETTINGS, Constants.FeatureTogglePrefix + feature.label);
}

export function fillArray(value, length) {
    const arr = [];

    for (let i = 0; i < length; i++) {
        arr.push(value);
    }

    return arr;
}

// Checks if a data transfer contains files not text, folders, etc..
// Slightly modified from http://stackoverflow.com/questions/6848043/how-do-i-detect-a-file-is-being-dragged-rather-than-a-draggable-element-on-my-pa
export function isFileTransfer(files) {
    if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
        return files.types != null && files.types.contains('Files');
    }

    return files.types != null && (files.types.indexOf ? files.types.indexOf('Files') !== -1 : files.types.contains('application/x-moz-file'));
}

export function clearFileInput(elm) {
    // clear file input for all modern browsers
    try {
        elm.value = '';
        if (elm.value) {
            elm.type = 'text';
            elm.type = 'file';
        }
    } catch (e) {
        // Do nothing
    }
}

export function isPostEphemeral(post) {
    return post.type === Constants.PostTypes.EPHEMERAL || post.state === Posts.POST_DELETED;
}

export function getRootId(post) {
    return post.root_id === '' ? post.id : post.root_id;
}

export function localizeMessage(id, defaultMessage) {
    const translations = LocalizationStore.getTranslations();
    if (translations) {
        const value = translations[id];
        if (value) {
            return value;
        }
    }

    if (defaultMessage) {
        return defaultMessage;
    }

    return id;
}

export function mod(a, b) {
    return ((a % b) + b) % b;
}

export const REACTION_PATTERN = /^(\+|-):([^:\s]+):\s*$/;

export function getPasswordConfig(config) {
    return {
        minimumLength: parseInt(config.PasswordMinimumLength, 10),
        requireLowercase: config.PasswordRequireLowercase === 'true',
        requireUppercase: config.PasswordRequireUppercase === 'true',
        requireNumber: config.PasswordRequireNumber === 'true',
        requireSymbol: config.PasswordRequireSymbol === 'true',
    };
}

export function isValidPassword(password, passwordConfig) {
    let errorId = 'user.settings.security.passwordError';
    let valid = true;
    const minimumLength = passwordConfig.minimumLength || Constants.MIN_PASSWORD_LENGTH;

    if (password.length < minimumLength || password.length > Constants.MAX_PASSWORD_LENGTH) {
        valid = false;
    }

    if (passwordConfig.requireLowercase) {
        if (!password.match(/[a-z]/)) {
            valid = false;
        }

        errorId += 'Lowercase';
    }

    if (passwordConfig.requireUppercase) {
        if (!password.match(/[A-Z]/)) {
            valid = false;
        }

        errorId += 'Uppercase';
    }

    if (passwordConfig.requireNumber) {
        if (!password.match(/[0-9]/)) {
            valid = false;
        }

        errorId += 'Number';
    }

    if (passwordConfig.requireSymbol) {
        if (!password.match(/[ !"\\#$%&'()*+,-./:;<=>?@[\]^_`|~]/)) {
            valid = false;
        }

        errorId += 'Symbol';
    }

    let error;
    if (!valid) {
        error = (
            <FormattedMessage
                id={errorId}
                default='Your password must contain between {min} and {max} characters.'
                values={{
                    min: minimumLength,
                    max: Constants.MAX_PASSWORD_LENGTH,
                }}
            />
        );
    }

    return {valid, error};
}

export function handleFormattedTextClick(e) {
    const hashtagAttribute = e.target.getAttributeNode('data-hashtag');
    const linkAttribute = e.target.getAttributeNode('data-link');
    const channelMentionAttribute = e.target.getAttributeNode('data-channel-mention');

    if (hashtagAttribute) {
        e.preventDefault();

        searchForTerm(hashtagAttribute.value);
    } else if (linkAttribute) {
        const MIDDLE_MOUSE_BUTTON = 1;

        if (!(e.button === MIDDLE_MOUSE_BUTTON || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();

            browserHistory.push(linkAttribute.value);
        }
    } else if (channelMentionAttribute) {
        e.preventDefault();
        browserHistory.push('/' + TeamStore.getCurrent().name + '/channels/' + channelMentionAttribute.value);
    }
}

export function isEmptyObject(object) {
    if (!object) {
        return true;
    }

    if (Object.keys(object).length === 0) {
        return true;
    }

    return false;
}

export function removePrefixFromLocalStorage(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith(prefix)) {
            keys.push(localStorage.key(i));
        }
    }

    for (let i = 0; i < keys.length; i++) {
        localStorage.removeItem(keys[i]);
    }
}

export function getEmailInterval(enableEmailBatching, isEmailEnabled) {
    const {
        INTERVAL_NEVER,
        INTERVAL_IMMEDIATE,
        INTERVAL_FIFTEEN_MINUTES,
        INTERVAL_HOUR,
        CATEGORY_NOTIFICATIONS,
        EMAIL_INTERVAL,
    } = Constants.Preferences;

    if (!isEmailEnabled) {
        return INTERVAL_NEVER;
    }

    const validValuesWithEmailBatching = [INTERVAL_IMMEDIATE, INTERVAL_FIFTEEN_MINUTES, INTERVAL_HOUR];
    const validValuesWithoutEmailBatching = [INTERVAL_IMMEDIATE];

    let emailInterval;

    if (enableEmailBatching) {
        // when email batching is enabled, the default interval is 15 minutes
        emailInterval = PreferenceStore.getInt(CATEGORY_NOTIFICATIONS, EMAIL_INTERVAL, INTERVAL_FIFTEEN_MINUTES);

        if (validValuesWithEmailBatching.indexOf(emailInterval) === -1) {
            emailInterval = INTERVAL_FIFTEEN_MINUTES;
        }
    } else {
        // otherwise, the default interval is immediately
        emailInterval = PreferenceStore.getInt(CATEGORY_NOTIFICATIONS, EMAIL_INTERVAL, INTERVAL_IMMEDIATE);

        if (validValuesWithoutEmailBatching.indexOf(emailInterval) === -1) {
            emailInterval = INTERVAL_IMMEDIATE;
        }
    }

    return emailInterval;
}

export function copyToClipboard(e, data) {
    // creates a tiny temporary text area to copy text out of
    // see https://stackoverflow.com/a/30810322/591374 for details
    var textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = getSiteURL() + data.link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

export function moveCursorToEnd(e) {
    const val = e.target.value;
    if (val.length) {
        e.target.value = '';
        e.target.value = val;
    }
}

export function isUserMediaAvailable() {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
}
