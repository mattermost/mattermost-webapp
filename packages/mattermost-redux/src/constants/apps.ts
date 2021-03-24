// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppCallResponseType, AppCallType, AppExpandLevel, AppFieldType} from 'mattermost-redux/types/apps';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.

export const AppBindingLocations = {
    POST_MENU_ITEM: '/post_menu',
    CHANNEL_HEADER_ICON: '/channel_header',
    COMMAND: '/command',
    IN_POST: '/in_post',
};

export const AppBindingPresentations = {
    MODAL: 'modal',
};

export const AppCallResponseTypes: { [name: string]: AppCallResponseType } = {
    OK: 'ok',
    ERROR: 'error',
    FORM: 'form',
    CALL: 'call',
    NAVIGATE: 'navigate',
};

export const AppCallTypes: { [name: string]: AppCallType } = {
    SUBMIT: 'submit',
    LOOKUP: 'lookup',
    FORM: 'form',
    CANCEL: 'cancel',
};

export const AppExpandLevels: { [name: string]: AppExpandLevel } = {
    EXPAND_DEFAULT: '',
    EXPAND_NONE: 'none',
    EXPAND_ALL: 'all',
    EXPAND_SUMMARY: 'summary',
};

export const AppFieldTypes: { [name: string]: AppFieldType } = {
    TEXT: 'text',
    STATIC_SELECT: 'static_select',
    DYNAMIC_SELECT: 'dynamic_select',
    BOOL: 'bool',
    USER: 'user',
    CHANNEL: 'channel',
};
