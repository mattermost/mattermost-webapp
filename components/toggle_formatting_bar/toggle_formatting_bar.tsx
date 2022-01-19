import React, {memo} from 'react';

interface ToggleFormattingBarProps {
    onClick: React.MouseEventHandler;
}

export const ToggleFormattingBar: React.ComponentType<ToggleFormattingBarProps> = memo(({onClick}) => {
    return (
        <div>
            <button
                type='button'
                id='fileUploadButton'
                onClick={onClick}
                className='style--none post-action icon icon--attachment'>
                Aa
            </button>
        </div>
    );
});
