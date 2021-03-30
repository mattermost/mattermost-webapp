// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from "react";

interface EmojiPickerCategoryProps {
  selected: boolean;
  enable: boolean;
  onCategoryClick: (category: string) => void;
  category: string;
  icon: React.ReactNode;
}

export default class EmojiPickerCategory extends React.Component<EmojiPickerCategoryProps> {
  shouldComponentUpdate(nextProps: EmojiPickerCategoryProps) {
    return (
      nextProps.selected !== this.props.selected ||
      nextProps.enable !== this.props.enable
    );
  }

  handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.onCategoryClick(this.props.category);
  };

  render() {
    let className = "emoji-picker__category";
    if (this.props.selected) {
      className += " emoji-picker__category--selected";
    }

    if (!this.props.enable) {
      className += " disable";
    }

    return (
      <a
        className={className}
        href="#"
        onClick={this.handleClick}
        aria-label={this.props.category}
      >
        {this.props.icon}
      </a>
    );
  }
}
