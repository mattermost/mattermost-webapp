import AppsForm from 'components/apps_form';
import React from 'react';
import {CommonProps} from './common_props';

export function AppBindingForm(props: CommonProps) {
    return (
        <div style={styles.containerSpacing}>
            <AppsForm
                hideCancel={true}
                isEmbedded={true}
                onExited={() => {
                    alert('exited');
                }}
                // context={props.context}
                form={props.binding.form!}
            />
        </div>
    );
}

const styles = {
    containerSpacing: {
        paddingLeft: '20px',
        paddingRight: '20px',
    },
};
