// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Input from '../input/input';

import Constants from 'utils/constants';
import {getShortenedURL} from 'utils/url';

import './url_input.scss';

type Props = {
    base: string;
    path?: string;
    pathInfo: string;
    limit?: number;
    maxLength?: number;
    shortenLength?: number;
    error?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function UrlInput({base, path, pathInfo, limit, maxLength, shortenLength, error, onChange, onBlur}: Props) {
    const {formatMessage} = useIntl();

    const [editing, setEditing] = useState(false);

    const fullPath = `${base}/${path ? `${path}/` : ''}`;
    const fullURL = `${fullPath}${editing ? '' : (pathInfo && `${pathInfo}`) || ''}`;
    const isShortenedURL = shortenLength && fullURL.length > shortenLength;
    const hasError = Boolean(error);

    const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event);
        }
    };

    const handleOnInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditing(hasError);

        if (onBlur) {
            onBlur(event);
        }
    };

    const handleOnButtonClick = () => {
        if (!hasError) {
            setEditing(!editing);
        }
    };

    return (
        <div className='url-input-main'>
            <div className='url-input-container'>
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={isShortenedURL ? (
                        <Tooltip id='urlTooltip'>
                            {fullURL}
                        </Tooltip>
                    ) : ''}
                >
                    <span className='url-input-label'>
                        {formatMessage({id: 'url_input.label.url', defaultMessage: 'URL: '})}
                        {isShortenedURL ? getShortenedURL(fullURL, shortenLength) : fullURL}
                    </span>
                </OverlayTrigger>
                {(editing || hasError) && (
                    <Input
                        name='url-input'
                        type='text'
                        containerClassName='url-input-editable-container'
                        inputClassName='url-input-editable-path'
                        autoFocus={true}
                        autoComplete='off'
                        value={pathInfo}
                        limit={limit}
                        maxLength={maxLength}
                        hasError={hasError}
                        onChange={handleOnInputChange}
                        onBlur={handleOnInputBlur}
                    />
                )}
                <button
                    className={classNames('url-input-button', {disabled: hasError})}
                    disabled={hasError}
                    onClick={handleOnButtonClick}
                >
                    <span className='url-input-button-label'>
                        {editing ? formatMessage({id: 'url_input.buttonLabel.done', defaultMessage: 'Done'}) : formatMessage({id: 'url_input.buttonLabel.edit', defaultMessage: 'Edit'})}
                    </span>
                </button>
            </div>
            {error && (
                <div className='url-input-error'>
                    <i className='icon icon-alert-outline'/>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default UrlInput;
