import { stringify } from "querystring";
import ReactComponentTree from "./lib/react_component_tree";
import { saveJSONToFile } from "./lib/utils";

const main = async (): Promise<void> => {
    // const DIR_PATH = "/home/khannom/Documents/projects/test_projects/react-functional-components-example/src";
    const DIR_PATH = "/home/khannom/Documents/projects/test_projects/arq-test/src";
    const reactComponentTree = new ReactComponentTree(DIR_PATH);
	const rootNodes = await reactComponentTree.getTree();
	await saveJSONToFile("./src/output/tree.json", rootNodes);
};

main();