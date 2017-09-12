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
import io from 'socket.io-client';
import Header from './Header';
import SearchContent from './SearchContent';
import Stage from './Stage';
import Info from './Info';
import { traverseItems, uuid, sortByName } from '../utils';
import './css/App.css';

function uiSocket() {
  return io('http://localhost:8888');
}

class App extends Component {

  constructor(props) {
    super(props);
    this.socket = uiSocket();

    this.state = {
      currentNode: false,
      graphs: [],
      collections: [],
      nodes: [],
      stageNodes: [],
      pageNumber: 0,
      enabledCollections: [],
      query: ""
    };

    this.findNodes = this.findNodes.bind(this);
    this.getNode = this.getNode.bind(this);
    this.addNodeToStage = this.addNodeToStage.bind(this);
    this.stageHasNode = this.stageHasNode.bind(this);
    this.getGraphsAndCollections = this.getGraphsAndCollections.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.clearCurrent = this.clearCurrent.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.clearStage = this.clearStage.bind(this);
    this.onToggleGraph = this.onToggleGraph.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.setPageNumber = this.setPageNumber.bind(this);
    this.setEnabledCollections = this.setEnabledCollections.bind(this);
    this.setAppState = this.setAppState.bind(this);
  }

  render() {
    return (
      <div className="main">
        <Header graphs={this.state.graphs}
                clearStage={this.clearStage}
                clearCurrent={this.clearCurrent}
                collections={this.state.collections}
                findNodes={this.findNodes}
                onToggleGraph={this.onToggleGraph}
                setPageNumber={this.setPageNumber}
                enabledCollections={this.state.enabledCollections}
                setEnabledCollections={this.setEnabledCollections}
                setAppState={this.setAppState}
                query={this.state.query}
                searchContent={this.searchContent} />

        <SearchContent ref={(searchContent) => {this.searchContent = searchContent}}
                       nodes={this.state.nodes}
                       setCurrent={this.setCurrent}
                       addNodeToStage={this.addNodeToStage}
                       currentNode={this.state.currentNode}
                       clearStage={this.clearStage}
                       clearCurrent={this.clearCurrent}
                       findNodes={this.findNodes}
                       pageNumber={this.state.pageNumber}
                       setPageNumber={this.setPageNumber}
                       enabledCollections={this.state.enabledCollections}
                       query={this.state.query} />

        <Stage graphs={this.state.graphs}
               stageNodes={this.state.stageNodes}
               currentNode={this.state.currentNode}
               clearCurrent={this.clearCurrent}
               removeNode={this.removeNode}
               setCurrent={this.setCurrent} />

        <Info getNode={this.getNode}
              stageNodes={this.state.stageNodes}
              graphs={this.state.graphs}
              stageHasNode={this.stageHasNode}
              addNodeToStage={this.addNodeToStage}
              clearCurrent={this.clearCurrent}
              currentNode={this.state.currentNode} />
      </div>
    );
  }

  getGraphsAndCollections() {
    this.socket.emit('getcollections', {}, (data) => {
      this.setState({ collections: data });
    });

    this.socket.emit('getgraphs', {}, (data) => {
      let graphs = [];
      data = sortByName(data);

      for(let i=0, l=data.length; i<l; ++i) {
        graphs.push({
          name: data[i].name,
          colorClass: 'graph-color' + i,
          enabled: true
        });
      }

      this.setState({ graphs: graphs });
    });
  }

  addNodeToStage(node, parentUuid, makeCurrent=false) {
    if(this.stageHasNode(node._id, parentUuid)) {
      let n = this.getNode(node, parentUuid);
      this.setCurrent(n);
      return;
    }

    node.uuid = uuid();
    node.items = node.items || [];
    let currentNodes = this.state.stageNodes.slice();

    if(parentUuid) {
      traverseItems(currentNodes, (n) => {
        if(n.uuid === parentUuid) {
          n.items.push(node);
        }
      });
    } else {
      node.root = true;
      currentNodes = [node];
    }

    return this.setState({ stageNodes: currentNodes }, () => {
      if(makeCurrent) {
        this.setCurrent(node);
      }
    });
  }

  stageHasNode(nodeId, parentUuid) {
    let stageNodes = this.state.stageNodes,
        ids = stageNodes.map(n => n._id);

    if(parentUuid !== undefined) {
      traverseItems(stageNodes, (n) => {
        if(n.uuid === parentUuid) {
          ids = n.items.map(n => n._id);
        }
      });
    }

    return !(ids.indexOf(nodeId) < 0);
  }

  getNode(node, parentUuid) {
    let stageNodes = this.state.stageNodes.slice(),
        nodeFound = false;

    traverseItems(stageNodes, (n) => {
      if(n.uuid === node.uuid) {
        nodeFound = n;
      }
    });

    if(!nodeFound && parentUuid !== undefined) {
      traverseItems(stageNodes, (n) => {
        if(n.uuid === parentUuid) {
          for(let i in n.items) {
            if(node._id === n.items[i]._id) {
              nodeFound = n.items[i];
            }
          }
        }
      });
    }

    return nodeFound;
  }

  removeNode(node) {
    let stageNodes = this.state.stageNodes.slice();
    let i = stageNodes.findIndex((n) => {
        return n.uuid === node.uuid;
    });

    if (i >= 0) {
      stageNodes.splice(i, 1);
    } else {
      traverseItems(stageNodes, (n) => {
        let j = n.items.findIndex((n) => {
          return n.uuid === node.uuid;
        });
        if (j >= 0) {
          n.items.splice(j, 1);
        }
      });
    }

    this.setState({ stageNodes: stageNodes });
  }

  clearStage() {
    return this.setState({ stageNodes: [] });
  }

  findNodes(query, co, count, pageNumber, fn) {
    if(co !== undefined && !co instanceof Array)  {
      console.log('The 2nd argument must be an Array');
      return;
    }

    if(co.length === 0) {
      console.log('Select an item');
      return;
    }

    this.socket.emit('findnodes', { query: query, collections: co, count: count, pageNumber: pageNumber }, (data) => {
      if(!data || data.length <= 0) {
        fn(data);
        return;
      }

      this.setState({ nodes: data }, () => {
        fn(data);
      });
    });
  }

  setPageNumber(pageNumber) {
    this.setState({ pageNumber: pageNumber });
  }

  setEnabledCollections(enabledCollections) {
    this.setState({ enabledCollections: enabledCollections });
  }

  setAppState(dict) {
    this.setState(dict);
  }

  setCurrent(node, fn) {
    this.setState({ currentNode: { _id: node._id, uuid: node.uuid } }, fn);
  }

  clearCurrent(fn) {
    this.setState({ currentNode: false }, fn);
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.clearCurrent();
    }
  };

  onToggleGraph(event, graphName) {
    event.stopPropagation();
    let graphsCopy = this.state.graphs.map((graph) => {
      if(graph.name === graphName) {
        graph.enabled = !graph.enabled;
      }
      return graph;
    });
    this.setState({ graphs: graphsCopy });
  }

  componentDidMount() {
    this.getGraphsAndCollections();
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

}

export { App as default, uiSocket };
