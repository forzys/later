import React, { Component, Children, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootControllerChanges = {
    Insert:0,
    Update:1,
    Remove:2
}

class StaticContainer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.shouldUpdate;
    }
    render() {
        const child = this.props.children;
        return child === null || child === false ? null : Children.only(child);
    }
}

export class RootController { 
    constructor(props) {
        this.siblings = new Set();
        this.pendingActions = []
        this.callback = null 
    }

    update(id, element, callback ) {
        if (!this.siblings.has(id)) {
            this.emit(id, { change: RootControllerChanges.Insert, element, updateCallback: callback });
            this.siblings.add(id);
        } else {
            this.emit(id, { change: RootControllerChanges.Update, element, updateCallback: callback });
        }
    }

    destroy(id, callback ) {
        if (this.siblings.has(id)) {
            this.emit(id, { change: RootControllerChanges.Remove, element: null, updateCallback: callback });
            this.siblings.delete(id);
        } else if (callback) {
            callback();
        }
    }

    setCallback( callback ) {
        this.callback = callback;
        this.pendingActions.forEach(({ id, action }) => { callback(id, action) });
    }

    emit(id, action) {
        if (this.callback) {
            this.callback(id, action);
        } else {
            this.pendingActions.push({ action, id });
        }
    }
}

class RootSiblings extends Component {
    constructor(props) {
        super(props); 
        this.state = {
            siblings: []
        };
        this.updatedSiblings = new Set();
        this.siblingsPool =  []; 
    }

    componentDidMount() {
        this.props.controller.setCallback((id, change) => {
            setTimeout(() => this.commitChange(id, change));
        });
    }

    componentDidUpdate() {
        this.updatedSiblings.clear();
    }

    render() {
            return (
                <GestureHandlerRootView style={{flex:1}}>
                    {this.props.children}
                    {this.renderSiblings()}
                </GestureHandlerRootView>
            );
        }

    commitChange(id, { change, element, updateCallback }) {
        const siblings = Array.from(this.siblingsPool);
        const index = siblings.findIndex(sibling => sibling.id === id);

        if (change === RootControllerChanges.Remove) {
            if (index > -1) {
                siblings.splice(index, 1);
            } else {
                this.invokeCallback(updateCallback);
                return;
            }
        } else if (change === RootControllerChanges.Update) {
            if (index > -1) {
                siblings.splice(index, 1, { element, id });
                this.updatedSiblings.add(id);
            } else {
                this.invokeCallback(updateCallback);
                return;
            }
        } else {
            if (index > -1) {
                siblings.splice(index, 1);
            }
            siblings.push({ element, id });
            this.updatedSiblings.add(id);
        }

        this.siblingsPool = siblings;
        this.setState({ siblings }, () => this.invokeCallback(updateCallback));
    }

    invokeCallback(callback) {
        if (callback) {
            callback();
        }
    }

    renderSiblings() {
        return this.state.siblings.map(({ id, element }) => {
            return (
                <StaticContainer key={`root-sibling-${id}`} shouldUpdate={this.updatedSiblings.has(id)}>
                    {this.wrapSibling(element)}
                </StaticContainer>
            );
        });
    }

    wrapSibling(element) {
        const { renderSibling } = this.props;
        if (renderSibling) {
            return renderSibling(element);
        } else {
            return element;
        }
    }
}


function wrapRootComponent(Root, renderSibling) {
    const controller = new RootController();

    return {
        Root: (props) => {
            return (
                <RootSiblings controller={controller} renderSibling={renderSibling}>
                    <Root {...props} />
                </RootSiblings>
            );
        },
        manager: {
            update(id, element, callback) {
                controller.update(id, element, callback);
            },
            destroy(id, callback) {
                controller.destroy(id, callback);
            }
        }
    };
}
 
function ChildrenWrapper(props) {
    return <>{props.children}</>;
}

let siblingWrapper = sibling => sibling;
  
function renderSibling(sibling) {
    return siblingWrapper(sibling);
}
  
export function setSiblingWrapper(wrapper) {
    siblingWrapper = wrapper;
}
  
const { manager: defaultManager } = wrapRootComponent(ChildrenWrapper, renderSibling);
 
let uuid = 0;
const managerStack  = [defaultManager];
const inactiveManagers  = new Set();
  
function getActiveManager() {
    for (let i = managerStack.length - 1; i >= 0; i--) {
        const manager = managerStack[i];
        if (!inactiveManagers.has(manager)) {
            return manager;
        }
    } 
    return defaultManager;
}
  
export function RootSiblingParent(props) {
    const { inactive } = props;
    const [sibling] = useState(() => {
        const { Root: parentRoot, manager: parentManager } = wrapRootComponent(ChildrenWrapper, renderSibling); 
        managerStack.push(parentManager); 
        if (inactive) {
            inactiveManagers.add(parentManager);
        }
        return { Root: parentRoot, manager: parentManager };
    });
  
    useEffect(() => {
        return () => {
            if (sibling) {
                const index = managerStack.indexOf(sibling.manager);
                if (index > 0) {
                    managerStack.splice(index, 1);
                }
            }
        };
    }, [sibling]);
  
    if (inactive && sibling && !inactiveManagers.has(sibling.manager)) {
        inactiveManagers.add(sibling.manager);
    } else if (!inactive && sibling && inactiveManagers.has(sibling.manager)) {
        inactiveManagers.delete(sibling.manager);
    }
  
    const Parent = sibling.Root;
    return <Parent>{props.children}</Parent>;
}


export function RootSiblingPortal(props) {
    const [sibling] = useState(() => new RootSiblingsManager(null));
    sibling.update(props.children); 
    useEffect(() => {
        if (sibling) {
            return () => sibling.destroy();
        }
    }, [sibling]);
    return null;
}


export default class RootSiblingsManager { 
    constructor(element, callback) {
        this.id = `root-sibling-${uuid + 1}`;
        this.manager = getActiveManager();
        this.manager.update(this.id, element, callback);
        uuid++;
    }
  
    update(element, callback) {
        this.manager.update(this.id, element, callback);
    }
  
    destroy(callback) {
        this.manager.destroy(this.id, callback);
    }
}


// import RootSiblingsManager from 'react-native-root-siblings';

// export const showModal = (renderModal) => {
//   let rootNode;
//   const onClose = () => {
//     rootNode?.destroy();
//     rootNode = null;
//   };
//   rootNode = new RootSiblingsManager(renderModal(onClose));
//   return onClose;
// };

// import WelcomeModal from './WelcomeModal';

// export function showWelcomeModal() {
//   showModal((onClose) => <WelcomeModal onClose={onClose} />);
// }

// // ...
// function HomeScreen() {
//   return <Button onClick={showWelcomeModal}>Welcome!</Button>
// }

// setTimeout(showWelcomeModal, 3000);
/**
 * 
 * origin： https://github.com/magicismight/react-native-root-siblings
 * 
 *  */ 