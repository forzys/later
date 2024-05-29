function TextNode(text, parent) {
  this.text = text;
  this.parent = parent;
}

function convertAttributes(str) {
  if (!str) {
    return {};
  }
  const result = {};
  const arr = str.replace(/[\s]+/g, ' ').trim().match(/([\S]+="[^"]*")|([^\s"]+)/g);

  arr.forEach((item) => {
    if (item.indexOf('=') === -1) {
      result[item] = true;
    } else {
      //just split first =
      const match = item.match(/([^=]+)=([^]*)/);
      // remove string ""
      result[match[1]] = (match[2] && match[2].replace(/^"([^]*)"$/, '$1'))
    }
  });
  return result;
}

function convertStyle(str) {
  if (!str) {
    return {};
  }
  const result = {};
  str.replace(/[\s]+/g, '').split(';').forEach((item) => {
    if (item) {
      const match = item.split(':');
      result[match[0]] = match[1];
    }
  });
  return result;
}

function convertClass(str) {
  if (!str || typeof str !== 'string') {
    return [];
  }
  return str.trim().replace(/[\s]+/g, ' ').split(' ');
}

function ElementNode({tagName, attributes, text}, parent) {
  this.text = text;
  this.tagName = tagName;
  this.attributes = convertAttributes(attributes);
  this.style = convertStyle(this.attributes.style);
  this.classList = convertClass(this.attributes['class']);
  this.children = [];
  this.parent = parent;
}

ElementNode.prototype.getElementById = function (id) {
  function find(element) {
    if (element instanceof TextNode) {
      return null;
    }
    if (element.attributes.id === id) {
      return element;
    } else if (element.children.length > 0) {
      let result = null;
      element.children.forEach((child) => {
        const temp = find(child);
        if (temp) {
          result = temp;
        }
      });
      return result;
    }
    return null;
  }
  return find(this);
};

ElementNode.prototype.getElementsByClassName = function (className) {
  function find(element) {
    if (element instanceof TextNode) {
      return [];
    }
    let result = [];
    if (element.classList.indexOf(className) !== -1) {
      result.push(element);
    }
    if (element.children.length > 0) {
      element.children.forEach((child) => {
        result = result.concat(find(child));
      });
    }
    return result;
  } 
  return find(this);
};

ElementNode.prototype.getElementsByTagName = function (tagName) {
  function find(element) {
    if (element instanceof TextNode) {
      return [];
    }
    let result = [];
    if (element.tagName === tagName) {
      result.push(element);
    }
    if (element.children.length > 0) {
      element.children.forEach((child) => {
        result = result.concat(find(child));
      });
    }
    return result;
  } 
  return find(this);
};

ElementNode.prototype.getElementsByName = function (name) {
  function find(element) {
    if (element instanceof TextNode) {
      return [];
    }
    let result = [];
    if (element.attributes.name === name) {
      result.push(element);
    }
    if (element.children.length > 0) {
      element.children.forEach((child) => {
        result = result.concat(find(child));
      });
    }
    return result;
  } 
  return find(this);
};

ElementNode.prototype.querySelector = function () {
//TODO
};

ElementNode.prototype.querySelectorAll = function () {
//TODO
}; 

function removeScript(str){
return str.replace(/<script[^>]*>([^]*?)<\/script>/g, '');
}

function correctBracket(str) {
return str.replace(/("[^<>\/"]*)<([^<>\/"]+)>([^<>\/"]*")/g, '"$1|$2|$3"');
}

function removeComment(str) {
return str.replace(/<!--[^>]*-->/g, '');
}

function removeBreakLine(str) {
return str.replace(/[\r\n\t]/g, '');
}

function getBodyIfHave(str) {
const match = str.match(/<body[^>]*>([^]*)<\/body>/);
if (!match) {
  return str;
}
return match[1];
}


const VOID_TAG = [
'area', 'base',
'br', 'col', 'embed', 'hr', 'img',
'input', 'link', 'meta', 'param',
'source', 'track', 'wbr'
];

const NODE_TYPE = {
text: 'text',
self: 'self',
close: 'close',
// start or total
start: 'start'
};

let stack = [];


function addLine(line, isTextNode) {
/**
 *   "<div>"
 *   "</div>"
 *   "<image />"
 *   "some text"
 */
if (line.trim() === '') {
  return;
}
// text node
if (isTextNode) {
  stack.push({
    type: NODE_TYPE.text,
    text: line
  });
  return;
}

let match;
// "<image />"
match = line.match(/<([^\s<>]+) ?([^<>]*)\/>/);
if (match) {
  stack.push({
    type: NODE_TYPE.self,
    tagName: match[1],
    attributes: match[2],
    text: line
  });
  return;
}
// "</div>"
match = line.match(/<\/([^\s<>]+)>/);
if (match) {
  stack.push({
    type: NODE_TYPE.close,
    tagName: match[1],
    text: line
  });
  return;
}
//  "<div>"
match = line.match(/<([^\s<>]+) ?([^<>]*)>/);
if (match) {
  stack.push({
    type: NODE_TYPE.start,
    tagName: match[1],
    attributes: match[2],
    text: line
  });
  return;
}
}


function parseChildren(str) {
const pattern = /(<[^<>]+>)/g;
if (!str) {
  return null;
}
let pointer = 0;
let match;
stack = [];
while (match = pattern.exec(str)) {
  addLine(str.slice(pointer, match.index), true);
  addLine(match[1]);
  pointer = match.index + match[0].length;
}
const children = [];
let currentNode = null;
if (stack.length > 0) {
  stack.forEach((node) => {
    // text node
    if (node.type === NODE_TYPE.text) {
      if (currentNode) {
        currentNode.children.push(new TextNode(node.text, currentNode));
      } else {
        children.push(new TextNode(node.text, null));
      }
    } else if (node.type === NODE_TYPE.close) {
      if (!currentNode) {
        throw new Error('parse error');
      } else {
        if (node.tagName === currentNode.tagName) {
          currentNode.firstChild = currentNode.children[0];
          currentNode.lastChild = currentNode.children[currentNode.children.length - 1];

          currentNode = currentNode.parent;
        } else {
          throw new Error('parse error');
        }
      }
    } else if (node.type === NODE_TYPE.start && VOID_TAG.indexOf(node.tagName) === -1) {
      const newNode = new ElementNode(node, currentNode);
      if (!currentNode) {
        children.push(newNode);
      } else {
        currentNode.children.push(newNode);
      }
      currentNode = newNode;
    } else if (node.type === NODE_TYPE.self || VOID_TAG.indexOf(node.tagName) !== -1) {
      if (currentNode) {
        currentNode.children.push(new ElementNode(node, currentNode));
      } else {
        children.push(new ElementNode(node, null));
      }
    }
  });
}
return children;
}

const DomSelector = function (str) {
  let _str = str || '';
  _str = correctBracket(getBodyIfHave(removeBreakLine(removeComment(removeScript(_str)))));

  const result = parseChildren(_str);
  if (result.length > 1) {
    const root = new ElementNode({tagName: '', attributes: '', text: str}, null);
    root.children = result;
    return root;
  } else {
    return result[0];
  }
};

export default DomSelector;