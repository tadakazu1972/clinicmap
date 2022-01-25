// 関数を定義

(function($){
	
 	$.fn.functions = function(options){

		/* --------------------------------------
		   引数の宣言
		----------------------------------------- */
		var options = $.extend({
		}, options);

		/* --------------------------------------
		   public 関数の宣言
		----------------------------------------- */

		$.fn.functions.isType = function(x) { // データ型判定関数
			return (x != x)? "NaN": (x === Infinity || x === -Infinity)? "Infinity": Object.prototype.toString.call(x).slice(8, -1);
		}

		$.fn.functions.isNumber = function(val) { // 0以上の整数のみを判定
			let regexp = new RegExp(/^[0-9]+(\.[0-9]+)?$/);
			return regexp.test(val);
		}

		$.fn.functions.isUrl = function( str ) { // 文字列がURLか判定

			let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name	
				'((\\d{1,3}\\.){3}\\d{1,3})|'+ // OR ip (v4) address
				'((([\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]|[ぁ-んァ-ヶ])*)\\.)+[a-z]{2,})'+ // OR japanese url
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
				'(\\#.*)?$','i'); // fragment locator
			return !!pattern.test(str);
		}

		$.fn.functions.isTel = function( str ) {  // 文字列が電話番号か判定
			let judge = true;
			let tel = str.replace(/[━.*‐.*―.*－.*\-.*ー.*|　.*]/gi,'');
			if( tel ) tel = tel.match( /\+?[0-9]+[\-\x20]?[0-9]+[\-\x20]?[0-9]+[\-\x20]?[0-9]+/g )[0];
			if ( !tel.match(/^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/) ) judge = false;
			return judge;
		}

		$.fn.functions.isDebug = function() {
			let res = (location.hostname != global.params.hostname);
			let param = $.fn.functions.getParam('debug');
			if (param) {
				if (param == 'true') {
					res = true;
				} else if (param == 'false') {
					res = false;
				}
			}
			return res;
		}
		
		$.fn.functions.isSmartDevice = function() { // クライアントがスマートデバイスの場合にTrueを返す
			if ( navigator.userAgent.match(/(iPhone|iPad|iPod|Android.+Mobile)/) ) {
				return true;
			} else {
				return false;
			}
		}

		$.fn.functions.getDate = function( year, month, day, hour, minute, seconds ) { // 現在の年月日分時間秒を返す
			const date = new Date();
			let nowDate = '';
			if( year ) nowDate += String( date.getFullYear() );
			if( month ) nowDate += String( ( '0' + ( date.getMonth() + 1 ) ).slice( -2 ) );
			if( day ) nowDate += String( ( '0' + date.getDate() ).slice( -2 ) );
			if( hour ) nowDate += String( ( '0' + date.getHours() ).slice( -2 ) );
			if( minute ) nowDate += String( ( '0' + date.getMinutes() ).slice( -2 ) );
			if( seconds ) nowDate += String( ( '0' + date.getSeconds() ).slice( -2 ) );
			return nowDate;
		}

		$.fn.functions.datetime = {
			_fmt : {
				hh: function(date) { return ('0' + date.getHours()).slice(-2); },
				h: function(date) { return date.getHours(); },
				mm: function(date) { return ('0' + date.getMinutes()).slice(-2); },
				m: function(date) { return date.getMinutes(); },
				ss: function(date) { return ('0' + date.getSeconds()).slice(-2); },
				dd: function(date) { return ('0' + date.getDate()).slice(-2); },
				d: function(date) { return date.getDate(); },
				s: function(date) { return date.getSeconds(); },
				yyyy: function(date) { return date.getFullYear() + ''; },
				yy: function(date) { return date.getYear() + ''; },
				t: function(date) { return date.getDate()<=3 ? ["st", "nd", "rd"][date.getDate()-1]: 'th'; },
				w: function(date) {return ["Sun", "$on", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]; },
				MMMM: function(date) { return ["January", "February", "$arch", "April", "$ay", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()]; },
				MMM: function(date) {return ["Jan", "Feb", "$ar", "Apr", "$ay", "Jun", "Jly", "Aug", "Spt", "Oct", "Nov", "Dec"][date.getMonth()]; },  
				MM: function(date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
				M: function(date) { return date.getMonth() + 1; },
				$: function(date) {return 'M';}
			},
			_priority : ["hh", "h", "mm", "m", "ss", "dd", "d", "s", "yyyy", "yy", "t", "w", "MMMM", "MMM", "MM", "M", "$"],
			_dateTimeFormatString : 'yyyy/MM/dd hh:mm:ss',
			
			// Dateを文字列に変換して返す
			format: function format(date, _format) {
				var _this = this;
				if (_format == undefined) {_format = this._dateTimeFormatString;}
				return this._priority.reduce(function (res, fmt) {
				return res.replace(fmt, _this._fmt[fmt](date));
				}, _format);
			},

			// 年月日を文字列に変換して返す
			dateString: function dateString(target) {
				var d;
				if ($.fn.functions.isType(target) == 'String') {
					d = new Date(target);
				} else if($.fn.functions.isType(target) == 'Date') {
					d = target;
				} else {
					return "";
				}
				res = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
				return res;
			},

			// 日付+時刻を文字列に変換して返す
			dateTimeString: function dateTimeString(target) {
				var d;
				if ($.fn.functions.isType(target) == 'String') {
					d = new Date(target);
				} else if($.fn.functions.isType(target) == 'Date') {
					d = target;
				} else {
					return "";
				}
				res = $.fn.functions.datetime.dateString(d);
				res = res + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				return res;
			}

		}

		$.fn.functions.showErrorDialog = function( errorNum ) {  // エラーメッセージ表示
			$("#dialog-title").html('<h2 class="uk-h5">' + global.errorDialog[errorNum]["title"] + '</h2>');
			$("#dialog-body").html(global.errorDialog[errorNum]["description"]);
			$("#dialog-button-close").html('閉じる');
			UIkit.modal("#dialog").show();
		}
		
		$.fn.functions.setClientClass = function() { // body要素にclientを表すclassをセットする

			var client_js_ua = window.navigator.userAgent.toLowerCase();
			var client_js_selector = "body";
			function client_js_addClass(className) {
				$(client_js_selector).addClass(className);
				return;
			}
			function client_js_removeClass(className) {
				$(client_js_selector).removeClass(className);
				return;
			}

			// browser
			if(client_js_ua.indexOf("edge") !== -1 || client_js_ua.indexOf("edga") !== -1 || client_js_ua.indexOf("edgios") !== -1) {
				client_js_addClass("edge");
			} else if(client_js_ua.indexOf("chrome") !== -1 || client_js_ua.indexOf("crios") !== -1) {
				client_js_addClass("chrome");
			} else if(client_js_ua.indexOf("firefox") !== -1 || client_js_ua.indexOf("fxios") !== -1) {
				client_js_addClass("firefox");
			} else if(client_js_ua.indexOf("safari") !== -1) {
				client_js_addClass("safari");
			} else if (client_js_ua.indexOf("msie") !== -1 || client_js_ua.indexOf("trident") !== -1) {
				client_js_addClass("ie");
			} else if (client_js_ua.indexOf("line") !== -1) {
				client_js_addClass("line");
			}
			
			// os
			if(client_js_ua.indexOf("windows nt") !== -1) {
				client_js_addClass("win");
			} else if(client_js_ua.indexOf("android") !== -1) {
				client_js_addClass("android");
			} else if(client_js_ua.indexOf("iphone") !== -1 || client_js_ua.indexOf("ipad") !== -1) {
				client_js_addClass("ios");
			} else if(client_js_ua.indexOf("mac os x") !== -1) {
				client_js_addClass("mac");
			}

			// device
			function client_js_setWindowSize() {
				var _devices = ["phone", "tablet", "pc"];
				for (var i = 0; i < _devices.length; i++) {
					client_js_removeClass(_devices[i]);
				}
				if (window.innerWidth <= 639) {
					client_js_addClass(_devices[0]);
				} else if (window.innerWidth <= 1199) {
					client_js_addClass(_devices[1]);
				} else {
					client_js_addClass(_devices[2]);
				}
			}
			$(window).resize(client_js_setWindowSize);
			client_js_setWindowSize();

		}

		$.fn.functions.getData = function(urlArray, fnSucceed, fnFailed) {
			let db = new CsvDatabase(urlArray);
			db.download(
				function(){
					global.data = db.tables;
					fnSucceed();
				}, 
				function(){
					fnFailed();
				}
			);
		}
		
		$.fn.functions.getParam = function (name, url) {
			if (!url) url = window.location.href;
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		}
	}
})(jQuery);

// use: var db = new CsvDatabase(["csv/csvfile1.csv", "csv/csvfile2.csv", "csv/csvfile3.csv", ...]);
function CsvDatabase(csvFileNamesArray) {
    this.tables = {};
    this.tableNames = [];
    for (var i = 0; i < csvFileNamesArray.length; i++) {
        var fileName = String(csvFileNamesArray[i]);
		var buf = fileName.split('/');
		var tableName = String(buf[buf.length - 1]).replace('.csv', '');
        this.tables[tableName] = new Csv(true, fileName);
        this.tableNames[i] = tableName;
    }
}
CsvDatabase.prototype = {
    download: function(succeed, failed) {
        var _this = this;
        var requests = [];
        for (var _table in _this.tables) {
            requests.push(_this.tables[_table].download());
        }
        $.when.apply($, requests)
        .done(function() {
			if (_this.tableNames.length == 0) {
				_this.tables[_table].data(arguments[0]);
			} else {
				for (var _table in _this.tables) {
					var _tableIndex = _this.tableNames.indexOf(_table);
					if (_this.tableNames.length == 1) {
						_this.tables[_table].data(arguments[0]);
					} else {
						_this.tables[_table].data(arguments[_tableIndex][0]);
					}
				}
			}
            if (succeed) {succeed(arguments);}
        })
        .fail(function(err) {
            if (failed) {failed(err);}
        });
    }
};

// use: var csv = new Csv(is_nocache, "csvfilename.csv");
function Csv(is_nocache, name) {
    // version
    if (is_nocache) {
        this.version = "?version=" + $.fn.functions.datetime.format(new Date(), "yyyyMMddhhmm");
    } else {
        this.version = "";
    }
    // name
    this.name = name + this.version;
    // data
    this._data = null;
}
Csv.prototype = {
    name: function() {return this.name;},
    data: function(data) {
        if (data) {
            this._data = $.csv.toArrays(data);
            return false;
            // readCsvData();
        } else {
            return this._data;
        }
    },
    text: function(row, col) {
        try {
            function csv_cleansing_string(s) {
                s = String(s);
                s = s.replace(/\n/g, '');
                s = s.replace(/'/g, '');
                s = s.replace(/"/g, '');
                s = s.replace(/</g, '');
                s = s.replace(/>/g, '');
                s = s.replace(/：/g, ':');
                s = s.replace(/　/g, ' ');
				/*
                s = s.replace(/（/g, '(');
                s = s.replace(/）/g, ')');
				*/
                s = s.replace(/－/g, '-');
                s = s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 65248);});
                return s;
            }
            return csv_cleansing_string(this.data()[row][col]);
        } catch(e) {
            // console.log(e);
            return null;
        }
    },
    html: function(row, col) {
        try {
            function csv_cleansing_string(s) {
                s = String(s);
                s = s.replace(/\n/g, '');
                s = s.replace(/：/g, ':');
                s = s.replace(/　/g, ' ');
				/*
                s = s.replace(/（/g, '(');
                s = s.replace(/）/g, ')');
				*/
                s = s.replace(/－/g, '-');
                s = s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 65248);});
                return s;
            }
            return csv_cleansing_string(this.data()[row][col]);
        } catch(e) {
            console.log(e);
            return null;
        }
    },
    json: function(row, col) {
        try {
            function csv_cleansing_string(s) {
                s = String(s);
                s = s.replace(/\n/g, '');
                return JSON.parse(s);
            }
            return csv_cleansing_string(this.data()[row][col]);
        } catch(e) {
            console.log(e);
            return null;
        }
    },
    length: function() {
        var res;
        if (this.data()) {
            res = this.data().length;
        } else {
            res = -1;
        }
        return res;
    },
    download: function(callback, async) {
        var _this = this;
        if (async == null) {async = true;}
        if (callback) {
            if (!_this.data()) {
                $.ajax({
					//https://qiita.com/svartalfheim/items/36100328a37c8221d0dd jQueryでShift-JIS読み込む
					beforeSend : function(xhr) {
						xhr.overrideMimeType("text/plain; charset=shift_jis");
					},
                    type: 'GET',
                    url: _this.name,
                    async: async
                })
                .done(function(data, status) { 
                    // success
                    _this.data(data);
                    callback();
                })
                .fail(function(status, status_text, description){
                    // fail
                })
                .always(function() {
                    // always
                });
            }    
        } else {
            return $.ajax({
                type: 'GET',
                url: _this.name,
                async: async
            });
        }
    }
}
