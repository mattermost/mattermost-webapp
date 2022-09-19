// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, memo, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {clamp} from 'lodash';

import {PlusIcon, MinusIcon} from '@mattermost/compass-icons/components';

import {minZoomExport, zoomExport} from '../image_preview';
import './file_preview_modal_image_controls.scss';

export type ZoomValue = 'A' | 'W' | 'H' | number;

interface Props {
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
}

const FilePreviewModalImageControls = ({toolbarZoom, setToolbarZoom}: Props) => {
    // Initial variables and constants
    // zoom text
    const [zoomText, setZoomText] = useState<string>();
    const [selectedZoomValue, setSelectedZoomValue] = useState<ZoomValue | 'customZoom'>();

    const zoomInButtonDisabled = useRef(false);
    const zoomOutButtonDisabled = useRef(true);

    // Initialize dropdown values
    const {formatMessage} = useIntl();
    const autoText = formatMessage({id: 'imageToolbarZoomDropdown.automatic', defaultMessage: 'Automatic'});
    const fitWidthText = formatMessage({id: 'imageToolbarZoomDropdown.fitWidth', defaultMessage: 'Fit width'});
    const fitHeightText = formatMessage({id: 'imageToolbarZoomDropdown.fitHeight', defaultMessage: 'Fit height'});

    const zoomLevels = new Map();
    zoomLevels.set('A', {text: autoText, type: 'auto'});
    zoomLevels.set('W', {text: fitWidthText, type: 'auto'});
    zoomLevels.set('H', {text: fitHeightText, type: 'auto'});
    zoomLevels.set('1', {text: '100%', type: 'scale'});
    zoomLevels.set('1.25', {text: '125%', type: 'scale'});
    zoomLevels.set('1.5', {text: '150%', type: 'scale'});
    zoomLevels.set('2', {text: '200%', type: 'scale'});
    zoomLevels.set('3', {text: '300%', type: 'scale'});
    zoomLevels.set('4', {text: '400%', type: 'scale'});
    zoomLevels.set('5', {text: '500%', type: 'scale'});

    const zoomLevelOptions = [];
    for (const [zoomLevelKey, zoomLevel] of zoomLevels) {
        zoomLevelOptions.push(
            <option
                key={zoomLevelKey}
                value={zoomLevelKey}
            >
                {zoomLevel.text}
            </option>,
        );
    }

    zoomLevelOptions.push(
        <option
            key={'customZoom'}
            value='customZoom'
            hidden={true}
        >
            {zoomText}
        </option>,
    );

    // Handlers
    // change type to proper type in the future
    const handleZoomDropdown = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const zoomLevel = event.target;
        if (zoomLevels.get(zoomLevel.value).type === 'scale') {
            setToolbarZoom(parseFloat(zoomLevel.value));
        } else {
            setToolbarZoom(zoomLevel.value as ZoomValue);
        }
    };

    const makeZoomHandler = (delta: number) => () => {
        let newToolbarZoom = typeof toolbarZoom === 'string' ? zoomExport : toolbarZoom;
        newToolbarZoom = Math.round(newToolbarZoom * 10) / 10;
        newToolbarZoom = clamp(newToolbarZoom + delta, minZoomExport, 5);
        setToolbarZoom(newToolbarZoom === minZoomExport ? 'A' : newToolbarZoom);
    };

    // Callbacks
    useEffect(() => {
        if (typeof toolbarZoom === 'number') {
            setZoomText(`${Math.round(toolbarZoom * 100)}%`);
            zoomInButtonDisabled.current = toolbarZoom >= 5;
            zoomOutButtonDisabled.current = toolbarZoom <= minZoomExport;
        } else if (toolbarZoom === 'A') {
            zoomInButtonDisabled.current = false;
            zoomOutButtonDisabled.current = true;
        }

        if (zoomLevels.has(toolbarZoom)) {
            setSelectedZoomValue(toolbarZoom);
        } else {
            setSelectedZoomValue('customZoom');
        }
    }, [toolbarZoom]);

    // Render
    return (
        <div className='image-controls'>
            <button
                id={'zoomOutButton'}
                onClick={makeZoomHandler(-0.1)}
                disabled={zoomOutButtonDisabled.current}
            >
                <MinusIcon
                    size={18}
                    color='currentColor'
                />
            </button>

            <button
                id={'zoomInButton'}
                onClick={makeZoomHandler(0.1)}
                disabled={zoomInButtonDisabled.current}
            >
                <PlusIcon
                    size={18}
                    color='currentColor'
                />
            </button>

            <select
                onChange={handleZoomDropdown}
                className='image-controls__dropdown'
                defaultValue={'A'}
                value={selectedZoomValue}
            >
                {zoomLevelOptions}
            </select>
        </div>
    );
};

export default memo(FilePreviewModalImageControls);
