var txt =  ["Иванова","Жанна","учитель информатики\rи обществознания"]

replaceText (txt)  

// функция замены текста, входные данные - массив
function replaceText (newText)  
    {        
        // получаем ссылку на активный текстовый слой
        var ref = new ActionReference();        
        ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
        
        // получаем объекты - текст, стили текста, стили параграфа
        var textKey = executeActionGet(ref).getObjectValue(stringIDToTypeID("textKey"));      
        var styleList = textKey.getList(stringIDToTypeID("textStyleRange"));    
        var paragList = textKey.getList(stringIDToTypeID("paragraphStyleRange"));    
  
        var textStyles = new Array();  
        var paragStyles = new Array();    
        var defaultStyle;  
        
        // преобразуем имеющийся текст в массив
        var oldText = textKey.getString(stringIDToTypeID("textKey")).split ('\r') ;   

        // определяем границы строк исходного текста
        var shift = 0
        for (var i = 0; i < oldText.length; i++)    
            {  
                oldText[i] = [shift, oldText[i].length + shift +1,[],[]]
                shift = oldText[i][1] 
             }      

        // записываем в массив границы стилей исходного текста
        for (var i = 0; i < styleList.count; i++)    
            {    
                var d = styleList.getObjectValue(i);    
                var x0 = d.getInteger(stringIDToTypeID("from"));    
                var x1 = d.getInteger(stringIDToTypeID("to"));    
                var st = d.getObjectValue(stringIDToTypeID("textStyle"));    
                
                textStyles.push ([x0,x1,st])
             }  
         
        // записываем в массив границы абзацев исходного текста
        for (var i = 0; i < paragList.count; i++)    
            {    
                var d = paragList.getObjectValue(i);    
                var x0 = d.getInteger(stringIDToTypeID("from"));    
                var x1 = d.getInteger(stringIDToTypeID("to"));    
                var st = d.getObjectValue(stringIDToTypeID("paragraphStyle"));    
    
                if (!i && st.hasKey(stringIDToTypeID("defaultStyle"))) defaultStyle = st.getObjectValue(stringIDToTypeID("defaultStyle"));    
    
                paragStyles.push ([x0,x1,st])
            }  
      
        // сопоставляем границы стилей с интервалами строк исходного текста
                       
          for (var i = 0; i < oldText.length; i++)    
            {  
                // стили текста
                for (var n = 0; n < textStyles.length; n++)
                {  
                    if (textStyles[n][0]<oldText[i][1] && textStyles[n][1]>oldText[i][0]) 
                    {
                        var tmp = textStyles[n]
                        if (tmp[0]<oldText[i][0]) {tmp[0] = oldText[i][0]}
                        if (tmp[1]>oldText[i][1]) {tmp[1] = oldText[i][1]}
                        oldText[i][2].push(tmp)
                     }
                }
               
                // стили абзацев
               for (var n = 0; n < paragStyles.length; n++)
                {  
                    if (paragStyles[n][0]<oldText[i][1] && paragStyles[n][1]>oldText[i][0]) 
                    {
                        var tmp = paragStyles[n]
                        if (tmp[0]<oldText[i][0]) {tmp[0] = oldText[i][0]}
                        if (tmp[1]>oldText[i][1]) {tmp[1] = oldText[i][1]}
                        oldText[i][3].push(tmp)
                     }
                } 
             }   
          
             
        // пересчитываем границы стилей с учетом длины и количества строк нового текста
        var txt = newText.join('\r')             
        var styles = new fitStyle (2)
        var paragraphs = new fitStyle (3)

        var new_style = new ActionList();      
        var new_parag = new ActionList();  
        
        // записываем новые значения стилей текста в объект
        for (var i = 0; i < styles.length; i++)    
            {    
                var d = new ActionDescriptor();      
                d.putInteger(stringIDToTypeID("from"), styles[i][0]);      
                d.putInteger(stringIDToTypeID("to"),   styles[i][1]);      
    
                if (defaultStyle) extend_descriptor(defaultStyle, styles[i][2])                  
    
                d.putObject(stringIDToTypeID("textStyle"), stringIDToTypeID("textStyle"), styles[i][2]);      
                new_style.putObject(stringIDToTypeID("textStyleRange"), d);    
            }    
        
         // записываем новые значения стилей абзацев в объект   
              for (var i = 0; i < paragraphs.length; i++)    
            { 
                var d = new ActionDescriptor();      
                d.putInteger(stringIDToTypeID("from"), paragraphs[i][0]);      
                d.putInteger(stringIDToTypeID("to"),   paragraphs[i][1]);      
                d.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), paragraphs[i][2]);      
                new_parag.putObject(stringIDToTypeID("paragraphStyleRange"), d);   
              }
  
        // записываем стили в textKey и применяем
            textKey.putList(stringIDToTypeID("textStyleRange"), new_style);      
            textKey.putList(stringIDToTypeID("paragraphStyleRange"), new_parag);      
    
            textKey.putString(stringIDToTypeID("textKey"), txt);    
        
            var d = new ActionDescriptor();        
            d.putReference(stringIDToTypeID("null"), ref);        
            d.putObject(stringIDToTypeID("to"), stringIDToTypeID("textLayer"), textKey);        
    
            executeAction(stringIDToTypeID("set"), d, DialogModes.NO);  
            
    // вспомогательные функции

    function fitStyle (idx)
        {
            var shift = 0 
            var counter = 0
            var arr = []

            for (var i = 0; i < oldText.length; i++) 
            {
                if (i<newText.length)
                {
                    for (var n = 0; n < oldText[i][idx].length; n++)
                    {
                        var dif = shift - oldText[i][0]
                        if (oldText[i][idx][n][0] <= newText[i].length + shift) {
                            arr.push (oldText[i][idx][n])
                            arr[counter][0] += dif
                            arr[counter][1] += dif
                            counter ++}
                    }
                    arr[counter-1][1]= shift = shift + newText[i].length+1
                }
            }

            if (txt.length >= shift) 
            {
                var from = arr[arr.length-1][1]
                var to = txt.length
                var r = arr[arr.length-1][2]
                arr.push ([from,to,r])
            }

            return arr
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
