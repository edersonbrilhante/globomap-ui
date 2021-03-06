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
import Properties from './Properties';
import './css/NodeEdges.css';

class NodeEdges extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inOpen: false,
      outOppen: false
    }

    this.buildEdgeItems = this.buildEdgeItems.bind(this);
    this.onOpenIn = this.onOpenIn.bind(this);
    this.onOpenOut = this.onOpenOut.bind(this);
    this.onOpenProp = this.onOpenProp.bind(this);
    this.closeAll = this.closeAll.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  render() {
    let edges = this.props.edges;
    if(edges === undefined) {
      return <div className="sub-node-edges"></div>;
    }

    let colorCls = this.props.graphs.filter((graph) => {
        return graph.name === edges.graph;
    })[0].colorClass;

    let edgesInOut = [
      { dir: 'in', toggleFn: this.onOpenIn, openState: this.state.inOpen, items: this.buildEdgeItems(edges.in) },
      { dir: 'out', toggleFn: this.onOpenOut, openState: this.state.outOpen, items: this.buildEdgeItems(edges.out) }
    ].map((elem) => {
      return elem.items.length > 0
              ? (<div key={elem.dir} className={'edges-' + elem.dir}>
                  <button className={'edges-btn ' + colorCls} onClick={elem.toggleFn}>
                    <i className={'fa fa-arrow-'+ (elem.dir === 'in' ? 'right' : 'left')}></i>
                  </button>
                  {elem.openState &&
                    <div className="edges-content" onClick={e => e.stopPropagation()}>
                      <div className="tooltip-arrow"></div>
                      <div className={'v-line ' + colorCls}></div>
                      <div className="edges-content-head">
                        Links
                        <button className="close-tooltip-btn" onClick={elem.toggleFn}>
                          <i className="fa fa-close"></i>
                        </button>
                      </div>
                      {elem.items}
                    </div>}
                  </div>)
              : null;
    });

    return <div className={'sub-node-edges ' + this.props.position}
                ref={node => { this.node = node; }}>
             {edgesInOut}
           </div>;
  }

  buildEdgeItems(edges) {
    return edges.map((edge, i) => {
      let noProp = '';
      if (edge.properties && edge.properties.length === 0) {
        noProp = ' no-prop';
      }

      return <span key={i} className={'edge-item' + noProp} title={edge.name}>
               <span className="edge-item-prop" onClick={(e) => this.onOpenProp(e, edge)}>
                 <i className="icon-right fa fa-caret-right"></i>
                 <i className="icon-down fa fa-caret-down"></i>
                 &nbsp;<strong>{edge.type}</strong>: {edge.name}
               </span>
               {edge.properties &&
                <Properties properties={edge}
                            hasId={this.props.hasId} />}
             </span>;
    });
  }

  handleOutsideClick(e) {
    if (this.node && this.node.contains(e.target)) {
      return;
    }
    this.closeAll();
  }

  closeAll() {
    this.setState({ inOpen: false, outOpen: false });
  }

  onOpenIn(event) {
    event.stopPropagation();
    this.setState({ inOpen: !this.state.inOpen, outOpen: false });
  }

  onOpenOut(event) {
    event.stopPropagation();
    this.setState({ outOpen: !this.state.outOpen, inOpen: false });
  }

  onOpenProp(event, edge) {
    event.stopPropagation();

    if(edge.properties && edge.properties.length > 0) {
      return event.currentTarget.parentNode.classList.toggle('open');
    }

    return event.preventDefault();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

}

export default NodeEdges;
