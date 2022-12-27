import traverse from "@babel/traverse";
import {
	getASTFromSource,
	getChildComponents,
	getJSXChildrensFromArrowFunction,
	IJSX,
} from "./parse_utils";
import { getFileContent, getFilesFromDirectory, saveJSONToFile } from "./utils";

interface ITreeNode {
	name: string;
	// state saves states names of the component
	state?: string[];
	// isConditional?: boolean;
	children: ITreeNode[];
}

interface IReactComponentTree {
	dirPath: string | null;
	srcFiles: string[] | null;
	// reactComponents: basically adjacency list
	// App -> [Head, Body]
	// Body -> [Section, Section, ImageWrapper]
	reactComponents: Map<string, string[]> | null;
	// componentsTree: ITree | null;
	getReactComponents: () => Promise<Map<string, string[]>>;
	getTree: () => Promise<ITreeNode[]>;
}

export default class ReactComponentTree implements IReactComponentTree {
	public dirPath: string | null;
	public srcFiles: string[] | null;
	public reactComponents: Map<string, string[]> | null;
	// public componentsTree: ITree | null;

	constructor(dirPath: string) {
		this.dirPath = dirPath;
		this.reactComponents = null;
		this.srcFiles = null;
		// this.componentsTree = null;
	}

	public async getAST(filePath: string) {
		// if no filePath was specified, throw error
		if (!filePath || filePath.length === 0) {
			throw new Error(
				`[REACT COMPONENT TREE] Couldn't get AST, filePath was not specified.`
			);
		}
		const fileSrc = await getFileContent(filePath);
		const AST = getASTFromSource(fileSrc);
		return AST;
	}

	public async saveAST(filePath: string) {
		const AST = await this.getAST(filePath);
		if (!AST) {
			throw new Error(
				`[REACT COMPONENT TREE] Couldn't save AST because AST was not generated.`
			);
		}

		await saveJSONToFile("./src/output/AST.json", AST);
	}

	public addParentComponent(
		children: IJSX[] | null,
		parentComponentName: string
	) {
		const _this = this;

		// returns child components
		const childComponents: string[] = getChildComponents(children, _this);
        
		// we initialize the component
		let parentComponent = _this.reactComponents?.get(parentComponentName);
		if (children && children.length > 0) {
			if (!parentComponent) {
				_this.reactComponents?.set(parentComponentName, []);
				parentComponent =
					_this.reactComponents?.get(parentComponentName);
			}
		}

		// after we initialize parent component
		// add each children component to parent component
		if (parentComponent) {
			_this.reactComponents?.set(
				parentComponentName,
				parentComponent.concat(childComponents)
			);
		}
	}

	public async getReactComponents() {
		if (!this.dirPath) {
			throw new Error(
				`[REACT COMPONENT TREE] Couldn't load files from directory, path was not specified.`
			);
		}
		this.srcFiles = await getFilesFromDirectory(this.dirPath, [
			"js",
			"ts",
			"jsx",
		]);
		this.reactComponents = new Map<string, string[]>();
		for (const file of this.srcFiles) {
			console.log(`Processing ${file}...`);
			const AST = await this.getAST(file);
			if (!AST) {
				throw new Error(
					`[REACT COMPONENT TREE] Couldn't get react components because AST was not generated.`
				);
			}

			const _this = this;
			traverse(AST, {
				VariableDeclarator(path) {
					const { node } = path;
					const dataType = node.init?.type;
					const varId = node.id;
					if (varId.type !== "Identifier") {
						return;
					}
					const varName = varId.name;
					if (dataType === "ArrowFunctionExpression") {
						const children = getJSXChildrensFromArrowFunction(
							node.init.body
						);
						_this.addParentComponent(children, varName);
					}
				},
				// enter(path) {
				// 	console.log(path.node.type);
				// 	console.log(path.node);
				// },
			});
		}
		return this.reactComponents;
	}

	public async getTree() {
		// build tree from this.reactComponents and return it
		if (!this.reactComponents) {
			await this.getReactComponents();
		}
		const rootNodes = new Set<string>();
		const treeNodes = new Map<string, ITreeNode>();
		if (this.reactComponents) {
            // recorremos todos los componentes padres con sus hijos
            // que identificamos
			for (const [
				parentComponent,
				childComponents,
			] of this.reactComponents.entries()) {
				if (!treeNodes.has(parentComponent)) {
                    // si el componente padre no fue agregado previamente al arbol,
                    // este se agrega como si fuera nodo raiz
					rootNodes.add(parentComponent);
				}
				if (treeNodes.has(parentComponent)) {
                    // si el componente padre fue agregado previamente al arbol,
                    // se agregan los componentes hijos al nodo en el arbol
					const mutable = treeNodes.get(parentComponent);
					if (mutable?.children) {
						mutable.children = childComponents.map(
							(childComponent) => {
								if (rootNodes.has(childComponent)) {
                                    // si el hijo fue agregado como nodo raiz,
                                    // se elimina porque es hijo de otro nodo
									rootNodes.delete(childComponent);
								}
								if (treeNodes.has(childComponent)) {
                                    // si el componente hijo ya fue agregado al arbol
                                    // se retorna ese nodo
									return (
										treeNodes.get(childComponent) ?? {
											name: childComponent,
											children: [],
										}
									);
								}
                                // sino se crea un nuevo nodo y se agrega como hijo
								treeNodes.set(childComponent, {
									name: childComponent,
									children: [],
								});
								return (
									treeNodes.get(childComponent) ?? {
										name: childComponent,
										children: [],
									}
								);
							}
						);
					}
				} else {
                    // si el componente padre no fue agregado previamente al arbol,
                    // se agrega el componente padre al arbol
					treeNodes.set(parentComponent, {
						name: parentComponent,
						children: childComponents.map((childComponent) => {
							if (rootNodes.has(childComponent)) {
                                // si el hijo fue agregado como nodo raiz,
                                // se elimina porque es hijo de otro nodo
								rootNodes.delete(childComponent);
							}
							if (treeNodes.has(childComponent)) {
                                // si el componente hijo ya fue agregado al arbol
                                // se retorna ese nodo
								return (
									treeNodes.get(childComponent) ?? {
										name: childComponent,
										children: [],
									}
								);
							}
                            // sino se crea un nuevo nodo y se agrega como hijo
							treeNodes.set(childComponent, {
								name: childComponent,
								children: [],
							});
							return (
								treeNodes.get(childComponent) ?? {
									name: childComponent,
									children: [],
								}
							);
						}),
					});
				}
			}
		}
        
        // agregamos los nodos raices
		let roots: ITreeNode[] = [];
		for (const [componentName] of rootNodes.entries()) {
			roots = roots.concat(
				treeNodes.get(componentName) ?? {
					name: componentName,
					children: [],
				}
			);
		}
		return roots;
	}
}
