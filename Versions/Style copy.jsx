#target photoshop

replaceTextLr ();
////////////////////////////////////////////////////////////////////////////////////
// замена текста, работа со стилями оформления
///////////////////////////////////////////////////////////////////////////////////
function replaceTextLr (newText, ref)  
    {        
        newText = ["","Скушал сорок докторов"]

        // получаем ссылку на активный текстовый слой
        ref = new ActionReference();        
        ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
        

        // получаем объекты - текст, стили текста, стили параграфа
        var textKey = executeActionGet(ref).getObjectValue(stringIDToTypeID("textKey"));      
        var styleList = textKey.getList(stringIDToTypeID("textStyleRange"));    
        var paragList = textKey.getList(stringIDToTypeID("paragraphStyleRange"));    
  
        var styles = new Array();  
        var parag = new Array();    
        var defaultStyle;  
        
        // преобразуем имеющийся текст в массив
        var oldTextKey = textKey.getString(stringIDToTypeID("textKey")).split('\r');  
        
        // определяем границы строк, слов исходного текста, исключая пробелы
        var shift = 0,
        sourceText = [];

        for (var i = 0; i < oldTextKey.length; i++)    
            {  
                var tmp = (oldTextKey[i].replace(/[\s]/g,'\v').split('\v')),
                words = [];
                
                for (var n = 0; n < tmp.length; n++)
                {
                    if (tmp[n]!="")
                    {
                        words.push ([shift, tmp[n].length + shift,[],[]])
                        shift = shift+tmp[n].length+1
                    } else {shift++}
                }
                if (words.length == 0) {words.push([0,1,[],[]])}
                sourceText.push (words)
             }      

        
        // записываем в массив границы стилей исходного текста
        for (var i = 0; i < styleList.count; i++)    
            {    
                var d = styleList.getObjectValue(i);    
                var x0 = d.getInteger(stringIDToTypeID("from"));    
                var x1 = d.getInteger(stringIDToTypeID("to"));    
                var st = d.getObjectValue(stringIDToTypeID("textStyle"));    
                
                if (styles.length>0)
                {
                    if (styles[styles.length-1][0]==x0 && styles[styles.length-1][1]==x1) 
                    {
                        styles[styles.length-1][2]==st
                    } else {styles.push ([x0,x1,st])}

                } else {styles.push ([x0,x1,st])}
             }  
         
        // записываем в массив границы абзацев исходного текста
        for (var i = 0; i < paragList.count; i++)    
            {    
                var d = paragList.getObjectValue(i);    
                var x0 = d.getInteger(stringIDToTypeID("from"));    
                var x1 = d.getInteger(stringIDToTypeID("to"));    
                var st = d.getObjectValue(stringIDToTypeID("paragraphStyle"));    
    
                if (!i && st.hasKey(stringIDToTypeID("defaultStyle"))) defaultStyle = st.getObjectValue(stringIDToTypeID("defaultStyle"));    
    
                if (parag.length>0)
                {
                    if (parag[parag.length-1][0]==x0 && parag[parag.length-1][1]==x1) 
                    {
                        parag[parag.length-1][2]==st
                    } else {parag.push ([x0,x1,st])}

                } else {parag.push ([x0,x1,st])}
                
                parag.push ([x0,x1,st])
            }  
      
        // сопоставляем границы стилей с интервалами слов исходного текста   
          for (var i = 0; i < sourceText.length; i++)    
            {  
                for (var x = 0; x < sourceText[i].length; x++)
                { 
                    for (var n = 0; n < styles.length; n++) 
                    {
                        matchStyles(sourceText[i][x],styles[n].slice(),2)
                    }
                    for (var n = 0; n < parag.length; n++)  {matchStyles(sourceText[i][x],parag[n].slice(),3)} 
                }
            }   
          
    // подготовка нового текста к обработке
    var txt = []  
    var txtStyles = []
    var txtParag = []

    for (var i=0; i<newText.length; i++) {txt.push(newText[i].replace(/[\s]/g,'\v').split('\v'))}
    
    // пересчитываем границы стилей с учетом длины и количества строк нового текста
    var shiftStyle = 0
    var shiftParag = 0

    for (var i=0; i<sourceText.length; i++)
            {
                if (i<txt.length)
                { 
                    shiftStyle = fitStyle (sourceText[i], txt[i].slice(), txtStyles, 2, shiftStyle)
                    shiftParag = fitStyle (sourceText[i], txt[i].slice(), txtParag, 3, shiftParag)
                }
            }

        var len = txt.join('\r').length
        if (shift <= len) 
        {
            txtStyles[txtStyles.length-1][1] += len-shift+1
            txtParag[txtParag.length-1][1] += len-shift+1
        }
        
        txtStyles = optimizeStyle (txtStyles)
        txtParag = optimizeStyle (txtParag)

        var new_style = new ActionList();      
        var new_parag = new ActionList();  
        
        // записываем новые значения стилей текста в объект
        for (var i = 0; i < txtStyles.length; i++)    
            {    
                var d = new ActionDescriptor();      
                d.putInteger(stringIDToTypeID("from"), txtStyles[i][0]);      
                d.putInteger(stringIDToTypeID("to"),   txtStyles[i][1]);      
    
                if (defaultStyle) extend_descriptor(defaultStyle, txtStyles[i][2])                  
    
                d.putObject(stringIDToTypeID("textStyle"), stringIDToTypeID("textStyle"), txtStyles[i][2]);      
                new_style.putObject(stringIDToTypeID("textStyleRange"), d);    
            }    
        
         // записываем новые значения стилей абзацев в объект   
              for (var i = 0; i < txtParag.length; i++)    
            { 
                var d = new ActionDescriptor();      
                d.putInteger(stringIDToTypeID("from"), txtParag[i][0]);      
                d.putInteger(stringIDToTypeID("to"),   txtParag[i][1]);      
                d.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), txtParag[i][2]);      
                new_parag.putObject(stringIDToTypeID("paragraphStyleRange"), d);   
              }
  
        // записываем стили в textKey и применяем
            textKey.putList(stringIDToTypeID("textStyleRange"), new_style);      
            textKey.putList(stringIDToTypeID("paragraphStyleRange"), new_parag);      
    
            textKey.putString(stringIDToTypeID("textKey"), newText.join('\r'));    
        
            var d = new ActionDescriptor();        
            d.putReference(stringIDToTypeID("null"), ref);        
            d.putObject(stringIDToTypeID("to"), stringIDToTypeID("textLayer"), textKey);        
    
            executeAction(stringIDToTypeID("set"), d, DialogModes.NO);  
            

 // вспомогательные функции

function matchStyles (source, style, idx)
{
    // проверка на попадание в интервал, пересчет координат
    if (style[0]<source[1] && style[1]>source[0]) 
    {
        if (style[0]<source[0]) {style[0] = source[0]}
        if (style[1]>source[1]) {style[1] = source[1]}
        style[0] = style[0] - source[0]
        style[1] = style[1] - source[0]
        source[idx].push(style)
    }
}

function fitStyle (style, txt, output, idx, shift)
    {
        var counter = output.length

        var styleCounter = 0
        var len = txt.length

        // перебираем слова исходной строки
        for (var i=0; i<len; i++)
        {
           if (styleCounter>=style.length) {break;}

           var next = false
           var word = txt.shift()

           if (word.length==0) 
           {
               if (output.length ==0) 
               {
                  output.push ([0,0,style[styleCounter][idx][0][2]])
                  counter ++
               }
               shift ++
               output[counter-1][1] ++
               continue;
            }

            for (var n=0; n<style[styleCounter][idx].length; n++)
            {
                var cur = style[styleCounter][idx][n].slice()

                if (cur[0] <= word.length)
                {
                    if (cur[1]>=word.length)
                    {
                        cur[1]=word.length+1
                        next = true
                    }

                    cur[0] += shift
                    cur[1] += shift

                    output.push (cur)
                    counter ++
                    if (next) {break;}
                }
            }   

            if (word.length>=output[counter-1][1]-shift) {output[counter-1][1]=word.length+1+shift}

            shift = output[counter-1][1]
            styleCounter++
        }

        if (txt.length>0) 
        {
            shift += txt.join (' ').length+1
            output[counter-1][1] += txt.join (' ').length+1
        }

        return shift
    }

    function optimizeStyle(style)
    {
        var tmp = style.slice()
        var counter = 0
        style = []
        
        style.push(tmp[0])
    
        for (var i=1; i<tmp.length;i++)
        {
            if (style[counter][2] == tmp[i][2])
            {
                style[counter][1] = tmp[i][1]
            } else
            {
                style.push(tmp[i])
                counter ++
            }
        }
        return style
    }
    

    function extend_descriptor(src_desc, dst_desc)  
    {  
    try   
        {  
        for (var i = 0; i < src_desc.count; i++)  
            {  
            var key = src_desc.getKey(i);  
  
            if (dst_desc.hasKey(key)) continue;  
  
            var type = src_desc.getType(key);  
  
            switch (type)   
                {  
                case DescValueType.ALIASTYPE:        dst_desc.putPath(key,         src_desc.getPath(key));         break;  
                case DescValueType.BOOLEANTYPE:      dst_desc.putBoolean(key,      src_desc.getBoolean(key));      break;  
                case DescValueType.CLASSTYPE:        dst_desc.putClass(key,        src_desc.getClass(key));        break;  
                case DescValueType.DOUBLETYPE:       dst_desc.putDouble(key,       src_desc.getDouble(key));       break;    
                case DescValueType.INTEGERTYPE:      dst_desc.putInteger(key,      src_desc.getInteger(key));      break;  
                case DescValueType.LISTTYPE:         dst_desc.putList(key,         src_desc.getList(key));         break;  
                case DescValueType.RAWTYPE:          dst_desc.putData(key,         src_desc.getData(key));         break;  
                case DescValueType.STRINGTYPE:       dst_desc.putString(key,       src_desc.getString(key));       break;  
                case DescValueType.LARGEINTEGERTYPE: dst_desc.putLargeInteger(key, src_desc.getLargeInteger(key)); break;  
                case DescValueType.REFERENCETYPE:    dst_desc.putReference(key,    src_desc.getReference(key));    break;  
  
                case DescValueType.OBJECTTYPE:         
                    dst_desc.putObject(key, src_desc.getObjectType(key), src_desc.getObjectValue(key));    
                    break;  
      
                case DescValueType.ENUMERATEDTYPE:     
                    dst_desc.putEnumerated(key, src_desc.getEnumerationType(key), src_desc.getEnumerationValue(key));   
                    break;                                               
      
                case DescValueType.UNITDOUBLE:         
                    dst_desc.putUnitDouble(key, src_desc.getUnitDoubleType(key), src_desc.getUnitDoubleValue(key));   
                    break;  
      
                default: alert("Unknown data type in descriptor"); return false;  
                }  
            }                                  
  
        return true;  
        }  
    catch (e) { throw(e); }  
    }  
}        