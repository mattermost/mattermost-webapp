// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// loadImage loads an image in the background without rendering it or using an XMLHttpRequest.
export function loadImage(src, onLoad) {
    const image = new Image();

    // Use a regular function instead of a named function so that "this" gets bound to the image
    image.onload = function() { // eslint-disable-line func-names
        onLoad(this);
    };
    image.src = src;

    return image;
}
