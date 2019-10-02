// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const ytRegex = /(?:http|https):\/\/(?:www\.|m\.)?(?:(?:youtube\.com\/(?:(?:v\/)|(?:(?:watch|embed\/watch)(?:\/|.*v=))|(?:embed\/)|(?:user\/[^/]+\/u\/[0-9]\/)))|(?:youtu\.be\/))([^#&?]*)/;

export function handleYoutubeTime(link) {
    const timeRegex = /[\\?&](t|start|time_continue)=([0-9]+h)?([0-9]+m)?([0-9]+s?)/;

    const time = link.match(timeRegex);
    if (!time || !time[0]) {
        return '';
    }

    const hours = time[2] ? time[2].match(/([0-9]+)h/) : null;
    const minutes = time[3] ? time[3].match(/([0-9]+)m/) : null;
    const seconds = time[4] ? time[4].match(/([0-9]+)s?/) : null;

    let ticks = 0;

    if (hours && hours[1]) {
        ticks += parseInt(hours[1], 10) * 3600;
    }

    if (minutes && minutes[1]) {
        ticks += parseInt(minutes[1], 10) * 60;
    }

    if (seconds && seconds[1]) {
        ticks += parseInt(seconds[1], 10);
    }

    return '&start=' + ticks.toString();
}

export function updateStateFromProps(props) {
    const link = props.link;
    let stateObject = {};

    const match = link.trim().match(ytRegex);
    if (!match || match[1].length !== 11) {
        return null;
    }

    if (props.show === false) {
        // equivalent to calling this.stop()
        stateObject = {playing: false};
    }

    const updatedStateObject = {
        videoId: match[1],
        time: handleYoutubeTime(link),
    };

    stateObject = {stateObject, ...updatedStateObject};

    return stateObject;
}