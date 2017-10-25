import React from 'react';

import {shallow} from 'enzyme';

import ViewImageModal from 'components/view_image';

describe('components/ViewImageModal', () => {
    test('should match snapshot', () => {
        const fileInfo = {
            id: '{file_id}'
        };

        const wrapper = shallow(
            <ViewImageModal
                show={true}
                onModalDismissed={jest.fn()}
                fileInfos={[fileInfo]}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
