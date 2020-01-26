// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import removeMd from 'remove-markdown';
import rangy from 'rangy';

import * as TextFormatting from 'utils/text_formatting.jsx';

import {getPostContent} from './copy_parser';

export async function copyPostData(e, getPostForCopy) {
    const selection = rangy.getSelection();
    if (selection.rangeCount) {
        const nodes = selection.getRangeAt(0).getNodes();
        const postIds = new Set(nodes.map((node) => getSelectedNodePostIds(node)).filter((node) => node !== null));
        const showUserAndTime = doesContainPostHeader(nodes);

        if (postIds.size > 0) {
            const postData = Array.from(postIds).map((postId) => getPostForCopy(postId));
            const resolvedPostData = await Promise.all(postData);
            const nonNullPostData = resolvedPostData.filter((data) => data !== null);

            const copiedContent = getPostContent(nonNullPostData, selection);

            if (nonNullPostData.length > 0) {
                e.clipboardData.setData('text/markdown', copiedContent.allContent);
                e.clipboardData.setData('text/html', getHtmlFormat(copiedContent.allContent));
                e.clipboardData.setData('text/plain', getRichTextFormat(nonNullPostData, copiedContent, showUserAndTime));
                e.preventDefault();
            }
        }
    }
}

function doesContainPostHeader(nodes) {
    for (const node of nodes) {
        const classList = node.classList || [];
        if (Array.from(classList).includes('post__header')) {
            return true;
        }
    }
    return false;
}

function getSelectedNodePostIds(node) {
    let currNode = node;
    while (!(
        currNode.tagName &&
        currNode.tagName === 'DIV' &&
        currNode.id &&
        currNode.id === 'postContent')
    ) {
        currNode = currNode.parentNode;
        if (currNode === null) {
            break;
        }
    }

    if (currNode) {
        return currNode.parentNode.id.split('post_')[1];
    }

    return null;
}

function customRemoveMarkdown(text) {
    if (text.match(/^[`]+$/)) {
        return '';
    }
    return removeMd(text);
}

function getHtmlFormat(copyData) {
    let content = '';
    for (const post of copyData) {
        const htmlContent = TextFormatting.formatText(post.content);
        content += `${htmlContent}<br/>`;
    }
    return content;
}

function getRichTextFormat(posts, copyContent, showUserAndTime = false) {
    const NEW_LINE = '\n';
    const DOUBLE_DIGIT_MONTH = 10;

    const dateMap = new Map();
    posts.forEach((post) => {
        const month = post.date.getMonth() + 1;
        const paddedMonth = month >= DOUBLE_DIGIT_MONTH ? month : '0' + month;
        const date = `${paddedMonth}-${post.date.getDate()}-${post.date.getFullYear()}`;
        if (dateMap.has(date)) {
            const currList = dateMap.get(date);
            currList.push(post);
            dateMap.set(date, currList);
        } else {
            dateMap.set(date, [post]);
        }
    });

    const contentGroups = [];
    for (const [date, datePosts] of dateMap.entries()) {
        let previousUser;
        let previousTime;
        const dateString = getDateSeperatorFormat(new Date(date));
        const userGroups = [];

        let content = '';
        if (showUserAndTime) {
            content += `${dateString}${NEW_LINE}`;
        }

        for (const post of datePosts) {
            const time = getDateTwelveHourFormat(post.date);
            const user = post.user;
            const isSameUserAndTime = !(user === previousUser && previousTime === time);

            if (previousUser && isSameUserAndTime) {
                userGroups.push(content);
                content = '';
            }

            if (isSameUserAndTime && showUserAndTime) {
                content += `${user} - ${time}${NEW_LINE}`;
            }

            const postCopiedContent = copyContent.posts[post.id];
            const postContent = postCopiedContent.split(/\r?\n/g).map((line) => customRemoveMarkdown(line)).join('\n');
            const postSplit = postContent.split(/\n/g);
            const fullContent = postSplit.map((item) => `${item.replace(/[\n,\r]/g, '')}\n`);
            content += fullContent.filter((line) => !line.match(/^\r?\n$/g)).join('');

            previousUser = user;
            previousTime = time;
        }
        if (content !== '') {
            userGroups.push(content);
        }
        contentGroups.push(userGroups.join(`${NEW_LINE}`));
    }
    return contentGroups.join(`${NEW_LINE}`);
}

function getDateSeperatorFormat(date) {
    const DAYS = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    const dayStr = DAYS[date.getDay()];
    const dayOfMonth = date.getDate();
    const monthStr = MONTHS[date.getMonth()];
    const yearStr = date.getFullYear();
    return `${dayStr}, ${monthStr} ${dayOfMonth}, ${yearStr}`;
}

function getDateTwelveHourFormat(date) {
    const AM_PM_THRESHOLD = 12;
    const DOUBLE_DIGIT_MINUTES = 10;

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= AM_PM_THRESHOLD ? 'PM' : 'AM';
    hours %= AM_PM_THRESHOLD;
    hours = hours || AM_PM_THRESHOLD;
    minutes = minutes < DOUBLE_DIGIT_MINUTES ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}