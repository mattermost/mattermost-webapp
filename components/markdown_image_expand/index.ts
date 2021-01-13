import { get } from 'mattermost-redux/selectors/entities/preferences';
import { GlobalState } from 'mattermost-redux/types/store';
import { connect } from 'react-redux';
import { Preferences } from 'utils/constants';
import MarkdownImageExpand from './markdown_image_expand';

const mapStateToProps = (state: GlobalState) => {
  const collapseDisplayValue = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT);

  return {
    collapseDisplay: collapseDisplayValue === 'true',
  };
};

export default connect(mapStateToProps)(MarkdownImageExpand);