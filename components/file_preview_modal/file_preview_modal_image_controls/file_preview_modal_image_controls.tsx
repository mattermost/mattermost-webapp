// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, memo, useEffect, useState} from 'react';
import {PlusIcon, MinusIcon} from '@mattermost/compass-icons/components';
import {useIntl} from 'react-intl';
import {clamp} from 'lodash';

import {minZoom, zoom} from '../image_preview';
import './file_preview_modal_image_controls.scss';

let zoomInButtonDisabled = false;
let zoomOutButtonDisabled = true;

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

    const plusSign = (
        <PlusIcon
            size={16}
            color='currentColor'
        />
    );

    const minusSign = (
        <MinusIcon
            size={16}
            color='currentColor'
        />
    );

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
        let newToolbarZoom = typeof toolbarZoom === 'string' ? zoom : toolbarZoom;
        newToolbarZoom = Math.round(newToolbarZoom * 10) / 10;
        newToolbarZoom = clamp(newToolbarZoom + delta, minZoom, 5);
        setToolbarZoom(newToolbarZoom === minZoom ? 'A' : newToolbarZoom);
    };

    // Callbacks
    useEffect(() => {
        if (typeof toolbarZoom === 'number') {
            setZoomText(`${Math.round(toolbarZoom * 100)}%`);
            zoomInButtonDisabled = toolbarZoom >= 5;
            zoomOutButtonDisabled = toolbarZoom <= minZoom;
        } else if (toolbarZoom === 'A') {
            zoomInButtonDisabled = false;
            zoomOutButtonDisabled = true;
        }

        if (zoomLevels.has(toolbarZoom)) {
            setSelectedZoomValue(toolbarZoom);
        } else {
            setSelectedZoomValue('customZoom');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toolbarZoom]);

    // Render
    return (
        <div className='image-controls'>
            <button
                id={'zoomOutButton'}
                onClick={makeZoomHandler(-0.1)}
                className={'image-controls__button'}
                disabled={zoomOutButtonDisabled}
            >
                {minusSign}
            </button>

            <button
                id={'zoomInButton'}
                onClick={makeZoomHandler(0.1)}
                className={'image-controls__button'}
                disabled={zoomInButtonDisabled}
            >
                {plusSign}
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
