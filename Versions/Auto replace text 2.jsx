///////////////////////////////////////////////////////////////////////////////
// Auto repalce text - revision 0.3
// jazz-y@ya.ru
///////////////////////////////////////////////////////////////////////////////

#target photoshop

 /*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
<name>Auto repalce text 2</name>
<category>jazzy</category>
<enableinfo>true</enableinfo>
<eventid>dca164894-e3cc-451a-a246-d4e141695556</eventid>
<terminology><![CDATA[<< /Version 1
                        /Events <<
                        /ca164894-e3cc-451a-a246-d4e141695556 [(Auto repalce text 2) <<
                        /removeLatin [(removeLatin) /boolean]                       
                        /removeDigits [(removeDigits) /boolean]
                        /removeSymbols [(removeSymbols) /boolean]      
                        /useDivider [(useDivider) /boolean] 
                        >>]
                         >>
                      >> ]]></terminology>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/ 

var strMessage = "Auto repalce text"
var GUID = "ca164894-e3cc-451a-a246-d4e141695556"
var exportInfo = new Object() 
initExportInfo(exportInfo) 

main ()

function main ()
{
if (!app.playbackParameters.count)  
    {  
   // normal run
    try {var d = app.getCustomOptions(GUID)
    if (d!=undefined) descriptorToObject(exportInfo, d, strMessage)} catch (e) {}
    
    var w = buildWindow (); var result = w.show()
    
    if (result == 2) {return} else  // if cancelled
        {
                    var d = objectToDescriptor(exportInfo, strMessage)
                    app.putCustomOptions(GUID, d)
                    app.playbackParameters = d
        }
    // exit script  
    }  
else  // если запущено из палитры
    {  

    var d = app.playbackParameters
    descriptorToObject(exportInfo, d, strMessage)
      
        if (app.playbackDisplayDialogs == DialogModes.ALL ) 
        {
             var w = buildWindow (); var result = w.show()
            
                if (result == 2) {return 'cancel'} else // if cancelled
                {   
                    var d = objectToDescriptor(exportInfo, strMessage)
                    app.playbackParameters = d
               }
        }

        if (app.playbackDisplayDialogs != DialogModes.ALL)  // run by button "play" with saved in palette settings (быстрый запуск с сохраненными настройками)
        {
             findAndRename ()
        }

    // next code  
    } 
}

  
function findAndRename ()
{
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), app.activeDocument.activeLayer.id);
    var desc = executeActionGet(ref)
    
    var lr = new getCenter (desc)
    var txt = getTextLayerIDs ()

    var minDist = []
    for (var i=0; i<txt.length; i++) {minDist.push (new distance(lr, txt[i]))} 
    
    minDist.sort (compareDist) 
    var s = makeName(lr.name)
    
    if (s!="")
    {
       selectLayer (minDist[0].lr)
       
       var txt = app.activeDocument.activeLayer.textItem.contents.split('\r')
       
       if (txt.length >= s.length)
       {
           for (var i=0; i<s.length; i++)
           {
              findReplace(txt[i], s[i], false, false, true, true, false);
            }
        }
       
   //    app.activeDocument.activeLayer.textItem.contents = s
       selectLayer (lr.id)
     }
}


//findReplace("субботина", "воскресенская", false, false, true, true, false);

function findReplace(find, replace, checkAll, forward, caseSensitive, wholeWord, ignoreAccents) {
	var c2t = function (s) {
		return app.charIDToTypeID(s);
	};

	var s2t = function (s) {
		return app.stringIDToTypeID(s);
	};

	var descriptor = new ActionDescriptor();
	var descriptor2 = new ActionDescriptor();
	var reference = new ActionReference();

	reference.putProperty( s2t( "property" ), s2t( "findReplace" ));
	reference.putEnumerated( s2t( "textLayer" ), s2t( "ordinal" ), s2t( "targetEnum" ));
	descriptor.putReference( c2t( "null" ), reference );
	descriptor2.putString( s2t( "find" ), find );
	descriptor2.putString( s2t( "replace" ), replace );
	descriptor2.putBoolean( s2t( "checkAll" ), checkAll );
	descriptor2.putBoolean( s2t( "forward" ), forward );
	descriptor2.putBoolean( s2t( "caseSensitive" ), caseSensitive );
	descriptor2.putBoolean( s2t( "wholeWord" ), wholeWord );
	descriptor2.putBoolean( s2t( "ignoreAccents" ), ignoreAccents );
	descriptor.putObject( s2t( "using" ), s2t( "findReplace" ), descriptor2 );
	executeAction( s2t( "findReplace" ), descriptor, DialogModes.NO );
}



function makeName (s)
{
        if (exportInfo.removeLatin) s = s.replace(/[A-z]/g, "")
        if (exportInfo.removeDigits) s = s.replace(/[\d]/g, "")
        if (exportInfo.removeSymbols) s = s.replace(/[^ A-zА-яёЁ \d]/g, "")
      
        s = s.replace(/ +$/,"")  
        s = s.replace(/^ +/,"")  
        
       // if (exportInfo.useDivider) s = s.replace(/ +/g, '\r')
       s = s.split(" ")
       var tmp = []
       
       var n = ""
       for (var i=3; i<s.length; i++)
       {if (s[i] == "уч") {s[i]= "уч."}
           n = n + s[i] + ' '
           }
       n = n.replace(/ +$/,"")  
       tmp.push (n)
       
        tmp.push (s[0])
       tmp.push (s[1] + ' ' +s[2] )
        return tmp
 }

function compareDist (a,b) {if (a.dist > b.dist) return 1; if (a.dist < b.dist) return -1}

function distance (lrA, lrB)
{    
    var a =lrA.X - lrB.X
    var b =lrA.Y - lrB.Y

    this.dist = Math.sqrt( a*a + b*b )
    this.lr = lrB.id
    
    return
}

function getTextLayerIDs(){     
   var ref = new ActionReference();     
   ref.putProperty( charIDToTypeID('Prpr') , charIDToTypeID('NmbL'));  
   ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );     
   var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) +1;     
   var Texts=[];    
try{    
    activeDocument.backgroundLayer;    
var i = 0; }catch(e){ var i = 1; };    
   for(i;i<count;i++){     
       if(i == 0) continue;    
        ref = new ActionReference();     
        ref.putIndex( charIDToTypeID( 'Lyr ' ), i );    
        var desc = executeActionGet(ref);      
        if (desc.getInteger(stringIDToTypeID("layerKind")) != 3 || desc.getBoolean(stringIDToTypeID("visible")) != true) continue;
        Texts.push (new getCenter (desc))
        }  
    return Texts  
};   

function getCenter (desc)
{
        var bounds = desc.getObjectValue(stringIDToTypeID("bounds"))
        var top = bounds.getDouble(stringIDToTypeID("top"))
        var left = bounds.getDouble(stringIDToTypeID("left"))
        var bottom = bounds.getDouble(stringIDToTypeID("bottom"))
        var right = bounds.getDouble(stringIDToTypeID("right"))
        
        this.id = desc.getInteger(stringIDToTypeID("layerID"))
        this.name =  desc.getString(stringIDToTypeID("name"))
        this.X = left + (right-left)/2
        this.Y = top + (bottom-top)/2
       
        return
}

function buildWindow ()
{
 var s = activeDocument.activeLayer.name
    var w = new Window("dialog"); 
        w.text = "Auto fill text"; 
        w.preferredSize.width = 300; 
        w.orientation = "column"; 
        w.alignChildren = ["center","top"]; 
        w.spacing = 10; 
        w.margins = 16; 

    // PN
    // ==
    var pn = w.add("panel"); 
        pn.text = "Опции"; 
        pn.orientation = "column"; 
        pn.alignChildren = ["fill","top"]; 
        pn.spacing = 10; 
        pn.margins = 10; 
        pn.alignment = ["fill","top"]; 

    // GR
    // ==
    var gr = pn.add("group"); 
        gr.orientation = "row"; 
        gr.alignChildren = ["left","center"]; 
        gr.spacing = 0; 
        gr.margins = 0; 

    var ch1 = pn.add("checkbox"); 
        ch1.text = "Удалять латиницу"; 

    var ch2 = pn.add("checkbox"); 
        ch2.text = "Удалять цифры"; 

    var ch3 = pn.add("checkbox"); 
        ch3.text = "Удалять спецсимволы"; 

    var divider1 = pn.add("panel"); 
        divider1.alignment = "fill"; 

    var et1 = pn.add("edittext",undefined,undefined, {multiline: true,readonly:true}); 
    et1.preferredSize.height=40
    
    var ch4 = pn.add("checkbox"); 
       ch4.text = "Переносить строки"; 
    // W
    // =
    var okBn = w.add("button"); 
      okBn.text = "Сохранить настройки"; 
        okBn.justify = "center"; 
        
    ch1.onClick = function () {exportInfo.removeLatin = this.value;et1.text=makeName (s)}
    ch2.onClick = function () {exportInfo.removeDigits = this.value;et1.text=makeName (s)}
    ch3.onClick = function () {exportInfo.removeSymbols = this.value;et1.text=makeName (s)}
    ch4.onClick = function () {exportInfo.useDivider = this.value;et1.text=makeName (s)}
    
    okBn.onClick = function () {w.close ()}
    
    w.onShow = function ()
    {
        ch1.value = exportInfo.removeLatin
        ch2.value = exportInfo.removeDigits
        ch3.value = exportInfo.removeSymbols
        ch4.value = exportInfo.useDivider
        et1.text =makeName (s)
     }
    return w
}

////////////////////////////////////////////////////////////////////////////////////
// управление настройками программы
///////////////////////////////////////////////////////////////////////////////////

function initExportInfo (exportInfo) 
{
        exportInfo.removeLatin = true
        exportInfo.removeDigits = true
        exportInfo.removeSymbols = true
        exportInfo.useDivider= true
}

function objectToDescriptor (o, s) 
{
	var d = new ActionDescriptor;
	var l = o.reflect.properties.length;
	d.putString( app.charIDToTypeID( 'Msge' ), s);
	for (var i = 0; i < l; i++ ) {
		var k = o.reflect.properties[i].toString();
		if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect") continue;
		var v = o[ k ];
		k = app.stringIDToTypeID(k);
		switch ( typeof(v) ) {
			case "boolean": d.putBoolean(k, v); break;
			case "string": d.putString(k, v); break;
			case "number": d.putInteger(k, v); break;
             default: $.writeln (typeof(v)); break;
		}
            $.writeln ('put ' + typeof(v) + ' "' + typeIDToStringID(k)  +'": ' + v)
	}
    return d;
}

function descriptorToObject (o, d, s) 
{
    $.writeln (" ")
	var l = d.count;
	if (l) {
	    var keyMessage = app.charIDToTypeID( 'Msge' );
        if ( d.hasKey(keyMessage) && ( s != d.getString(keyMessage) )) return;
	}
	for (var i = 0; i < l; i++ ) {
		var k = d.getKey(i); // i + 1 ?
		var t = d.getType(k);
		strk = app.typeIDToStringID(k);
		switch (t) {
			case DescValueType.BOOLEANTYPE:
				o[strk] = d.getBoolean(k);
				break;
			case DescValueType.STRINGTYPE:
				o[strk] = d.getString(k);
				break;
			case DescValueType.INTEGERTYPE:
				o[strk] = d.getDouble(k);
				break;
		}
        $.writeln ('get ' + typeof(o[strk]) + ' "' + strk  +'": ' + o[strk])
	}
}

 function selectLayer (ID, add) {
    add = (add == undefined)  ? add = false : add
   var ref = new ActionReference()
   ref.putIdentifier(charIDToTypeID('Lyr '), ID)
   var desc = new ActionDescriptor()
   desc.putReference(charIDToTypeID('null'), ref)
   if (add) {
      desc.putEnumerated(stringIDToTypeID('selectionModifier'), stringIDToTypeID('selectionModifierType'), stringIDToTypeID('addToSelection'))
   }
   desc.putBoolean(charIDToTypeID('MkVs'), false)
   executeAction(charIDToTypeID('slct'), desc, DialogModes.NO)
}