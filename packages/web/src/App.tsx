import { useState } from "react";
import Tree from "react-d3-tree";
import { RawNodeDatum } from "react-d3-tree/lib/types/common";
import treeData from "./data/tree.json";
import "./App.css";

function App() {
	const [tree, setTree] = useState<RawNodeDatum | RawNodeDatum[]>(treeData);
	// const [tree, setTree] = useState<RawNodeDatum | RawNodeDatum[]>([
	// 	{
	// 		name: "App",
	// 		children: [
	// 			{
	// 				name: "CounterComponent",
	// 				children: [{ name: "div", children: [] }],
	// 			},
	// 			{ name: "h1", children: [{ name: "div", children: [] }] },
	// 			{ name: "h2", children: [] },
	// 			{ name: "img", children: [] },
	// 			{ name: "functionReturn", children: [] },
	// 			{ name: "normalFunction", children: [] },
	// 		],
	// 		attributes: {
	// 			counter: "number",
    //             data: 'IDatos',
	// 		},
	// 	},
	// 	{ name: "arrowFunction", children: [] },
	// ]);
	console.log(tree);
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<Tree data={tree} orientation="vertical"></Tree>
		</div>
	);
}

export default App;
