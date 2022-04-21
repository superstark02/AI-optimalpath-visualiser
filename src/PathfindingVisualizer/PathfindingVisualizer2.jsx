import React, { Component } from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { astar } from '../algorithms/astar';
import './PathfindingVisualizer.css';

const START_NODE_ROW = 0;
const START_NODE_COL = 0;
const FINISH_NODE_ROW = 19;
const FINISH_NODE_COL = 49;

export default class PathfindingVisualizer2 extends Component {
    constructor() {
        super();
        this.state = {
            grid: [],
            mouseIsPressed: false,
        };
    }

    componentDidMount() {
        const grid = getInitialGrid();
        this.setState({ grid });
    }

    handleMouseDown(row, col) {
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ grid: newGrid, mouseIsPressed: true });
    }

    handleMouseEnter(row, col) {
        if (!this.state.mouseIsPressed) return;
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ grid: newGrid });
    }

    handleMouseUp() {
        this.setState({ mouseIsPressed: false });
    }

    visualizeAstar() {
        const { grid } = this.state;
        const startNode = grid[START_NODE_ROW][START_NODE_COL];
        const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
        const visitedNodesInOrder = astar(startNode, finishNode);
        //const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        this.animateDijkstra(visitedNodesInOrder);
    }

    animateDijkstra(visitedNodesInOrder) {
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            const node = visitedNodesInOrder[i];
            const newGrid = this.state.grid.slice();
            const newNode = {
                ...node,
                isVisited: true
            };

            newGrid[node.row][node.col] = newNode;
            setTimeout(() => {
                this.setState({ grid: newGrid });
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
            }, 100);
        }
    }

    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className =
                    'node node-shortest-path';
            }, 50 * i);
        }
    }

    render() {
        const { grid, mouseIsPressed } = this.state;

        return (
            <>
                <div>
                    <button onClick={() => this.visualizeAstar()}>
                        Visualize A* Algorithm
                    </button>
                </div>
                <div className="grid">
                    {grid.map((row, rowIdx) => {
                        return (
                            <div key={rowIdx}>
                                {row.map((node, nodeIdx) => {
                                    const { row, col, isFinish, isStart, isWall } = node;
                                    return (
                                        <Node
                                            key={nodeIdx}
                                            col={col}
                                            isFinish={isFinish}
                                            isStart={isStart}
                                            isWall={isWall}
                                            mouseIsPressed={mouseIsPressed}
                                            onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                                            onMouseEnter={(row, col) =>
                                                this.handleMouseEnter(row, col)
                                            }
                                            onMouseUp={() => this.handleMouseUp()}
                                            row={row}></Node>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }
}

const getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < 20; row++) {
        const currentRow = [];
        for (let col = 0; col < 50; col++) {
            currentRow.push(createNode(col, row));
        }
        grid.push(currentRow);
    }
    addNeighboursWrap(grid);
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const endNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    astar(startNode, endNode);
    return grid;
};

const createNode = (col, row) => {
    return {
        col,
        row,
        g: 0,
        f: 0,
        h: 0,
        isStart: row === START_NODE_ROW && col === START_NODE_COL,
        isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
        neighbours: [],
        previous: undefined,
        addNeighbours: function (grid) {
            let i = this.col;
            let j = this.row;
            if (i > 0) this.neighbours.push(grid[j][i - 1]);
            if (i < 50 - 1) this.neighbours.push(grid[j][i + 1]);
            if (j > 0) this.neighbours.push(grid[j - 1][i]);
            if (j < 20 - 1) this.neighbours.push(grid[j + 1][i]);
        },

    };
};

const addNeighboursWrap = (grid) => {
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 50; j++) {
            grid[i][j].addNeighbours(grid);
        }
    }
}

const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
        ...node,
        isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
};
