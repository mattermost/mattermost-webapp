// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';

import {localizeMessage} from 'utils/utils';
import * as FileUtils from 'utils/file_utils';

import './picture_selector.scss';

type Props = {
    src?: string;
    defaultSrc?: string;
    loadingPicture?: boolean;
    onSelect: (file: File) => void;
    onRemove: () => void;
};

const PictureSelector: React.FC<Props> = (props: Props) => {
    const [image, setImage] = useState<string>();
    const [orientationStyles, setOrientationStyles] = useState<{transform: any; transformOrigin: any}>();

    const inputRef: React.RefObject<HTMLInputElement> = React.createRef();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(URL.createObjectURL(file));

                const orientation = FileUtils.getExifOrientation(ev.target!.result);
                setOrientationStyles(FileUtils.getOrientationStyles(orientation));
            };
            reader.readAsArrayBuffer(file);

            props.onSelect(file);
        }
    };

    const handleInputFile = () => {
        if (!inputRef || !inputRef.current) {
            return;
        }

        inputRef.current.value = '';
        inputRef.current.click();
    };

    const handleRemove = () => {
        props.onRemove();
        if (props.defaultSrc) {
            setImage(props.defaultSrc);
        } else {
            setImage(undefined);
        }
    };

    useEffect(() => {
        if (!image) {
            if (props.src) {
                setImage(props.src);
            } else if (props.defaultSrc) {
                setImage(props.defaultSrc);
            }
        }
    });

    let removeButton;
    if (image && image !== props.defaultSrc) {
        removeButton = (
            <button
                data-testid='PictureSelector__removeButton'
                className='PictureSelector__removeButton'
                disabled={props.loadingPicture}
                onClick={handleRemove}
            >
                <FormattedMessage
                    id='picture_selector.remove_picture'
                    defaultMessage='Remove picture'
                />
            </button>
        );
    }

    return (
        <div className='PictureSelector'>
            <input
                data-testid='PictureSelector__input'
                ref={inputRef}
                className='PictureSelector__input'
                accept='.jpg,.png,.bmp'
                type='file'
                onChange={handleFileChange}
                disabled={props.loadingPicture}
                aria-hidden={true}
                tabIndex={-1}
            />
            <div className='PictureSelector__imageContainer'>
                <div
                    className='PictureSelector__image'
                    style={{
                        backgroundImage: 'url(' + image + ')',
                        ...orientationStyles,
                    }}
                />
                <button
                    data-testid='PictureSelector__selectButton'
                    className='PictureSelector__selectButton'
                    disabled={props.loadingPicture}
                    onClick={handleInputFile}
                    aria-label={localizeMessage('picture_selector.select_button.ariaLabel', 'Select picture')}
                >
                    <i className='icon icon-pencil-outline'/>
                </button>
            </div>
            {removeButton}
        </div>
    );
};

export default PictureSelector;
