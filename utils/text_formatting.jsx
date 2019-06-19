// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import XRegExp from 'xregexp';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';
import emojiRegex from 'emoji-regex';

import {formatWithRenderer} from 'utils/markdown';
import {getEmojiMap} from 'selectors/emojis';
import store from 'stores/redux_store.jsx';

import * as Emoticons from './emoticons.jsx';
import * as Markdown from './markdown';

const punctuation = XRegExp.cache('[^\\pL\\d]');

const AT_MENTION_PATTERN = /\B@([a-z0-9.\-_]+)/gi;
const UNICODE_EMOJI_REGEX = emojiRegex();
const htmlEmojiPattern = /^<p>\s*(?:<img class="emoticon"[^>]*>|<span data-emoticon[^>]*>[^<]*<\/span>\s*|<span class="emoticon emoticon--unicode">[^<]*<\/span>\s*)+<\/p>$/;

// pattern to detect the existence of a Chinese, Japanese, or Korean character in a string
// http://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi
const cjkPattern = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\uac00-\ud7a3]/;

// Performs formatting of user posts including highlighting mentions and search terms and converting urls, hashtags,
// @mentions and ~channels to links by taking a user's message and returning a string of formatted html. Also takes
// a number of options as part of the second parameter:
// - searchTerm - If specified, this word is highlighted in the resulting html. Defaults to nothing.
// - searchMatches - If specified, an array of words that will be highlighted. Defaults to nothing. If both
//     this and searchTerm are specified, this takes precedence.
// - mentionHighlight - Specifies whether or not to highlight mentions of the current user. Defaults to true.
// - mentionKeys - A list of mention keys for the current user to highlight.
// - singleline - Specifies whether or not to remove newlines. Defaults to false.
// - emoticons - Enables emoticon parsing with a data-emoticon attribute. Defaults to true.
// - markdown - Enables markdown parsing. Defaults to true.
// - siteURL - The origin of this Mattermost instance. If provided, links to channels and posts will be replaced with internal
//     links that can be handled by a special click handler.
// - atMentions - Whether or not to render at mentions into spans with a data-mention attribute. Defaults to false.
// - channelNamesMap - An object mapping channel display names to channels. If provided, ~channel mentions will be replaced with
//     links to the relevant channel.
// - team - The current team.
// - proxyImages - If specified, images are proxied. Defaults to false.
// - autolinkedUrlSchemes - An array of url schemes that will be allowed for autolinking. Defaults to autolinking with any url scheme.
// - renderer - a custom renderer object to use in the formatWithRenderer function. Defaults to empty.
// - minimumHashtagLength - Minimum number of characters in a hashtag. Defaults to 3.
export function formatText(text, inputOptions) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    let output = text;

    const options = Object.assign({}, inputOptions);

    if (options.searchMatches) {
        options.searchPatterns = options.searchMatches.map(convertSearchTermToRegex);
    } else {
        options.searchPatterns = parseSearchTerms(options.searchTerm).map(convertSearchTermToRegex);
    }

    if (options.renderer) {
        output = formatWithRenderer(output, options.renderer);
        output = doFormatText(output, options);
    } else if (!('markdown' in options) || options.markdown) {
        // the markdown renderer will call doFormatText as necessary
        output = Markdown.format(output, options);
    } else {
        output = sanitizeHtml(output);
        output = doFormatText(output, options);
    }

    // replace newlines with spaces if necessary
    if (options.singleline) {
        output = replaceNewlines(output);
    }

    if (htmlEmojiPattern.test(output.trim())) {
        output = '<span class="all-emoji">' + output.trim() + '</span>';
    }

    return output;
}

// Performs most of the actual formatting work for formatText. Not intended to be called normally.
export function doFormatText(text, options) {
    let output = text;

    const tokens = new Map();

    // replace important words and phrases with tokens
    if (options.atMentions) {
        output = autolinkAtMentions(output, tokens);
    }

    if (options.channelNamesMap) {
        output = autolinkChannelMentions(output, tokens, options.channelNamesMap, options.team);
    }

    output = autolinkEmails(output, tokens);
    output = autolinkHashtags(output, tokens, options.minimumHashtagLength);

    if (!('emoticons' in options) || options.emoticon) {
        output = Emoticons.handleEmoticons(output, tokens);
    }

    if (options.searchPatterns) {
        output = highlightSearchTerms(output, tokens, options.searchPatterns);
    }

    if (!('mentionHighlight' in options) || options.mentionHighlight) {
        output = highlightCurrentMentions(output, tokens, options.mentionKeys);
    }

    if (!('emoticons' in options) || options.emoticon) {
        const emojiMap = getEmojiMap(store.getState());
        output = handleUnicodeEmoji(output, emojiMap, UNICODE_EMOJI_REGEX);
    }

    // reinsert tokens with formatted versions of the important words and phrases
    output = replaceTokens(output, tokens);

    return output;
}

export function sanitizeHtml(text) {
    let output = text;

    // normal string.replace only does a single occurrance so use a regex instead
    output = output.replace(/&/g, '&amp;');
    output = output.replace(/</g, '&lt;');
    output = output.replace(/>/g, '&gt;');
    output = output.replace(/'/g, '&apos;');
    output = output.replace(/"/g, '&quot;');

    return output;
}

// Copied from our fork of commonmark.js
var emailAlphaNumericChars = '\\p{L}\\p{Nd}';
var emailSpecialCharacters = '!#$%&\'*+\\-\\/=?^_`{|}~';
var emailRestrictedSpecialCharacters = '\\s(),:;<>@\\[\\]';
var emailValidCharacters = emailAlphaNumericChars + emailSpecialCharacters;
var emailValidRestrictedCharacters = emailValidCharacters + emailRestrictedSpecialCharacters;
var emailStartPattern = '(?:[' + emailValidCharacters + '](?:[' + emailValidCharacters + ']|\\.(?!\\.|@))*|\\"[' + emailValidRestrictedCharacters + '.]+\\")@';
var reEmail = XRegExp.cache('(^|[^\\pL\\d])(' + emailStartPattern + '[\\pL\\d.\\-]+[.]\\pL{2,4}(?=$|[^\\p{L}]))', 'g');

// Convert emails into tokens
function autolinkEmails(text, tokens) {
    function replaceEmailWithToken(fullMatch, prefix, email) {
        const index = tokens.size;
        const alias = `$MM_EMAIL${index}$`;

        tokens.set(alias, {
            value: `<a class="theme" href="mailto:${email}">${email}</a>`,
            originalText: email,
        });

        return prefix + alias;
    }

    let output = text;
    output = XRegExp.replace(text, reEmail, replaceEmailWithToken);

    return output;
}

export function autolinkAtMentions(text, tokens) {
    function replaceAtMentionWithToken(fullMatch, username) {
        const index = tokens.size;
        const alias = `$MM_ATMENTION${index}$`;

        tokens.set(alias, {
            value: `<span data-mention="${username}">@${username}</span>`,
            originalText: fullMatch,
        });

        return alias;
    }

    let output = text;

    // handle @channel, @all, @here mentions first (purposely excludes trailing punctuation)
    output = output.replace(/\B@(channel|all|here)\b/gi, replaceAtMentionWithToken);

    // handle all other mentions (supports trailing punctuation)
    let match = output.match(AT_MENTION_PATTERN);
    while (match && match.length > 0) {
        output = output.replace(AT_MENTION_PATTERN, replaceAtMentionWithToken);
        match = output.match(AT_MENTION_PATTERN);
    }

    return output;
}

function autolinkChannelMentions(text, tokens, channelNamesMap, team) {
    function channelMentionExists(c) {
        return Boolean(channelNamesMap[c]);
    }
    function addToken(channelName, mention, displayName) {
        const index = tokens.size;
        const alias = `$MM_CHANNELMENTION${index}$`;
        let href = '#';
        if (team) {
            href = (window.basename || '') + '/' + team.name + '/channels/' + channelName;
        }

        tokens.set(alias, {
            value: `<a class="mention-link" href="${href}" data-channel-mention="${channelName}">~${displayName}</a>`,
            originalText: mention,
        });
        return alias;
    }

    function replaceChannelMentionWithToken(fullMatch, mention, channelName) {
        let channelNameLower = channelName.toLowerCase();

        if (channelMentionExists(channelNameLower)) {
            // Exact match
            const alias = addToken(channelNameLower, mention, escapeHtml(channelNamesMap[channelNameLower].display_name));
            return alias;
        }

        // Not an exact match, attempt to truncate any punctuation to see if we can find a channel
        const originalChannelName = channelNameLower;

        for (let c = channelNameLower.length; c > 0; c--) {
            if (punctuation.test(channelNameLower[c - 1])) {
                channelNameLower = channelNameLower.substring(0, c - 1);

                if (channelMentionExists(channelNameLower)) {
                    const suffix = originalChannelName.substr(c - 1);
                    const alias = addToken(channelNameLower, '~' + channelNameLower,
                        escapeHtml(channelNamesMap[channelNameLower].display_name));
                    return alias + suffix;
                }
            } else {
                // If the last character is not punctuation, no point in going any further
                break;
            }
        }

        return fullMatch;
    }

    let output = text;
    output = output.replace(/\B(~([a-z0-9.\-_]*))/gi, replaceChannelMentionWithToken);

    return output;
}

export function escapeRegex(text) {
    if (text == null) {
        return '';
    }
    return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
};

export function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (match) => htmlEntities[match]);
}

export function convertEntityToCharacter(text) {
    return text.
        replace(/&lt;/g, '<').
        replace(/&gt;/g, '>').
        replace(/&#39;/g, '\'').
        replace(/&quot;/g, '"').
        replace(/&amp;/g, '&');
}

function highlightCurrentMentions(text, tokens, mentionKeys = []) {
    let output = text;

    // look for any existing tokens which are self mentions and should be highlighted
    var newTokens = new Map();
    for (const [alias, token] of tokens) {
        const tokenTextLower = token.originalText.toLowerCase();

        if (mentionKeys.findIndex((key) => key.key.toLowerCase() === tokenTextLower) !== -1) {
            const index = tokens.size + newTokens.size;
            const newAlias = `$MM_SELFMENTION${index}$`;

            newTokens.set(newAlias, {
                value: `<span class="mention--highlight">${alias}</span>`,
                originalText: token.originalText,
            });
            output = output.replace(alias, newAlias);
        }
    }

    // the new tokens are stashed in a separate map since we can't add objects to a map during iteration
    for (const newToken of newTokens) {
        tokens.set(newToken[0], newToken[1]);
    }

    // look for self mentions in the text
    function replaceCurrentMentionWithToken(fullMatch, prefix, mention, suffix = '') {
        const index = tokens.size;
        const alias = `$MM_SELFMENTION${index}$`;

        tokens.set(alias, {
            value: `<span class="mention--highlight">${mention}</span>`,
            originalText: mention,
        });

        return prefix + alias + suffix;
    }

    for (const mention of mentionKeys) {
        if (!mention || !mention.key) {
            continue;
        }

        let flags = 'g';
        if (!mention.caseSensitive) {
            flags += 'i';
        }

        let pattern;
        if (cjkPattern.test(mention.key)) {
            // In the case of CJK mention key, even if there's no delimiters (such as spaces) at both ends of a word, it is recognized as a mention key
            pattern = new RegExp(`()(${escapeRegex(mention.key)})()`, flags);
        } else {
            pattern = new RegExp(`(^|\\W)(${escapeRegex(mention.key)})(\\b|_+\\b)`, flags);
        }
        output = output.replace(pattern, replaceCurrentMentionWithToken);
    }

    return output;
}

function autolinkHashtags(text, tokens, minimumHashtagLength = 3) {
    let output = text;

    var newTokens = new Map();
    for (const [alias, token] of tokens) {
        if (token.originalText.lastIndexOf('#', 0) === 0) {
            const index = tokens.size + newTokens.size;
            const newAlias = `$MM_HASHTAG${index}$`;

            newTokens.set(newAlias, {
                value: `<a class='mention-link' href='#' data-hashtag='${token.originalText}'>${token.originalText}</a>`,
                originalText: token.originalText,
                hashtag: token.originalText.substring(1),
            });

            output = output.replace(alias, newAlias);
        }
    }

    // the new tokens are stashed in a separate map since we can't add objects to a map during iteration
    for (const newToken of newTokens) {
        tokens.set(newToken[0], newToken[1]);
    }

    // look for hashtags in the text
    function replaceHashtagWithToken(fullMatch, prefix, originalText) {
        const index = tokens.size;
        const alias = `$MM_HASHTAG${index}$`;

        if (originalText.length < minimumHashtagLength + 1) {
            // too short to be a hashtag
            return fullMatch;
        }

        tokens.set(alias, {
            value: `<a class='mention-link' href='#' data-hashtag='${originalText}'>${originalText}</a>`,
            originalText,
            hashtag: originalText.substring(1),
        });

        return prefix + alias;
    }

    return output.replace(XRegExp.cache('(^|\\W)(#\\pL[\\pL\\d\\-_.]*[\\pL\\d])', 'g'), replaceHashtagWithToken);
}

const puncStart = XRegExp.cache('^[^\\pL\\d\\s#]+');
const puncEnd = XRegExp.cache('[^\\pL\\d\\s]+$');

function parseSearchTerms(searchTerm) {
    let terms = [];

    let termString = searchTerm;

    while (termString) {
        let captured;

        // check for a quoted string
        captured = (/^"([^"]*)"/).exec(termString);
        if (captured) {
            termString = termString.substring(captured[0].length);

            if (captured[1].length > 0) {
                terms.push(captured[1]);
            }
            continue;
        }

        // check for a search flag (and don't add it to terms)
        captured = (/^(?:in|from|channel): ?\S+/).exec(termString);
        if (captured) {
            termString = termString.substring(captured[0].length);
            continue;
        }

        // capture at mentions differently from the server so we can highlight them with the preceeding at sign
        captured = (/^@[a-z0-9.-_]+\b/).exec(termString);
        if (captured) {
            termString = termString.substring(captured[0].length);

            terms.push(captured[0]);
            continue;
        }

        // capture any plain text up until the next quote or search flag
        captured = (/^.+?(?=\bin:|\bfrom:|\bchannel:|"|$)/).exec(termString);
        if (captured) {
            termString = termString.substring(captured[0].length);

            // break the text up into words based on how the server splits them in SqlPostStore.SearchPosts and then discard empty terms
            terms.push(...captured[0].split(/[ <>+()~@]/).filter((term) => Boolean(term)));
            continue;
        }

        // we should never reach this point since at least one of the regexes should match something in the remaining text
        throw new Error('Infinite loop in search term parsing: "' + termString + '"');
    }

    // remove punctuation from each term
    terms = terms.map((term) => {
        term.replace(puncStart, '');
        if (term.charAt(term.length - 1) !== '*') {
            term.replace(puncEnd, '');
        }
        return term;
    });

    return terms;
}

function convertSearchTermToRegex(term) {
    let pattern;

    if (cjkPattern.test(term)) {
        // term contains Chinese, Japanese, or Korean characters so don't mark word boundaries
        pattern = '()(' + escapeRegex(term.replace(/\*/g, '')) + ')';
    } else if ((/[^\s][*]$/).test(term)) {
        pattern = '\\b()(' + escapeRegex(term.substring(0, term.length - 1)) + ')';
    } else if (term.startsWith('@') || term.startsWith('#')) {
        // needs special handling of the first boundary because a word boundary doesn't work before a symbol
        pattern = '(\\W|^)(' + escapeRegex(term) + ')\\b';
    } else {
        pattern = '\\b()(' + escapeRegex(term) + ')\\b';
    }

    return {
        pattern: new RegExp(pattern, 'gi'),
        term,
    };
}

export function highlightSearchTerms(text, tokens, searchPatterns) {
    if (!searchPatterns || searchPatterns.length === 0) {
        return text;
    }

    let output = text;

    function replaceSearchTermWithToken(match, prefix, word) {
        const index = tokens.size;
        const alias = `$MM_SEARCHTERM${index}$`;

        tokens.set(alias, {
            value: `<span class="search-highlight">${word}</span>`,
            originalText: word,
        });

        return prefix + alias;
    }

    for (const pattern of searchPatterns) {
        // highlight existing tokens matching search terms
        var newTokens = new Map();
        for (const [alias, token] of tokens) {
            if (pattern.pattern.test(token.originalText)) {
                // If it's a Hashtag, skip it unless the search term is an exact match.
                let originalText = token.originalText;
                if (originalText.startsWith('#')) {
                    originalText = originalText.substr(1);
                }
                let term = pattern.term;
                if (term.startsWith('#')) {
                    term = term.substr(1);
                }

                if (alias.startsWith('$MM_HASHTAG') && alias.endsWith('$') && originalText.toLowerCase() !== term.toLowerCase()) {
                    continue;
                }

                const index = tokens.size + newTokens.size;
                const newAlias = `$MM_SEARCHTERM${index}$`;

                newTokens.set(newAlias, {
                    value: `<span class="search-highlight">${alias}</span>`,
                    originalText: token.originalText,
                });

                output = output.replace(alias, newAlias);
            }

            // The pattern regexes are global, so calling pattern.pattern.test() above alters their
            // state. Reset lastIndex to 0 between calls to test() to ensure it returns the
            // same result every time it is called with the same value of token.originalText.
            pattern.pattern.lastIndex = 0;
        }

        // the new tokens are stashed in a separate map since we can't add objects to a map during iteration
        for (const newToken of newTokens) {
            tokens.set(newToken[0], newToken[1]);
        }

        output = output.replace(pattern.pattern, replaceSearchTermWithToken);
    }

    return output;
}

export function replaceTokens(text, tokens) {
    let output = text;

    // iterate backwards through the map so that we do replacement in the opposite order that we added tokens
    const aliases = [...tokens.keys()];
    for (let i = aliases.length - 1; i >= 0; i--) {
        const alias = aliases[i];
        const token = tokens.get(alias);
        output = output.replace(alias, token.value);
    }

    return output;
}

function replaceNewlines(text) {
    return text.replace(/\n/g, ' ');
}

export function handleUnicodeEmoji(text, supportedEmoji, searchPattern) {
    let output = text;

    // replace all occurances of unicode emoji with additional markup
    output = output.replace(searchPattern, (emoji) => {
        // convert unicode character to hex string
        const emojiCode = emoji.codePointAt(0).toString(16);

        // convert emoji to image if supported, or wrap in span to apply appropriate formatting
        if (supportedEmoji.hasUnicode(emojiCode)) {
            // build image tag to replace supported unicode emoji
            return `<img class="emoticon" draggable="false" alt="${emoji}" src="${getEmojiImageUrl(supportedEmoji.getUnicode(emojiCode))}">`;
        }

        // wrap unsupported unicode emoji in span to style as needed
        return `<span class="emoticon emoticon--unicode">${emoji}</span>`;
    });
    return output;
}
