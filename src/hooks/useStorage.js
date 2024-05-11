 
import { useEffect, useRef, useState } from 'react';
import { MMKV } from 'react-native-mmkv'
import RNFetchBlob from 'react-native-blob-util';


const useStorage = (USER = 'later.default', { dir = RNFetchBlob.fs.dirs.DocumentDir, security = true, } = { })=>{
    const [_, foceUpdate] = useState([]);
    const storage = useRef(null);

    const update = (_user = USER, _savedir = dir)=>{
        if(_user){
            storage.current = new MMKV({
                id: _user,
                path: `${_savedir}/storage`,
                encryptionKey: security ? 'hunter2' : undefined
            })
        }
        return Promise.resolve(storage.current);
    }

    useEffect(()=>{
        update().then(()=>{
            foceUpdate()
        })
    },[])
  
    return [storage.current, update]
}

export default useStorage

/** 
 * 

SET
storage.set('user.name', 'Marc')
storage.set('user.age', 21)
storage.set('is-mmkv-fast-asf', true)

GET
const username = storage.getString('user.name') // 'Marc'
const age = storage.getNumber('user.age') // 21
const isMmkvFastAsf = storage.getBoolean('is-mmkv-fast-asf') // true

KEY
const hasUsername = storage.contains('user.name') // checking if a specific key exists
const keys = storage.getAllKeys() // ['user.name', 'user.age', 'is-mmkv-fast-asf']
storage.delete('user.name') // delete a specific key + value
storage.clearAll() // delete all keys

OBJECT
const user = { username: 'Marc', age: 21 } 
storage.set('user', JSON.stringify(user)) // Serialize the object into a JSON string
const jsonUser = storage.getString('user') // { 'username': 'Marc', 'age': 21 }
const userObject = JSON.parse(jsonUser)

 * 
 */
