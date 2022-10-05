// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, memo} from 'react';
import {useIntl} from 'react-intl';
import {clamp} from 'lodash';

import {PlusIcon, MinusIcon} from '@mattermost/compass-icons/components';

import {minZoomExport, zoomExport} from '../image_preview';
import './file_preview_modal_image_controls.scss';

export type ZoomValue = 'Automatic' | 'FitWidth' | 'FitHeight' | number;

interface Props {
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
}

// Default zoom levels
const zoomLevels = new Map();
zoomLevels.set('1', {text: '100%', type: 'scale'});
zoomLevels.set('1.25', {text: '125%', type: 'scale'});
zoomLevels.set('1.5', {text: '150%', type: 'scale'});
zoomLevels.set('2', {text: '200%', type: 'scale'});
zoomLevels.set('3', {text: '300%', type: 'scale'});
zoomLevels.set('4', {text: '400%', type: 'scale'});
zoomLevels.set('5', {text: '500%', type: 'scale'});

const FilePreviewModalImageControls = ({toolbarZoom, setToolbarZoom}: Props) => {
    // Zoom levels that need translations
    const {formatMessage} = useIntl();
    const autoText = formatMessage({id: 'imageToolbarZoomDropdown.automatic', defaultMessage: 'Automatic'});
    const fitWidthText = formatMessage({id: 'imageToolbarZoomDropdown.fitWidth', defaultMessage: 'Fit width'});
    const fitHeightText = formatMessage({id: 'imageToolbarZoomDropdown.fitHeight', defaultMessage: 'Fit height'});
    zoomLevels.set('Automatic', {text: autoText, type: 'auto'});
    zoomLevels.set('FitWidth', {text: fitWidthText, type: 'auto'});
    zoomLevels.set('FitHeight', {text: fitHeightText, type: 'auto'});

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

    // Add custom zoom val
    zoomLevelOptions.push(
        <option
            key={toolbarZoom}
            value={toolbarZoom}
            hidden={true}
        >
            {/* Convert to percent */}
            {`${Math.round((toolbarZoom as number) * 100)}%`}
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
        setToolbarZoom(newToolbarZoom === minZoomExport ? 'Automatic' : newToolbarZoom);
    };

    // Render
    return (
        <div className='image-controls'>
            <button
                id={'zoomOutButton'}
                onClick={makeZoomHandler(-0.1)}
                disabled={typeof toolbarZoom === 'number' ? toolbarZoom <= minZoomExport : toolbarZoom === 'Automatic'}
            >
                <MinusIcon
                    size={18}
                    color='currentColor'
                />
            </button>

            <button
                id={'zoomInButton'}
                onClick={makeZoomHandler(0.1)}
                disabled={typeof toolbarZoom === 'number' ? toolbarZoom >= 5 : toolbarZoom !== 'Automatic'}
            >
                <PlusIcon
                    size={18}
                    color='currentColor'
                />
            </button>

            <select
                onChange={handleZoomDropdown}
                className='image-controls__dropdown'
                value={toolbarZoom}
            >
                {zoomLevelOptions}
            </select>
        </div>
    );
};

export default memo(FilePreviewModalImageControls);
