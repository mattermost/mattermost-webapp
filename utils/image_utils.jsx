// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// createPlaceholderImage returns a data URI for a blank image with the given dimensions.
export function createPlaceholderImage(width, height) {
    const placeholder = document.createElement('canvas');

    placeholder.width = width;
    placeholder.height = height;
    placeholder.style.backgroundColor = 'transparent';

    try {
        return placeholder.toDataURL();
    } catch (e) {
        // Canvas.toDataURL throws an error if the dimensions are too large
        return '';
    }
}

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
