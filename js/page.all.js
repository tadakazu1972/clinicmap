// 全pageで共通のパラメータや処理を定義

/* --------------------------------------
 グローバル変数の宣言
----------------------------------------- */

let global = {};
global.params = {};
global.data = {};
global.errorDialog = {};

/* --------------------------------------
  パラメータの設定
----------------------------------------- */

global.params = {
    hostname: 'www.city.osaka.lg.jp',
    data: {
        url: {
            debug: [
                "csv/vaccine_place_utf8bom.csv"
            ],
            release: [
                "csv/vaccine_place_utf8bom.csv"
            ],
            readParam: function() {
                let d = $.fn.functions.getParam('d');
                if (d) {
                    let release = global.params.data.url.release.split('/');
                    let debug = global.params.data.url.debug.split('/');
                    global.params.data.url.release = [release[0] + "/" + d + "/" + release[1]];
                    global.params.data.url.debug = [debug[0] + "/" + d + "/" + debug[1]];
                    global.params.marker.prefix = d;
                }
            },
            getCurrent: function() {
                if ($.fn.functions.isDebug()) {
                    return global.params.data.url.debug;
                } else {
                    return global.params.data.url.release;
                }
            },
            getCurrentFilename: function(index) {
                if (!index) {index = 0;}
                let url = global.params.data.url.getCurrent()[index].split('/');
                let fn = url[url.length - 1].split('.')[0];
                return fn;
            }
        },
        getDataSucceed: function(){ console.log('getData succeed.'); }, // page.[pagename].jsで定義
        getDataFailed: function(){ $.fn.functions.showErrorDialog(0); }
    },
    marker: {
        prefix: 'pin'
    },
    status: [
        {
            code: 0,
            title: '情報なし',
            mark: '　',
            image: {
                true: 'img/pin/pin-0-true.png',
                false: 'img/pin/pin-0-false.png'
            }
        },
        {
            code: 1,
            title: '予約不可能',
            mark: '×',
            image: {
                true: 'img/pin/pin-1-true.png',
                false: 'img/pin/pin-1-false.png'
            }
        },
        {
            code: 2,
            title: '若干空き有り',
            mark: '△',
            image: {
                true: 'img/pin/pin-2-true.png',
                false: 'img/pin/pin-2-false.png'
            }
        },
        {
            code: 3,
            title: '予約可能',
            mark: '○',
            image: {
                true: 'img/pin/pin-3-true.png',
                false: 'img/pin/pin-3-false.png'
            }
        },
        {
            code: 4,
            title: '予約不要',
            mark: '◇',
            image: {
                true: 'img/pin/pin-4-true.png',
                false: 'img/pin/pin-4-false.png'
            }
        }
    ],
    makers: [
        'ファイザー', 
        'モデルナ'
    ],
    targets: [
        '一般の方',
        'かかりつけの方',
        '妊婦',
        'こども'
    ]
};

global.errorDialog = {
	0: {
		title: 'データ取得失敗',
		description: 
            '<p>' + 
                '画面を表示するためのデータ取得に失敗しました。<br>' + 
                '恐れ入りますが、ブラウザで再読み込みするか、時間をおいて再度アクセスをお願いします。' + 
            '</p>'
	},
    1: {
        title: '現在地取得失敗',
        description: 
            '<p>' +
                '現在地の位置情報を取得できませんでした。<br>' + 
                '恐れ入りますが、次の点についてご確認をお願いします。' +
            '</p>' +
            '<ul>' +
                '<li>現在ご使用のブラウザに<strong>「位置情報へのアクセス」が許可</strong>されている<br><span class="uk-text-meta">iPhoneの例：設定 &gt; プライバシー &gt; 位置情報サービス &gt; ブラウザ名（Safari、Chrome、Edge等） を許可</span></li>' +
                '<li>このサイトのURLが「http<strong>s</strong>」から始まっている</li>' +
            '</ul>'
    }
};

/* --------------------------------------
    プラグインの読み込み
----------------------------------------- */

$.fn.functions();

/* --------------------------------------
    初期設定
----------------------------------------- */

$.fn.functions.setClientClass(); // client情報をbodyのclassにセット

/* --------------------------------------
    DOM読み込み後実行
----------------------------------------- */

$(function() {
    
    // read param
    global.params.data.url.readParam();

    // global.params.dataをダウンロードしてglobal.dataに格納後、getDataSucceed() を実行
    $.fn.functions.getData( 
        global.params.data.url.getCurrent(),
        global.params.data.getDataSucceed,
        global.params.data.getDataFailed
    );

});
