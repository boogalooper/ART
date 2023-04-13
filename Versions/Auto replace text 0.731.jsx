////////////////////////////////////////////////////////////////////////////////
// Auto replace text
// jazz-y@ya.ru
///////////////////////////////////////////////////////////////////////////////

#target photoshop;

////////////////////////////////////////////////////////////////////////////////////
// публичные константы
///////////////////////////////////////////////////////////////////////////////////

var GUID = "e981ad2e-29f6-4695-b445-3e7644b0bf9f",
    ver = "0.731",
    strMessage = "Auto replace text",
    curLine = 0, //указатель текущей строки в списке
    wordLen = 0, // длина строки для слайдеров
    renew = false, // режим обновления формы
    lrText = "", //имя после преобразования
    errFlag = false, // ошибка пересчета длины строки
    isCancelled = false,
    cfg = new Config,
    AM = new ActionManager,
    PS = new Preset;

main()

////////////////////////////////////////////////////////////////////////////////////
// запуск программы
///////////////////////////////////////////////////////////////////////////////////
function main() {
    if (!app.playbackParameters.count)  // запуск из меню
    {
        // пытаемся загрузить настройки из реестра
        try {
            var d = app.getCustomOptions(GUID)
            if (d != undefined) descriptorToObject(cfg, d, strMessage)
        } catch (e) { }

        var w = buildWindow(),
            result = w.show();

        switch (result) {
            case 1: // сохранить настройки
                var d = objectToDescriptor(cfg, strMessage)
                app.putCustomOptions(GUID, d)
                app.playbackParameters = d
                break;
            case 2: // отмена
                isCancelled = true
                return;
            case 3: // применить настройки
                app.activeDocument.suspendHistory("Auto replace text", "findNearest()")
                isCancelled = true
                return;
        }
        // exit script */ 

    }
    else  // если запущено из палитры
    {

        var d = app.playbackParameters
        descriptorToObject(cfg, d, strMessage)

        if (app.playbackDisplayDialogs == DialogModes.ALL) {
            //double click from action
            var w = buildWindow()
            w.children[2].children[2].children[1].enabled = false
            var result = w.show()

            switch (result) {
                case 1: // сохранить настройки
                    var d = objectToDescriptor(cfg, strMessage)
                    app.playbackParameters = d
                    break;
                case 2: // отмена
                    isCancelled = true
                    return
            }
        }

        if (app.playbackDisplayDialogs != DialogModes.ALL)  // run by button "play" with saved in palette settings (быстрый запуск с сохраненными настройками)
        {
            try { app.activeDocument.suspendHistory("Auto replace text", "findNearest()") } catch (e) { }
        }

    }
}

isCancelled ? 'cancel' : undefined //чтобы не записывался экшен, если отмена

////////////////////////////////////////////////////////////////////////////////////
// конструктор главного окна
///////////////////////////////////////////////////////////////////////////////////
function buildWindow() {
    {
        var w = new Window("dialog");
        w.text = strMessage + " " + ver;
        w.orientation = "column";
        w.alignChildren = ["fill", "top"];
        w.spacing = 10;
        w.margins = 16;

        // PNLR
        // ====
        var pnLr = w.add("panel");
        pnLr.text = "Образец форматирования исходного текста (имя слоя):";
        pnLr.orientation = "column";
        pnLr.alignChildren = ["fill", "top"];
        pnLr.spacing = 10;
        pnLr.margins = [10, 20, 10, 10];

        // GRLAYER
        // =======
        var grLayer = pnLr.add("group", undefined, { name: "grLayer" });
        grLayer.orientation = "row";
        grLayer.alignChildren = ["left", "fill"];
        grLayer.spacing = 10;
        grLayer.margins = 0;

        var etLr = grLayer.add("edittext", undefined, undefined, { readonly: true });
        etLr.text = cfg.currentName
        etLr.preferredSize.width = 860

        var bnRefresh = grLayer.add("button", undefined, undefined, { name: "bnRefresh" });
        bnRefresh.text = "↻";
        bnRefresh.helpTip = "обновить имя слоя"

        // GRFILTER
        // ========
        var grFilter = pnLr.add("group");
        grFilter.orientation = "row";
        grFilter.alignChildren = ["left", "center"];
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
        pnReplace.orientation = "column";
        pnReplace.alignChildren = ["left", "top"];
        pnReplace.spacing = 10;
        pnReplace.margins = 10;
        // pnReplace.maximumSize.height = 400

        // =========================================
        // preset module
        // =========================================    
        var grPreset = pnReplace.add("group");
        grPreset.orientation = "row";
        grPreset.alignChildren = ["left", "center"];
        grPreset.spacing = 10;

        var dlPreset_array = ["по-умолчанию"];
        var dlPreset = grPreset.add("dropdownlist", undefined, undefined, { items: dlPreset_array });
        dlPreset.text = "Предустановки:"
        dlPreset.preferredSize.width = 300

        var bnRefreshPreset = grPreset.add("button");
        bnRefreshPreset.text = "↺"
        bnRefreshPreset.preferredSize.width = 30

        var bnSave = grPreset.add("button");
        bnSave.text = "Сохранить"

        var bnSaveAs = grPreset.add("button");
        bnSaveAs.text = "Добавить"

        var bnDelPreset = grPreset.add("button");
        bnDelPreset.text = "Удалить"

        var div = pnReplace.add("panel");
        div.alignment = "fill";

        var grLinesAndOptions = pnReplace.add("group");
        grLinesAndOptions.orientation = "row";
        grLinesAndOptions.alignChildren = ["left", "top"];
        grLinesAndOptions.spacing = 10;
        grLinesAndOptions.margins = 0;

        // GRLINES
        // =======
        var grLines = grLinesAndOptions.add("group");
        grLines.orientation = "column";
        grLines.alignChildren = ["center", "top"];
        grLines.spacing = 0;
        grLines.margins = 0;
        grLines.alignment = ["left", "fill"];

        var lst = grLines.add("listbox", undefined, undefined);
        lst.selection = 0;
        lst.preferredSize.width = 115;
        lst.preferredSize.height = 250;

        // GRBNLINES
        // =========
        var grBnLines = grLines.add("group");
        grBnLines.orientation = "row";
        grBnLines.alignChildren = ["center", "center"];
        grBnLines.spacing = 0;
        grBnLines.margins = 0;

        var bnAdd = grBnLines.add("button");
        bnAdd.text = "+";
        bnAdd.preferredSize.width = 30;
        bnAdd.justify = "center";
        bnAdd.helpTip = 'добавить строку\nAlt - копировать текущую'

        var bnUp = grBnLines.add("button");
        bnUp.text = "△";
        bnUp.preferredSize.width = 30;
        bnUp.justify = "center";
        bnUp.helpTip = 'поднять вверх'

        var bnDown = grBnLines.add("button");
        bnDown.text = "▽";
        bnDown.preferredSize.width = 30;
        bnDown.justify = "center";
        bnDown.helpTip = 'опустить вниз'

        var bnDel = grBnLines.add("button");
        bnDel.text = "-";
        bnDel.preferredSize.width = 30;
        bnDel.justify = "center";
        bnDel.helpTip = 'удалить строку\nAlt - удалить всё, кроме текущей'
        /*
                var bnReset = grLines.add("button");
                bnReset.text = "Сброс";
                bnReset.preferredSize.width = 100;
                bnReset.justify = "center";
        */
        // GROPT
        // =====
        var grOpt = grLinesAndOptions.add("group");
        grOpt.orientation = "column";
        grOpt.alignChildren = ["left", "top"];
        grOpt.spacing = 0;
        grOpt.margins = 0;
        grOpt.label = "grOpt"

        // GRPOST
        // ======
        var grPost = w.add("group");
        grPost.orientation = "row";
        grPost.alignChildren = ["left", "fill"];
        grPost.spacing = 10;
        grPost.margins = 0;

        // PNPREVIEW
        // =========
        var pnPreview = grPost.add("panel");
        pnPreview.text = "Предпросмотр:";
        pnPreview.orientation = "row";
        pnPreview.alignChildren = ["center", "fill"];
        pnPreview.spacing = 10;
        pnPreview.margins = 10;

        var etPreview = pnPreview.add("edittext", [0, 0, 500, 80], undefined, { multiline: true, readonly: true });
        //etPreview.text = "иванова\rжанна";

        // PNADDITIONAL
        // ============
        var pnAdditional = grPost.add("panel");
        pnAdditional.text = "Опции текстового слоя:";
        pnAdditional.preferredSize.width = 200;
        pnAdditional.orientation = "column";
        pnAdditional.alignChildren = ["fill", "top"];
        pnAdditional.spacing = 10;
        pnAdditional.margins = 10;

        var st2 = pnAdditional.add("statictext");
        st2.text = "при изменении размера:";

        var dlPosition_array = ["сохранять позицию верхнего края", "сохранять позицию нижнего края"];
        var dlPosition = pnAdditional.add("dropdownlist", undefined, dlPosition_array);

        var ch9 = pnAdditional.add("checkbox");
        ch9.text = "искать текстовый слой по имени";

        var etMask = pnAdditional.add("edittext");
        etMask.text = "";
        etMask.helpTip = "скрипт ищет ближайший текстовый слой, имя которого содержит указанный текст\nможно задавать несколько масок, разделяя их запятой\n\nПример 1, Пример 2"
        // GRBTN
        // =====
        var grBtn = grPost.add("group");
        grBtn.orientation = "column";
        grBtn.alignChildren = ["fill", "top"];
        grBtn.spacing = 10;
        grBtn.margins = 0;

        var bnOk = grBtn.add("button", undefined, undefined, { name: "ok" });
        bnOk.text = "Сохранить настройки";
        bnOk.justify = "center";

        bnApply = grBtn.add("button");
        bnApply.text = "Применить настройки";
        bnApply.justify = "center";

        var bnCancel = grBtn.add("button", undefined, undefined, { name: "cancel" })
        bnCancel.text = "Отмена";
        bnCancel.justify = "center";
    }
    // ======================================================
    // preset functions
    // ======================================================

    dlPreset.onChange = function () {
        if (this.selection.index == 0) {
            bnDelPreset.enabled = false

            if (renew) {
                var def = new Config
                def.currentName = cfg.currentName
                var a = PS.settingsToPreset(def)
                PS.presetToSettings(a)

                w.onShow(true)
            }
        } else {
            bnDelPreset.enabled = true

            if (renew) {
                var a = PS.items.getByName(this.selection.text)
                PS.presetToSettings(a)

                w.onShow(true)
            }
        }

        cfg.preset = this.selection.text
        if (w.visible) { var d = objectToDescriptor(cfg); app.putCustomOptions(GUID, d) }
        PS.checkPresetIntegrity(w)
    }

    bnSave.onClick = function () {
        var a = PS.settingsToPreset(cfg)
        PS.items.add(dlPreset.selection.text, a)

        var d = objectToDescriptor(cfg); app.putCustomOptions(GUID, d)
        PS.checkPresetIntegrity(w)
    }

    bnSaveAs.onClick = function () {
        var a = PS.settingsToPreset(cfg),
            nm = prompt("Укажите имя пресета\nБудут сохранены имя слоя, параметры фильтрации символов, настройки замены и подстановки текста", dlPreset.selection.text + " копия", "Сохранение пресета");

        if (nm != null && nm != "") {
            if (PS.items.getByName(nm) == null && nm != "по-умолчанию") {
                PS.items.add(nm, a)

                loadPresets()

                renew = false;
                dlPreset.selection = dlPreset.find(nm)
                renew = true;
            } else {
                if (nm != "по-умолчанию") {
                    if (confirm("Набор с таким именем уже существует. Перезаписать?", false, "Сохранение пресета")) {
                        PS.items.add(nm, a)

                        renew = false;
                        dlPreset.selection = dlPreset.find(nm)
                        renew = true;
                    }
                }
            }
        }

        var d = objectToDescriptor(cfg); app.putCustomOptions(GUID, d)
        PS.checkPresetIntegrity(w)
    }

    bnDelPreset.onClick = function () {
        var nm = dlPreset.selection.text,
            num = dlPreset.selection.index;

        PS.items.delete(nm)
        loadPresets()

        dlPreset.selection = num > dlPreset.items.length - 1 ? dlPreset.items.length - 1 : num
    }

    bnRefreshPreset.onClick = function () {
        dlPreset.onChange()
    }

    // обработка текстовых фильтров
    ch1.onClick = function () { cfg.filterCyrillic = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch2.onClick = function () { cfg.filterLatin = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch3.onClick = function () { cfg.filterDigits = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch4.onClick = function () { cfg.filterDot = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch5.onClick = function () { cfg.filterComma = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch6.onClick = function () { cfg.filterColon = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch7.onClick = function () { cfg.filterBracket = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }
    ch8.onClick = function () { cfg.filterOther = this.value; etLr.text = lrText = preProcessName(); lst.onChange() }

    ch9.onClick = function () {
        etMask.visible = cfg.useMask = this.value
        if (!this.value) { cfg.mask = etMask.text = "" }
    }

    //bnReset.onClick = function () { CFG.parsingOptions = "0\r-1"; lst.removeAll(); renewList(); lst.onChange() }

    // обновление имени текстового слоя
    bnRefresh.onClick = function () {
        var err = false
        try { AM.getDocProperty('targetLayersIDs') } catch (e) { err = true }
        if (!err) cfg.currentName = AM.getOrdinalLayerProperty('name')
        if (err) { bnRefresh.enabled = bnApply.enabled = false }

        etLr.text = lrText = preProcessName()

        lst.onChange()
    }


    // добавление новой строки в список строк
    bnAdd.addEventListener('click', commonHandler)
    bnDel.addEventListener('click', commonHandler)
    bnUp.addEventListener('click', commonHandler)
    bnDown.addEventListener('click', commonHandler)

    function commonHandler(evt) {
        var tmp = cfg.parsingOptions.split('\n')
        switch (evt.target) {
            case bnAdd:
                curLine++
                tmp = tmp.slice(0, curLine)
                tmp.push(evt.altKey ? tmp[tmp.length - 1] : "0\r-1")
                tmp = tmp.concat(cfg.parsingOptions.split('\n').slice(curLine))
                break;
            case bnDel:
                if (evt.altKey) {
                    var line = tmp[curLine];
                    curLine = 0
                    tmp = [line]
                } else {
                    tmp.splice(curLine, 1)
                    cfg.parsingOptions = tmp.join('\n')
                    curLine = curLine == lst.items.length - 1 ? curLine - 1 : curLine
                    renewList(curLine)
                }
                break;
            case bnUp:
                var line = tmp[curLine];
                tmp[curLine] = tmp[curLine - 1]
                tmp[curLine - 1] = line
                curLine--
                break;
            case bnDown:
                var line = tmp[curLine];

                tmp[curLine] = tmp[curLine + 1]
                tmp[curLine + 1] = line
                curLine++
                break;
        }

        cfg.parsingOptions = tmp.join('\n')
        renewList(curLine)
    }


    // обновление и загрузка панелей через список строк
    lst.onChange = function () {
        bnDel.enabled = (lst.selection && lst.items.length != 1) ? true : false
        bnUp.enabled = (lst.selection.index) ? true : false
        bnDown.enabled = (lst.selection.index < lst.items.length - 1) ? true : false
        bnAdd.enabled = (lst.items.length < 15) ? true : false

        // при загрузке экранных элементов проверить вылет слайдеров за диапазоны
        if (lst.selection) {
            curLine = lst.selection.index
            var tmp = preProcessOptions(cfg.parsingOptions)

            if (errFlag) alert("Изменилась длина текста!\nЗначения элементов управления, выходящие за границы текста были пересчитаны!")

            cfg.parsingOptions = tmp.join('\n')
            loadOptionsFromList(tmp[curLine])

        } else (lst.selection = curLine)
    }

    // закрытие формы с сохранением настроек
    bnOk.onClick = function () {
        w.close(1)
    }

    // закрытие формы c применением настроек
    bnApply.onClick = function () {
        w.close(3)
    }

    // закрытие формы без сохранения настроек
    bnCancel.onClick = function () {
        w.close(2)
    }

    // изменение списка привязки
    dlPosition.onChange = function () { cfg.allign = this.selection.index == 0 ? "top" : "bottom" }

    // изменение маски
    etMask.onChanging = function () { cfg.mask = this.text }


    // загрузка данных при открытии формы
    w.onShow = function (fromPreset) {
        renew = false

        if (fromPreset) {
            lst.removeAll()
            var len = grOpt.children.length
            for (var i = 0; i < len; i++) { grOpt.remove(grOpt.children[0]) }
        } else {
            loadPresets();
            dlPreset.selection = (p = dlPreset.find(cfg.preset)) != null ? p : 0
        }

        var err = false
        try { AM.getDocProperty('targetLayersIDs') } catch (e) { err = true }
        if (!err && cfg.currentName == "") cfg.currentName = AM.getOrdinalLayerProperty('name')
        if (err) { bnRefresh.enabled = bnApply.enabled = false }

        ch1.value = cfg.filterCyrillic
        ch2.value = cfg.filterLatin
        ch3.value = cfg.filterDigits
        ch4.value = cfg.filterDot
        ch5.value = cfg.filterComma
        ch6.value = cfg.filterColon
        ch7.value = cfg.filterBracket
        ch8.value = cfg.filterOther

        etLr.text = lrText = preProcessName()

        dlPosition.selection = cfg.allign == "top" ? 0 : 1

        ch9.value = cfg.useMask
        etMask.text = cfg.mask
        etMask.visible = cfg.useMask

        renewList()

        renew = true

    }

    function loadPresets() {
        var len = dlPreset.items.length,
            items = PS.items;
        if (len > 1) { for (var i = 1; i < len; i++) { dlPreset.remove(dlPreset.items[1]) } }
        for (var i = 0; i < items.count; i++) { dlPreset.add('item', t2s(items.getKey(i))) }
    }

    // обновление списка при изменении данных
    function renewList(sel) {
        lst.removeAll();
        sel = sel ? sel : 0

        var tmp = cfg.parsingOptions.split('\n'),
            len = tmp.length;
        for (var i = 0; i < len; i++) { lst.add("item", "Строка " + (i + 1)) }


        lst.selection = curLine = sel
    }

    // загрузка связанных с текущим элементом списка панелей
    function loadOptionsFromList(s) {
        renew = false
        var len = grOpt.children.length
        for (var i = 0; i < len; i++) { grOpt.remove(grOpt.children[0]) }

        var tmp = s.split('\r'),
            len = tmp.length;
        for (var i = 0; i < len; i++) { addOptions(grOpt, tmp[i]) }

        if (grOpt.children.length == 2) grOpt.children[0].children[0].children[1].enabled = false

        renew = true
        collectSettings(grOpt)
        w.layout.layout(true)
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка с выбором опций
    ///////////////////////////////////////////////////////////////////////////////////
    function addOptions(parent, s) {
        var tmp = s.split('\t')

        // GROPTIONS
        // =========
        var grOptions = parent.add("group");
        grOptions.orientation = "row";
        grOptions.alignChildren = ["left", "center"];
        grOptions.spacing = 10;
        grOptions.margins = 0;

        if (Number(tmp[0]) >= 0) // выбираем, что отображать
        {
            grOptions.label = "dropdownlist"
            var grBtn = grOptions.add("group");
            grBtn.orientation = "row";
            grBtn.alignChildren = ["left", "center"];
            grBtn.spacing = 0;
            grBtn.margins = 0;

            var bnAdd = grBtn.add("button");
            bnAdd.text = "+";
            bnAdd.preferredSize.width = 30;
            bnAdd.justify = "center";
            bnAdd.helpTip = 'добавить строку\nAlt - копировать текущую'

            var bnDel = grBtn.add("button");
            bnDel.text = "-";
            bnDel.preferredSize.width = 30;
            bnDel.justify = "center";
            bnDel.helpTip = 'удалить строку\nAlt - удалить всё, кроме текущей'

            var dl_array = ["Интервал", "Слово", "Замена", "Текст"];
            var dl = grOptions.add("dropdownlist", undefined, dl_array);
            dl.selection = 0;
            var div = grOptions.add("panel");
            div.alignment = "fill";

            // выбор нужной опции из списка, в зависимости от переданного аргумента

            dl.selection = Number(tmp[0])
            addSubpanel(tmp)

            // загрузка панели, в зависимости от выбранной в списке опции с учетом аргументов
            function addSubpanel(s) {
                if (grOptions.children.length > 3) { grOptions.remove(grOptions.children[3]) }
                switch (Number(s[0])) {
                    case 0: addInterval(grOptions, s); break;
                    case 1: addWord(grOptions, s); break;
                    case 2: replaceText(grOptions, s); break;
                    case 3: addText(grOptions, s); break;
                }

                if (renew) w.layout.layout(true)
            }

            // загрузка пустой панели в завсимости от выбранной в списке опции
            dl.onChange = function () { var tmp = [this.selection.index]; addSubpanel(tmp) }

            bnAdd.addEventListener('click', commonHandler)
            bnDel.addEventListener('click', commonHandler)

            function commonHandler(evt) {
                if (evt.target == bnAdd) {
                    if (parent.children.length == 2) parent.children[0].children[0].children[1].enabled = true
                    renew = false

                    var cur,
                        len = parent.children.length,
                        tmp;

                    // определяем, с какой строкой/массивом будем сейчас работать
                    tmp = cfg.parsingOptions.split('\n')
                    tmp = tmp[curLine].split('\r')

                    // ищем в каком ряду нажата кнопка
                    for (var i = 0; i < len; i++) { if (parent.children[i] == grOptions) { cur = i + 1; break } }

                    //удаляем строки, расположенные ниже
                    var delLines = parent.children.length;
                    for (var i = cur; i < delLines; i++) { parent.remove(parent.children[cur]) }

                    // добавляем пустую строку  
                    addOptions(parent, evt.altKey ? tmp[cur - 1] : "0")

                    // добавляем оставшиеся строки из памяти  
                    for (var i = cur; i < tmp.length; i++) { addOptions(parent, tmp[i]) }

                    // обновляем список
                    collectSettings(parent)

                    if (parent.children.length == 16) {
                        for (var i = 0; i < 15; i++) { parent.children[i].children[0].children[0].enabled = false }
                    }

                    w.layout.layout(true)
                    renew = true
                } else {
                    renew = evt.altKey ? false : true
                }
            }

            bnDel.onClick = function () {

                if (parent.children.length > 2) {
                    if (parent.children.length == 16) {
                        for (var i = 0; i < 15; i++) { parent.children[i].children[0].children[0].enabled = true }
                    }

                    if (renew) {
                        parent.remove(grOptions);
                    } else {
                        var len = parent.children.length - 2
                        for (var i = 0; i < len; i++) { parent.remove(parent.children[0]) }
                    }

                    if (parent.children.length == 2) { parent.children[0].children[0].children[1].enabled = false }
                    collectSettings(parent); w.layout.layout(true)
                } else { parent.children[0].children[0].children[1].enabled = false }

            }

        }
        else // мультистроки 
        {
            grOptions.label = "multiline"
            addMultiline(grOptions, tmp)

            if (renew) w.layout.layout(true)
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка вставки слова
    ///////////////////////////////////////////////////////////////////////////////////
    function addWord(parent, s) {
        var gr = parent.add("group");
        gr.orientation = "row";
        gr.alignChildren = ["left", "center"];
        gr.spacing = 10;
        gr.margins = 0;

        var dl_array = ["с начала строки", "от конца строки"];
        var dl = gr.add("dropdownlist", undefined, dl_array);
        dl.selection = 0;
        dl.preferredSize.width = 140

        var sl = gr.add("slider");
        sl.minvalue = 0;
        sl.maxvalue = 0;
        sl.value = 0;
        sl.preferredSize.width = 135

        var st = gr.add("statictext");
        st.text = "00";

        var ch = gr.add("checkbox");
        ch.text = "сократить до инициала";

        ch.onClick = function () { if (renew) collectSettings(gr.parent.parent) }
        dl.onChange = function () { if (renew) collectSettings(gr.parent.parent) }
        sl.onChanging = function () { this.label = st.text = Math.round(this.value); if (renew) collectSettings(gr.parent.parent) }

        sl.addEventListener('keyup', commonHandler)
        sl.addEventListener('mouseup', commonHandler)
        sl.addEventListener('mouseout', commonHandler)

        function commonHandler(evt) {
            sl.value = sl.label = st.text = Math.round(sl.value)
            if (renew) collectSettings(gr.parent.parent)
        }

        //выполняется один раз при загрузки панели

        loadLine(s, gr)
        if (renew) collectSettings(gr.parent.parent)
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка вставки интервала
    ///////////////////////////////////////////////////////////////////////////////////
    function addInterval(parent, s) {
        var gr = parent.add("group");
        gr.orientation = "row";
        gr.alignChildren = ["left", "center"];
        gr.spacing = 10;
        gr.margins = 0;

        var dl_array = ["с начала строки", "от конца строки", "с начала и от конца"];
        var dl = gr.add("dropdownlist", undefined, dl_array);
        dl.selection = 0;
        dl.preferredSize.width = 140

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
        slTo.preferredSize.width = 100

        var stToValue = gr.add("statictext");
        stToValue.text = "00";

        dl.onChange = function () {
            var tmp = slTo.value
            switch (this.selection.index) {
                case 0: // фиксированный интервал
                case 1: // фиксированный интервал
                    slTo.maxvalue = wordLen + 1
                    if (tmp == wordLen && this.label == 2) { slTo.value = wordLen + 1; slTo.label = stToValue.text = "∞" }
                    else if (this.label == 2) { slTo.value = slTo.label = stToValue.text = tmp }
                    this.label = this.selection.index
                    break;
                case 2: // относительный интервал
                    slTo.maxvalue = wordLen
                    if (tmp > wordLen) { slTo.value = wordLen; slTo.label = stToValue.text = slTo.maxvalue - slTo.value + 1 }
                    else { slTo.value = tmp; slTo.label = stToValue.text = slTo.maxvalue - slTo.value + 1 }
                    this.label = this.selection.index
                    break;
            }

            if (renew) collectSettings(gr.parent.parent)
        }

        //   slFrom.onChange = function () {this.value = Math.round (this.value)}
        //  slTo.onChange = function () {this.value = Math.round (this.value)}

        slFrom.addEventListener('keyup', commonHandler)
        slFrom.addEventListener('mouseup', commonHandler)
        slFrom.addEventListener('mouseout', commonHandler)

        slTo.addEventListener('keyup', commonHandler)
        slTo.addEventListener('mouseup', commonHandler)
        slTo.addEventListener('mouseout', commonHandler)

        function commonHandler(evt) {
            if (dl.selection.index != 2) {
                switch (evt.currentTarget) {
                    case slFrom:
                        var val = Math.round(slFrom.value)
                        slFrom.value = slFrom.label = stFromValue.text = val

                        if (val >= slTo.value) slTo.value = slTo.label = stToValue.text = val
                        break;
                    case slTo:
                        var val = Math.round(slTo.value)
                        slTo.value = val
                        stToValue.text = slTo.label = slTo.value > wordLen ? "∞" : val

                        if (val <= slFrom.value) slFrom.value = slFrom.label = stFromValue.text = val
                        break;
                }
            } else {
                switch (evt.currentTarget) {
                    case slFrom:
                        var val = Math.round(this.value)
                        this.value = this.label = stFromValue.text = val
                        if (val >= slTo.value) { slTo.value = val; slTo.label = stToValue.text = slTo.maxvalue - slTo.value + 1 }
                        break;
                    case slTo:
                        var val = Math.round(this.value)
                        this.value = val
                        stToValue.text = this.label = this.maxvalue - val + 1
                        if (val <= slFrom.value) slFrom.value = stFromValue.text = slFrom.label = val
                        break;
                }
            }

            if (renew) collectSettings(gr.parent.parent)
        }

        slFrom.onChanging = function () {
            switch (dl.selection.index) {
                case 0:
                case 1:
                    var val = Math.round(this.value)
                    this.label = stFromValue.text = val

                    if (val >= slTo.value) slTo.value = slTo.label = stToValue.text = val
                    break;
                case 2:
                    var val = Math.round(this.value)
                    this.label = stFromValue.text = val
                    if (val >= slTo.value) { slTo.value = val; slTo.label = stToValue.text = slTo.maxvalue - slTo.value + 1 }
                    break;
            }
            if (renew) collectSettings(gr.parent.parent)
        }


        slTo.onChanging = function () {
            switch (dl.selection.index) {
                case 0:
                case 1:
                    var val = Math.round(this.value)
                    // this.value =  val
                    stToValue.text = this.label = this.value > wordLen ? "∞" : val

                    if (val <= slFrom.value) slFrom.value = slFrom.label = stFromValue.text = val
                    break;
                case 2:
                    var val = Math.round(this.value)
                    //   this.value =  val
                    stToValue.text = this.label = this.maxvalue - val + 1
                    if (val <= slFrom.value) slFrom.value = stFromValue.text = slFrom.label = val
                    break;
            }
            if (renew) collectSettings(gr.parent.parent)
        }

        //выполняется один раз при загрузке панели
        loadLine(s, gr)
        if (renew) collectSettings(gr.parent.parent)
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка вставки текста
    ///////////////////////////////////////////////////////////////////////////////////
    function addText(parent, s) {
        var gr = parent.add("group");
        gr.orientation = "row";
        gr.alignChildren = ["left", "center"];
        gr.spacing = 10;
        gr.margins = 0;

        var dl_array = ["слово", "набор символов"];
        var dl = gr.add("dropdownlist", undefined, dl_array);
        dl.selection = 0;
        dl.preferredSize.width = 140

        dl.onChange = function () { if (renew) collectSettings(gr.parent.parent) }

        var et = gr.add("edittext");
        et.preferredSize.width = 285;

        et.onChanging = function () {
            if (this.text.length > 128) this.text = this.text.substr(0, 128)
            if (renew) collectSettings(gr.parent.parent)
        }

        //выполняется один раз при загрузки панели
        loadLine(s, gr)
        if (renew) collectSettings(gr.parent.parent)
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка замены текста
    ///////////////////////////////////////////////////////////////////////////////////
    function replaceText(parent, s) {
        var gr = parent.add("group");
        gr.orientation = "row";
        gr.alignChildren = ["left", "center"];
        gr.spacing = 10;
        gr.margins = 0;

        var dl_array = ["слово", "набор символов"];
        var dl = gr.add("dropdownlist", undefined, dl_array);
        dl.selection = 0;
        dl.preferredSize.width = 140

        var stFind = gr.add("statictext");
        stFind.text = "найти:";

        var etFind = gr.add("edittext");
        etFind.preferredSize.width = 150;

        var stReplace = gr.add("statictext");
        stReplace.text = "заменить:";

        var etReplace = gr.add("edittext");
        etReplace.preferredSize.width = 150;

        dl.onChange = function () { if (renew) collectSettings(gr.parent.parent) }
        etFind.onChanging = function () {
            if (this.text.length > 128) this.text = this.text.substr(0, 128)
            if (renew) collectSettings(gr.parent.parent)
        }
        etReplace.onChanging = function () {
            if (this.text.length > 128) this.text = this.text.substr(0, 128)
            if (renew) collectSettings(gr.parent.parent)
        }

        //выполняется один раз при загрузки панели
        loadLine(s, gr)
        if (renew) collectSettings(gr.parent.parent)
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // строка разбиения на подстроки
    ///////////////////////////////////////////////////////////////////////////////////
    function addMultiline(parent, s) {
        // GR
        // ==
        var gr = parent.add("group");
        gr.orientation = "row";
        gr.alignChildren = ["left", "center"];
        gr.spacing = 10;
        gr.margins = 0;

        var ch = gr.add("checkbox");
        ch.text = "Разбивать на подстроки";

        var dlMode_array = ["количество строк", "количество символов"];
        var dlMode = gr.add("dropdownlist", undefined, dlMode_array);
        dlMode.selection = 0;

        var sl = gr.add("slider");
        sl.minvalue = 0;
        sl.maxvalue = 0;
        sl.value = 0;
        sl.preferredSize.width = 135

        var st = gr.add("statictext");
        st.text = "00";

        var dlOpt_array = ["длинная строка начинает текст", "длинная строка завершает текст"];
        var dlOpt = gr.add("dropdownlist", undefined, dlOpt_array);
        dlOpt.selection = 0;


        ch.onClick = function () {
            dlMode.visible = sl.visible = st.visible = dlOpt.visible = this.value

            if (renew) collectSettings(gr.parent.parent)
            w.layout.layout(true)
        }

        dlMode.onChange = function () { if (renew) collectSettings(gr.parent.parent) }
        dlOpt.onChange = function () { if (renew) collectSettings(gr.parent.parent) }
        //  sl.onChange = function(){this.value = Math.round (this.value)}

        sl.onChanging = function () {
            // this.label = st.text = Math.round (this.value)
            if (renew) collectSettings(gr.parent.parent)
        }


        sl.addEventListener('keyup', commonHandler)
        sl.addEventListener('mouseup', commonHandler)
        sl.addEventListener('mouseout', commonHandler)

        function commonHandler(evt) {
            sl.value = sl.label = st.text = Math.round(sl.value)
            if (renew) collectSettings(gr.parent.parent)
        }

        // выполняется один раз при загрузке панели
        loadLine(s, gr)
        ch.onClick()
        return
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // обновить значение слайдера мультистроки c учетом текущей длины строки
    ///////////////////////////////////////////////////////////////////////////////////
    function updateSlider(parent) {
        if (typeof parent == "object") {
            var ch = parent.children[0],
                dlMode = parent.children[1],
                sl = parent.children[2],
                st = parent.children[3];

            if (ch.value) {
                var tmp = cfg.parsingOptions.split('\n'),
                    line = buildLine(tmp[curLine]);

                // "количество строк","количество слов","количество символов"

                switch (dlMode.selection.index) {
                    case 0:
                        line = line.replace(/[\r]/ig, " ")
                        tmp = line.split(' ')
                        sl.maxvalue = tmp.length
                        st.text = sl.label = sl.value > tmp.length ? tmp.length : Math.round(sl.value)
                        break;
                    case 1:
                        line = line.replace(/[\r]/ig, " ")
                        line = line.replace(/[ ]/ig, "")
                        sl.maxvalue = line.length
                        st.text = sl.label = sl.value > line.length ? line.length : Math.round(sl.value)
                        break;
                }
            }
        } else {
            var tmp = cfg.parsingOptions.split('\n'),
                line = buildLine(tmp[curLine]);

            switch (Number(parent)) {
                case 0:
                    line = line.replace(/[\r]/ig, " ")
                    tmp = line.split(' ')
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
    function loadLine(s, parent) {
        var cur = 1, // позиция текущего элемента в массиве
            len = parent.children.length; //элемент строки (не обязательно совпадает с массивом)

        for (var i = 0; i < len; i++) {
            switch (parent.children[i].type) {
                case "dropdownlist":
                    parent.children[i].selection = s[cur] ? Number(s[cur]) : 0
                    cur++
                    break;
                case "edittext":
                    parent.children[i].text = s[cur] ? s[cur] : ""
                    cur++
                    break;
                case "statictext":
                    break;
                case "slider":
                    if (i <= 2) // первый слайдер
                    {
                        // min
                        parent.children[i].minvalue = 1
                        // max
                        parent.children[i].maxvalue = Number(s[0]) == -1 && s[2] != undefined ? updateSlider(s[2]) : wordLen
                        // val
                        s[cur] = s[cur] ? Number(s[cur]) : 1
                        parent.children[i].value = parent.children[i].label = parent.children[i + 1].text = s[cur]
                    } else // второй слайдер
                    {
                        var mode = !Number(s[1]) ? 0 : Number(s[1])
                        switch (mode) {
                            case 0:
                            case 1:
                                // min
                                parent.children[i].minvalue = 1
                                // max
                                parent.children[i].maxvalue = wordLen + 1
                                // val
                                if (s[cur] == "∞" || s[cur] == undefined) {
                                    parent.children[i].label = parent.children[i + 1].text = "∞"
                                    parent.children[i].value = wordLen + 1
                                } else {
                                    parent.children[i].value = parent.children[i].label = parent.children[i + 1].text = s[cur]
                                }
                                break;
                            case 2:
                                // min
                                parent.children[i].minvalue = 1
                                // max
                                parent.children[i].maxvalue = wordLen
                                // val
                                if (s[cur] == undefined) {
                                    parent.children[i].label = parent.children[i + 1].text = 1
                                    parent.children[i].value = wordLen
                                } else {
                                    parent.children[i].label = parent.children[i + 1].text = s[cur]
                                    parent.children[i].value = wordLen - Number(s[cur]) + 1
                                }
                                break;
                        }
                    }
                    cur++
                    break;
                case "checkbox":
                    parent.children[i].value = s[cur] ? Number(s[cur]) : 0
                    cur++
                    break;
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // проверка позиции слайдеров перед загрузкой элементов в форму
    ///////////////////////////////////////////////////////////////////////////////////
    function preProcessOptions(s) {
        var tmp = s.split('\n'),
            len = tmp.length,
            output = [];
        var cursor = curLine

        errFlag = false

        for (var i = 0; i < len; i++) {
            curLine = i

            var cur = tmp[i].split('\r'),
                opt = [];
            for (x = 0; x < cur.length; x++) {
                var line = cur[x].split('\t')

                // слово        1	0	8	0
                // интервал     0	0	6	∞
                // мультистрока -1	1	2	16	0

                switch (Number(line[0])) {
                    case -1:
                        if (line.length > 2) {
                            line[3] = Number(line[3])
                            var max = updateSlider(line[2])
                            if (errFlag == 0) errFlag = line[3] > max ? true : false
                            line[3] = line[3] > max ? max : line[3]
                        }
                        break;
                    case 0:
                    case 1:
                        if (Number(line[1]) < 2) {
                            if (line.length > 2) {
                                line[2] = Number(line[2])
                                if (errFlag == 0) errFlag = line[2] > wordLen ? true : false
                                line[2] = line[2] > wordLen ? wordLen : line[2]

                                if (line[3] != "∞" && line[3] != undefined) {
                                    line[3] = Number(line[3])
                                    if (errFlag == 0) errFlag = line[3] > wordLen + 1 ? true : false
                                    line[3] = line[3] > wordLen ? wordLen : line[3]
                                }
                            }
                            break;
                        } else {
                            if (line.length > 2) {
                                line[2] = Number(line[2])
                                if (errFlag == 0) errFlag = line[2] > wordLen ? true : false
                                line[2] = line[2] > wordLen ? wordLen : line[2]

                                if (line[3] != undefined) {
                                    line[3] = Number(line[3])
                                    if (errFlag == 0) errFlag = line[3] > wordLen + 1 ? true : false
                                    line[3] = line[3] > wordLen ? wordLen : line[3]
                                    if (errFlag == 0) errFlag = wordLen - line[3] + 1 < line[2] ? true : false
                                    line[3] = wordLen - line[3] + 1 < line[2] ? wordLen - line[2] + 1 : line[3]
                                }
                            }
                        }
                }
                opt.push(line.join('\t'))
            }
            output.push(opt.join('\r'))
        }

        curLine = cursor

        return output
    }

    ////////////////////////////////////////////////////////////////////////////////////
    // считать значения элементов из формы
    ///////////////////////////////////////////////////////////////////////////////////
    function collectSettings(parent) {
        var set = []
        var len = parent.children.length

        for (var i = 0; i < len; i++) {
            if (parent.children[i].label != "multiline") {
                set.push(readLine(parent.children[i].children[1].selection.index, parent.children[i].children[3]))
            }
            else { set.push(readLine("-1", parent.children[i].children[0])) }
        }

        var tmp = cfg.parsingOptions.split('\n')
        tmp[curLine] = set.join('\r')
        cfg.parsingOptions = tmp.join('\n')

        // обновить слайдер мультистроки с учетом изменений

        updateSlider(parent.children[parent.children.length - 1].children[0])
        // окно отладки
        //   parent.parent.children[2].text = wordLen + '\n' + curLine + '\n' + CFG.parsingOptions 

        // addSubstr (parent)
        var txt = []
        for (var i = 0; i < tmp.length; i++) {
            txt.push(buildLine(tmp[i]))
        }
        parent.parent.parent.parent.children[2].children[0].children[0].text = txt.join('\r')
        PS.checkPresetIntegrity(parent.parent.parent.parent)
        // чтение отдельной строки      
        function readLine(mode, parent) {
            var line = [mode]

            if (parent) {
                var len = parent.children.length

                for (var i = 0; i < len; i++) {
                    switch (parent.children[i].type) {
                        case "dropdownlist":
                            line.push(parent.children[i].selection.index)
                            break;
                        case "edittext":
                            line.push(parent.children[i].text)
                            break;
                        case "statictext":
                            break;
                        case "slider":
                            line.push(parent.children[i].label)
                            break;
                        case "checkbox":
                            line.push(Number(parent.children[i].value))
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
function buildLine(arg) {
    var s = [],
        line = arg.split('\r'),
        len = line.length;

    for (var i = 0; i < len; i++) {
        var options = line[i].split('\t')

        switch (Number(options[0])) {
            case -1: s = buildMultiline(options, s); break;
            case 0: s.push(buildInterval(options)); break;
            case 1: s.push(buildWord(options)); break;
            case 2: s = replaceWord(options, s); break;
            case 3: s = addWord(options, s); break;
            default: break;
        }
    }

    // обработка текста, если был включен посимвольный режим
    s = s.join(' ')
    s = s.replace(/\s\v/g, "")
    s = s.replace(/\v\s/g, "")
    s = s.replace(/\v/g, "")

    return s

    // выбор интервала
    function buildInterval(arg) {
        var tmp = lrText.split(' '),
            s = [];

        switch (Number(arg[1])) {
            case 0:
            case 1:
                arg[3] = arg[3] == "∞" ? wordLen : arg[3]

                var start = Number(arg[1]) == 0 ? Number(arg[2]) - 1 : tmp.length - Number(arg[3])
                var end = Number(arg[1]) == 0 ? Number(arg[3]) - 1 : tmp.length - Number(arg[2])

                for (var i = start; i <= end; i++) { s.push(tmp[i]) }
                break;
            case 2:
                var start = Number(arg[2]) - 1
                var end = tmp.length - Number(arg[3])

                end = start > end ? start : end

                for (var i = start; i <= end; i++) { s.push(tmp[i]) }
                break;
        }

        return s.join(' ')
    }

    // выбор слова
    function buildWord(arg) {
        var tmp = lrText.split(' '),
            txt;

        var start = Number(arg[1]) == 0 ? 0 : tmp.length
        var end = Number(arg[1]) == 0 ? Number(arg[2]) - 1 : -Number(arg[2])

        txt = tmp[start + end]

        if (Number(arg[3]) == 1 && txt != "") { txt = txt.substr(0, 1).toUpperCase() + '.' }
        return txt
    }

    // замена слова
    function replaceWord(arg, txt) {
        if (arg[2] == "") return txt

        var tmp = txt.join(' '),
            s,
            r;

        if (arg[1] == 0) {
            s = arg[2].replace(/ +$/, "")
            s = s.replace(/^ +/, "")

            r = arg[3] != "" ? ' ' + arg[3] + ' ' : ' '

            s = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');// экранирование пользовательского ввода

            var reg = new RegExp('\\s' + s + '\\s', "ig")
            var result = ' ' + tmp + ' '
            var result = result.replace(reg, r)

            result = result.replace(/ +$/, "")
            result = result.replace(/^ +/, "")
        } else {
            s = arg[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // экранирование пользовательского ввода

            var reg = new RegExp(s, "ig")
            var result = tmp.replace(reg, arg[3])

        }


        return result.split(' ')
    }

    // вставка текста
    function addWord(arg, s) {
        switch (Number(arg[1])) {
            case 0:
                if (arg[2]) s.push(arg[2])
                break;
            case 1:
                if (arg[2]) s.push('\v' + arg[2] + '\v')
                break;
        }
        return s
    }

    // создание подстроки
    function buildMultiline(arg, txt) {
        if (Number(arg[1]) == 0) return txt

        var output = [],
            tmp = [],

            input = txt.join(" ").split(" ")

        // обработка висячих строк
        for (var i = 0; i < input.length - 1; i++) {
            if (input[i].length <= 3) {
                switch (input[i].length) {
                    case 3:
                        if (input[i].replace(/[0-9A-ZА-Я]/g, "").length - input[i].length == 0) input[i] = input[i] + "\u00A0"
                        break;
                    default:
                        if (input[i].replace(/[^а-яёa-z]/g, "").length - input[i].length == 0) input[i] = input[i] + "\u00A0"
                }

            }
        }

        input = input.join(" ").replace(/\u00A0 /ig, "\u00A0").split(" ");

        //мультистрока -1	1	2	16	0

        var lines = Number(arg[2]) == 0 ? Number(arg[3]) : input.join(" ").replace(/[ ]/ig, "").length / Number(arg[3])

        for (var i = 0; i < lines; i++) {
            if (!input[0]) break;

            var current = [],
                maxLen = input.join(" ").replace(/[ ]/ig, "").length / (lines - i)
            curLen = input[0].length;

            current.push(input.shift())

            if (curLen < maxLen) {
                do {
                    if (!input[0]) break;

                    var shiftLen = input[0].length

                    if (curLen + shiftLen <= maxLen) {
                        curLen += shiftLen
                        current.push(input.shift())
                    } else {
                        if (curLen + shiftLen - maxLen <= 0.5 * shiftLen && arg[4] == 0) {
                            current.push(input.shift())
                        }
                        break;
                    }

                } while (true)
            }

            tmp.push(current.join(" ").replace(/\u00A0/ig, " "))
        }

        // обработка случая, когда использовался текст в режиме "символы"

        output.push(tmp.join('\r'))

        return output
    }

}

////////////////////////////////////////////////////////////////////////////////////
// фильтрация текущего имени
///////////////////////////////////////////////////////////////////////////////////

function preProcessName() {
    var s = cfg.currentName

    s = s.replace(/[\s]/g, ' ')

    if (!cfg.filterCyrillic) s = s.replace(/[а-яё]/ig, " ")
    if (!cfg.filterLatin) s = s.replace(/[a-z]/ig, " ")
    if (!cfg.filterDigits) s = s.replace(/[\d]/g, " ")
    if (!cfg.filterDot) s = s.replace(/[.]/g, " ")
    if (!cfg.filterComma) s = s.replace(/[,]/g, " ")
    if (!cfg.filterColon) s = s.replace(/[-]/g, " ")
    if (!cfg.filterBracket) s = s.replace(/[()]/g, " ")
    if (!cfg.filterOther) s = s.replace(/[^)( ,.\-a-zа-яё \d]/ig, " ")

    s = s.replace(/ +$/, "")
    s = s.replace(/^ +/, "")
    s = s.replace(/ +/g, " ")

    wordLen = s.split(' ').length

    return s
}

////////////////////////////////////////////////////////////////////////////////////
// работа со слоями
///////////////////////////////////////////////////////////////////////////////////
function findNearest() {
    var err = false
    try { AM.getDocProperty('targetLayersIDs') } catch (e) { err = true }

    if (!err) {
        cfg.currentName = AM.getOrdinalLayerProperty('name')
        lrText = preProcessName()

        var lr = new AM.getCenter(AM.getOrdinalLayerProperty('bounds'), AM.getOrdinalLayerProperty('layerID')),
            txt = getTextLayerIDs(),
            minDist = []

        for (var i = 0; i < txt.length; i++) { minDist.push(new distance(lr, txt[i])) }

        minDist.sort(compareDist)

        if (minDist[0]) {

            var units = AM.getRulerUnits(),
                h = AM.getDocProperty('height'),
                w = AM.getDocProperty('width'),
                l1 = AM.getTextRect(AM.getLayerPropertyById('textKey', minDist[0].id), w, h),
                tmp = cfg.parsingOptions.split('\n'),
                txt = [];

            AM.setRulerUnits('rulerPixels')

            for (var i = 0; i < tmp.length; i++) {
                txt.push(buildLine(tmp[i]))
            }

            try { replaceTextLr(txt, minDist[0].id) } catch (e) { }

            if (cfg.allign == "bottom") {
                var l2 = AM.getTextRect(AM.getLayerPropertyById('textKey', minDist[0].id), w, h);

                AM.selectLayer(minDist[0].id)
                try { AM.moveLayer(getVector(l2.points, l1.points), l1.units) } catch (e) { }
                AM.selectLayer(lr.id)
            }

            AM.setRulerUnits(units)
        }
    }
}

function compareDist(a, b) { if (a.dist > b.dist) return 1; if (a.dist <= b.dist) return -1 }

function distance(lrA, lrB) {
    var a = lrA.X - lrB.X
    var b = lrA.Y - lrB.Y

    this.dist = Math.sqrt(a * a + b * b)

    this.bottom = lrB.bottom
    this.id = lrB.id

    return
}

function getVector(l1, l2) {
    var x1 = l2[2][0],
        x2 = l2[3][0],
        y1 = l2[2][1],
        y2 = l2[3][1],
        x3 = (l1[2][0] + l1[3][0]) / 2,
        y3 = (l1[2][1] + l1[3][1]) / 2;

    var x4 = ((x2 - x1) * (y2 - y1) * (y3 - y1) + x1 * Math.pow(y2 - y1, 2) + x3 * Math.pow(x2 - x1, 2)) / (Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)),
        y4 = (y2 - y1) * (x4 - x1) / (x2 - x1) + y1;

    return [x4 - x3, y4 - y3]
}

function getTextLayerIDs() {
    var len = AM.getDocProperty('numberOfLayers'),
        output = [];

    for (var i = 1; i <= len; i++) {
        if (AM.getLayerPropertyByIndex("layerKind", i) == 3) {
            if (maskedName(AM.getLayerPropertyByIndex("name", i)) == true) {
                if (AM.getLayerPropertyByIndex("visible", i) == true) {
                    if (isNotLocked(AM.getLayerPropertyByIndex('layerLocking', i)) == true) {
                        output.push(new AM.getCenter(AM.getLayerPropertyByIndex('bounds', i), AM.getLayerPropertyByIndex('layerID', i)))
                    }
                }
            }
        }
    }

    return output
}

function maskedName(s) {
    if (cfg.useMask == true && cfg.mask.length != 0) {
        s = s.toUpperCase()
        var tmp = cfg.mask.split(",")
        for (var i = 0; i < tmp.length; i++) {
            tmp[i] = tmp[i].replace(/ +$/, "")
            tmp[i] = tmp[i].replace(/^ +/, "")

            if (tmp[i] != "") {
                if (s.indexOf(tmp[i].toUpperCase()) >= 0) return true
            }
        }
        return false
    } else { return true }
}

function isNotLocked(d) {
    for (var i = 0; i < d.count; i++) {
        if (d.getBoolean(d.getKey(i)) == true) { return false }
    }
    return true
}

////////////////////////////////////////////////////////////////////////////////////
// замена текста, работа со стилями оформления
///////////////////////////////////////////////////////////////////////////////////
function replaceTextLr(newText, id) {
    var textKey = AM.getLayerPropertyById('textKey', id),
        styleList = textKey.getList(s2t('textStyleRange')),
        paragList = textKey.getList(s2t('paragraphStyleRange'));

    var styles = new Array(),
        parag = new Array(),
        defaultStyle;

    // преобразуем имеющийся текст в массив строк
    var sourceTextKey = textKey.getString(s2t('textKey')).split('\r');

    // определяем границы строк, слов исходного текста, исключая пробелы
    var shift = 0,
        sourceText = [],
        len = sourceTextKey.length;

    for (var i = 0; i < len; i++) {
        var tmp = (sourceTextKey[i].replace(/[\s]/g, ' ').split(' ')),
            words = [],
            wLen = tmp.length;


        for (var n = 0; n < wLen; n++) {
            if (tmp[n] != "") {
                words.push([shift, tmp[n].length + shift, [], []])
                shift = shift + tmp[n].length + 1
            } else { shift++ }
        }
        if (words.length == 0) { words.push([0, 1, [], []]) } // если текст состоял только из одних пробелов
        sourceText.push(words)
    }

    // записываем в массив границы стилей исходного текста
    for (var i = 0; i < styleList.count; i++) {
        var d = styleList.getObjectValue(i);
        var x0 = d.getInteger(s2t('from'));
        var x1 = d.getInteger(s2t('to'));
        var st = d.getObjectValue(s2t('textStyle'));

        if (styles.length > 0) {
            if (styles[styles.length - 1][0] == x0 && styles[styles.length - 1][1] == x1) {
                styles[styles.length - 1][2] == st
            } else { styles.push([x0, x1, st]) }

        } else { styles.push([x0, x1, st]) }
    }

    // записываем в массив границы абзацев исходного текста
    for (var i = 0; i < paragList.count; i++) {
        var d = paragList.getObjectValue(i);
        var x0 = d.getInteger(s2t('from'));
        var x1 = d.getInteger(s2t('to'));
        var st = d.getObjectValue(s2t('paragraphStyle'));

        if (!i && st.hasKey(s2t('defaultStyle'))) defaultStyle = st.getObjectValue(s2t('defaultStyle'));

        if (parag.length > 0) {
            if (parag[parag.length - 1][0] == x0 && parag[parag.length - 1][1] == x1) {
                parag[parag.length - 1][2] == st
            } else { parag.push([x0, x1, st]) }

        } else { parag.push([x0, x1, st]) }

        parag.push([x0, x1, st])
    }

    // сопоставляем границы стилей с интервалами слов исходного текста 
    var len = sourceText.length;
    for (var i = 0; i < len; i++) {
        for (var x = 0; x < sourceText[i].length; x++) {
            var sLen = styles.length;
            for (var n = 0; n < sLen; n++) {
                matchStyles(sourceText[i][x], styles[n].slice(), 2)
            }
            var sLen = parag.length;
            for (var n = 0; n < sLen; n++) {
                matchStyles(sourceText[i][x], parag[n].slice(), 3)
            }
        }
    }

    // подготовка нового текста к обработке
    var txt = [],
        txtStyles = [],
        txtParag = [],
        len = newText.length;


    for (var i = 0; i < len; i++) { txt.push(newText[i].replace(/[\s]/g, ' ').split(' ')) }

    // пересчитываем границы стилей с учетом длины и количества строк нов��го текста
    var shiftStyle = 0,
        shiftParag = 0,
        len = sourceText.length;

    for (var i = 0; i < len; i++) {
        if (i < txt.length) {
            shiftStyle = fitStyle(sourceText[i], txt[i].slice(), txtStyles, 2, shiftStyle)
            shiftParag = fitStyle(sourceText[i], txt[i].slice(), txtParag, 3, shiftParag)
        }
    }

    var len = txt.join('\r').length
    if (shift <= len) {
        txtStyles[txtStyles.length - 1][1] += len - shiftStyle + 1
        txtParag[txtParag.length - 1][1] += len - shiftParag + 1
    }

    txtStyles = optimizeStyle(txtStyles)
    txtParag = optimizeStyle(txtParag)

    var new_style = new ActionList();
    var new_parag = new ActionList();

    // записываем новые значения стилей текста в объект
    for (var i = 0; i < txtStyles.length; i++) {
        var d = new ActionDescriptor();
        d.putInteger(s2t('from'), txtStyles[i][0]);
        d.putInteger(s2t('to'), txtStyles[i][1]);

        if (defaultStyle) extend_descriptor(defaultStyle, txtStyles[i][2])

        d.putObject(s2t('textStyle'), s2t('textStyle'), txtStyles[i][2]);
        new_style.putObject(s2t('textStyleRange'), d);
    }

    // записываем новые значения стилей абзацев в объект   
    for (var i = 0; i < txtParag.length; i++) {
        var d = new ActionDescriptor();
        d.putInteger(s2t('from'), txtParag[i][0]);
        d.putInteger(s2t('to'), txtParag[i][1]);
        d.putObject(s2t('paragraphStyle'), s2t('paragraphStyle'), txtParag[i][2]);
        new_parag.putObject(s2t('paragraphStyleRange'), d);
    }

    // записываем стили в textKey и применяем
    textKey.putList(s2t('textStyleRange'), new_style);
    textKey.putList(s2t('paragraphStyleRange'), new_parag);

    textKey.putString(s2t('textKey'), newText.join('\r'));

    var d = new ActionDescriptor();
    d.putReference(s2t('null'), AM.getLayerReferenceById(id));
    d.putObject(s2t('to'), s2t('textLayer'), textKey);

    executeAction(s2t('set'), d, DialogModes.NO);


    // вспомогательные функции

    function matchStyles(source, style, idx) {
        // проверка на попадание в интервал, пересчет координат
        if (style[0] < source[1] && style[1] > source[0]) {
            if (style[0] < source[0]) { style[0] = source[0] }
            if (style[1] > source[1]) { style[1] = source[1] }
            style[0] = style[0] - source[0]
            style[1] = style[1] - source[0]
            source[idx].push(style)
        }
    }

    function fitStyle(style, txt, output, idx, shift) {
        var counter = output.length

        var styleCounter = 0
        var len = txt.length

        // перебираем слова исходной строки
        for (var i = 0; i < len; i++) {
            if (styleCounter >= style.length) { break; }

            var next = false
            var word = txt.shift()

            if (word.length == 0) {
                if (output.length == 0) {
                    output.push([0, 0, style[styleCounter][idx][0][2]])
                    counter++
                }
                shift++
                output[counter - 1][1]++
                continue;
            }

            for (var n = 0; n < style[styleCounter][idx].length; n++) {
                var cur = style[styleCounter][idx][n].slice()

                if (cur[0] <= word.length) {
                    if (cur[1] >= word.length) {
                        cur[1] = word.length + 1
                        next = true
                    }

                    cur[0] += shift
                    cur[1] += shift

                    output.push(cur)
                    counter++
                    if (next) { break; }
                }
            }

            if (word.length >= output[counter - 1][1] - shift) { output[counter - 1][1] = word.length + 1 + shift }

            shift = output[counter - 1][1]
            styleCounter++
        }

        if (txt.length > 0) {
            shift += txt.join(' ').length + 1
            output[counter - 1][1] += txt.join(' ').length + 1
        }

        return shift
    }

    function optimizeStyle(style) {
        var tmp = style.slice()
        var counter = 0
        style = []

        style.push(tmp[0])

        for (var i = 1; i < tmp.length; i++) {
            if (style[counter][2].isEqual(tmp[i][2])) {
                style[counter][1] = tmp[i][1]
            } else {
                style.push(tmp[i])
                counter++
            }
        }
        return style
    }


    function extend_descriptor(src_desc, dst_desc) {
        try {
            for (var i = 0; i < src_desc.count; i++) {
                var key = src_desc.getKey(i);

                if (dst_desc.hasKey(key)) continue;

                var type = src_desc.getType(key);

                switch (type) {
                    case DescValueType.ALIASTYPE: dst_desc.putPath(key, src_desc.getPath(key)); break;
                    case DescValueType.BOOLEANTYPE: dst_desc.putBoolean(key, src_desc.getBoolean(key)); break;
                    case DescValueType.CLASSTYPE: dst_desc.putClass(key, src_desc.getClass(key)); break;
                    case DescValueType.DOUBLETYPE: dst_desc.putDouble(key, src_desc.getDouble(key)); break;
                    case DescValueType.INTEGERTYPE: dst_desc.putInteger(key, src_desc.getInteger(key)); break;
                    case DescValueType.LISTTYPE: dst_desc.putList(key, src_desc.getList(key)); break;
                    case DescValueType.RAWTYPE: dst_desc.putData(key, src_desc.getData(key)); break;
                    case DescValueType.STRINGTYPE: dst_desc.putString(key, src_desc.getString(key)); break;
                    case DescValueType.LARGEINTEGERTYPE: dst_desc.putLargeInteger(key, src_desc.getLargeInteger(key)); break;
                    case DescValueType.REFERENCETYPE: dst_desc.putReference(key, src_desc.getReference(key)); break;

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
        catch (e) { throw (e); }
    }
}

////////////////////////////////////////////////////////////////////////////////////
// управление настройками программы
///////////////////////////////////////////////////////////////////////////////////
function Config() {
    this.currentName = ""
    this.useMask = false
    this.mask = ""
    this.allign = "top" // "top" "bottom"
    this.filterCyrillic = true
    this.filterLatin = true
    this.filterDigits = true
    this.filterDot = true
    this.filterComma = true
    this.filterColon = true
    this.filterBracket = true
    this.filterOther = true
    this.parsingOptions = "0\r-1"
    this.preset = ""
}

function objectToDescriptor(o) {
    var d = new ActionDescriptor;
    var l = o.reflect.properties.length;
    for (var i = 0; i < l; i++) {
        var k = o.reflect.properties[i].toString();
        if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect") continue;
        var v = o[k];
        k = app.stringIDToTypeID(k);
        switch (typeof (v)) {
            case "boolean": d.putBoolean(k, v); break;
            case "string": d.putString(k, v); break;
            case "number": d.putInteger(k, v); break;
        }
    }
    return d;
}

function descriptorToObject(o, d) {
    var l = d.count;

    for (var i = 0; i < l; i++) {
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

function s2t(s) { return stringIDToTypeID(s) }
function t2s(s) { return typeIDToStringID(s) }

function ActionManager() {
    var gLayer = s2t('layer'),
        gOrdinal = s2t('ordinal'),
        gTargetEnum = s2t('targetEnum'),
        gProperty = s2t('property'),
        gTop = s2t('top'),
        gLeft = s2t('left'),
        gBottom = s2t('bottom'),
        gRight = s2t('right'),
        gDocument = s2t('document'),
        gNull = s2t('null'),
        gSelectionModifier = s2t('selectionModifier'),
        gSelectionModifierType = s2t('selectionModifierType'),
        gAddToSelection = s2t('addToSelection'),
        gMakeVisible = s2t('makeVisible'),
        gSelect = s2t('select'),
        gRulerUnits = s2t('rulerUnits'),
        gApplication = s2t('application'),
        gUnitsPrefs = s2t('unitsPrefs'),
        gTo = s2t('to'),
        gSet = s2t('set'),
        gTransform = s2t('transform'),
        gXx = s2t('xx'),
        gXy = s2t('xy'),
        gYx = s2t('yx'),
        gYy = s2t('yy'),
        gTx = s2t('tx'),
        gTy = s2t('ty'),
        gBounds = s2t('bounds'),
        gTextClickPoint = s2t('textClickPoint'),
        gVertical = s2t('vertical'),
        gHorizontal = s2t('horizontal');

    this.getRulerUnits = function () {
        (r = new ActionReference()).putProperty(gProperty, gRulerUnits)
        r.putEnumerated(gApplication, gOrdinal, gTargetEnum);
        return t2s(executeActionGet(r).getEnumerationValue(gRulerUnits));
    }

    this.setRulerUnits = function (units) {
        (r = new ActionReference()).putProperty(gProperty, gUnitsPrefs);
        r.putEnumerated(gApplication, gOrdinal, gTargetEnum);
        (d = new ActionDescriptor).putReference(gNull, r);
        (d1 = new ActionDescriptor).putEnumerated(gRulerUnits, gRulerUnits, s2t(units));
        d.putObject(gTo, gUnitsPrefs, d1);
        executeAction(gSet, d, DialogModes.NO);
    }

    this.getTextRect = function (textKey, width, height) {
        var xx = 1,
            xy = 0,
            yx = 0,
            yy = 1,
            tx = 0,
            ty = 0;

        if (textKey.hasKey(gTransform)) {
            xx = textKey.getObjectValue(gTransform).getDouble(gXx);
            xy = textKey.getObjectValue(gTransform).getDouble(gXy);
            yx = textKey.getObjectValue(gTransform).getDouble(gYx);
            yy = textKey.getObjectValue(gTransform).getDouble(gYy);
            tx = textKey.getObjectValue(gTransform).getDouble(gTx); // not used
            ty = textKey.getObjectValue(gTransform).getDouble(gTy); // not used
        }

        var b = textKey.getObjectValue(gBounds),
            cp = textKey.getObjectValue(gTextClickPoint),
            x0 = b.getUnitDoubleValue(gLeft),
            y0 = b.getUnitDoubleValue(gTop),
            x1 = b.getUnitDoubleValue(gRight),
            y1 = b.getUnitDoubleValue(gBottom),
            tu = t2s(b.getUnitDoubleType(gTop)),
            p = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]],
            ch = cp.getUnitDoubleValue(gHorizontal),
            cv = cp.getUnitDoubleValue(gVertical);

        tx += width * ch / 100;
        ty += height * cv / 100;

        tranform(p[0], xx, xy, yx, yy, tx, ty);
        tranform(p[1], xx, xy, yx, yy, tx, ty);
        tranform(p[2], xx, xy, yx, yy, tx, ty);
        tranform(p[3], xx, xy, yx, yy, tx, ty);



        
        return { points: p, units: tu };

        function tranform(p, xx, xy, yx, yy, tx, ty) {
            var x = p[0],
                y = p[1];

            p[0] = xx * x + yx * y + tx;
            p[1] = xy * x + yy * y + ty;
        }
    }

    this.getDocProperty = function (property) {
        var ref = new ActionReference()
        ref.putProperty(gProperty, s2t(property))
        ref.putEnumerated(gDocument, gOrdinal, gTargetEnum)
        return getDescValue(executeActionGet(ref), s2t(property))
    }

    this.getLayerPropertyByIndex = function (property, index) {
        property = s2t(property)
        var ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putIndex(gLayer, index)
        return getDescValue(executeActionGet(ref), property)
    }

    this.getLayerPropertyById = function (property, id) {
        property = s2t(property)
        var ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putIdentifier(gLayer, id)
        return getDescValue(executeActionGet(ref), property)
    }

    this.getLayerReferenceById = function (id) {
        var ref = new ActionReference()
        ref.putIdentifier(gLayer, id)
        return ref
    }

    this.getOrdinalLayerProperty = function (property) {
        property = s2t(property)
        var ref = new ActionReference()
        ref.putProperty(gProperty, property)
        ref.putEnumerated(gLayer, gOrdinal, gTargetEnum)
        return getDescValue(executeActionGet(ref), property)
    }

    this.getCenter = function (bounds, id) {
        var top = bounds.getDouble(gTop)
        var left = bounds.getDouble(gLeft)
        this.bottom = bounds.getDouble(gBottom)
        var right = bounds.getDouble(gRight)

        this.id = id
        this.X = left + (right - left) / 2
        this.Y = top + (this.bottom - top) / 2

        return
    }

    this.selectLayer = function (ID, add) {
        add = (add == undefined) ? add = false : add

        var ref = new ActionReference()
        var desc = new ActionDescriptor()

        ref.putIdentifier(gLayer, ID)
        desc.putReference(gNull, ref)

        if (add) {
            desc.putEnumerated(gSelectionModifier, gSelectionModifierType, gAddToSelection)
        }
        desc.putBoolean(gMakeVisible, false)
        executeAction(gSelect, desc, DialogModes.NO)
    }

    this.moveLayer = function (offset, units) {
        var ref = new ActionReference()
        var desc = new ActionDescriptor()

        ref.putEnumerated(gLayer, gOrdinal, gTargetEnum)
        desc.putReference(gNull, ref)

        var d1 = new ActionDescriptor();
        d1.putUnitDouble(gHorizontal, p = s2t(units), offset[0]);
        d1.putUnitDouble(gVertical, p, offset[1]);
        desc.putObject(gTo, s2t("offset"), d1);
        executeAction(s2t("move"), desc, DialogModes.NO);
    }

    function getDescValue(desc, property) {

        switch (desc.getType(property)) {
            case DescValueType.OBJECTTYPE:
                return (desc.getObjectValue(property));
                break;
            case DescValueType.LISTTYPE:
                return desc.getList(property);
                break;
            case DescValueType.REFERENCETYPE:
                return desc.getReference(property);
                break;
            case DescValueType.BOOLEANTYPE:
                return desc.getBoolean(property);
                break;
            case DescValueType.STRINGTYPE:
                return desc.getString(property);
                break;
            case DescValueType.INTEGERTYPE:
                return desc.getInteger(property);
                break;
            case DescValueType.LARGEINTEGERTYPE:
                return desc.getLargeInteger(property);
                break;
            case DescValueType.DOUBLETYPE:
                return desc.getDouble(property);
                break;
            case DescValueType.ALIASTYPE:
                return desc.getPath(property);
                break;
            case DescValueType.CLASSTYPE:
                return desc.getClass(property);
                break;
            case DescValueType.UNITDOUBLE:
                return (desc.getUnitDoubleValue(property));
                break;
            case DescValueType.ENUMERATEDTYPE:
                return (t2s(desc.getEnumerationValue(property)));
                break;
            case DescValueType.RAWTYPE:
                var tempStr = desc.getData(property);
                var rawData = new Array();
                for (var tempi = 0; tempi < tempStr.length; tempi++) {
                    rawData[tempi] = tempStr.charCodeAt(tempi);
                }
                return rawData;
                break;
            default:
                break;
        };
    }
}

function Preset() {

    function stringToObject(arr) {
        var a = arr.split('\v'),
            s = {};

        s.currentName = String(a[0])
        s.filterCyrillic = a[1] == "true" ? true : false
        s.filterLatin = a[2] == "true" ? true : false
        s.filterDigits = a[3] == "true" ? true : false
        s.filterDot = a[4] == "true" ? true : false
        s.filterComma = a[5] == "true" ? true : false
        s.filterColon = a[6] == "true" ? true : false
        s.filterBracket = a[7] == "true" ? true : false
        s.filterOther = a[8] == "true" ? true : false
        s.parsingOptions = String(a[9])

        s.useMask = false
        s.mask = ""
        s.allign = "top" // "top" "bottom"

        return s
    }

    this.settingsToPreset = function (s) {
        var p = new PresetObject(),
            d = new ActionDescriptor();
        for (var a in p) { p[a] = s[a] }
        d.putObject(s2t('options'), s2t('preset'), objectToDescriptor(p))
        return d.getObjectValue(s2t('options'))
    }

    this.presetToSettings = function (p) {
        var o = {}
        descriptorToObject(o, p)
        for (var a in o) { cfg[a] = o[a] }
    }

    this.items = getPresetList()

    this.items.getByName = function (s) {
        var key = s2t(s)
        return this.hasKey(key) ? this.getObjectValue(key) : null
    }

    this.items.add = function (n, p) {
        this.putObject(s2t(n), s2t('preset'), p)
        saveToFile(this)
    }

    this.items.delete = function (s) {
        this.erase(s2t(s))
        saveToFile(this)
    }

    function getPresetList() {
        var fle = new File(app.preferencesFolder + "/" + strMessage + ".desc")
        if (!fle.exists) {
            try {
                // конвертация старого формата в новый
                var d = app.getCustomOptions('ART'),
                    p = new ActionDescriptor();

                for (var i = 0; i < d.count; i++) {
                    var o = new stringToObject(d.getString(d.getKey(i)))
                    p.putObject(d.getKey(i), s2t('preset'), objectToDescriptor(o))
                }
                saveToFile(p)
            } catch (e) { }
        }
        return getFromFile()
    }

    function getFromFile() {
        var d = new ActionDescriptor(),
            fle = new File(app.preferencesFolder + "/" + strMessage + ".desc");
        try {
            if (fle.exists) {
                fle.open('r')
                fle.encoding = 'BINARY'
                var s = fle.read()
                fle.close;
                d.fromStream(s);
            }
            var a = [];
            for (var i = 0; i < d.count; i++) {
                a.push(t2s(d.getKey(i)))
            }

            a.sort(sortPresets)

            var p = new ActionDescriptor();
            for (var i = 0; i < d.count; i++) {
                var cur = s2t(a[i])
                p.putObject(cur, s2t('preset'), d.getObjectValue(cur))
            }
        } catch (e) { alert('Ошибка при загрузке файла пресетов!', '', 1) }

        return p

        function sortPresets(a, b) {
            if (a > b) { return 1 } else { return -1 }
        }
    }

    function saveToFile(d) {
        var fle = new File(app.preferencesFolder + "/" + strMessage + ".desc");
        try {
            fle.open('w')
            fle.encoding = 'BINARY'
            fle.write(d.toStream())
            fle.close()
            return true
        } catch (e) { alert(e, '', 1) }
        return false
    }

    this.checkPresetIntegrity = function (w) {
        var dlPreset = w.children[1].children[0].children[0],
            bnRefresh = w.children[1].children[0].children[1],
            bnSave = w.children[1].children[0].children[2];

        if (dlPreset.selection.index > 0) {
            bnRefresh.enabled = bnSave.enabled = PS.settingsToPreset(cfg).isEqual(PS.items.getByName(dlPreset.selection.text)) ? false : true
        } else { bnSave.enabled = false; bnRefresh.enabled = true }
    }

    PresetObject = function () {
        this.currentName = ''
        this.useMask = false
        this.mask = ""
        this.allign = "top" // "top" "bottom"
        this.filterCyrillic = true
        this.filterLatin = true
        this.filterDigits = true
        this.filterDot = true
        this.filterComma = true
        this.filterColon = true
        this.filterBracket = true
        this.filterOther = true
        this.parsingOptions = "0\r-1"
    }
}
