var csvFile = getCSV()

// пытаемся разбить таблицу автоматически
var cursor = 0 //позиция в CSV файле для окон
var fltr = false
var type = getTypeOfRow (csvFile) // определяем тип столбцов
var csvArray = splitStr (csvFile, type) //  разбиваем строковые значения на слова
getKindOfRow (csvArray, type) // пытаемся определить, где фамилии, а где должности
csvFilter (csvArray, type, fltr) // фильтруем символы, если БЫЛА такая настройка при прошлом запуске

if (checkIntegrity (csvArray, type) == true) //проверка на целостность, если всё ок то выводим окно, если нет то редактирование вручную
{
    for (var i=0; i<csvArray.length; i++) //формируем строковый массив для основного окна
    {
        csvArray[i] = preProcessCSV (csvArray[i], type)
    }
        $.write ("открываем основное окно\n")
    }
else
{
        $.write ("открываем окно редактирования\n")
        var w = editDlg()
        if (w.show() == 0) 
        {
            csvFilter (csvArray, type, fltr); 
        for (var i=0; i<csvArray.length; i++) //формируем строковый массив для основного окна
        {
            csvArray[i] = preProcessCSV (csvArray[i], type)
        }
        $.write ("открываем основное окно\n")
    }
        
        
 }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////                        функции для работы с CSV                             ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function preProcessCSV (strArr, typeArr)
{
    var newStrArr = new desc ()
    for (var i=0; i<typeArr.length; i++)
    {
        switch (typeArr[i])
        {
            case "name":
            var tmp = strArr[i]
            for (var x = 0; x < tmp.length; x++)  {if (tmp[x] != "") newStrArr.name.push(tmp[x]);}
            break;
            case "sign":
            var tmp = strArr[i]
            for (var x = 0; x < tmp.length; x++)  {if (tmp[x] != "") newStrArr.sign.push(tmp[x]);}
            break;
            case "number":
            if (strArr[i] != "") newStrArr.number.push(strArr[i])
            break;
        }
    }   
    function desc ()
    {
            this.name=[]
            this.sign=[]
            this.number=[]
            return
    }

return newStrArr
}

function getCSV ()
{
    dataFile = File.openDialog('Файл со списком:','*.csv', false) // добавить сохранение каталога, мультиплатформенность по книге

    if (dataFile!= null && dataFile.exists)
    {
        var csv = [] 
        dataFile.open('r');    
            while (!dataFile.eof)
            {    
                strLineIn = dataFile.readln() 
                csv.push (strLineIn)
             }
            dataFile.close()
            var div = detectDiv (csv)
            for (var i=0; i<csv.length; i++) {csv[i]=split(csv[i], div)}
    }

    function detectDiv (strArr)
    {
         var tmp = [0,0,0,0]
         for (var i = 0; i < strArr.length; i++)
         {
             for (var x=0; x<tmp.length;x++)
             {
                 var a = strArr[i]
                 switch (x)
                 {
                     case 0: var b = strArr[i].replace(/\t/g, ""); break;
                     case 1: var b = strArr[i].replace(/;/g, ""); break;
                     case 2: var b = strArr[i].replace(/,/g, ""); break;
                     case 3: var b = strArr[i].replace(/|/g, ""); break;
                  }
                 tmp[x]+=a.length - b.length
             }  
         }
                   switch (max(tmp))
                 {
                     case 0: return '\t'; break; // tab
                     case 1: return ';'; break;
                     case 2: return ','; break;
                     case 3: return '|'; break;
                  }
              
        function max (arr)
        {
            var tmp = [0,0]
            for (var i = 0; i < arr.length; i++) {if (arr[i]>tmp[0]) {tmp[0] = arr[i]; tmp[1]=i}}      
            return tmp[1]
        }
    }

    function split (line, div)
    {
        var tmp = []
        while (true)
        {
             if (line.indexOf ('"', 0) ==0 & line.indexOf ('"', 1) >0) 
            {
                line=line.substr(1, line.length)
                tmp.push (line.substr(0, line.indexOf ('"', 0)))
                line = line.substr (line.indexOf ('"', 0)+1) 
                if (line.indexOf (div, 0) != -1) {continue} else {break}
            }
        
        if (line.indexOf (div, 0) != -1) 
        {
            tmp.push (line.substr (0, line.indexOf (div, 0)))
            line = line.substr (line.indexOf (div, 0)+1)
            } else {
                tmp.push (line)
                break
            }
        
        }
    return tmp
    }

return csv
}

function getTypeOfRow (strArr)
{
    var typeCounter = []
    for (var i=0; i<strArr[0].length; i++) {typeCounter.push (new desc)}

    for (var i=0; i<strArr.length; i++)
    {
        var tmp = strArr[i]
        for (var x = 0; x< strArr[i].length; x++)
        {
            determineTypeOfRow (tmp[x], typeCounter[x])
        }
    }

    function desc ()
    {
            this.str=0
            this.num=0
            this.err=0
            return
    }

    function determineTypeOfRow (strArr, type)
    {
        if (strArr.length>0)
        {
        var tmp
        var isNum
        tmp = strArr.length*0.6
        isNum = strArr.replace(/[0-9]/g, "")
        if (isNum.length<tmp) { type.num++} else {type.str++}
        } else type.err++
        return desc
    }


    for (var i=0; i<strArr[0].length; i++) 
    {
        typeCounter[i].str=Math.round (typeCounter[i].str/strArr.length*100)
        typeCounter[i].num=Math.round (typeCounter[i].num/strArr.length*100)
        typeCounter[i].err=Math.round (typeCounter[i].err/strArr.length*100)
    }

    for (var i=0; i< typeCounter.length; i++)
    {
        if (typeCounter[i].num > typeCounter[i].str) { typeCounter[i]="number"} else { typeCounter[i]="str"}
     }
    return  typeCounter
}


function getKindOfRow (strArr, typeArr)
{
for (var i = 0;  i< typeArr.length; i++)
{
    var nm = 0
    var dz = 0
    
    if (typeArr[i]=="str")
    {
        for (var x =0; x<strArr.length; x++)
        {
            var a = strArr[x]
            a =a[i]
            
            var f = 0
            var d = 0
            
            for (var z = 0; z < a.length; z++)
            {
                 var tmpF= a[z].replace (/[^А-ЯA-Z]/g, "")
                 var tmpD= a[z].replace (/[^a-zа-я]/g, "")
                 if (a[z].indexOf (tmpF, 0)==0 && tmpF !="") {f++} else {if (tmpD != "") {if (a[z].indexOf (tmpD, 0)==0 || a[z].indexOf (".", 0) != -1 || a[z].indexOf (",", 0) != -1 ) {d++} }}
            }
           if (a.length <=3 && d == 0 && f > 0) nm++ else {if (d>0) dz++}
        }
    }
   if (nm > dz*3 ) typeArr[i]="name" else {if (dz >0) typeArr[i]="sign"}

  //  $.write (typeArr[i] + '\n') 
    }
    return typeArr
}

function csvFilter (strArr, typeArr, filter)
{
    if (filter !=false)
    {
    for (var i =0; i<strArr.length; i++)
    {
        for (var x = 0; x<typeArr.length; x++)
        {
            if (typeArr[x]=="name" || typeArr[x]=="sign" )
            {
                var tmp = strArr[i]
                var a = tmp [x]
                for (var z = 0; z< a.length; z++)
                {
                    if (typeArr[x]=="name" ) a[z] = a[z].replace(/[^А-яA-z-]/g, "")
                    if (typeArr[x]=="sign" ) a[z] = a[z].replace(/[^А-яA-z-.,]/g, "")
                 }
                
                   var b = []
                   for (var z = 0; z< a.length; z++)
                {
                   if (a[z]!="") b.push (a[z])
                 }
                    tmp [x] = b
             }   
         }   
    }
}
return strArr
}

function splitStr (strArr, typeArr, filterCyr)
{    
    
    var newArr = []
    for (var i=0; i<strArr.length; i++)
    {
        var a = strArr[i].concat ()
        for (var x=0; x< typeArr.length; x++)
        {
            if (typeArr[x] == "str")
            {  
               a[x] = splitName (a[x])
            }
     }
               newArr.push (a)
    }

    function splitName (str)
    {
       str = str.split (" ")
       var tmp = []
       for (var i=0; i<str.length; i++) 
       { if (str[i]!="") tmp.push (str[i])}
       str = tmp
       return str
    }
return newArr
}

function checkIntegrity (strArr, typeArr)
{
    var nCounter = 0
    var sCounter = 0
    for (var i=0; i < typeArr.length; i++)
    {
        if (typeArr[i]=="name") nCounter++
        if (typeArr[i]=="sign") sCounter++
    }

    if (nCounter > 1)
    {
        var a = 0
        for (var i=0; i < strArr.length; i++)
        {
            var b = 0
            for (var x=0; x < typeArr.length; x++)
              {
                      if (type[x]=="name") 
                       {
                           var tmp = strArr[i]
                           b+= tmp[x].length                   
                       }
              }
          
          if (b>a) a=b
        }

        if (a <=3) {return true} else {return false}
    }
return true
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////                         окно редактирования csv                               ////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function editDlg ()
{
var dialog =  new Window("dialog"); 
    dialog.text = "Редактирование таблицы"; 
    dialog.orientation = "column"; 
    dialog.alignChildren = ["center","top"]; 
    dialog.spacing = 10; 
    dialog.margins = 16; 

// GROUP1
// ======
var group1 = dialog.add("group"); 
    group1.orientation = "row"; 
    group1.alignChildren = ["left","center"]; 

var button1 = group1.add("button"); 
    button1.text = "<<"; 
    button1.justify = "center"; 
    button1.preferredSize.width = 40; 

var statictext1 = group1.add('statictext {text: "0/0", characters: 7, justify: "center"}'); 
    
var button2 = group1.add("button"); 
    button2.text = ">>"; 
    button2.justify = "center"; 
    button2.preferredSize.width = 40; 

// PANEL1
// ======
var panel1 = dialog.add("panel"); 
    panel1.text = "Сопоставление типов данных полям таблицы"; 
    panel1.orientation = "column"; 
    panel1.alignChildren = ["left","top"]; 
    panel1.spacing = 10; 
    panel1.margins = [5,20,20,20]

// GROUP2
// ======
var txt = []
var drop = []
var newType = []

for (var i = 0; i <type.length; i++)
{
var group = panel1.add("group"); 
    group.orientation = "row"; 
    group.alignChildren = ["left","center"]; 
    group.spacing = 10; 
    group.margins = 0; 
   
var statictext2 = group.add('statictext {characters: 2, justify: "right"}'); 
statictext2.text = i + 1+'.'

var edittext = group.add("edittext"); 
    edittext.preferredSize.width = 200; 
    edittext.preferredSize.height = 23; 

var dropdown = group.add("dropdownlist", undefined, ["фио", "подпись", "номер файла", "-", "не используется"]); 
    dropdown.preferredSize.width = 120; 
    dropdown.preferredSize.height = 23; 
    dropdown.onChange = function () {if (dialog.visible) {renewType (); getCsvFields (cursor)}}
    
txt.push (edittext)
drop.push (dropdown)
}

var group4 = panel1.add("group"); 
group4.margins = [23,5,0,0]
var checkbox1 = group4.add("checkbox"); 
        checkbox1.text = "очищать ФИО и подписи от мусора"; 
    
// GROUP3
// ======
var group3 = dialog.add("group"); 
    group3.orientation = "row"; 
    group3.alignChildren = ["left","center"]; 
    group3.spacing = 10; 
    group3.margins = 0; 

var button3 = group3.add("button",undefined, undefined, {name: "ok"}); 
    button3.text = "Сохранить"; 
    button3.justify = "center"; 

var button4 = group3.add("button",undefined, undefined, {name: "cancel"}); 
    button4.text = "Отмена"; 
    button4.justify = "center"; 

checkbox1.onClick = function () {getCsvFields (cursor); fltr=this.value}

button1.onClick = function ()
{
    if (cursor >=1) cursor--
    getCsvFields (cursor)
}

button3.onClick = function ()
{
     for (var i=0; i<newType.length; i++){type[i]=newType[i]}
     dialog.close ()
}

button2.onClick = function ()
{
    if (cursor < csvFile.length-1) cursor++
    getCsvFields (cursor)
}

dialog.onShow = function ()
{
    for (var i = 0; i<type.length; i++)
    {
        switch (type[i])
        {
            case "name": drop[i].selection=0; newType.push ("name"); break;
            case "sign": drop[i].selection=1;  newType.push ("sign");break;
            case "number": drop[i].selection=2; newType.push ("number"); break;
            default: drop[i].selection=4;  newType.push ("del"); break;        
        }
    }
    checkbox1.value = fltr 
    getCsvFields (cursor)
}
    
function getCsvFields (cursor)
{
    var tmp = csvFile[cursor]
    for (var i = 0; i<newType.length; i++)
    {
        if (checkbox1.value) 
        {
            if (newType[i]=="sign" || newType[i]=="name")
            {
            var a = csvFile[cursor].concat ()
            a = a[i].split (" ")
            txt[i].text= ""
                for (var x = 0; x < a.length; x++)
                { 
                    switch (newType[i])
                    {
                    case "name": if (a[x]!= "") {if (a[x].replace(/[^А-яA-z-]/g, "") != "") {txt[i].text=txt[i].text + a[x].replace(/[^А-яA-z-]/g, "")  + ' '}}; break;
                    case "sign": if (a[x]!= "") {if (a[x].replace(/[^А-яA-z-,.]/g, "") != "") {txt[i].text=txt[i].text + a[x].replace(/[^А-яA-z-,.]/g, "")  + ' '}}; break;
                    }
                 }
            }
        }   else {txt[i].text = tmp[i]} 
    }
        statictext1.text = cursor+1 + "/" + csvFile.length
}

function renewType ()
{
       for (var i = 0; i<newType.length; i++)
    {
        switch (drop[i].selection.index)
        {
            case 0: newType[i] ="name"; break;
            case 1: newType[i] ="sign";break;
            case 2: newType[i] ="number"; break;
            case 4: newType[i] ="del"; break;             
        }
    }
    $.write (newType + '\n')
}
 return dialog
}