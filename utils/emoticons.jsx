// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const emoticonPatterns = {
    slightly_smiling_face: /(^|\B)(:-?\))($|\B)/g, // :)
    wink: /(^|\B)(;-?\))($|\B)/g, // ;)
    open_mouth: /(^|\B)(:o)($|\b)/gi, // :o
    scream: /(^|\B)(:-o)($|\b)/gi, // :-o
    smirk: /(^|\B)(:-?])($|\B)/g, // :]
    smile: /(^|\B)(:-?d)($|\b)/gi, // :D
    stuck_out_tongue_closed_eyes: /(^|\b)(x-d)($|\b)/gi, // x-d
    stuck_out_tongue: /(^|\B)(:-?p)($|\b)/gi, // :p
    rage: /(^|\B)(:-?[[@])($|\B)/g, // :@
    slightly_frowning_face: /(^|\B)(:-?\()($|\B)/g, // :(
    cry: /(^|\B)(:[`'’]-?\(|:&#x27;\(|:&#39;\()($|\B)/g, // :`(
    confused: /(^|\B)(:-?\/)($|\B)/g, // :/
    confounded: /(^|\B)(:-?s)($|\b)/gi, // :s
    neutral_face: /(^|\B)(:-?\|)($|\B)/g, // :|
    flushed: /(^|\B)(:-?\$)($|\B)/g, // :$
    mask: /(^|\B)(:-x)($|\b)/gi, // :-x
    heart: /(^|\B)(<3|&lt;3)($|\b)/g, // <3
    broken_heart: /(^|\B)(<\/3|&lt;\/3)($|\b)/g, // </3
    thumbsup: /(^|\B)(:\+1:)($|\B)/g, // :+1:
    thumbsdown: /(^|\B)(:-1:)($|\B)/g, // :-1:
};

export const EMOJI_PATTERN = /(:([a-zA-Z0-9_-]+):)/g;

export function handleEmoticons(text, tokens) {
    let output = text;

    function replaceEmoticonWithToken(fullMatch, prefix, matchText, name) {
        const index = tokens.size;
        const alias = `$MM_EMOTICON${index}$`;

        tokens.set(alias, {
            value: `<span data-emoticon="${name}">${matchText}</span>`,
            originalText: fullMatch,
        });

        return prefix + alias;
    }

    // match named emoticons like :goat:
    output = output.replace(EMOJI_PATTERN, (fullMatch, matchText, name) => replaceEmoticonWithToken(fullMatch, '', matchText, name));

    // match text smilies like :D
    for (const name of Object.keys(emoticonPatterns)) {
        const pattern = emoticonPatterns[name];

        // this might look a bit funny, but since the name isn't contained in the actual match
        // like with the named emoticons, we need to add it in manually
        output = output.replace(pattern, (fullMatch, prefix, matchText) => replaceEmoticonWithToken(fullMatch, prefix, matchText, name));
    }

    return output;
}
