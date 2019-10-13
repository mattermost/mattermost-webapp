// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import removeMd from 'remove-markdown';
import rangy from 'rangy';

import * as TextFormatting from 'utils/text_formatting.jsx';

export async function copyPostData(e, getPostForCopy) {
    const selection = rangy.getSelection();
    if (selection.rangeCount) {
        const nodes = selection.getRangeAt(0).getNodes();
        const postIds = new Set(nodes.map((node) => getSelectedNodePostIds(node)).filter((node) => node !== null));
        const postData = Array.from(postIds).map((postId) => getPostForCopy(postId));
        const resolved = await Promise.all(postData);

        e.clipboardData.setData('text/markdown', resolved.map((post) => post.content).join('\n\r'));
        e.clipboardData.setData('text/html', getHtmlFormat(resolved));
        e.clipboardData.setData('text/plain', getRichTextFormat(resolved));
        e.preventDefault();
    }
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

function getHtmlFormat(copyData) {
    let content = '';
    for (const post of copyData) {
        const htmlContent = TextFormatting.formatText(post.content);
        content += `${htmlContent}<br/>`;
    }
    return content;
}

function getRichTextFormat(copyData) {
    const NEW_LINE = '\n\r';
    const DOUBLE_DIGIT_MONTH = 10;

    const dateMap = new Map();
    copyData.forEach((post) => {
        const month = post.date.getMonth();
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

    let content = '';
    for (const [date, posts] of dateMap.entries()) {
        const dateString = getDateSeperatorFormat(new Date(date));
        content += `${dateString}${NEW_LINE}`;
        for (const post of posts) {
            content += `${post.user} - ${getDateTwelveHourFormat(post.date)}${NEW_LINE}`;
            content += `${removeMd(post.content)}${NEW_LINE}${NEW_LINE}`;
        }
    }
    return content;
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