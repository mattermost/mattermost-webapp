import React from 'react';

import {shallow} from 'enzyme';

import LoadingImagePreview from 'components/loading_image_preview';

describe('components/LoadingImagePreview', () => {
    test('should match snapshot', () => {
        const loading = 'Loading';
        const progress = 50;

        const wrapper = shallow(
            LoadingImagePreview({loading, progress})
        );

        expect(wrapper).toMatchSnapshot();
    });
});
