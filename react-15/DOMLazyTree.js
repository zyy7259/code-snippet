var DOMLazyTree = {
  replaceChildWithTree(oldNode, newTree) {
    oldNode.parentNode.replaceChild(newTree.node, oldNode);
    insertTreeChildren(newTree);
  }
};

export default DOMLazyTree;
