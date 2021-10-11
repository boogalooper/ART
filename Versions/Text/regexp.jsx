inFileName = "2;Корнеева Ольга Борисовна;16-1555;img_6000.tif"

/*inFileName = inFileName.replace(/[a-z0-9]/g, "_");  // '/\:*?"<>|' -> '-'/
inFileName = inFileName.replace(/[^А-я ]/g, "")
$.write (inFileName)
inFileName=inFileName.split (" ")
$.write (inFileName)
inFileName=trim(inFileName)
$.write (inFileName)
*/

inFileName=getColumns (inFileName, ";")
numOrTxt (inFileName)
/*
function trim (strArr)
{
    tmp = []
    for (var i=0; i<strArr.length; i++)
    {if (strArr[i] != "") tmp.push (strArr[i]) }
    return tmp
}
*/
function getColumns (strArr, div)
{
    tmp = []
    tmp = strArr.split (div)
    return tmp
}

function numOrTxt (strArr)
{
    var tmp
    var isNum
    for (var i=0; i<strArr.length; i++)
   {
       tmp = strArr[i].length*0.6
       $.write (tmp + " ")
       isNum = strArr[i].replace(/[0-9]/g, "")
       $.write (isNum.length  + " ")
       if (isNum.length<tmp) {$.write (strArr[i] + " num\r") } else {$.write (strArr[i] + " str\r")}
    }
}