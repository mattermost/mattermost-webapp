import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import Input from 'components/widgets/inputs/input/input';

type Props = {
    handleChange: (data: Record<string, any>) => void;
}

const IntervalForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [interval, setInterval] = useState<string>('');

    const handleIfValueOnChange = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setInterval(value);
        handleChange({interval});
    };

    return (
        <div className='node-modal__column'>
            <Input
                type='number'
                name='node-modal-name'
                containerClassName='node-modal-name-container'
                inputClassName='node-modal-name-input'
                label={formatMessage({id: 'node_modal.name.interval.label', defaultMessage: 'interval'})}
                placeholder={formatMessage({id: 'node_modal.name.interval.placeholder', defaultMessage: 'interval'})}
                onChange={handleIfValueOnChange}
                value={interval}
                data-testid='nameInput'
                maxLength={64}
                autoFocus={true}
            />
        </div>
    );
};

export default IntervalForm;

