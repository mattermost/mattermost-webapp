// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

function applyEncapsulatedMarkdown(ancestorContainer, builtString) {
    if (ancestorContainer.nodeName === '#text') {
        return parseNodeToText(ancestorContainer.parentNode, builtString);
    }
    return parseNodeToText(ancestorContainer, builtString);
}

function doDirectChildrenMatchTag(element, tagName) {
    return Array.from(element.childNodes).some((child) => {
        if (child.tagName === tagName) {
            return true;
        }
        return false;
    });
}

function getParsedChildNodes(node, shouldBreakLine = true) {
    let builtString = '';
    const nodes = Array.from(node.childNodes);
    for (let i = 0; i < nodes.length; i++) {
        const childNode = nodes[i];
        const contentToAdd = parseNodeToText(childNode, shouldBreakLine);
        if (contentToAdd) {
            builtString += contentToAdd;
        }
    }
    return builtString;
}

function parseNodeToText(node, shouldBreakLine = true, textContent = '') {
    const optionalBreakLine = shouldBreakLine ? '\n' : '';

    const isEmojiContainer = node.tagName === 'SPAN' && node.dataset.emoticon;
    const isLinkContainer = node.tagName === 'A';
    const isParagraph = node.tagName === 'P';
    const isListItem = node.tagName === 'LI';
    const isListContainer = node.tagName === 'OL';
    const isImage = node.tagName === 'IMG';
    const imageDescendant = node.tagName === 'DIV' && doDirectChildrenMatchTag(node, 'IMG');
    const isQuoteContainer = (node.tagName === 'P' && node.parentNode.tagName === 'BLOCKQUOTE') || node.tagName === 'BLOCKQUOTE';
    const isCodeContainer = ['P', 'SPAN'].includes(node.tagName) && (node.querySelector('.codespan__pre-wrap') || node.className === 'codespan__pre-wrap');
    const isUnlabeledCodeContainer = ['DIV', 'CODE'].includes(node.tagName) && (node.className === 'post-code post-code--wrap' || node.className === 'hljs');
    const isDiv = node.tagName === 'DIV';
    const isCodeTextContainer = node.tagName === 'SPAN' && node.className === 'hljs-code';
    const isLabeledCodeContainers = node.tagName ? Array.from(node.querySelectorAll('.hljs-code') || []) : [];

    let content = textContent;
    if (!content) {
        if (isEmojiContainer) {
            content = node.dataset.emoticon;
        } else if (isLinkContainer) {
            content = node.childNodes.length > 0 ? getParsedChildNodes(node) : node.textContent;
        } else {
            content = node.textContent;
        }
    }

    if (!node.tagName && node.textContent) {
        return content;
    }
    if (node.tagName.length === 2 && node.tagName[0] === 'H') {
        const headerLevels = parseInt(node.tagName[1], 10);
        const headerHashes = '#'.repeat(headerLevels);
        return `${headerHashes} ${content}` + optionalBreakLine;
    }
    if (isImage || imageDescendant) {
        let image = node;
        if (imageDescendant) {
            image = node.querySelector('img');
        }
        const ImageSrc = image.src;
        const ImageAltText = image.alt;
        return `![${ImageAltText}](${ImageSrc})` + optionalBreakLine;
    }
    if (isListContainer) {
        return getParsedChildNodes(node);
    }
    if (isLinkContainer) {
        return `[${content}](${node.href})` + optionalBreakLine;
    }
    if (isListItem) {
        return `${node.value}. ${content}`;
    }
    if (isQuoteContainer) {
        return `>${content}`;
    }
    if (isParagraph) {
        if (node.childNodes.length) {
            return getParsedChildNodes(node, false);
        }
        return content;
    }
    if (isCodeTextContainer) {
        return `\n${content}`;
    }
    if (isLabeledCodeContainers.length > 0) {
        return '```' + isLabeledCodeContainers.map((stringContainer) => parseNodeToText(stringContainer)).join('') + '\n```';
    }
    if (isUnlabeledCodeContainer) {
        return '```\n' + content.replace(/\n$/, '') + '\n```' + optionalBreakLine;
    }
    if (node.tagName === 'CODE' || isCodeContainer) {
        return '```' + content.replace(/\n$/, '') + '```' + optionalBreakLine;
    }
    if (node.tagName === 'DEL') {
        return `~~${content}~~`;
    }
    if (node.tagName === 'EM') {
        return `*${content}*`;
    }
    if (node.tagName === 'STRONG') {
        return `**${content}**`;
    }
    if (isEmojiContainer) {
        return `:${content}:`;
    }
    if (isDiv) {
        return getParsedChildNodes(node, false);
    }

    return textContent;
}

export function getPostContent(posts, rangySelection) {
    const content = {
        posts: {},
        allContent: '',
    };

    const range = rangySelection.getRangeAt(0);

    const ancestorContainer = range.commonAncestorContainer;
    const clonedContents = range.cloneContents();
    const childList = [...Array.from(clonedContents.childNodes)];
    let isAncestorContainerAllPosts = false;

    for (let i = 0; i < childList.length; i++) {
        const child = childList[i];

        let contentToAdd = '';
        let postMessageText = null;
        if (child.tagName) {
            postMessageText = child.querySelector('.post-message__text');
        }

        if (child.tagName === 'DIV' && postMessageText) {
            contentToAdd = getParsedChildNodes(postMessageText);
            isAncestorContainerAllPosts = true;
        } else {
            contentToAdd = parseNodeToText(child);
        }

        if (contentToAdd.length > 0) {
            content.allContent += contentToAdd;
            const isLastIndex = childList.length - 1 === i;
            if (!isLastIndex) {
                content.allContent += '\n';
            }
        }

        if (posts.length === 1) {
            content.posts[posts[0].id] = content.allContent;
        } else if (postMessageText) {
            const postId = postMessageText.id.split('postMessageText_')[1];
            content.posts[postId] = contentToAdd;
        }
    }

    const nonNullAncestorClassList = Array.from(ancestorContainer.classList || []);
    const isAncestorContainerAPost = nonNullAncestorClassList.includes('post-message__text');
    if (isAncestorContainerAllPosts || isAncestorContainerAPost) {
        return content;
    }

    content.allContent = applyEncapsulatedMarkdown(ancestorContainer, content.allContent);
    return content;
}