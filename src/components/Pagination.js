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
import './css/Pagination.css';

class Pagination extends Component {

  constructor(props) {
    super(props);

    this.state = {
      pageNumber: 1,
      nodes: []
    };

    this.onSendSearchQuery = this.onSendSearchQuery.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  onSendSearchQuery(event, direction) {
    let count = Math.ceil(pageSize() / this.props.enabledCollections.length);
    let pageNumberView = this.state.pageNumber;
    let pageNumber = 0;

    if (String(pageNumberView).trim() === '') {
      return;
    }

    event.preventDefault();
    this.props.clearStage();
    this.props.clearCurrent();

    if (direction === 'next') {
      pageNumberView++
      pageNumber = pageNumberView - 1;
    } else if (direction === 'previous' && pageNumberView > 1) {
      pageNumberView--
      pageNumber = pageNumberView - 1;
    }

    this.props.findNodes(this.props.query, this.props.enabledCollections, count, pageNumber, (data) => {
      if (data.length === 0) {
        return;
      }
      this.setState({ nodes: data }, () => {
        let nodesLength = this.state.nodes.length;

        if (nodesLength <= 0) {
          return;
        }
        if (this.state.nodes.length > 0) {
          this.setState({ pageNumber: pageNumberView });
        }
      });
    });
  }

  handleInputChange(event) {
    let pageNumber = event.target.value.trim();

    if (pageNumber.length === 0) {
      this.setState({ pageNumber });
      return;
    }

    pageNumber = parseInt(event.target.value, 10) || 1;
    this.setState({ pageNumber });
  }

  handleKeyPress(event) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    let count = Math.ceil(pageSize() / this.props.enabledCollections.length);
    let pageNumber = parseInt(event.target.value, 10) || 1;
    pageNumber--;
    this.props.findNodes(this.props.query, this.props.enabledCollections, count, pageNumber, (data) => {
      this.setState({ nodes: data }, (data) => {
        if (this.state.nodes.length > 0) {
          this.props.setPageNumber(pageNumber);
        }
      });
    });
  }

  render() {
    if (this.props.nodes.length === 0) {
      return null;
    }

    return (
      <div className="pagination">
        <span onClick={(e) => this.onSendSearchQuery(e, 'previous')}>
          <i className="icon-left fa fa-caret-left"></i>
        </span>
        <input className="input topcoat-text-input--large"
          type="text"
          name="pagination"
          onChange={this.handleInputChange}
          onKeyPress={this.handleKeyPress}
          value={this.state.pageNumber} />
        <span onClick={(e) => this.onSendSearchQuery(e, 'next')}>
          <i className="icon-right fa fa-caret-right"></i>
        </span>
      </div>
    )
  }

}

export default Pagination;
