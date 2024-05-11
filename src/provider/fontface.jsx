import { memo, useEffect, useRef, useState } from "react";
import { loadedFonts, loadFontFromFile } from '@vitrion/react-native-load-fonts';
import fetcher from "@/common/fetcher";
import { auto } from "@/common/common";
import { FontFaceContext } from '@/hooks/context'
import { useStorage } from '@/hooks/index'
// import configs from "@/common/configs";
// import Loading from '@/components/Loading';

 
export default memo((props)=>{
    const {current} = useRef({ 
        today: auto.dateFormat().format('YYYYMMDD'),
    })
    const [storage] = useStorage('later.config')
    const [init] = useState({
        property: 'File',
        files: {
            is_not_empty: true
        }
    })
    const [fonts, setFonts] = useState([])
    const [fontName, setFontName] = useState('Roboto')

    const query = (filter)=>{
        return fetcher.notion.post('4e5c1f3f548e4015b8182946d684c8e5/query', { 
            filter: filter
        }).then((res)=>{
            const fontPaths = {}
            const fontFile = res.results?.map((obj)=>{
                const { FontName, Preview, FileSize, File }= obj?.properties;
                fontPaths[FontName.title[0]?.plain_text] = File?.files[0]?.file?.url
           
                return {
                    Preview: Preview?.url,
                    FontName: FontName?.title[0]?.plain_text, 
                    FileSize: FileSize?.rich_text[0]?.text?.content,
                }
            });
            return {fontFile, fontPaths}
        })
    }

    const onQueryFonts = ()=>{ 
        const localFont = auto.jsonFormat(storage?.getString('fonts'), [])

        query(init).then(({fontFile})=>{
            // 本地保存Fonts 
            const nameMap = localFont?.reduce((summ, item)=>{
                summ[item.FontName] = true
                return summ
            }, {})

            const filterFont = fontFile?.filter(item=> !nameMap[item.FontName])

            if(filterFont?.length){
                localFont?.unshift(...filterFont)
                storage.set('fonts', JSON.stringify(localFont))
            }
  
            setFonts(localFont)
            storage.set('fontsLastUpdate', current?.today)
        });
    }
 
    const runing = ()=>{
        const last = storage?.getString('fontsLastUpdate') || auto.dateFormat().format('YYYYMMDD')

        if(Number(current?.today) > Number(last)) {
            console.log('--?--网络请求') 
            onQueryFonts()
        }else{
            console.log('--?--本地数据') 
            const localFont = auto.jsonFormat(storage?.getString('fonts'), [])
            setFonts(localFont)
        } 
    }


    const onSetFont = (name)=>{
        if(name){ 
            setFontName(name)
            storage.set('fontsName', name)
        }
    }
     
    const onLoadFonts = (item)=>{
        console.log('--下载字体', item?.FontName);
        if(!item?.FontName){
            return
        }

        query({
            and: [init, {
                property: "FontName",
                rich_text: { contains: item.FontName }
            }]
        }).then(({fontPaths})=>{
            const path = fontPaths[item?.FontName]
            const index = fonts?.findIndex(i=> i?.FontName === item?.FontName)
 
            fetcher.get(path, {
                session: 'fonts',
                path: item.FontName + '.ttf',
            }).then(({ path })=>{
                fonts.splice(index, 1, {
                    ...item,
                    LocalPath: path,
                });
                setFonts([...fonts])
                storage.set('fonts', JSON.stringify(fonts))
            })
        })
    }

    const onUseFonts = (item)=>{
        if(!item?.FontName){
            return onSetFont('Roboto');
        }
        const path = item?.LocalPath 
        fetcher.exists(path).then((exists)=>{ 
            if(exists){
                loadFontFromFile(item.FontName,  path).then((_name) =>{
                    console.log('Loaded font successfully. Font name is: ', _name);
                    onSetFont(_name); 
                })
            }
        }).catch(e=>{ 
            console.log('---加载字体失败')
        })
    }

    useEffect(()=>{
        if(storage && !current.loading){
            current.loading = true
            const name = storage?.getString('fontsName')
            name && onSetFont(name);

            runing();
        } 
    },[storage])
    

    console.log({ len: fonts.length, session: fetcher.session('fonts') });

    return (
        <FontFaceContext.Provider value={{ onQueryFonts, onLoadFonts, onUseFonts, fontName, fonts  }}>
            {props.children}
        </FontFaceContext.Provider>  
    )
})