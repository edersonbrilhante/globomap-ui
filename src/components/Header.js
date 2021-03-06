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
import Search from './Search';
import './css/Header.css';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      checkedCollections: []
    };

    this.handleCheckItem = this.handleCheckItem.bind(this);
  }

  render() {
    let graphButtons = this.props.graphs.map((graph) => {
      let disabledCls = !graph.enabled ? ' btn-disabled' : '';

      return <button key={"btn-" + graph.name}
              className={"graph-btn topcoat-button--quiet " + graph.colorClass + disabledCls}
              onClick={(e) => this.props.onToggleGraph(e, graph.name)}>
              {graph.name}
             </button>;
    });

    let collectionItems = this.props.collections.map((co) => {
      let hasCollection = !this.props.enabledCollections.includes(co);
      let disabledCls = hasCollection ? ' disabled' : '';

      return <label key={co} className={"item topcoat-checkbox" + disabledCls}>
              <input type="checkbox" name={co} checked={this.state.checkedCollections.includes(co)}
                onChange={this.handleCheckItem} disabled={hasCollection} />
              <div className="topcoat-checkbox__checkmark"></div>
              &nbsp;{co}
             </label>;
    });

    return <header className="main-header">
            <div className="header-group">
              <span className="logo">globomap</span>
              <Search findNodes={this.props.findNodes}
                      clearStage={this.props.clearStage}
                      clearCurrent={this.props.clearCurrent}
                      checkedCollections={this.state.checkedCollections}
                      clearInfo={this.props.clearInfo} />
            </div>
            <div className="header-sub-group">
              <div className="graph-buttons">
                {graphButtons}
              </div>
              <div className="collection-items">
                {collectionItems}
              </div>
            </div>
           </header>;
  }

  handleCheckItem(event) {
    let target = event.target,
        colls = this.state.checkedCollections.slice(),
        itemIndex = colls.indexOf(target.name);

    if(itemIndex < 0) {
      colls.push(target.name);
    } else {
      colls.splice(itemIndex, 1);
    }

    this.setState({ checkedCollections: colls });
  }

  componentWillReceiveProps(nextProps) {
    let checkedCollections = [];

    this.state.checkedCollections.forEach((item) => {
      if (nextProps.enabledCollections.includes(item)) {
        checkedCollections.push(item);
      }
    });

    this.setState({ checkedCollections });
  }
}

export default Header;
