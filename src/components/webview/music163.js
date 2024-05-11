
// http://music.163.com/api/song/enhance/player/url?id=450795499&ids=[450795499]&br=3200000
import { memo } from "react";

import {regex} from '@/common/common'

const music = (url)=>{
    // const [path] = url.match(regex.linkRegex)
    // const id = path?.split('?')[1]
 
    return 'http://music.163.com/api/song/enhance/player/url' + 
    `?id=${id}&ids=[${id}]&br=3200000`

}