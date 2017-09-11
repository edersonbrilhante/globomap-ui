/*
Copyright 2017 Globo.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { Component } from 'react';
import { pageSize } from '../utils';
import './css/Search.css';

class Search extends Component {

  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.onSendSearchQuery = this.onSendSearchQuery.bind(this);
  }

  render() {
    return (
      <div className="search-box">
        <input className="topcoat-text-input--large" type="search" name="query"
          value={this.props.query} onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} />
        <button className="btn-search topcoat-button--large" onClick={(event) => this.onSendSearchQuery(event)}>Search</button>
      </div>
    );
  }

  handleInputChange(event) {
    let target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    this.props.setAppState({ [target.name]: value });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSendSearchQuery(event);
    }
  };

  onSendSearchQuery(event, direction) {
    event.preventDefault();
    this.props.clearStage();
    this.props.clearCurrent();

    let count = Math.ceil(pageSize() / this.props.enabledCollections.length);

    this.props.findNodes(this.props.query, this.props.enabledCollections, count, 0, () => {});
    this.props.setPageNumber(0);
  }

}

export default Search;
