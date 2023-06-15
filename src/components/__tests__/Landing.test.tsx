import React from 'react';
import renderer from 'react-test-renderer';

import { Landing } from '@components/landing';

describe('<Landing />', () => {
  it('Renders "Hello World" message', () => {
    const tree = renderer.create(<Landing />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
