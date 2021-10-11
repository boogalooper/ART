////////////////////////////////////////////////////////////////////////////////
// Auto replace text - v 0.3
// jazz-y@ya.ru
///////////////////////////////////////////////////////////////////////////////

#target photoshop;

 /*
// BEGIN__HARVEST_EXCEPTION_ZSTRING
<javascriptresource>
<name>Auto replace text</name>
<category>jazzy</category>
<enableinfo>true</enableinfo>
<eventid>e981ad2e-29f6-4695-b445-3e7644b0bf9f</eventid>
<terminology><![CDATA[<< /Version 1
                        /Events <<
                        /e981ad2e-29f6-4695-b445-3e7644b0bf9f [(Auto replace text) <<                    
                        /currentName [(SavedLayerName) /string]
                        /useMask [(TextLayerMask) /boolean]    
                        /mask [(TextMask) /string]         
                        /allign [(TextLayerAllign) /string] 
                        /filterCyrillic [(FilterCyrillic) /boolean]     
                        /filterLatin [(FilterLatin) /boolean] 
                        /filterDigits [(FilterDigits) /boolean] 
                        /filterDot [(FilterDot) /boolean] 
                        /filterComma [(FilterComma) /boolean] 
                        /filterColon [(FilterColon) /boolean] 
                        /filterBracket [(FilterBracket) /boolean] 
                        /filterOther [(FilterOther) /boolean] 
                        /parsingOptions [(RenamePattern) /string]                           
                        >>]
                         >>
                      >> ]]></terminology>
</javascriptresource>
// END__HARVEST_EXCEPTION_ZSTRING
*/ 

////////////////////////////////////////////////////////////////////////////////////
// публичные константы
///////////////////////////////////////////////////////////////////////////////////

var GUID = "e981ad2e-29f6-4695-b445-3e7644b0bf9f",
strMessage = "Auto replace text",
curLine = 0, //указатель текущей строки в списке
wordLen = 0, // длина строки для слайдеров
renew = false, // режим обновления формы
lrText ="", //имя после преобразования
errFlag = false;

var exportInfo = new Object()
initExportInfo(exportInfo)

main ();

////////////////////////////////////////////////////////////////////////////////////
// запуск программы
///////////////////////////////////////////////////////////////////////////////////
function main ()
{
if (!app.playbackParameters.count)  // запуск из меню
    {  
   
    // пытаемся загрузить настройки из реестра
    try {var d = app.getCustomOptions(GUID)
    if (d!=undefined) descriptorToObject(exportInfo, d, strMessage)} catch (e) {}

    if (exportInfo.currentName == "")
    {
        var err = false
        try {
            var ref = new ActionReference();        
            ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
            var lrName = executeActionGet(ref).getString(stringIDToTypeID("name"));
        } catch (e) {err=true}

        if (!err) exportInfo.currentName = lrName
    }
        
        if (exportInfo.currentName != "")
        {
            var w = buildWindow (); 
            var result = w.show()
    
            switch (result)
            {
                case 1 : // сохранить настройки
                    var d = objectToDescriptor(exportInfo, strMessage)
                    app.putCustomOptions(GUID, d)
                    app.playbackParameters = d
                break;
                case 2 : // отмена
                    return
                case 3 : // применить настройки
                app.activeDocument.suspendHistory("Auto replace text", "findNearest()")
                break;
            }
            // exit script */ 
        }
    }  
else  // если запущено из палитры
    {  

    var d = app.playbackParameters
    descriptorToObject(exportInfo, d, strMessage)
      
    if (app.playbackDisplayDialogs == DialogModes.ALL ) 
    {
        //double click from action
        var w = buildWindow ()
        w.children[2].children[2].children[1].enabled = false
        var result = w.show()

        switch (result)
        {
            case 1 : // сохранить настройки
                var d = objectToDescriptor(exportInfo, strMessage)
                app.playbackParameters = d
            break;
            case 2 : // отмена
                return
        }
    }

    if (app.playbackDisplayDialogs != DialogModes.ALL)  // run by button "play" with saved in palette settings (быстрый запуск с сохраненными настройками)
    {
        app.activeDocument.suspendHistory("Auto replace text", "findNearest()")  
    }

} 
}

////////////////////////////////////////////////////////////////////////////////////
// конструктор главного окна
///////////////////////////////////////////////////////////////////////////////////
function buildWindow ()
{
var w = new Window("dialog"); 
    w.text = strMessage; 
    w.orientation = "column"; 
    w.alignChildren = ["fill","top"]; 
    w.spacing = 10; 
    w.margins = 16; 

// PNLR
// ====
var pnLr = w.add("panel"); 
    pnLr.text = "Имя слоя:"; 
    pnLr.orientation = "column"; 
    pnLr.alignChildren = ["fill","top"]; 
    pnLr.spacing = 10; 
    pnLr.margins = [10,20,10,10]; 

// GRLAYER
// =======
var grLayer = pnLr.add("group", undefined, {name: "grLayer"}); 
    grLayer.orientation = "row"; 
    grLayer.alignChildren = ["left","fill"]; 
    grLayer.spacing = 10; 
    grLayer.margins = 0; 

var etLr = grLayer.add("edittext", undefined, undefined, {readonly: true});
    etLr.text = exportInfo.currentName 
    etLr.preferredSize.width = 860

var bnRefresh = grLayer.add("button", undefined, undefined, {name: "bnRefresh"}); 
    bnRefresh.text = "↻";
    bnRefresh.helpTip = "обновить имя слоя"
    
// GRFILTER
// ========
var grFilter = pnLr.add("group"); 
    grFilter.orientation = "row"; 
    grFilter.alignChildren = ["left","center"]; 
    grFilter.spacing = 10; 
    grFilter.margins = 0; 

var stFilter = grFilter.add("statictext"); 
    stFilter.text = "фильтрация символов:"; 

var ch1 = grFilter.add("checkbox"); 
    ch1.text = "кириллица"; 

var ch2 = grFilter.add("checkbox"); 
    ch2.text = "латиница"; 

var ch3 = grFilter.add("checkbox"); 
    ch3.text = "цифры"; 

var ch4 = grFilter.add("checkbox"); 
    ch4.text = "точка"; 

var ch5 = grFilter.add("checkbox"); 
    ch5.text = "запятая"; 

var ch6 = grFilter.add("checkbox"); 
    ch6.text = "дефис"; 

var ch7 = grFilter.add("checkbox"); 
    ch7.text = "скобки"; 

var ch8 = grFilter.add("checkbox"); 
    ch8.text = "прочие символы";     

// PNREPLACE
// =========
var pnReplace = w.add("panel"); 
    pnReplace.text = "Замена и подстановка текста:"; 
    pnReplace.orientation = "row"; 
    pnReplace.alignChildren = ["left","top"]; 
    pnReplace.spacing = 10; 
    pnReplace.margins = [10,20,10,10]; 

// GRLINES
// =======
var grLines = pnReplace.add("group"); 
    grLines.orientation = "column"; 
    grLines.alignChildren = ["center","top"]; 
    grLines.spacing = 0; 
    grLines.margins = 0; 
    grLines.alignment = ["left","fill"]; 
    
var lst = grLines.add("listbox", undefined, undefined); 
    lst.selection = 0; 
    lst.preferredSize.width = 100; 
    lst.preferredSize.height = 250; 

// GRBNLINES
// =========
var grBnLines = grLines.add("group"); 
    grBnLines.orientation = "row"; 
    grBnLines.alignChildren = ["center","center"]; 
    grBnLines.spacing = 0; 
    grBnLines.margins = 0; 

var bnAdd = grBnLines.add("button"); 
    bnAdd.text = "+"; 
    bnAdd.preferredSize.width = 50; 
    bnAdd.justify = "center"; 

var bnDel = grBnLines.add("button"); 
    bnDel.text = "-"; 
    bnDel.preferredSize.width = 50; 
    bnDel.justify = "center"; 

// GROPT
// =====
var grOpt = pnReplace.add("group"); 
    grOpt.orientation = "column"; 
    grOpt.alignChildren = ["left","top"]; 
    grOpt.spacing = 10; 
    grOpt.margins = 0; 
    grOpt.label = "grOpt"

// окно отладки //
//var edittext1 = pnReplace.add("edittext",[0,0, 250, 250 ], undefined, {multiline: true});
// окно отладки //
    
// GRPOST
// ======
var grPost = w.add("group"); 
    grPost.orientation = "row"; 
    grPost.alignChildren = ["left","fill"]; 
    grPost.spacing = 10; 
    grPost.margins = 0; 

// PNPREVIEW
// =========
var pnPreview = grPost.add("panel"); 
    pnPreview.text = "Предпросмотр:"; 
    pnPreview.orientation = "row"; 
    pnPreview.alignChildren = ["center","fill"]; 
    pnPreview.spacing = 10; 
    pnPreview.margins = 10; 

var etPreview = pnPreview.add("edittext", [0,0, 500, 80 ], undefined, {multiline: true, readonly: true}); 
    etPreview.text = "иванова\rжанна"; 

// PNADDITIONAL
// ============
var pnAdditional = grPost.add("panel"); 
    pnAdditional.text = "Опции текстового слоя:"; 
    pnAdditional.preferredSize.width = 200; 
    pnAdditional.orientation = "column"; 
    pnAdditional.alignChildren = ["fill","top"]; 
    pnAdditional.spacing = 10; 
    pnAdditional.margins = 10; 

var st2 = pnAdditional.add("statictext"); 
    st2.text = "при изменении размера:"; 

var dlPosition_array = ["сохранять позицию верхнего края","сохранять позицию нижнего края"]; 
var dlPosition = pnAdditional.add("dropdownlist", undefined, dlPosition_array); 
    
    var ch9 = pnAdditional.add("checkbox"); 
    ch9.text = "искать текстовый слой по имени"; 

    var etMask = pnAdditional.add("edittext"); 
    etMask.text = ""; 
    etMask.helpTip = "скрипт ищет ближайший текстовый слой, имя которого содержит указанный текст\nможно задавать несколько масок, разделяя их символом ';'\n\nПример 1; Пример 2"
// GRBTN
// =====
var grBtn = grPost.add("group"); 
    grBtn.orientation = "column"; 
    grBtn.alignChildren = ["fill","top"]; 
    grBtn.spacing = 10; 
    grBtn.margins = 0; 

var bnOk = grBtn.add("button",undefined, undefined, {name: "ok"}); 
    bnOk.text = "Сохранить настройки"; 
    bnOk.justify = "center"; 

    bnApply = grBtn.add("button"); 
    bnApply.text = "Применить настройки"; 
    bnApply.justify = "center"; 

var bnCancel = grBtn.add("button",undefined, undefined, {name: "cancel"})
    bnCancel.text = "Отмена"; 
    bnCancel.justify = "center"; 

    // обработка текстовых фильтров
    ch1.onClick = function () {exportInfo.filterCyrillic = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch2.onClick = function () {exportInfo.filterLatin = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch3.onClick = function () {exportInfo.filterDigits = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch4.onClick = function () {exportInfo.filterDot = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch5.onClick = function () {exportInfo.filterComma = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch6.onClick = function () {exportInfo.filterColon = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch7.onClick = function () {exportInfo.filterBracket = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}
    ch8.onClick = function () {exportInfo.filterOther = this.value; etLr.text = lrText = preProcessName ();  lst.onChange ()}

    ch9.onClick = function () {etMask.visible = this.value; exportInfo.useMask = this.value}

    // обновление имени текстового слоя
    bnRefresh.onClick = function ()
    {
        var err = false
        try {
            var ref = new ActionReference();        
            ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
            var lrName = executeActionGet(ref).getString(stringIDToTypeID("name"));
        } catch (e) {err=true}

        if (!err) exportInfo.currentName = lrName

        etLr.text = lrText = preProcessName ()
        
        lst.onChange ()
    }
        

   // добавление новой строки в список строк
    bnAdd.onClick = function () 
    {
        curLine++

        var tmp = exportInfo.parsingOptions.split ('\n').slice(0,curLine)
        tmp.push ("0\r-1")
        tmp = tmp.concat(exportInfo.parsingOptions.split ('\n').slice(curLine))

        exportInfo.parsingOptions = tmp.join ('\n')
        renewList (curLine,true)  
     }
 
    // удаление строки из списка строк
     bnDel.onClick = function () 
    {
        var tmp = exportInfo.parsingOptions.split ('\n')
        tmp.splice (lst.selection.index, 1)
        exportInfo.parsingOptions = tmp.join ('\n')

        renewList (lst.selection.index, false)
    }
    
    // обновление и загрузка панелей через список строк
    lst.onChange = function ()
    {
        bnDel.enabled = (lst.selection && lst.items.length!=1) ? true : false
        bnAdd.enabled = (lst.items.length<10) ? true : false


        // при загрузке экранных элементов проверить вылет слайдеров за диапазоны
        if (lst.selection)
        { 
            curLine = lst.selection.index
            var tmp = preProcessOptions (exportInfo.parsingOptions)

            if (errFlag) alert ("Изменилась длина текста!\nЗначения элементов управления, выходящие за границы текста были пересчитаны!")

            exportInfo.parsingOptions = tmp.join ('\n')
            loadOptionsFromList (tmp[curLine])

         } else (lst.selection = curLine)
    }

    // закрытие формы с сохранением настроек
    bnOk.onClick = function ()
    {
        w.close (1)
     }

    // закрытие формы c применением настроек
    bnApply.onClick = function ()
    {
        w.close (3)
    }
 
    // закрытие формы без сохранения настроек
     bnCancel.onClick = function ()
    {
        w.close (2)
    }
 
    // изменение списка привязки
    dlPosition.onChange = function () {exportInfo.allign = this.selection.index == 0 ? "top" : "bottom"}

    // изменение маски
    etMask.onChanging = function () {exportInfo.mask = this.text}

    // загрузка данных при открытии формы
    w.onShow = function ()
    {
        ch1.value = exportInfo.filterCyrillic
        ch2.value = exportInfo.filterLatin
        ch3.value = exportInfo.filterDigits
        ch4.value = exportInfo.filterDot
        ch5.value = exportInfo.filterComma
        ch6.value = exportInfo.filterColon
        ch7.value = exportInfo.filterBracket  
        ch8.value = exportInfo.filterOther  
        
        etLr.text = lrText = preProcessName ()

        dlPosition.selection = exportInfo.allign == "top" ? 0 : 1

        bnRefresh.enabled = app.documents.length>0 ? true : false

        ch8.value = exportInfo.useMask
        etMask.text = exportInfo.mask
        etMask.visible = exportInfo.useMask

        renewList ()
        
        renew = true
     }    
 
// обновление списка при изменении данных
renewList = function (sel, mode) 
    {   
        sel = sel ? sel : 0
       
        switch (mode)
        {
            case true:
                lst.add ("item", "Строка " + (lst.items.length+1))
                break;
            case false:
                var tmp = exportInfo.parsingOptions.split ('\n'),
                len = tmp.length-sel;
                for (var i=0; i<=len; i++) {lst.remove (sel)}
                for (var i=0; i<len; i++) {lst.add ("item", "Строка " + (lst.items.length+1))}
                sel = (sel-1>0) ? sel-1 : 0
                break;
            default: 
                var tmp = exportInfo.parsingOptions.split ('\n'),
                len = tmp.length;
                for (var i=0; i<len;i++) {lst.add ("item", "Строка " + (i+1))}
            break;
         }   
     
        lst.selection = curLine = sel        
    } 
 
    
 // загрузка связанных с текущим элементом списка панелей
 loadOptionsFromList = function (s) 
 {
     renew = false
     var len = grOpt.children.length
     for (var i=0; i<len; i++) {grOpt.remove (grOpt.children[0])}
     
     var tmp = s.split ('\r'),
     len = tmp.length;
     for (var i=0; i<len; i++) {addOptions (grOpt, tmp[i])}
     
     if (grOpt.children.length==2) grOpt.children[0].children[0].children[1].enabled=false

     renew = true 
     collectSettings (grOpt)
     w.layout.layout (true) 
 }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка с выбором опций
    ///////////////////////////////////////////////////////////////////////////////////
function addOptions (parent, s)
{
    var tmp = s.split('\t')

    // GROPTIONS
    // =========
    var grOptions = parent.add("group"); 
        grOptions.orientation = "row"; 
        grOptions.alignChildren = ["left","center"]; 
        grOptions.spacing = 10; 
        grOptions.margins = 0; 

    if (Number(tmp[0])>=0) // выбираем, что отображать
    {

        grOptions.label = "dropdownlist"    
    var grBtn = grOptions.add("group"); 
        grBtn.orientation = "row"; 
        grBtn.alignChildren = ["left","center"]; 
        grBtn.spacing = 0; 
        grBtn.margins = 0; 
            
    var bnAdd = grBtn.add("button"); 
        bnAdd.text = "+"; 
        bnAdd.preferredSize.width = 30; 
        bnAdd.justify = "center"; 

    var bnDel = grBtn.add("button"); 
        bnDel.text = "-"; 
        bnDel.preferredSize.width = 30; 
        bnDel.justify = "center"; 

    var dl_array = ["Интервал","Слово","Замена","Текст"]; 
    var dl = grOptions.add("dropdownlist", undefined, dl_array); 
        dl.selection = 0; 

    var div = grOptions.add("panel"); 
        div.alignment = "fill"; 
        
    // выбор нужной опции из списка, в зависимости от переданного аргумента
            
        dl.selection = Number(tmp[0])
        addSubpanel(tmp)

    // загрузка панели, в зависимости от выбранной в списке опции с учетом аргументов
    function addSubpanel (s)
    {
        if (grOptions.children.length >3) {grOptions.remove (grOptions.children[3])}
        switch (Number(s[0])) 
        {
            case 0: addInterval (grOptions,s); break;
            case 1: addWord (grOptions,s); break;
            case 2: replaceText (grOptions,s); break;
            case 3: addText (grOptions,s); break;
        }
        
        if (renew) w.layout.layout (true)
    }

    // загрузка пустой панели в завсимости от выбранной в списке опции
    dl.onChange = function (){var tmp = [this.selection.index]; addSubpanel(tmp)}   
        
    bnAdd.onClick = function () 
    {       
            if (parent.children.length == 2) parent.children[0].children[0].children[1].enabled=true
            
            renew = false

            var cur, 
            len = parent.children.length,
            tmp;

            // определяем, с какой строкой/массивом будем сейчас работать
            tmp=exportInfo.parsingOptions.split ('\n')
            tmp=tmp[curLine].split ('\r')

            // ищем в каком ряду нажата кнопка
            for (var i=0; i<len ;i++) {if (parent.children[i]==grOptions) {cur = i+1; break}}
            
            //удаляем строки, расположенные ниже
            var delLines = parent.children.length;
            for (var i=cur; i<delLines;i++) {parent.remove(parent.children[cur])}
        
        // добавляем пустую строку     
            addOptions (parent, "0" )
            
        // добавляем оставшиеся строки из памяти  
            for (var i=cur; i<tmp.length; i++) {addOptions (parent, tmp[i])}
    
        // обновляем список
            collectSettings (parent)
            
        if (parent.children.length==11)
            {
                for (var i=0; i<10;i++) {parent.children[i].children[0].children[0].enabled=false}
            }
    
            w.layout.layout (true) 
            renew = true
            }
        
    bnDel.onClick = function () 
        {
        
        if (parent.children.length > 2)
            {
                if (parent.children.length==11)
                    {
                    for (var i=0; i<10;i++) {parent.children[i].children[0].children[0].enabled=true}
                    }
                parent.remove (grOptions); 

            if (parent.children.length==2) {parent.children[0].children[0].children[1].enabled=false}
            collectSettings (parent); w.layout.layout (true)
            } else {parent.children[0].children[0].children[1].enabled=false}
        }        
    }

   else // мультистроки 
    {
       grOptions.label = "multiline" 
       addMultiline(grOptions, tmp)

       if (renew) w.layout.layout (true)
    }
    
}

    ////////////////////////////////////////////////////////////////////////////////////
    // строка вставки слова
    ///////////////////////////////////////////////////////////////////////////////////
function addWord (parent, s)
{
    var gr = parent.add("group"); 
        gr.orientation = "row"; 
        gr.alignChildren = ["left","center"]; 
        gr.spacing = 10; 
        gr.margins = 0; 
        
    var dl_array = ["с начала строки","с конца строки"]; 
    var dl = gr.add("dropdownlist", undefined, dl_array); 
        dl.selection = 0; 

    var sl = gr.add("slider"); 
        sl.minvalue = 0; 
        sl.maxvalue = 0; 
        sl.value = 0; 
        sl.preferredSize.width = 135

    var st = gr.add("statictext"); 
        st.text = "00"; 
    
    var ch = gr.add("checkbox"); 
        ch.text = "сократить до инициала"; 

        ch.onClick = function () {if (renew) collectSettings (gr.parent.parent)}
        dl.onChange = function () {if (renew) collectSettings (gr.parent.parent)}
        sl.onChanging = function () {this.value = this.label = st.text = Math.round (this.value)}

        sl.addEventListener ('change', commonHandler)

        function commonHandler(evt) 
        {
                sl.value = sl.label = st.text = Math.round (sl.value)
                if (renew) collectSettings (gr.parent.parent)          
        }
        //выполняется один раз при загрузки панели

        loadLine (s, gr)
        if (renew) collectSettings (gr.parent.parent)
}

    ////////////////////////////////////////////////////////////////////////////////////
    // строка вставки интервала
    ///////////////////////////////////////////////////////////////////////////////////
function addInterval (parent, s)
{
var gr = parent.add("group"); 
    gr.orientation = "row"; 
    gr.alignChildren = ["left","center"]; 
    gr.spacing = 10; 
    gr.margins = 0;

var dl_array = ["с начала строки","с конца строки"]; 
var dl = gr.add("dropdownlist", undefined, dl_array); 
    dl.selection = 0; 

var stFrom = gr.add("statictext"); 
    stFrom.text = "от:"; 

var slFrom = gr.add("slider"); 
    slFrom.minvalue = 0; 
    slFrom.maxvalue = 0; 
    slFrom.value = 0; 
    slFrom.preferredSize.width = 100

var stFromValue = gr.add("statictext"); 
    stFromValue.text = "00"; 

var stTo = gr.add("statictext"); 
    stTo.text = "до:"; 

var slTo = gr.add("slider"); 
    slTo.minvalue = 0; 
    slTo.maxvalue = 0; 
    slTo.value = 0; 
    slTo.preferredSize.width=100

var stToValue = gr.add("statictext"); 
    stToValue.text = "00"; 

    dl.onChange = function () {if (renew) collectSettings (gr.parent.parent)}

    slFrom.addEventListener ('change', commonHandler)
    slTo.addEventListener ('change', commonHandler)

    function commonHandler(evt) 
    {
        switch (evt.currentTarget)
        {
            case slFrom:
                var val = Math.round (slFrom.value)
                slFrom.value = slFrom.label = stFromValue.text = val

                if (val >= slTo.value) slTo.value = slTo.label = stToValue.text = val
            break;
            case slTo:
                var val = Math.round (slTo.value)
                slTo.value =  val
                stToValue.text = slTo.label = slTo.value > wordLen ? "∞" : val
                
                if (val <= slFrom.value) slFrom.value = slFrom.label = stFromValue.text = val
            break;
        }

        if (renew) collectSettings (gr.parent.parent)       
    }

    slFrom.onChanging = function () 
    {
        var val = Math.round (this.value)
        this.value = this.label = stFromValue.text = val

        if (val >= slTo.value) slTo.value = slTo.label = stToValue.text = val
    }


    slTo.onChanging = function () 
    {
        var val = Math.round (this.value)
        this.value =  val
        stToValue.text = this.label = this.value > wordLen ? "∞" : val
        
        if (val <= slFrom.value) slFrom.value = slFrom.label = stFromValue.text = val
    }

    //выполняется один раз при загрузки панели
    loadLine (s, gr) 
    if (renew) collectSettings (gr.parent.parent)
}

    ////////////////////////////////////////////////////////////////////////////////////
    // строка вставки текста
    ///////////////////////////////////////////////////////////////////////////////////
function addText (parent, s)
{
var gr = parent.add("group"); 
    gr.orientation = "row"; 
    gr.alignChildren = ["left","center"]; 
    gr.spacing = 10; 
    gr.margins = 0; 

var et = gr.add("edittext"); 
    et.preferredSize.width = 290; 

    et.onChanging = function () 
    {
        if (this.text.length > 128) this.text = this.text.substr(0,128)
        if (renew) collectSettings (gr.parent.parent)
    }
    
    //выполняется один раз при загрузки панели
    loadLine (s, gr) 
    if (renew) collectSettings (gr.parent.parent)
}

    ////////////////////////////////////////////////////////////////////////////////////
    // строка замены текста
    ///////////////////////////////////////////////////////////////////////////////////
function replaceText (parent, s)
{
var gr = parent.add("group"); 
    gr.orientation = "row"; 
    gr.alignChildren = ["left","center"]; 
    gr.spacing = 10; 
    gr.margins = 0; 

var dl_array = ["слово","набор символов"]; 
var dl = gr.add("dropdownlist", undefined, dl_array); 
    dl.selection = 0;    

var stFind = gr.add("statictext"); 
    stFind.text = "найти:"; 

var etFind = gr.add("edittext"); 
    etFind.preferredSize.width = 150; 

var stReplace = gr.add("statictext"); 
    stReplace.text = "заменить:"; 

var etReplace = gr.add("edittext"); 
    etReplace.preferredSize.width = 150; 

    dl.onChange = function () {if (renew) collectSettings (gr.parent.parent)}
    etFind.onChanging = function () 
    {
        if (this.text.length > 128) this.text = this.text.substr(0,128)
        if (renew) collectSettings (gr.parent.parent)
    }
    etReplace.onChanging = function () 
    {
        if (this.text.length > 128) this.text = this.text.substr(0,128)
        if (renew) collectSettings (gr.parent.parent)
    }

    //выполняется один раз при загрузки панели
    loadLine (s, gr) 
    if (renew) collectSettings (gr.parent.parent)
}

    ////////////////////////////////////////////////////////////////////////////////////
    // строка разбиения на подстроки
    ///////////////////////////////////////////////////////////////////////////////////
function addMultiline (parent, s)
{
// GR
// ==
var gr = parent.add("group"); 
    gr.orientation = "row"; 
    gr.alignChildren = ["left","center"]; 
    gr.spacing = 10; 
    gr.margins = 0; 

var ch = gr.add("checkbox"); 
    ch.text = "Разбивать на подстроки"; 

var dlMode_array = ["количество строк","количество символов"]; 
var dlMode = gr.add("dropdownlist", undefined, dlMode_array); 
    dlMode.selection = 0; 

var sl = gr.add("slider"); 
    sl.minvalue = 0; 
    sl.maxvalue = 0; 
    sl.value = 0; 
    sl.preferredSize.width = 135

var st = gr.add("statictext"); 
    st.text = "00"; 

var dlOpt_array = ["длинная строка начинает текст","длинная строка завершает текст"]; 
var dlOpt = gr.add("dropdownlist", undefined, dlOpt_array); 
    dlOpt.selection = 0; 
   

    ch.onClick = function ()
    {
        dlMode.visible = sl.visible = st.visible = dlOpt.visible =  this.value

        if (renew) collectSettings (gr.parent.parent)
        w.layout.layout (true) 
    }

    dlMode.onChange = function(){if (renew) collectSettings (gr.parent.parent)}
    dlOpt.onChange = function(){if (renew) collectSettings (gr.parent.parent)}

    sl.onChanging = function () 
    {
        var val = Math.round (this.value)
        this.value = this.label = st.text = val
    }

    
    sl.addEventListener ('change', commonHandler)

    function commonHandler(evt) 
    {
            sl.value = sl.label = st.text = Math.round (sl.value)
            if (renew) collectSettings (gr.parent.parent)          
    }

    loadLine (s, gr) 

    ch.onClick ()
    return 
}


    ////////////////////////////////////////////////////////////////////////////////////
    // обновить значение слайдера мультистроки c учетом текущей длины строки
    ///////////////////////////////////////////////////////////////////////////////////
function updateSlider (parent)
{
    if (typeof parent == "object")
    {
        var ch = parent.children[0],
        dlMode = parent.children[1],
        sl = parent.children[2],
        st = parent.children[3];

        if (ch.value)
        {
            var tmp = exportInfo.parsingOptions.split ('\n'),
            line = buildLine (tmp[curLine]);
            
            // "количество строк","количество слов","количество символов"

            switch (dlMode.selection.index)
            {
                case 0: 
                    line = line.replace(/[\r]/ig, " ") 
                    tmp = line.split (' ') 
                    sl.maxvalue = tmp.length
                    sl.value = st.text = sl.label = sl.value > tmp.length ? tmp.length : sl.value
                    break;
                case 1:
                    line = line.replace(/[\r]/ig, " ") 
                    line = line.replace(/[ ]/ig, "")
                    sl.maxvalue = line.length
                    sl.value = st.text = sl.label = sl.value > line.length ? line.length : sl.value
                    break;
            }
        }
    } else 
    {
        var tmp = exportInfo.parsingOptions.split ('\n'),
        line = buildLine (tmp[curLine]);

        switch (Number(parent))
        {
            case 0:   
                line = line.replace(/[\r]/ig, " ")
                tmp = line.split (' ') 
                return tmp.length
            case 1:
                line = line.replace(/[\r]/ig, " ")
                line = line.replace(/[ ]/ig, "")
                return line.length
            default: 
                return wordLen
        }

    }
}

    ////////////////////////////////////////////////////////////////////////////////////
    // получить настройки из строки и применить их к элементам формы
    ///////////////////////////////////////////////////////////////////////////////////
function loadLine (s, parent)
{
    var cur = 1, // позиция текущего элемента в массиве
    len = parent.children.length; //элемент строки (не обязательно совпадает с массивом)

    for (var i=0; i<len;i++)
    {
        switch (parent.children[i].type)
        {
            case "dropdownlist":
                parent.children[i].selection = s[cur] ? Number(s[cur]) : 0
                cur ++
                break;
            case "edittext":
                parent.children[i].text = s[cur] ? s[cur] : ""
                cur ++
                break;
            case "statictext":
                break;
            case "slider":
                if (i<=2) // первый слайдер
                {
                    // min
                    parent.children[i].minvalue = 1
                    // max
                    parent.children[i].maxvalue = Number(s[0]) == -1 && s[2] != undefined ? updateSlider(s[2]) : wordLen 
                    // val
                    s[cur] = s[cur] ? Number(s[cur]) : 1
                    parent.children[i].value = parent.children[i].label = parent.children[i+1].text = s[cur]
                } else // второй слайдер
                {
                    // min
                    parent.children[i].minvalue = 1
                    // max
                    parent.children[i].maxvalue = wordLen + 1 
                    // val
                    if (s[cur] == "∞" || s[cur] == undefined)
                    {
                        parent.children[i].label = parent.children[i+1].text = "∞"
                        parent.children[i].value = wordLen +1
                    } else
                    {
                        parent.children[i].value = parent.children[i].label = parent.children[i+1].text = s[cur]
                    } 
                }        
                    cur ++
                    break;
            case "checkbox":
                parent.children[i].value = s[cur] ? Number(s[cur]) : 0
                cur ++
            break; 
            default:
                $.writeln (parent.children[i].type)
            break;
         }
     }  
 }

    ////////////////////////////////////////////////////////////////////////////////////
    // проверка позиции слайдеров перед загрузкой элементов в форму
    ///////////////////////////////////////////////////////////////////////////////////
function preProcessOptions (s)
{
    var tmp = s.split ('\n'),
    len = tmp.length,
    output = [];
    var cursor = curLine

    errFlag = false
    
    for (var i = 0; i<len; i++)
    {
        curLine = i
        
        var cur = tmp[i].split('\r'),
        opt = [];
        for (x=0; x<cur.length;x++)
        {
            var line = cur [x].split ('\t')
       
        // слово        1	0	8	0
        // интервал     0	0	6	∞
        // мультистрока -1	1	2	16	0

        switch (Number(line[0]))
            {
                case -1:
                    if (line.length > 2)
                    {
                        line[3] = Number(line[3])
                        var max = updateSlider(line[2])
                        if (errFlag == 0) errFlag = line[3] > max ? true : false
                        line[3] = line[3] > max ? max : line[3]
                    }
                    break;
                case 0:
                case 1:
                    if (line.length > 2)
                    {
                        line[2] = Number(line[2])
                        if (errFlag == 0) errFlag = line[2] > wordLen ? true : false
                        line[2] = line[2] > wordLen ? wordLen : line[2]

                        if (line[3] != "∞" && line[3] != undefined)
                        {
                            line[3] = Number(line[3])
                            if (errFlag == 0) errFlag = line[3] > wordLen+1 ? true : false
                            line[3] = line[3] > wordLen ? wordLen : line[3]
                        }
                    }
                    break;  
            }
            opt.push (line.join('\t'))
        }
        output.push (opt.join('\r'))
    }

    curLine = cursor

    return output
}

    ////////////////////////////////////////////////////////////////////////////////////
    // считать значения элементов из формы
    ///////////////////////////////////////////////////////////////////////////////////
function collectSettings (parent)
{
    var set = []
    var len = parent.children.length

    for (var i=0; i<len; i++)
    {  
        if (parent.children[i].label != "multiline") 
        {
            set.push (readLine (parent.children[i].children[1].selection.index, parent.children[i].children[3]))
        }
        else {set.push (readLine ("-1", parent.children[i].children[0]))}
    }

       var tmp = exportInfo.parsingOptions.split ('\n')
       tmp[curLine] = set.join('\r')
       exportInfo.parsingOptions = tmp.join ('\n')

    // обновить слайдер мультистроки с учетом изменений

    updateSlider (parent.children[parent.children.length-1].children[0])
    // окно отладки
  //     parent.parent.children[2].text = wordLen + '\n' + curLine + '\n' + exportInfo.parsingOptions 

    // addSubstr (parent)
    var txt = []  
    for (var i=0; i<tmp.length; i++)
    {
        txt.push (buildLine (tmp[i]))
    }
       parent.parent.parent.children[2].children[0].children[0].text =  txt.join ('\r')

    // чтение отдельной строки      
    function readLine (mode, parent)
    {
        var line = [mode]

        if (parent)
        {
        var len = parent.children.length

        for (var i=0; i<len;i++)
            {
                switch (parent.children[i].type)
                {
                    case "dropdownlist":
                        line.push (parent.children[i].selection.index)
                        break;
                case "edittext":
                        line.push (parent.children[i].text)
                        break;
                case "statictext":   
                        break;
                case "slider": 
                        line.push (parent.children[i].label)
                        break;  
                    case "checkbox":
                        line.push (Number(parent.children[i].value))
                        break;       
                    default: $.writeln (parent.children[i].type)
                    break;
                }
            } 
        }
        return line.join('\t')
    }

}

return w
}
////////////////////////////////////////////////////////////////////////////////////
// формирование читаемой строки
///////////////////////////////////////////////////////////////////////////////////
function buildLine (arg)
{
    var s = [],
    line = arg.split ('\r'),
    len = line.length;

       for (var i=0; i<len; i++)
       {
            var options = line[i].split('\t')

            switch (Number(options[0]))
            {
                case -1: s = buildMultiline (options,s); break;
                case 0:  s.push(buildInterval (options)); break;
                case 1:  s.push(buildWord (options)); break;
                case 2:  s = replaceWord (options,s); break;
                case 3:  if (options[1]) s.push(addWord (options)); break;
                default: break;
            }
       }
       

    return s.join (' ')

// выбор интервала
function buildInterval (arg)
{
    var tmp = lrText.split(' '),
    s = [];

    arg[3] = arg[3] == "∞" ? wordLen : arg[3]

    var start = Number(arg[1]) == 0 ? Number(arg[2])-1 : tmp.length - Number(arg[3])
    var end = Number(arg[1]) == 0 ? Number(arg[3])-1 : tmp.length -Number(arg[2])

    for (var i = start; i<=end; i++) {s.push(tmp[i])}

    return s.join (' ')
}

// выбор слова
function buildWord (arg)
{
    var tmp = lrText.split(' '),
    txt;

    var start = Number(arg[1]) == 0 ? 0 : tmp.length
    var end = Number(arg[1]) == 0 ? Number(arg[2])-1 : -Number(arg[2])

    txt = tmp[start + end]
    
    if (Number(arg[3]) == 1 && txt != "") {txt = txt.substr(0,1).toUpperCase() + '.'}
    return txt
}

// замена слова
function replaceWord (arg, txt)
{
    if (arg[2]=="") return txt

    var tmp = txt.join(' '),
    s,
    r;

    if (arg[1] == 0)
    {
        s = arg[2].replace(/ +$/,"") 
        s = s.replace(/^ +/,"")  
              
        r = arg[3] != "" ? ' ' + arg[3] + ' ' : ' ' 
        
        s = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');// экранирование пользовательского ввода

        var reg = new RegExp ('\\s' + s + '\\s',"ig")
        var result =  ' ' + tmp + ' '
        var result = result.replace (reg,r)

        result = result.replace(/ +$/,"") 
        result = result.replace(/^ +/,"")
    } else
    {
        s = arg[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // экранирование пользовательского ввода

            var reg = new RegExp (s,"ig")
            var result = tmp.replace (reg,arg[3])

    }


   return result.split (' ')
}

// вставка текста
function addWord (arg)
{
    return arg[1]
}

// создание подстроки
function buildMultiline (arg, txt)
{
    if (Number(arg[1]) == 0) return txt
    
    var output = [],
    tmp = [],

    input = txt.join(" ").split(" ")

    // обработка висячих строк
    for (var i=0; i<input.length-1; i++)
    {
        if (input[i].length <=3) 
        {
            switch (input[i].length)
            {
            case 3:
                input[i]=input[i]+"\u00A0"
            break;
            default:
                if (input[i].replace(/[^а-яёa-z]/ig, "").length - input[i].length == 0) input[i]=input[i]+"\u00A0"
            }
        }
    }

   input = input.join(" ").replace(/\u00A0 /ig, "\u00A0").split(" ");

   //мультистрока -1	1	2	16	0
 
            var lines = Number(arg[2]) == 0 ? Number(arg[3]) : input.join(" ").replace(/[ ]/ig, "").length/Number(arg[3])
            
            for (var i=0; i<lines; i++)
            {
                if (!input [0]) break;

                var current = [],
                maxLen = input.join(" ").replace(/[ ]/ig, "").length/(lines-i)
                curLen = input[0].length;

                current.push(input.shift())
                
                if (curLen<maxLen)
                {
                    do
                    {
                      if (!input[0]) break;
                      
                      var shiftLen = input[0].length

                      if (curLen + shiftLen <= maxLen)
                      {
                        curLen += shiftLen
                        current.push(input.shift())
                      } else
                      {
                          if (curLen+shiftLen-maxLen <= 0.5 * shiftLen && arg[4]==0)
                          {
                            current.push(input.shift())
                          }
                          break;
                      }
                    
                    } while (true)
                }

                tmp.push (current.join(" "))
            }

    output.push (tmp.join('\r'))
   
    return  output
}

}



////////////////////////////////////////////////////////////////////////////////////
// фильтрация текущего имени
///////////////////////////////////////////////////////////////////////////////////

function preProcessName ()
{      
        var s = exportInfo.currentName
        
        if (!exportInfo.filterCyrillic) s = s.replace(/[а-яё]/ig, "")
        if (!exportInfo.filterLatin) s = s.replace(/[a-z]/ig, "")
        if (!exportInfo.filterDigits) s = s.replace(/[\d]/g, "")
        if (!exportInfo.filterDot) s = s.replace(/[.]/g, "")
        if (!exportInfo.filterComma) s = s.replace(/[,]/g, "")
        if (!exportInfo.filterColon) s = s.replace(/[-]/g, "")
        if (!exportInfo.filterBracket) s = s.replace(/[()]/g, "")
        if (!exportInfo.filterOther) s = s.replace(/[^)( ,.\-a-zа-яё \d]/ig, "")

        s = s.replace(/ +$/,"")  
        s = s.replace(/^ +/,"")  
        s = s.replace(/ +/g," ") 

        wordLen = s.split(' ').length
        return s
 }

////////////////////////////////////////////////////////////////////////////////////
// работа со слоями
///////////////////////////////////////////////////////////////////////////////////
function findNearest ()
{
     var err = false
     try {
         var ref = new ActionReference();        
         ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
         exportInfo.currentName = executeActionGet(ref).getString(stringIDToTypeID("name"));
     } catch (e) {err=true}

    if (!err)
    {
        lrText = preProcessName ()

        var desc = executeActionGet(ref)
        
        var lr = new getCenter (desc, ref)
        var txt = getTextLayerIDs ()

        var minDist = []
        for (var i=0; i<txt.length; i++) {minDist.push (new distance(lr, txt[i]))} 
        
        minDist.sort (compareDist) 

        if (minDist[0]) 
        {   
                var bottom = minDist[0].bottom
                var tmp = exportInfo.parsingOptions.split ('\n')
                var txt = []  
                for (var i=0; i<tmp.length; i++)
                {
                    txt.push (buildLine (tmp[i]))
                }
            
                try{replaceTextLr(txt, minDist[0].ref)} catch (e) {}

                if (exportInfo.allign=="bottom")
                {
                    var desc = executeActionGet(minDist[0].ref)
                    var bounds = desc.getObjectValue(stringIDToTypeID("bounds"))
                    bottom = bottom - bounds.getDouble(stringIDToTypeID("bottom"))
                    
                    selectLayer(minDist[0].id)
                    try{moveLayer(minDist[0].ref, bottom)} catch (e) {}
                    selectLayer(lr.id)
                }  
        }
    }
}

function compareDist (a,b) {if (a.dist > b.dist) return 1; if (a.dist < b.dist) return -1}

function distance (lrA, lrB)
{    
    var a =lrA.X - lrB.X
    var b =lrA.Y - lrB.Y

    this.dist = Math.sqrt( a*a + b*b )
    this.ref = lrB.ref

    this.bottom = lrB.bottom
    this.id = lrB.id
    
    return
}

function getCenter (desc, ref)
{
        var bounds = desc.getObjectValue(stringIDToTypeID("bounds"))
        var top = bounds.getDouble(stringIDToTypeID("top"))
        var left = bounds.getDouble(stringIDToTypeID("left"))
        this.bottom = bounds.getDouble(stringIDToTypeID("bottom"))
        var right = bounds.getDouble(stringIDToTypeID("right"))
        
        this.id = desc.getInteger(stringIDToTypeID("layerID"))
        this.X = left + (right-left)/2
        this.Y = top + (this.bottom-top)/2
        this.ref = ref

        return
}

function getTextLayerIDs()
{     
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
        if (desc.getInteger(stringIDToTypeID("layerKind")) != 3 || desc.getBoolean(stringIDToTypeID("visible")) != true || maskedName(desc.getString(stringIDToTypeID("name")))!= true || isLocked(desc)==true) continue;
        Texts.push (new getCenter (desc, ref))
        }  
    return Texts  
};   

function isLocked (desc)
{
    var locked = false
    var d = desc.getObjectValue(stringIDToTypeID("layerLocking")) 

    for (var i =0; i<d.count;i++)
    {
        if (d.getBoolean(d.getKey(i)) == true) {locked = true; break}
    }
    return locked
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

function moveLayer (ref, offset)
{
   /* var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));*/
    var desc = new ActionDescriptor();
    desc.putReference(stringIDToTypeID("null"), ref)

    var d1 = new ActionDescriptor();
    d1.putUnitDouble(stringIDToTypeID("horizontal"), stringIDToTypeID("pixelsUnit"), 0);
    d1.putUnitDouble(stringIDToTypeID("vertical"),   stringIDToTypeID("pixelsUnit"), offset);
    desc.putObject(stringIDToTypeID("to"), stringIDToTypeID("offset"), d1);
    executeAction(stringIDToTypeID("move"), desc, DialogModes.NO);
}

function maskedName (s)
{

   var mask = true
   if (exportInfo.useMask == true && exportInfo.mask.length!=0)
   {
       s = s.toUpperCase()
       var mask = false
       var tmp = exportInfo.mask.split(";")
       for (var i = 0; i < tmp.length; i++)
       {
           tmp[i] = tmp[i].replace(/ +$/,"")  
           tmp[i] = tmp[i].replace(/^ +/,"") 

           if (tmp[i]!="")
           {
               if (s.indexOf(tmp[i].toUpperCase()) >=0) mask = true
           }
       }
   }

 return mask  
}
////////////////////////////////////////////////////////////////////////////////////
// замена текста, работа со стилями оформления
///////////////////////////////////////////////////////////////////////////////////
function replaceTextLr (newText, ref)  
    {        
        /*
        // получаем ссылку на активный текстовый слой
        var ref = new ActionReference();        
        ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));  
        */

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

////////////////////////////////////////////////////////////////////////////////////
// управление настройками программы
///////////////////////////////////////////////////////////////////////////////////
function initExportInfo (exportInfo) 
{
        exportInfo.currentName = ""
        exportInfo.useMask = false
        exportInfo.mask = ""
        exportInfo.allign = "top" // "top" "bottom"
        exportInfo.filterCyrillic = true
        exportInfo.filterLatin = false
        exportInfo.filterDigits = false
        exportInfo.filterDot = true
        exportInfo.filterComma = true
        exportInfo.filterColon = false
        exportInfo.filterBracket = false
        exportInfo.filterOther = false
        exportInfo.parsingOptions = "0\r-1"
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
	}
}