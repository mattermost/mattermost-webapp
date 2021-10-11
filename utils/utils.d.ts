// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';
import {ClientConfig} from 'mattermost-redux/types/config';
import {Team} from 'mattermost-redux/types/teams';
import {Theme} from 'mattermost-redux/types/themes';
import {UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {GlobalState} from 'types/store';

export function isMac(): boolean;
export function isLinux(): boolean;

export function createSafeId(prop: string | {defaultMessage: string}): string;

export function cmdOrCtrlPressed<E = React.KeyboardEvent>(e: E, allowAlt = false): boolean;
export function isKeyPressed<E = React.KeyboardEvent>(e: E, key: Array<string | number>): booelan; // The type of key should ideally be [string, number]

export function isUnhandledLineBreakKeyCombo(e: React.KeyboardEvent): boolean;
export function insertLineBreakFromKeyEvent(e: React.KeyboardEvent): string;

export function isInRole(roles: string, inRole: string): boolean;
export function isChannelAdmin(isLicensed: boolean, roles: string, hasAdminScheme = false): boolean;
export function isAdmin(roles: string): boolean;
export function isSystemAdmin(roles: string): boolean;
export function isGuest(user: UserProfile): boolean;

export function getTeamRelativeUrl(team: Team): boolean;
export function getPermalinkUrl(state: GlobalState, teamId: string, postId: string): string;
export function getChannelURL(state: GlobalState, channel: Channel, teamId: string): string;

export function ding(name: string): void;
export function tryNotificationSound(name: string): void;
export function hasSoundOptions(): boolean;

export function getDateForUnixTicks(ticks: number);
export function getTimestamp(): number;

export function getRemainingDaysFromFutureTimestamp(timestamp: number | undefined): number;
export function getLocaleDateFromUTC(timestamp: number, format = 'YYYY/MM/DD HH:mm:ss', userTimezone = ''): number;

export function replaceHtmlEntities(text: string): string;

export function isGIFImage(extin: string): boolean;
export function getFileType(extin: string): string;
export function getFileIconPath(fileInfo: FileInfo): string;
export function getIconClassName(fileTypeIn: string): string;

export function toTitleCase(str: string): string;

export function applyTheme(theme: Theme): void;
export function resetTheme(): void;

export function placeCaretAtEnd(el: HTMLElement): void;
export function getCaretPosition(el: HTMLElement): number;

export function copyTextAreaToDiv(textArea: HTMLTextAreaElement): HTMLTextAreaElement;
export function getCaretXYCoordinate(textArea: HTMLTextAreaElement): {x: number; y: number};
export function getViewportSize(win: Window): {w: number; h: number};
export function offsetTopLeft(el: HTMLElement): {top: number; left: number};
export function getSuggestionBoxAlgn(textArea: HTMLTextAreaElement, pxToSubtract = 0): {pixelsToMoveX: number; pixelsToMoveY: number; lineHeight?: number};
export function getPxToSubstract(char = '@'): number;

export function setSelectionRange(input: HTMLElement, selectionStart: number, selectionEnd: number);
export function setCaretPosition(input: HTMLElement, pos: number);

export function scrollbarWidth(el: HTMLElement): number;

type GoStyleError = {id: string};
export function isValidUsername(name: string): GoStyleError | undefined;
export function isValidBotUsername(name: string): GoStyleError | undefined;

export function isMobile(): boolean;

export function loadImage(url: string, onLoad: () => void, onProgress?: (percentage: number) => void);

export function getFullName(user: UserProfile): string;
export function getDisplayName(user: UserProfile): string;
export function getLongDisplayName(user: UserProfile): string;
export function getLongDisplayNameParts(user: UserProfile): {displayName: string; fullName: string; nickname: string; position: string};

export function getDisplayNameByUser(state: GlobalState, user?: UserProfile): string;

export function sortUsersByStatusAndDisplayName(users: UserProfile[], statusesByUserId: RelationOneToOne<UsersProfile, UserStatus>, teammateNameDisplay: string): UserProfile[];

export function displayEntireNameForUser(user: UserProfile): string;
export function displayFullAndNicknameForUser(user: UserProfile): string;

export function imageURLForUser(userId: string, lastPictureUpdate = 0): string;
export function defaultImageURLForUser(userId: string): string;
export function imageURLForTeam(team: Team): string;

export function fileSizeToString(bytes: number): string;

export function generateId(): string;

export function getDirectChannelName(id: string, otherId: string): string;
export function getUserIdFromChannelName(channel: Channel): string;
export function getUserIdFromChannelId(channelId: string, currentUserId?: string): string;

export function windowWidth(): number;
export function windowHeight(): number;

export function isFeatureEnabled(feature: {label: string}, state: GlobalState): boolean;

export function fillArray<T>(value: T, length: number): T[];

export function isFileTransfer(files: FileList): boolean;
export function isUriDrop(dataTransfer: DataTransfer): boolean;

export function clearFileInput(elm: HTMLInputElement);

export function isPostEphemeral(post: Post): boolean;
export function getRootId(post: Post): string;
export function getRootPost(postList: Post[]): Post | undefined;

export function localizeMessage(id: string, defaultMessage: string): string;
export function localizeAndFormatMessage(id: string, defaultMessage: string, template: any): string;

export function mod(a: number, b: number): number;

export const REACTION_PATTERN: RegExp;

export type PasswordConfig = {minimumLength: number; requireLowercase: boolean; requireUppercase: boolean; requireNumber: boolean; requireSymbol: boolean};
export function getPasswordConfig(config: Partial<ClientConfig>): PasswordConfig;
export function isValidPassword(password: string, passwordConfig: PasswordConfig): {valid: boolean; error?: React.ReactNode};

export function handleFormattedTextClick(e: MouseEvent | React.MouseEvent, currentRelativeTeamUrl = '');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmptyObject(object: any): boolean;

export function removePrefixFromLocalStorage(prefix: string): void;

export function copyToClipboard(data: string): void;

export function moveCursorToEnd<E = MouseEvent>(e: E): void;

export function compareChannels(a: Channel, b: Channel): number;

export function setCSRFFromCookie(): void;

export function isDevMode(): boolean;
export function enableDevModeFeatures(): void;

export function getClosestParent(elem: HTMLElement, selector: string): void;

export function applyHotkeyMarkdown(e: KeyEvent): {message: string; selectionStart: number; selectionEnd: number};
export function adjustSelection(inputBox: HTMLInputElement, e: KeyEvent): void;

export function getNextBillingDate(): string;

export function stringToNumber(s: string | undefined): number;

export function renderPurchaseLicense(): React.ReactNode;

export function deleteKeysFromObject(value: any, keys: string[]): any;

export function makeIsEligibleForClick(selector = ''): (event: MouseEvent) => boolean;
