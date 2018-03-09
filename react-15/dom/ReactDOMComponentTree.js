// TODO:
var ReactDOMComponentTree = {
  /**
   * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
   * DOM node.
   */
  getNodeFromInstance(inst) {
    if (inst._hostNode) {
      return inst._hostNode;
    }

    // Walk up the tree until we find an ancestor whose DOM node we have cached.
    var parents = [];
    while (!inst._hostNode) {
      parents.push(inst);
      invariant(
        inst._hostParent,
        'React DOM tree root should always have a node reference.'
      );
      inst = inst._hostParent;
    }

    // Now parents contains each ancestor that does *not* have a cached native
    // node, and `inst` is the deepest ancestor that does.
    for (; parents.length; inst = parents.pop()) {
      precacheChildNodes(inst, inst._hostNode);
    }

    return inst._hostNode;
  },

  uncacheNode() {}
};

export default ReactDOMComponentTree;
