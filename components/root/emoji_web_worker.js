// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

onmessage = ({data: {url}}) => {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
        postMessage('Worker: emoji sprite sheet downloaded successfully');
    };

    request.onerror = (e) => {
        console.error(e); // eslint-disable-line no-console
        postMessage('Worker: emoji sprite sheet download failed, will automatically download on emoji picker open');
    };

    request.send();
};

