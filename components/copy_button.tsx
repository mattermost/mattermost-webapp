// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {copyToClipboard} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

type Props = {
    content: string;
    beforeCopyText?: string;
    afterCopyText?: string;
};

const CopyButton: React.FC<Props> = (props: Props) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyText = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
        e.preventDefault();
        setIsCopied(true);

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);

        copyToClipboard(props.content);
    };

    const tooltip = (
        <Tooltip id='copyButton'>
            <FormattedMessage
                id={isCopied ? t('copied.message') : t('copy.block.message')}
                defaultMessage={isCopied ? props.afterCopyText : props.beforeCopyText}
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            shouldUpdatePosition={true}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            overlay={tooltip}
        >
            <span
                className='post-code__clipboard'
                onClick={copyText}
            >
                {!isCopied &&
                    <i
                        role='button'
                        className='icon icon-content-copy'
                    />
                }
                {isCopied &&
                    <i
                        role='button'
                        className='icon icon-check'
                    />
                }
            </span>
        </OverlayTrigger>
    );
};

CopyButton.defaultProps = {
    beforeCopyText: 'Copy code block',
    afterCopyText: 'Copied',
};

export default CopyButton;
