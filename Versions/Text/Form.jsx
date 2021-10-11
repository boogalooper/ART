/* 
Code for Import https://scriptui.joonas.me — (Triple click to select): 
{"activeId":5,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"text":"Редактирование полей таблицы","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Group","parentId":0,"style":{"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-2":{"id":2,"type":"Button","parentId":1,"style":{"text":"<<","justify":"center","preferredSize":[0,0],"alignment":null}},"item-4":{"id":4,"type":"Button","parentId":1,"style":{"text":">>","justify":"center","preferredSize":[0,0],"alignment":null}},"item-5":{"id":5,"type":"StaticText","parentId":1,"style":{"text":"0/0","justify":"left","preferredSize":[0,0],"alignment":null}},"item-6":{"id":6,"type":"Group","parentId":14,"style":{"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-7":{"id":7,"type":"EditText","parentId":6,"style":{"text":"","preferredSize":[200,23],"alignment":null}},"item-8":{"id":8,"type":"DropDownList","parentId":6,"style":{"text":"","listItems":"","preferredSize":[100,23],"alignment":null,"selection":0}},"item-9":{"id":9,"type":"Group","parentId":0,"style":{"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-10":{"id":10,"type":"Button","parentId":9,"style":{"text":"Сохранить","justify":"center","preferredSize":[0,0],"alignment":null}},"item-11":{"id":11,"type":"Button","parentId":9,"style":{"text":"Отмена","justify":"center","preferredSize":[0,0],"alignment":null}},"item-13":{"id":13,"type":"Checkbox","parentId":14,"style":{"text":"Только кириллические символы в ФИО","preferredSize":[0,0],"alignment":null}},"item-14":{"id":14,"type":"Panel","parentId":0,"style":{"text":"Поля таблицы","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}}},"order":[0,1,2,5,4,14,6,7,8,13,9,10,11]}
*/ 

// DIALOG
// ======
var w = new editDlg()
w.show()

function editDlg ()
{
var dialog =  new Window("dialog"); 
    dialog.text = "Редактирование полей таблицы"; 
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

var statictext1 = group1.add("statictext"); 
    statictext1.text = "  0/0  "; 
    
var button2 = group1.add("button"); 
    button2.text = ">>"; 
    button2.justify = "center"; 

// PANEL1
// ======
var panel1 = dialog.add("panel"); 
    panel1.text = "Поля таблицы"; 
    panel1.orientation = "column"; 
    panel1.alignChildren = ["left","top"]; 
    panel1.spacing = 10; 
    panel1.margins = 10; 

// GROUP2
// ======
var txt = []
var drop = []
for (var i = 0; i <10; i++)
{
 var group = panel1.add("group"); 
    group.orientation = "row"; 
    group.alignChildren = ["left","center"]; 
    group.spacing = 10; 
    group.margins = 0; 
   
var edittext = group.add("edittext"); 
    edittext.preferredSize.width = 200; 
    edittext.preferredSize.height = 23; 

var dropdown = group.add("dropdownlist", undefined); 
    dropdown.selection = 0; 
    dropdown.preferredSize.width = 100; 
    dropdown.preferredSize.height = 23; 
    
txt.push (edittext)
drop.push (dropdown)
}

for (var i = 0; i <10; i++)
{
txt[i].text = String (i)
}

// PANEL1
// ======
var checkbox1 = panel1.add("checkbox"); 
    checkbox1.text = "Только кириллические символы в ФИО"; 

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
    
 return dialog
}