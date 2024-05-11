import { useMemo, Children } from "react";

 
const Highlighter = ({
    children,

})=>{
 
    const text = useMemo(()=>{
        let text = '';
        Children.map(children, (child) => {
            if (typeof child === 'string') {
                text += child;
            }
        });
        return text;
    },[children])

 
 
}