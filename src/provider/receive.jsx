import { useState, useEffect, memo, useRef } from "react";
 
import { auto } from "@/common/common";
import { ReceiveContext } from '@/hooks/context'
import { useStorage } from '@/hooks/index'






export default memo((props)=>{
    const [initFolder] = useState([
        { name: '全部', icon: 'folder', count: 0 },
        { name: '共享文件夹', icon: 'folder-share', count: 0 },
        { name: '媒体文件夹', icon: 'folder-video', count: 0 },
        { name: '私密文件夹', icon: 'folder-lock',count: 0 },
        { name: '最近删除', icon: 'delete', count: 0 }, 
    ]);
    const { current: cache } = useRef({});
    const [notes] = useStorage('later.notes')
    const [history] = useStorage('later.history', { security: false });

    const [config, setState] = useState({
        notesBefore: '',
        historyBefore: '', 
        historyKey: auto.uuid(),
        notesKey: auto.uuid(),
    });



    const onUpdate = (key)=>{
        setState({ 
            ...config,
            [key]: auto.uuid(),
        });
    }

    const onInitNote = (key)=>{
        if(key === 'folders'){
            if(!cache[key]?.length){
                cache[key] = initFolder
            }
        } 
    }
 
    const onSetHistory = (key, value)=>{
        history.set(key, typeof value === 'object' ? JSON.stringify(value) :  value) 
        onUpdate('historyKey')
        
    }

    const onGetHistory = (key)=>{
        if(config.historyBefore !== config.historyKey){
            cache[key] = auto.jsonFormat(history?.getString(key), [])
        }
        return cache[key]
    }

    const onDeleteNoteItem = (key)=>{
        notes.delete(key);
    }

    const onSetNotes = (key, value)=>{
        notes.set(key, typeof value === 'object' ? JSON.stringify(value) : value)
        setState({ 
            ...config,
            notesKey:  auto.uuid(),
        });
    }

    const onGetNotes = (key, init = [])=>{
        if(!cache[key] || (config.notesBefore !== config.notesKey)){
            cache[key] = typeof init === 'object' ? auto.jsonFormat(notes?.getString(key), init) : notes?.getString(key)
            onInitNote(key) 
        } 
        return cache[key]
    }

    return (
        <ReceiveContext.Provider 
            value={{ 
                notes, history, 
                onGetNotes, onSetNotes,
                onGetHistory, onSetHistory,
                onDeleteNoteItem,
                ...config,
            }}
        >
            {props.children}
        </ReceiveContext.Provider>
    )
})
