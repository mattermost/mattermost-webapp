// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */

import React from 'react';
import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import {
    getChannel as getChannelAction,
    getChannelByNameAndTeamName,
    getChannelMember,
    joinChannel,
} from 'mattermost-redux/actions/channels';
import {getPost as getPostAction} from 'mattermost-redux/actions/posts';
import {getTeamByName as getTeamByNameAction} from 'mattermost-redux/actions/teams';
import {Client4} from 'mattermost-redux/client';
import {Posts, Preferences} from 'mattermost-redux/constants';
import {
    getChannel,
    getChannelsNameMapInTeam,
    getMyChannelMemberships,
    getRedirectChannelNameForTeam,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getBool, getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {displayUsername, isSystemAdmin} from 'mattermost-redux/utils/user_utils';
import {
    getCurrentRelativeTeamUrl,
    getCurrentTeam,
    getCurrentTeamId,
    getTeam,
    getTeamByName,
    getTeamMemberships,
} from 'mattermost-redux/selectors/entities/teams';

import {addUserToTeam} from 'actions/team_actions';
import {searchForTerm} from 'actions/post_actions';
import {browserHistory} from 'utils/browser_history';
import Constants, {FileTypes, UserStatuses, ValidationErrors} from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent';
import bing from 'sounds/bing.mp3';
import crackle from 'sounds/crackle.mp3';
import down from 'sounds/down.mp3';
import hello from 'sounds/hello.mp3';
import ripple from 'sounds/ripple.mp3';
import upstairs from 'sounds/upstairs.mp3';
import {t} from 'utils/i18n';
import store from 'stores/redux_store.jsx';

import {getCurrentLocale, getTranslations} from 'selectors/i18n';

import PurchaseLink from 'components/announcement_bar/purchase_link/purchase_link';
import ContactUsButton from 'components/announcement_bar/contact_sales/contact_us';

import {joinPrivateChannelPrompt} from './channel_utils';

const CLICKABLE_ELEMENTS = [
    'a',
    'button',
    'img',
    'svg',
    'audio',
    'video',
];

export function isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function isLinux() {
    return navigator.platform.toUpperCase().indexOf('LINUX') >= 0;
}

export function createSafeId(prop) {
    if (prop === null) {
        return undefined;
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

    // checks for event.key for older browsers and also for the case of different English layout keyboards.
    if (typeof event.key !== 'undefined' && event.key !== 'Unidentified' && event.key !== 'Dead') {
        const isPressedByCode = event.key === key[0] || event.key === key[0].toUpperCase();
        if (isPressedByCode) {
            return true;
        }
    }

    // used for different language keyboards to detect the position of keys
    return event.keyCode === key[1];
}

/**
 * check keydown event for line break combo. Should catch alt/option + enter not all browsers except Safari
 * @param  {object}  e - keydown event
 * @return {boolean}
 */
export function isUnhandledLineBreakKeyCombo(e) {
    return Boolean(
        isKeyPressed(e, Constants.KeyCodes.ENTER) &&
        !e.shiftKey && // shift + enter is already handled everywhere, so don't handle again
        (e.altKey && !UserAgent.isSafari() && !cmdOrCtrlPressed(e)), // alt/option + enter is already handled in Safari, so don't handle again
    );
}

/**
 * insert a new line character at keyboard cursor (or overwrites selection)
 * @param  {object}  e - keydown event
 * @return {string} message modified with new line inserted for app consumption
 * WARNING: HAS DOM SIDE EFFECTS
 */
export function insertLineBreakFromKeyEvent(e) {
    const el = e.target;
    const {selectionEnd, selectionStart, value} = el;

    // replace text selection (or insert if no selection) with new line character
    const newValue = `${value.substr(0, selectionStart)}\n${value.substr(selectionEnd, value.length)}`;

    // update value on DOM element immediately and restore key cursor to correct position
    el.value = newValue;
    setSelectionRange(el, selectionStart + 1, selectionStart + 1);

    // return the updated string so that component state can be updated
    return newValue;
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

export function getTeamRelativeUrl(team) {
    if (!team) {
        return '';
    }

    return '/' + team.name;
}

export function getPermalinkURL(state, teamId, postId) {
    let team = getTeam(state, teamId);
    if (!team) {
        team = getCurrentTeam(state);
    }
    return `${getTeamRelativeUrl(team)}/pl/${postId}`;
}

export function getChannelURL(state, channel, teamId) {
    let notificationURL;
    if (channel && (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL)) {
        notificationURL = getCurrentRelativeTeamUrl(state) + '/channels/' + channel.name;
    } else if (channel) {
        const team = getTeam(state, teamId);
        notificationURL = getTeamRelativeUrl(team) + '/channels/' + channel.name;
    } else if (teamId) {
        const team = getTeam(state, teamId);
        const redirectChannel = getRedirectChannelNameForTeam(state, teamId);
        notificationURL = getTeamRelativeUrl(team) + `/channels/${redirectChannel}`;
    } else {
        const currentTeamId = getCurrentTeamId(state);
        const redirectChannel = getRedirectChannelNameForTeam(state, currentTeamId);
        notificationURL = getCurrentRelativeTeamUrl(state) + `/channels/${redirectChannel}`;
    }
    return notificationURL;
}

export const notificationSounds = new Map([
    ['Bing', bing],
    ['Crackle', crackle],
    ['Down', down],
    ['Hello', hello],
    ['Ripple', ripple],
    ['Upstairs', upstairs],
]);

var canDing = true;
export function ding(name) {
    if (hasSoundOptions() && canDing) {
        tryNotificationSound(name);
        canDing = false;
        setTimeout(() => {
            canDing = true;
        }, 3000);
    }
}

export function tryNotificationSound(name) {
    const audio = new Audio(notificationSounds.get(name) ?? notificationSounds.get('Bing'));
    audio.play();
}

export function hasSoundOptions() {
    return (!UserAgent.isEdge());
}

export function getDateForUnixTicks(ticks) {
    return new Date(ticks);
}

// returns Unix timestamp in milliseconds
export function getTimestamp() {
    return Date.now();
}

export function getRemainingDaysFromFutureTimestamp(timestamp) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const futureDate = new Date(timestamp);
    const utcFuture = Date.UTC(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate());
    const today = new Date();
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    return Math.floor((utcFuture - utcToday) / MS_PER_DAY);
}

export function getLocaleDateFromUTC(timestamp, format = 'YYYY/MM/DD HH:mm:ss', userTimezone = '') {
    if (!timestamp) {
        return moment.now();
    }
    const timezone = userTimezone ? ' ' + moment().tz(userTimezone).format('z') : '';
    return moment.unix(timestamp).format(format) + timezone;
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

export function isGIFImage(extin) {
    return extin.toLowerCase() === Constants.IMAGE_TYPE_GIF;
}

const removeQuerystringOrHash = (extin) => {
    return extin.split(/[?#]/)[0];
};

export const getFileType = (extin) => {
    const ext = removeQuerystringOrHash(extin.toLowerCase());

    if (Constants.TEXT_TYPES.indexOf(ext) > -1) {
        return FileTypes.TEXT;
    }

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

export function toTitleCase(str) {
    function doTitleCase(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
    return str.replace(/\w\S*/g, doTitleCase);
}

export function applyTheme(theme) {
    if (!theme.codeTheme) {
        theme.codeTheme = Constants.DEFAULT_CODE_THEME;
    }

    updateCodeTheme(theme.codeTheme);
}

export function resetTheme() {
    applyTheme(Preferences.THEMES.denim);
}

function changeCss(className, classValue) {
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

    const link = document.querySelector('link.code_theme');
    if (link && cssPath !== link.attributes.href) {
        changeCss('code.hljs', 'visibility: hidden');

        const xmlHTTP = new XMLHttpRequest();

        xmlHTTP.open('GET', cssPath, true);
        xmlHTTP.onload = function onLoad() {
            link.href = cssPath;

            if (UserAgent.isFirefox()) {
                link.addEventListener('load', () => {
                    changeCss('code.hljs', 'visibility: visible');
                }, {once: true});
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

function createHtmlElement(el) {
    return document.createElement(el);
}

function getElementComputedStyle(el) {
    return getComputedStyle(el);
}

function addElementToDocument(el) {
    document.body.appendChild(el);
}

export function copyTextAreaToDiv(textArea) {
    if (!textArea) {
        return null;
    }
    const copy = createHtmlElement('div');
    copy.textContent = textArea.value;
    const style = getElementComputedStyle(textArea);
    [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'wordWrap',
        'whiteSpace',
        'borderLeftWidth',
        'borderTopWidth',
        'borderRightWidth',
        'borderBottomWidth',
        'paddingRight',
        'paddingLeft',
        'paddingTop',
    ].forEach((key) => {
        copy.style[key] = style[key];
    });
    copy.style.overflow = 'auto';
    copy.style.width = textArea.offsetWidth + 'px';
    copy.style.height = textArea.offsetHeight + 'px';
    copy.style.position = 'absolute';
    copy.style.left = textArea.offsetLeft + 'px';
    copy.style.top = textArea.offsetTop + 'px';
    addElementToDocument(copy);
    return copy;
}

function convertEmToPixels(el, remNum) {
    if (isNaN(remNum)) {
        return 0;
    }
    const styles = getElementComputedStyle(el);
    return remNum * parseFloat(styles.fontSize);
}

export function getCaretXYCoordinate(textArea) {
    if (!textArea) {
        return {x: 0, y: 0};
    }
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const copy = copyTextAreaToDiv(textArea);
    const range = document.createRange();
    range.setStart(copy.firstChild, start);
    range.setEnd(copy.firstChild, end);
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const rect = range.getClientRects();
    document.body.removeChild(copy);
    textArea.selectionStart = start;
    textArea.selectionEnd = end;
    textArea.focus();
    return {
        x: Math.floor(rect[0].left - textArea.scrollLeft),
        y: Math.floor(rect[0].top - textArea.scrollTop),
    };
}

export function getViewportSize(win) {
    const w = win || window;
    if (w.innerWidth != null) {
        return {w: w.innerWidth, h: w.innerHeight};
    }
    const {clientWidth, clientHeight} = w.document.body;
    return {w: clientWidth, h: clientHeight};
}

export function offsetTopLeft(el) {
    if (!(el instanceof HTMLElement)) {
        return {top: 0, left: 0};
    }
    const rect = el.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {top: rect.top + scrollTop, left: rect.left + scrollLeft};
}

export function getSuggestionBoxAlgn(textArea, pxToSubstract = 0) {
    if (!textArea || !(textArea instanceof HTMLElement)) {
        return {
            pixelsToMoveX: 0,
            pixelsToMoveY: 0,
        };
    }

    const caretCoordinatesInTxtArea = getCaretXYCoordinate(textArea);
    const caretXCoordinateInTxtArea = caretCoordinatesInTxtArea.x;
    const caretYCoordinateInTxtArea = caretCoordinatesInTxtArea.y;
    const viewportWidth = getViewportSize().w;

    const suggestionBoxWidth = getSuggestionBoxWidth(textArea);

    // value in pixels for the offsetLeft for the textArea
    const txtAreaOffsetLft = offsetTopLeft(textArea).left;

    // how many pixels to the right should be moved the suggestion box
    let pxToTheRight = (caretXCoordinateInTxtArea) - (pxToSubstract);

    // the x coordinate in the viewport of the suggestion box border-right
    const xBoxRightCoordinate = caretXCoordinateInTxtArea + txtAreaOffsetLft + suggestionBoxWidth;

    // if the right-border edge of the suggestion box will overflow the x-axis viewport
    if (xBoxRightCoordinate > viewportWidth) {
        // stick the suggestion list to the very right of the TextArea
        pxToTheRight = textArea.offsetWidth - suggestionBoxWidth;
    }

    return {

        // The rough location of the caret in the textbox
        pixelsToMoveX: Math.max(0, Math.round(pxToTheRight)),
        pixelsToMoveY: Math.round(caretYCoordinateInTxtArea),

        // The line height of the textbox is needed so that the SuggestionList can adjust its position to be below the current line in the textbox
        lineHeight: Number(getComputedStyle(textArea)?.lineHeight.replace('px', '')),
    };
}

function getSuggestionBoxWidth(textArea) {
    if (textArea.id === 'edit_textbox') {
        // when the sugeestion box is in the edit mode it will inhering the class .modal suggestion-list which has width: 100%
        return textArea.offsetWidth;
    }

    // 496 - value in pixels used in suggestion-list__content class line 72 file _suggestion-list.scss

    return Constants.SUGGESTION_LIST_MODAL_WIDTH;
}

export function getPxToSubstract(char = '@') {
    // depending on the triggering character different values must be substracted
    if (char === '@') {
    // mention name padding-left 2.4rem as stated in suggestion-list__content .suggestion-list__item
        const mentionNamePaddingLft = convertEmToPixels(document.documentElement, Constants.MENTION_NAME_PADDING_LEFT);

        // half of width of avatar stated in .Avatar.Avatar-sm (24px)
        const avatarWidth = Constants.AVATAR_WIDTH * 0.5;
        return 5 + avatarWidth + mentionNamePaddingLft;
    } else if (char === '~') {
        return 39;
    } else if (char === ':') {
        return 32;
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

export function scrollbarWidth(el) {
    return el.offsetWidth - el.clientWidth;
}

export function isValidUsername(name) {
    let error;
    if (!name) {
        error = {
            id: ValidationErrors.USERNAME_REQUIRED,
        };
    } else if (name.length < Constants.MIN_USERNAME_LENGTH || name.length > Constants.MAX_USERNAME_LENGTH) {
        error = {
            id: ValidationErrors.INVALID_LENGTH,
        };
    } else if (!(/^[a-z0-9.\-_]+$/).test(name)) {
        error = {
            id: ValidationErrors.INVALID_CHARACTERS,
        };
    } else if (!(/[a-z]/).test(name.charAt(0))) { //eslint-disable-line no-negated-condition
        error = {
            id: ValidationErrors.INVALID_FIRST_CHARACTER,
        };
    } else {
        for (const reserved of Constants.RESERVED_USERNAMES) {
            if (name === reserved) {
                error = {
                    id: ValidationErrors.RESERVED_NAME,
                };
                break;
            }
        }
    }

    return error;
}

export function isValidBotUsername(name) {
    let error = isValidUsername(name);
    if (error) {
        return error;
    }

    if (name.endsWith('.')) {
        error = {
            id: ValidationErrors.INVALID_LAST_CHARACTER,
        };
    }

    return error;
}

export function isMobile() {
    return window.innerWidth > 0 && window.innerWidth <= Constants.MOBILE_SCREEN_WIDTH;
}

export function loadImage(url, onLoad, onProgress) {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = onLoad;
    request.onprogress = (e) => {
        if (onProgress) {
            let total = 0;
            if (e.lengthComputable) {
                total = e.total;
            } else {
                total = parseInt(e.target.getResponseHeader('X-Uncompressed-Content-Length'), 10);
            }

            const completedPercentage = Math.round((e.loaded / total) * 100);

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

export function getLongDisplayName(user) {
    let displayName = '@' + user.username;
    var fullName = getFullName(user);
    if (fullName) {
        displayName = displayName + ' - ' + fullName;
    }
    if (user.nickname && user.nickname.trim().length > 0) {
        displayName = displayName + ' (' + user.nickname + ')';
    }

    if (user.position && user.position.trim().length > 0) {
        displayName = displayName + ' -' + user.position;
    }

    return displayName;
}

export function getLongDisplayNameParts(user) {
    return {
        displayName: '@' + user.username,
        fullName: getFullName(user),
        nickname: user.nickname && user.nickname.trim() ? user.nickname : null,
        position: user.position && user.position.trim() ? user.position : null,
    };
}

/**
 * Gets the display name of the specified user, respecting the TeammateNameDisplay configuration setting
 */
export function getDisplayNameByUser(state, user) {
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
    bot: 4,
};

/**
 * Sort users by status then by display name, respecting the TeammateNameDisplay configuration setting
 */
export function sortUsersByStatusAndDisplayName(users, statusesByUserId, teammateNameDisplay) {
    function compareUsers(a, b) {
        const aStatus = a.is_bot ? 'bot' : statusesByUserId[a.id] || UserStatuses.OFFLINE;
        const bStatus = b.is_bot ? 'bot' : statusesByUserId[b.id] || UserStatuses.OFFLINE;

        if (UserStatusesWeight[aStatus] !== UserStatusesWeight[bStatus]) {
            return UserStatusesWeight[aStatus] - UserStatusesWeight[bStatus];
        }

        const aName = displayUsername(a, teammateNameDisplay);
        const bName = displayUsername(b, teammateNameDisplay);

        return aName.localeCompare(bName);
    }

    return users.sort(compareUsers);
}

/**
 * Gets the entire name, including username, full name, and nickname, of the specified user
 */
export function displayEntireNameForUser(user) {
    if (!user) {
        return '';
    }

    let displayName = '';
    const fullName = getFullName(user);

    if (fullName) {
        displayName = ' - ' + fullName;
    }

    if (user.nickname) {
        displayName = displayName + ' (' + user.nickname + ')';
    }

    if (user.position) {
        displayName = displayName + ' - ' + user.position;
    }

    displayName = (
        <span id={'displayedUserName' + user.username}>
            {'@' + user.username}
            <span className='light'>{displayName}</span>
        </span>
    );

    return displayName;
}

/**
 * Gets the full name and nickname of the specified user
 */
export function displayFullAndNicknameForUser(user) {
    if (!user) {
        return '';
    }

    let displayName;
    const fullName = getFullName(user);

    if (fullName && user.nickname) {
        displayName = (
            <span className='light'>{fullName + ' (' + user.nickname + ')'}</span>
        );
    } else if (fullName) {
        displayName = (
            <span className='light'>{fullName}</span>
        );
    } else if (user.nickname) {
        displayName = (
            <span className='light'>{'(' + user.nickname + ')'}</span>
        );
    }

    return displayName;
}

export function imageURLForUser(userId, lastPictureUpdate = 0) {
    return Client4.getUsersRoute() + '/' + userId + '/image?_=' + lastPictureUpdate;
}

export function defaultImageURLForUser(userId) {
    return Client4.getUsersRoute() + '/' + userId + '/image/default';
}

// in contrast to Client4.getTeamIconUrl, for ui logic this function returns null if last_team_icon_update is unset
export function imageURLForTeam(team) {
    return team.last_team_icon_update ? Client4.getTeamIconUrl(team.id, team.last_team_icon_update) : null;
}

// Converts a file size in bytes into a human-readable string of the form '123MB'.
export function fileSizeToString(bytes) {
    // it's unlikely that we'll have files bigger than this
    if (bytes > 1024 ** 4) {
        // check if file is smaller than 10 to display fractions
        if (bytes < (1024 ** 4) * 10) {
            return (Math.round((bytes / (1024 ** 4)) * 10) / 10) + 'TB';
        }
        return Math.round(bytes / (1024 ** 4)) + 'TB';
    } else if (bytes > 1024 ** 3) {
        if (bytes < (1024 ** 3) * 10) {
            return (Math.round((bytes / (1024 ** 3)) * 10) / 10) + 'GB';
        }
        return Math.round(bytes / (1024 ** 3)) + 'GB';
    } else if (bytes > 1024 ** 2) {
        if (bytes < (1024 ** 2) * 10) {
            return (Math.round((bytes / (1024 ** 2)) * 10) / 10) + 'MB';
        }
        return Math.round(bytes / (1024 ** 2)) + 'MB';
    } else if (bytes > 1024) {
        return Math.round(bytes / 1024) + 'KB';
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
export function getUserIdFromChannelId(channelId, currentUserId = getCurrentUserId(store.getState())) {
    var ids = channelId.split('__');
    var otherUserId = '';
    if (ids[0] === currentUserId) {
        otherUserId = ids[1];
    } else {
        otherUserId = ids[0];
    }

    return otherUserId;
}

export function windowWidth() {
    return window.innerWidth;
}

export function windowHeight() {
    return window.innerHeight;
}

// Should be refactored, seems to make most sense to wrap TextboxLinks in a connect(). To discuss
export function isFeatureEnabled(feature, state) {
    return getBool(state, Constants.Preferences.CATEGORY_ADVANCED_SETTINGS, Constants.FeatureTogglePrefix + feature.label);
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
        return files.types != null && files.types.includes('Files');
    }

    return files.types != null && (files.types.indexOf ? files.types.indexOf('Files') !== -1 : files.types.contains('application/x-moz-file'));
}

export function isUriDrop(dataTransfer) {
    if (UserAgent.isInternetExplorer() || UserAgent.isEdge() || UserAgent.isSafari()) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
            if (dataTransfer.items[i].type === 'text/uri-list') {
                return true;
            }
        }
    }
    return false; // we don't care about others, they handle as we want it
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

export function getRootPost(postList) {
    return postList.find((post) => post.root_id === '');
}

export function localizeMessage(id, defaultMessage) {
    const state = store.getState();

    const locale = getCurrentLocale(state);
    const translations = getTranslations(state, locale);

    if (!translations || !(id in translations)) {
        return defaultMessage || id;
    }

    return translations[id];
}

export function localizeAndFormatMessage(id, defaultMessage, template) {
    const base = localizeMessage(id, defaultMessage);

    if (!template) {
        return base;
    }

    return base.replace(/{[\w]+}/g, (match) => {
        const key = match.substr(1, match.length - 2);
        return template[key] || match;
    });
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
    let errorId = t('user.settings.security.passwordError');
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

function isChannelOrPermalink(link) {
    let match = (/\/([^/]+)\/channels\/(\S+)/).exec(link);
    if (match) {
        return {
            type: 'channel',
            teamName: match[1],
            channelName: match[2],
        };
    }
    match = (/\/([^/]+)\/pl\/(\w+)/).exec(link);
    if (match) {
        return {
            type: 'permalink',
            teamName: match[1],
            postId: match[2],
        };
    }
    return match;
}

export async function handleFormattedTextClick(e, currentRelativeTeamUrl = '') {
    const hashtagAttribute = e.target.getAttributeNode('data-hashtag');
    const linkAttribute = e.target.getAttributeNode('data-link');
    const channelMentionAttribute = e.target.getAttributeNode('data-channel-mention');

    if (hashtagAttribute) {
        e.preventDefault();

        store.dispatch(searchForTerm(hashtagAttribute.value));
    } else if (linkAttribute) {
        const MIDDLE_MOUSE_BUTTON = 1;

        if (!(e.button === MIDDLE_MOUSE_BUTTON || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();

            const state = store.getState();
            const user = getCurrentUser(state);
            if (isSystemAdmin(user.roles)) {
                const match = isChannelOrPermalink(linkAttribute.value);
                if (match) {
                    // Get team by name
                    const {teamName} = match;
                    let team = getTeamByName(state, teamName);
                    if (!team) {
                        const {data: teamData} = await store.dispatch(getTeamByNameAction(teamName));
                        team = teamData;
                    }
                    if (team && team.delete_at === 0) {
                        let channel;

                        // Handle channel url - Get channel data from channel name
                        if (match.type === 'channel') {
                            const {channelName} = match;
                            channel = getChannelsNameMapInTeam(state, team.id)[channelName];
                            if (!channel) {
                                const {data: channelData} = await store.dispatch(getChannelByNameAndTeamName(teamName, channelName, true));
                                channel = channelData;
                            }
                        } else { // Handle permalink - Get channel data from post
                            const {postId} = match;
                            let post = getPost(state, postId);
                            if (!post) {
                                const {data: postData} = await store.dispatch(getPostAction(match.postId));
                                post = postData;
                            }
                            if (post) {
                                channel = getChannel(state, post.channel_id);
                                if (!channel) {
                                    const {data: channelData} = await store.dispatch(getChannelAction(post.channel_id));
                                    channel = channelData;
                                }
                            }
                        }
                        if (channel && channel.type === Constants.PRIVATE_CHANNEL) {
                            let member = getMyChannelMemberships(state)[channel.id];
                            if (!member) {
                                const membership = await store.dispatch(getChannelMember(channel.id, getCurrentUserId(state)));
                                if ('data' in membership) {
                                    member = membership.data;
                                }
                            }
                            if (!member) {
                                const {data} = await store.dispatch(joinPrivateChannelPrompt(team, channel, false));
                                if (data.join) {
                                    let error = false;
                                    if (!getTeamMemberships(state)[team.id]) {
                                        const joinTeamResult = await store.dispatch(addUserToTeam(team.id, user.id));
                                        error = joinTeamResult.error;
                                    }
                                    if (!error) {
                                        await store.dispatch(joinChannel(user.id, team.id, channel.id, channel.name));
                                    }
                                } else {
                                    return;
                                }
                            }
                        }
                    }
                }
            }

            e.stopPropagation();
            browserHistory.push(linkAttribute.value);
        }
    } else if (channelMentionAttribute) {
        e.preventDefault();
        browserHistory.push(currentRelativeTeamUrl + '/channels/' + channelMentionAttribute.value);
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

export function copyToClipboard(data) {
    // Attempt to use the newer clipboard API when possible
    const clipboard = navigator.clipboard;
    if (clipboard) {
        clipboard.writeText(data);
        return;
    }

    // creates a tiny temporary text area to copy text out of
    // see https://stackoverflow.com/a/30810322/591374 for details
    const textArea = document.createElement('textarea');
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
    textArea.value = data;
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

export function compareChannels(a, b) {
    const aDisplayName = a.display_name.toUpperCase();
    const bDisplayName = b.display_name.toUpperCase();
    const result = aDisplayName.localeCompare(bDisplayName);
    if (result !== 0) {
        return result;
    }

    const aName = a.name.toUpperCase();
    const bName = b.name.toUpperCase();
    return aName.localeCompare(bName);
}

export function setCSRFFromCookie() {
    if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('MMCSRF=')) {
                Client4.setCSRF(cookie.replace('MMCSRF=', ''));
                break;
            }
        }
    }
}

/**
 * Returns true if in dev mode, false otherwise.
 */
export function isDevMode() {
    const config = getConfig(store.getState());
    return config.EnableDeveloper === 'true';
}

/**
 * Enables dev mode features.
 */
export function enableDevModeFeatures() {
    /*eslint no-extend-native: ["error", { "exceptions": ["Set", "Map"] }]*/
    Object.defineProperty(Set.prototype, 'length', {
        configurable: true, // needed for testing
        get: () => {
            throw new Error('Set.length is not supported. Use Set.size instead.');
        },
    });
    Object.defineProperty(Map.prototype, 'length', {
        configurable: true, // needed for testing
        get: () => {
            throw new Error('Map.length is not supported. Use Map.size instead.');
        },
    });
}

/**
 * Get closest parent which match selector
 */
export function getClosestParent(elem, selector) {
    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            ((s) => {
                const matches = (this.document || this.ownerDocument).querySelectorAll(s);
                let i = matches.length - 1;
                while (i >= 0 && matches.item(i) !== this) {
                    i--;
                }
                return i > -1;
            });
    }

    // Get the closest matching element
    let currentElem = elem;
    for (; currentElem && currentElem !== document; currentElem = currentElem.parentNode) {
        if (currentElem.matches(selector)) {
            return currentElem;
        }
    }
    return null;
}

const BOLD_MD = '**';
const ITALIC_MD = '*';

/**
 * Applies bold/italic/link markdown on textbox associated with event and returns
 * modified text alongwith modified selection positions.
 */
export function applyHotkeyMarkdown(e) {
    e.preventDefault();

    if (e.keyCode === Constants.KeyCodes.B[1] || e.keyCode === Constants.KeyCodes.I[1]) {
        return applyBoldItalicMarkdown(e);
    } else if (e.keyCode === Constants.KeyCodes.K[1]) {
        return applyLinkMarkdown(e);
    }

    throw Error('Unsupported key code: ' + e.keyCode);
}

function applyBoldItalicMarkdown(e) {
    const el = e.target;
    const {selectionEnd, selectionStart, value} = el;

    // <prefix> <selection> <suffix>
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    // Is it italic hot key on existing bold markdown? i.e. italic on **haha**
    let isItalicFollowedByBold = false;
    let delimiter = '';

    if (e.keyCode === Constants.KeyCodes.B[1]) {
        delimiter = BOLD_MD;
    } else if (e.keyCode === Constants.KeyCodes.I[1]) {
        delimiter = ITALIC_MD;
        isItalicFollowedByBold = prefix.endsWith(BOLD_MD) && suffix.startsWith(BOLD_MD);
    }

    // Does the selection have current hotkey's markdown?
    const hasCurrentMarkdown = prefix.endsWith(delimiter) && suffix.startsWith(delimiter);

    // Does current selection have both of the markdown around it? i.e. ***haha***
    const hasItalicAndBold = prefix.endsWith(BOLD_MD + ITALIC_MD) && suffix.startsWith(BOLD_MD + ITALIC_MD);

    let newValue = '';
    let newStart = 0;
    let newEnd = 0;
    if (hasItalicAndBold || (hasCurrentMarkdown && !isItalicFollowedByBold)) {
        // message already has the markdown; remove it
        newValue = prefix.substring(0, prefix.length - delimiter.length) + selection + suffix.substring(delimiter.length);
        newStart = selectionStart - delimiter.length;
        newEnd = selectionEnd - delimiter.length;
    } else {
        // Add italic or bold markdown
        newValue = prefix + delimiter + selection + delimiter + suffix;
        newStart = selectionStart + delimiter.length;
        newEnd = selectionEnd + delimiter.length;
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
}

function applyLinkMarkdown(e) {
    const el = e.target;
    const {selectionEnd, selectionStart, value} = el;

    // <prefix> <selection> <suffix>
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    const delimiterStart = '[';
    const delimiterEnd = '](url)';

    // Does the selection have link markdown?
    const hasMarkdown = prefix.endsWith(delimiterStart) && suffix.startsWith(delimiterEnd);

    let newValue = '';
    let newStart = 0;
    let newEnd = 0;

    // When url is to be selected in [...](url), selection cursors need to shift by this much.
    const urlShift = delimiterStart.length + 2; // ']'.length + ']('.length
    if (hasMarkdown) {
        // message already has the markdown; remove it
        newValue = prefix.substring(0, prefix.length - delimiterStart.length) + selection + suffix.substring(delimiterEnd.length);
        newStart = selectionStart - delimiterStart.length;
        newEnd = selectionEnd - delimiterStart.length;
    } else if (value.length === 0) {
        // no input; Add [|](url)
        newValue = delimiterStart + delimiterEnd;
        newStart = delimiterStart.length;
        newEnd = delimiterStart.length;
    } else if (selectionStart < selectionEnd) {
        // there is something selected; put markdown around it and preserve selection
        newValue = prefix + delimiterStart + selection + delimiterEnd + suffix;
        newStart = selectionEnd + urlShift;
        newEnd = newStart + urlShift;
    } else {
        // nothing is selected
        const spaceBefore = prefix.charAt(prefix.length - 1) === ' ';
        const spaceAfter = suffix.charAt(0) === ' ';
        const cursorBeforeWord = ((selectionStart !== 0 && spaceBefore && !spaceAfter) ||
                                  (selectionStart === 0 && !spaceAfter));
        const cursorAfterWord = ((selectionEnd !== value.length && spaceAfter && !spaceBefore) ||
                                 (selectionEnd === value.length && !spaceBefore));

        if (cursorBeforeWord) {
            // cursor before a word
            const word = value.substring(selectionStart, findWordEnd(value, selectionStart));

            newValue = prefix + delimiterStart + word + delimiterEnd + suffix.substring(word.length);
            newStart = selectionStart + word.length + urlShift;
            newEnd = newStart + urlShift;
        } else if (cursorAfterWord) {
            // cursor after a word
            const cursorAtEndOfLine = (selectionStart === selectionEnd && selectionEnd === value.length);
            if (cursorAtEndOfLine) {
                // cursor at end of line
                newValue = value + ' ' + delimiterStart + delimiterEnd;
                newStart = selectionEnd + 1 + delimiterStart.length;
                newEnd = newStart;
            } else {
                // cursor not at end of line
                const word = value.substring(findWordStart(value, selectionStart), selectionStart);

                newValue = prefix.substring(0, prefix.length - word.length) + delimiterStart + word + delimiterEnd + suffix;
                newStart = selectionStart + urlShift;
                newEnd = newStart + urlShift;
            }
        } else {
            // cursor is in between a word
            const wordStart = findWordStart(value, selectionStart);
            const wordEnd = findWordEnd(value, selectionStart);
            const word = value.substring(wordStart, wordEnd);

            newValue = prefix.substring(0, wordStart) + delimiterStart + word + delimiterEnd + value.substring(wordEnd);
            newStart = wordEnd + urlShift;
            newEnd = newStart + urlShift;
        }
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
}

function findWordEnd(text, start) {
    const wordEnd = text.indexOf(' ', start);
    return wordEnd === -1 ? text.length : wordEnd;
}

function findWordStart(text, start) {
    const wordStart = text.lastIndexOf(' ', start - 1) + 1;
    return wordStart === -1 ? 0 : wordStart;
}

/**
 * Adjust selection to correct text when there is Italic markdown (_) around selected text.
 */
export function adjustSelection(inputBox, e) {
    const el = e.target;
    const {selectionEnd, selectionStart, value} = el;

    if (selectionStart === selectionEnd) {
        // nothing selected.
        return;
    }

    e.preventDefault();

    const firstUnderscore = value.charAt(selectionStart) === '_';
    const lastUnderscore = value.charAt(selectionEnd - 1) === '_';

    const spaceBefore = value.charAt(selectionStart - 1) === ' ';
    const spaceAfter = value.charAt(selectionEnd) === ' ';

    if (firstUnderscore && lastUnderscore && (spaceBefore || spaceAfter)) {
        setSelectionRange(inputBox, selectionStart + 1, selectionEnd - 1);
    }
}

export function getNextBillingDate() {
    const nextBillingDate = moment().add(1, 'months').startOf('month');
    return nextBillingDate.format('MMM D, YYYY');
}

export function stringToNumber(s) {
    if (!s) {
        return 0;
    }

    return parseInt(s, 10);
}

export function renderPurchaseLicense() {
    return (
        <div className='purchase-card'>
            <PurchaseLink
                eventID='post_trial_purchase_license'
                buttonTextElement={
                    <FormattedMessage
                        id='admin.license.trialCard.purchase_license'
                        defaultMessage='Purchase a license'
                    />
                }
            />
            <ContactUsButton
                eventID='post_trial_contact_sales'
            />
        </div>
    );
}

export function deleteKeysFromObject(value, keys) {
    for (const key of keys) {
        delete value[key];
    }
    return value;
}

function isSelection() {
    const selection = window.getSelection();
    return selection.type === 'Range';
}

/*
 * Returns false when the element clicked or its ancestors
 * is a potential click target (link, button, image, etc..)
 * but not the events currentTarget
 * and true in any other case.
 *
 * @param {string} selector - CSS selector of elements not eligible for click
 * @returns {function}
 */
export function makeIsEligibleForClick(selector = '') {
    return (event) => {
        const currentTarget = event.currentTarget;
        let node = event.target;

        if (isSelection()) {
            return false;
        }

        if (node === currentTarget) {
            return true;
        }

        // in the case of a react Portal
        if (!currentTarget.contains(node)) {
            return false;
        }

        // traverses the targets parents up to currentTarget to see
        // if any of them is a potentially clickable element
        while (node) {
            if (!node || node === currentTarget) {
                break;
            }

            if (
                CLICKABLE_ELEMENTS.includes(node.tagName.toLowerCase()) ||
                node.getAttribute('role') === 'button' ||
                (selector && node.matches(selector))
            ) {
                return false;
            }

            node = node.parentNode;
        }

        return true;
    };
}
