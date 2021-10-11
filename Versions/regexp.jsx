var s = ".,:.!Gdfgвасяdfg....;"
var reg = new RegExp ("[\\.,!:;^a-z]","ig")


$.writeln (s.replace (reg, "#"))