// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react-hooks/exhaustive-deps */

import PropTypes from 'prop-types';
import React, {useRef, useMemo, useEffect, useState} from 'react';
import {clamp} from 'lodash';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import './image_preview.scss';

const HORIZONTAL_PADDING = 48;
const VERTICAL_PADDING = 168;

const SCROLL_SENSITIVITY = 0.003;
const MAX_ZOOM = 5;
var MIN_ZOOM_EXT = 0;
var ZOOM_EXT = 1;

ImagePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
    toolbarZoom: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
    ]),
    setToolbarZoom: PropTypes.func.isRequired,
};

export {MIN_ZOOM_EXT, ZOOM_EXT};

// Utils
const getWindowDimensions = () => {
    const maxWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - HORIZONTAL_PADDING;
    const maxHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - VERTICAL_PADDING;
    return {maxWidth, maxHeight};
};

const fitCanvas = (width, height) => {
    // Calculate maximum scale for canvas to fit in viewport
    const {maxWidth, maxHeight} = getWindowDimensions();
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;

    return Math.round(Math.min(scaleX, scaleY) * 100) / 100;
};

export default function ImagePreview({fileInfo, toolbarZoom, setToolbarZoom}) {
    const background = useMemo(() => new Image(), []);
    var {width, height} = background;
    const containerScale = fitCanvas(width, height);

    const minZoom = Math.min(containerScale, 1);
    const maxCanvasZoom = containerScale;

    let zoom;
    let isFullscreen = {horizontal: false, vertical: false};
    let cursorType = 'normal';

    // Set the zoom given by the toolbar dropdown
    if (typeof toolbarZoom === 'string') {
        switch (toolbarZoom) {
        case 'A':
            zoom = minZoom;
            break;
        case 'F':
            zoom = maxCanvasZoom;
            break;
        case 'W':
            zoom = getWindowDimensions().maxWidth / width;
            break;
        case 'H':
            zoom = getWindowDimensions().maxHeight / height;
            break;
        }
    } else {
        zoom = toolbarZoom;
    }

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const [, setIsReady] = useState(false);

    const touch = useRef({x: 0, y: 0});
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const canvasBorder = useRef({w: 0, h: 0});
    const isMouseDown = useRef(false);

    const isExternalFile = !fileInfo.id;

    // Update external vars
    ZOOM_EXT = zoom;
    MIN_ZOOM_EXT = minZoom;

    let fileUrl;
    let previewUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    } else {
        fileUrl = getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    }

    const clampOffset = (x, y) => {
        // Clamps the offset to something that is inside canvas or window depending on zoom level
        const {w, h} = canvasBorder.current;
        const {horizontal, vertical} = isFullscreen;
        var xPos = 0;
        var yPos = 0;

        if (zoom > maxCanvasZoom) {
            if (horizontal) {
                xPos = clamp(x, w, -w);
            }
            if (vertical) {
                yPos = clamp(y, h, -h);
            }
        }

        return {xPos, yPos};
    };

    const handleWheel = (event) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            zoom = clamp(zoom + (deltaY * SCROLL_SENSITIVITY * -1), minZoom, MAX_ZOOM);
            setToolbarZoom(zoom === minZoom ? 'A' : zoom);
        }
    };

    const handleMouseMove = (event) => {
        if (dragging) {
            const {x, y} = touch.current;
            const {clientX, clientY} = event;
            const {xPos, yPos} = clampOffset(offset.x + (x - clientX), offset.y + (y - clientY));
            setOffset({x: xPos, y: yPos});
            touch.current = {x: clientX, y: clientY};
        }
    };

    const handleMouseDown = (event) => {
        event.preventDefault();
        const {clientX, clientY} = event;
        touch.current = {x: clientX, y: clientY};
        isMouseDown.current = true;
        setDragging(true);
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;
        setDragging(false);
    };

    // Stop dragging if mouse left canvas
    const handleMouseLeave = () => {
        setDragging(false);
    };

    // Resume dragging if mouse stays clicked
    const handleMouseEnter = () => {
        if (isMouseDown.current) {
            setDragging(true);
        }
    };

    // Initialize canvas
    useEffect(() => {
        // Global mouseup event, otherwise canvas can stay stuck on mouse when leaving canvas while dragging
        window.addEventListener('mouseup', handleMouseUp);

        background.src = previewUrl;
        if (canvasRef.current) {
            background.onload = () => {
                // Initialize with the zoom at minimum.
                zoom = minZoom;
                setIsReady(true);
            };
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');

        // Improve smoothing quality
        context.imageSmoothingQuality = 'high';

        // Resize canvas to current zoom level
        canvasRef.current.width = width * zoom;
        canvasRef.current.height = height * zoom;

        // Update borders and clamp offset accordingly
        canvasBorder.current = {w: context.canvas.offsetLeft, h: context.canvas.offsetTop - 72 - 48};
        isFullscreen = {
            horizontal: canvasBorder.current.w <= 0,
            vertical: canvasBorder.current.h <= 0,
        };

        // Translate canvas to current offset
        const {xPos, yPos} = clampOffset(offset.x, offset.y);
        context.translate(-xPos, -yPos);

        context.drawImage(background, 0, 0, width * zoom, height * zoom);
    }

    // Reset offset to center when unzoomed
    if (!(isFullscreen.horizontal || isFullscreen.vertical) && (offset.x !== 0 && offset.y !== 0)) {
        setOffset({x: 0, y: 0});
    }

    // Change cursor to dragging only if the image in the canvas is zoomed and draggable
    if (isFullscreen.horizontal || isFullscreen.vertical) {
        cursorType = dragging ? 'dragging' : 'hover';
    } else {
        cursorType = 'normal';
    }

    // Export current zoom level for toolbar
    ZOOM_EXT = zoom;

    return (
        <div
            ref={containerRef}
            className={`image_preview_div__${zoom >= maxCanvasZoom ? 'fullscreen' : 'normal'}`}
        >
            <canvas
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onWheel={handleWheel}
                ref={canvasRef}
                className={`image_preview_canvas__${cursorType}`}
            />
        </div>
    );
}
