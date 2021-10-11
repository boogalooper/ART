set_text_contents("Text Nothing\rText")  
  
function set_text_contents(text)  
    {        
    try {        
        var sep = /(,|\.|\s)/;  
  
        var r = new ActionReference();        
        r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
        var textKey = executeActionGet(r).getObjectValue(stringIDToTypeID("textKey"));      
  
        var style_list = textKey.getList(stringIDToTypeID("textStyleRange"));    
        var parag_list = textKey.getList(stringIDToTypeID("paragraphStyleRange"));                
  
        var style0 = style_list.getObjectValue(0).getObjectValue(stringIDToTypeID("textStyle"));  
        var parag0 = parag_list.getObjectValue(0).getObjectValue(stringIDToTypeID("paragraphStyle"));  
  
        var old_text = textKey.getString(stringIDToTypeID("textKey"));    
  
        var styles = new Array();  
  
        var from = 0;  
        var to = old_text.length+1;  
  
        var def_style;  
  
        for (var i = 0; i < old_text.length; i++)    
            {  
            if (old_text.charAt(i).match(sep))  
                {  
                to = i+1;  
                styles.push([from,to, style0, parag0]);  
  
                from = to;  
                }      
            }  
  
        styles.push([from,to, style0, parag0]);  
  
        for (var i = 0; i < style_list.count; i++)    
            {    
            var d = style_list.getObjectValue(i);    
  
            var x0 = d.getInteger(stringIDToTypeID("from"));    
            var x1 = d.getInteger(stringIDToTypeID("to"));    
            var st = d.getObjectValue(stringIDToTypeID("textStyle"));    
  
            for (var n = 0; n < styles.length; n++)  
                {  
                if (styles[n][0] >= x0)  
                    {  
                    styles[n][2] = st;  
                    }  
                }  
            }  
  
        for (var i = 0; i < parag_list.count; i++)    
            {    
            var d = parag_list.getObjectValue(i);    
  
            var x0 = d.getInteger(stringIDToTypeID("from"));    
            var x1 = d.getInteger(stringIDToTypeID("to"));    
            var st = d.getObjectValue(stringIDToTypeID("paragraphStyle"));    
  
            if (!i && st.hasKey(stringIDToTypeID("defaultStyle"))) def_style = st.getObjectValue(stringIDToTypeID("defaultStyle"));    
  
            for (var n = 0; n < styles.length; n++)  
                {  
                if (styles[n][0] >= x0)  
                    {  
                    styles[n][3] = st;  
                    }  
                }  
            }  
  
        var from = 0;  
        var to = text.length+1;  
  
        var idx = 0;  
  
        for (var i = 0; i < text.length; i++)    
            {  
            if (text.charAt(i).match(sep))  
                {  
                to = i+1;  
                styles[idx][0] = from;  
                styles[idx][1] = to;  
  
                from = to;  
  
                if (idx >= styles.length-1) break;  
  
                ++idx;  
                }      
  
            }  
  
        if (idx > 0) styles[idx][0] = styles[idx-1][1];  
        styles[idx][1] = text.length+1;  
  
        var new_style = new ActionList();      
        var new_parag = new ActionList();      
  
        for (var i = 0; i < styles.length; i++)    
            {    
            var d = new ActionDescriptor();      
            d.putInteger(stringIDToTypeID("from"), styles[i][0]);      
            d.putInteger(stringIDToTypeID("to"),   styles[i][1]);      
  
            if (def_style) extend_descriptor(def_style, styles[i][2])                  
  
            d.putObject(stringIDToTypeID("textStyle"), stringIDToTypeID("textStyle"), styles[i][2]);      
            new_style.putObject(stringIDToTypeID("textStyleRange"), d);    
  
            var d = new ActionDescriptor();      
            d.putInteger(stringIDToTypeID("from"), styles[i][0]);      
            d.putInteger(stringIDToTypeID("to"),   styles[i][1]);      
            d.putObject(stringIDToTypeID("paragraphStyle"), stringIDToTypeID("paragraphStyle"), styles[i][3]);      
            new_parag.putObject(stringIDToTypeID("paragraphStyleRange"), d);    
            }    
  
  
        textKey.putList(stringIDToTypeID("textStyleRange"), new_style);      
        textKey.putList(stringIDToTypeID("paragraphStyleRange"), new_parag);      
  
        textKey.putString(stringIDToTypeID("textKey"), text);    
      
        var d = new ActionDescriptor();        
        d.putReference(stringIDToTypeID("null"), r);        
        d.putObject(stringIDToTypeID("to"), stringIDToTypeID("textLayer"), textKey);        
  
        executeAction(stringIDToTypeID("set"), d, DialogModes.NO);        
        }        
    catch (e) { alert(e); }         
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