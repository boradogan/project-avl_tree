
class Node {
    constructor(value) {
        this.value = value;
        this.leftChild = null;
        this.rightChild = null;
        this.height = 1;
        this.balanceFactor = 0;
    }
}


class AVLTree {
    constructor() {
        this.root = null;
    }

    #getHeight(node){
        return node? node.height : 0;
    }
    #updateHeight(node) {
        //Updates the height of the node assuming that all the children already have correct heights
        node.height = 1 + Math.max(this.#getHeight(node.leftChild), this.#getHeight(node.rightChild));
    }
    #updateBalanceFactor(node){
        //Updates the node.balanceFactor assuming that all the children already have correct heights
        node.balanceFactor = this.#getHeight(node.rightChild) - this.#getHeight(node.leftChild);
    }


    buildTree(array) {
        //Given an array of numbers, builds a self balancing AVL Tree

        array.forEach(item => {
            this.insert(item);
        })

        return this.root;

    }

    find(value) {
        //Finds the node with the value or otherwise returns null
        console.log(`looking for the node with value ${value}`)
        if(!this.root) {
            return null
        }
        let currentNode = this.root;

        while(currentNode) {
            // console.log(currentNode)
            if(currentNode.value === value) {
                return currentNode;
            }

            currentNode = currentNode.value < value? currentNode.rightChild: currentNode.leftChild;
        }
        // console.log('we hit here')
        return null;
    }


    height(value) {
        //Finds the node with the matching value and returns the height of it, otherwise returns null
        const node = this.find(value);
        return node? node.height: null
    }
    traverseToLeaf(value, startingRoot = this.root){
        //Traverses the tree starting from the root, until a match is found
        //returns a stack (array) of the traversal where the first item is the root
        // and the last item is the leaf or the node that a match is found
        const traverseStack = [];
        if(!this.root) {
            return traverseStack;
        }

        let currentNode = startingRoot;
        while(currentNode) {
            traverseStack.push(currentNode);
            if(currentNode.value === value) {
                console.log('match is found terminating the traversal');
                // return traverseStack;
                break;
            }

            //console.log(currentNode);
            currentNode = currentNode.value < value? currentNode.rightChild : currentNode.leftChild;

        }   
        console.log('Traverse Stack', traverseStack)
        traverseStack.forEach((node) => {
            console.log(node.value);
        })
        return traverseStack

    }
    // This is the PUBLIC delete method.
    delete(value) {
        this.root = this.#deleteNode(this.root, value);
    }
    #deleteNode(node, value) {
        // Base case: If the node is null, the value isn't here.
        if (node === null) {
            return node;
        }

        // Recurse down the tree to find the node to delete
        if (value < node.value) {
            node.leftChild = this.#deleteNode(node.leftChild, value);
        } else if (value > node.value) {
            node.rightChild = this.#deleteNode(node.rightChild, value);
        } else {
            // --- Node with the value found ---

            // Case 1 & 2: Node has 0 or 1 child
            if (node.leftChild === null) {
                return node.rightChild;
            }
            if (node.rightChild === null) {
                return node.leftChild;
            }

            // Case 3: Node has 2 children
            // Find the in-order successor (smallest node in the right subtree)
            const successor = this.#findMinValueNode(node.rightChild);
            // Copy the successor's value to this node
            node.value = successor.value;
            // Recursively delete the successor from its original position
            node.rightChild = this.#deleteNode(node.rightChild, successor.value);
        }

        // --- Update height and rebalance the current node ---
        this.#updateHeightAndBalance(node);
        
        // The updateSubTree logic can be simplified into a rebalance helper
        return this.#rebalance(node);
    }
    #findMinValueNode(node) {
        let current = node;
        while (current.leftChild !== null) {
            current = current.leftChild;
        }
        return current;
    }
    #rebalance(node) {
        // Right-heavy cases
        if (node.balanceFactor >= 2) {
            if (node.rightChild.balanceFactor < 0) { // Right-Left case
                node.rightChild = this.#rotateRight(node.rightChild);
            }
            return this.#rotateLeft(node);
        }
        // Left-heavy cases
        if (node.balanceFactor <= -2) {
            if (node.leftChild.balanceFactor > 0) { // Left-Right case
                node.leftChild = this.#rotateLeft(node.leftChild);
            }
            return this.#rotateRight(node);
        }

        // No rebalancing needed, return the original node
        return node;
    }




    #propagateBackRebalance(traverseStack) {
        //Given a traversal stack, propagates back to the first node while rebalancing at each step

        while(traverseStack.length) {
            const lastNode = traverseStack.pop();
            // console.log(traverseStack)
            // console.log(lastNode)
            this.#updateHeightAndBalance(lastNode);
            
            //update the subtree, using the appropriate rotations,
            //  if there is still nodes left in the stack the last one has to be the parent of the lastNode

            this.updateSubTree(lastNode, traverseStack.length? traverseStack.at(-1): null);

        }
    }

    insert(value) {
        if(!this.root) {
            this.root = new Node(value);
            // console.log(this)
            return
        }

        const traverseStack = this.traverseToLeaf(value);
        const leafNode = traverseStack.at(-1);
        // console.log(leafNode);


        if(value === leafNode.value) {
            console.log('Match is found not inserting');
            return
        }

        const newNode = new Node(value);
        
        if(value > leafNode.value) {
            leafNode.rightChild = newNode;
        } else {
            leafNode.leftChild = newNode;
        }

        //Now at this point we assume that we have a traverseStack and we inserted the new child 
        // successfully

        //We now traverse back until the traverseStack is empty, updating the heights and baalnce factors
        // of the nodes accordingly and rebalancing the tree when necessary
        this.#propagateBackRebalance(traverseStack);
        // while(traverseStack.length) {
        //     const lastNode = traverseStack.pop();
        //     // console.log(traverseStack)
        //     // console.log(lastNode)
        //     this.#updateHeightAndBalance(lastNode);
            
        //     //update the subtree, using the appropriate rotations,
        //     //  if there is still nodes left in the stack the last one has to be the parent of the lastNode
        //     this.updateSubTree(lastNode, traverseStack.length? traverseStack.at(-1): null);

        // }
    }
    #updateHeightAndBalance(node){
        this.#updateHeight(node);
        this.#updateBalanceFactor(node);
    }

    #rotateLeft(node) {
        const oldRoot = node;
        const newRoot = node.rightChild;
        oldRoot.rightChild = newRoot.leftChild;
        newRoot.leftChild = oldRoot;

        //After setting the new subtree update the height and balance factor (bottom-up)
        this.#updateHeightAndBalance(oldRoot);
        this.#updateHeightAndBalance(newRoot);
        return newRoot;
    }

    #rotateRight(node) {
        const oldRoot = node;
        const newRoot = node.leftChild;
        oldRoot.leftChild = newRoot.rightChild;
        newRoot.rightChild = oldRoot;

        //After setting the new subtree update the height and balance factor (bottom-up)
        this.#updateHeightAndBalance(oldRoot);
        this.#updateHeightAndBalance(newRoot);
        return newRoot;
    }

    updateSubTree(currentSubTreeRoot, currentSubTreeParent) {
        let newRoot;
        const oldRoot = currentSubTreeRoot;

        if(oldRoot.balanceFactor >= -1 && oldRoot.balanceFactor <= 1){
            //no need for balancing
            return
        }

        console.log(`Updating the subtree for the node with value ${oldRoot.value}`);

        if(oldRoot.balanceFactor >= 2) {
            if(oldRoot.rightChild.balanceFactor < 0) {
                //In this case we need double rotation
                console.log('double rotation incoming');
                oldRoot.rightChild = this.#rotateRight(oldRoot.rightChild);

                //Turns out that you dont need to check for the balance of the old root
                //after doing to first rotation so we dont need to update 

                // this.#updateHeightAndBalance(oldRoot);
                // if(!(oldRoot.balanceFactor >= 2)){
                //     console.log('the balance is fixed via the first rotation');
                // }
            }


            newRoot = this.#rotateLeft(oldRoot);
            
           
        }

        if(oldRoot.balanceFactor <= -2) {
            // Left-heavy imbalance
            if(oldRoot.leftChild.balanceFactor > 0) {
                //If the left child is right heavy we need double rotation
                oldRoot.leftChild = this.#rotateLeft(oldRoot.leftChild);
            }
            newRoot = this.#rotateRight(oldRoot);


        }


        //Attach the subtree correctly to its older parent

        //If there the subtree root is the root of the whole tree update it
        if(oldRoot === this.root) {
            this.root = newRoot;
            return
        }
        //In the typical case that the subtree is not the whole tree,
        //attach the updated subtree to its parent
        // prettyPrint(this.root)
        if(oldRoot === currentSubTreeParent.leftChild) {
            currentSubTreeParent.leftChild = newRoot;
        } else if(oldRoot === currentSubTreeParent.rightChild) {
            currentSubTreeParent.rightChild = newRoot;
        } else {
            throw new Error('something has gone wrong this cant be the case');
        }

    }

}




const myTree = new AVLTree();

myTree.buildTree([5, 3, 8, 7, 1, 9.5, 6, 4]);
// myTree.insert(100);
// myTree.insert(125);
// myTree.insert(130);
// myTree.insert(120);


console.log(myTree)


const prettyPrint = (node, prefix = '', isLeft = true) => {
  if (node === null) {
    return;
  }
  if (node.rightChild !== null) {
    prettyPrint(node.rightChild, `${prefix}${isLeft ? '│   ' : '    '}`, false);
  }
  console.log(`${prefix}${isLeft ? '└── ' : '┌── '}${node.value}`);
  if (node.leftChild !== null) {
    prettyPrint(node.leftChild, `${prefix}${isLeft ? '    ' : '│   '}`, true);
  }
};


prettyPrint(myTree.root)
myTree.delete(8)
prettyPrint(myTree.root)
myTree.insert(12)
prettyPrint(myTree.root)
myTree.delete(5)
prettyPrint(myTree.root)

