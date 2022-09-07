// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC} from 'react';
import {FormattedMessage} from 'react-intl';

interface Props {
    handleSubmit?: () => void;
    setSomethingChanged?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnsavedChangesModal: FC<Props> = ({
    handleSubmit,
    setSomethingChanged,
}: Props) => {
    return (
        <div

            // className="unsavedChangesModal"
            style={{
                color: 'white',
                top: '82%',
                zIndex: 1000,
                position: 'fixed',
                left: '40%',
                height: '56px',
                width: 'calc(100% - 232px - 40px)',
                borderRadius: '4px',
                boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.12)',
                backgroundColor: '#D24B4E',
                fontSize: '14px',
                fontWeight: 600,
            }}
        >
            <span
                style={{
                    padding: '19.3px 0 18.7px 15px',
                    position: 'absolute',
                }}
            >
                <i
                    style={{border: '2px solid white', borderRadius: '100%'}}
                    className='icon-exclamation-thick'
                />
            </span>
            <span style={{padding: '18px 0 18px 50px', position: 'absolute'}}>
                {'You have unsaved changes'}
            </span>
            <span
                onClick={() =>
                    setSomethingChanged && setSomethingChanged(false)
                }
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    marginLeft: '417px',
                    position: 'absolute',
                    marginTop: '12px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: 'white',
                }}
            >
                <FormattedMessage
                    id='setting_item_max.cancel'
                    defaultMessage='Undo'
                />
            </span>
            <span
                onClick={() => {
                    handleSubmit && handleSubmit();
                    setSomethingChanged && setSomethingChanged(false);
                }}
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    position: 'absolute',
                    marginLeft: '497px',
                    marginTop: '12px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '12px',
                    backgroundColor: 'white',
                    color: '#1C58D9',
                }}
            >
                {'Save'}
            </span>
        </div>
    );
};
