// pageの処理を定義

/* --------------------------------------
 data読み込み後の処理
----------------------------------------- */
global.params.data.getDataSucceed = function() {
    // show GoogleMap
    showGoogleMap();
}

/* --------------------------------------
 GoogleMap
----------------------------------------- */
let map = {
    object: null,
    key: 'AIzaSyCi5xFbwGMdupEXtkwKOv6c-TkRaX5Wxws',
    form: {
        forms: {
            pc: {
                number: 1
            },
            sp: {
                number: 2
            }
        },
        create: function() {

            // targets
            let targets = '';
            for (let i in global.params.targets) {
                let type = 'checkbox'; if (i < 2) {type = 'radio';}
                let checked = ''; if (i == 0) {checked = 'checked';}
                targets += '<label><input name="form{number}-target" class="uk-' + type + ' uk-margin-small-right" type="' + type + '" value="' + i + '" ' + checked + '>' + global.params.targets[i] + '</label><br>';
            }

            // makers
            let makers = '';
            makers +=   '<div class="uk-margin">' +
                            '<label class="uk-form-label" for="form{number}-maker">ワクチンメーカー</label>' +
                            '<div class="uk-form-controls">' +
                                '<select class="uk-select" id="form{number}-maker" name="form{number}-maker">';
            makers += makers =      '<option value="-1">指定なし</option>';
            for (let i in global.params.makers) {
                makers +=           '<option value="' + i + '">' + global.params.makers[i] + '</option>';
            }
            makers +=           '</select>' +
                            '</div>' +
                        '</div>';

            // source
            let source = 
                '<div>' +
                    '<h5>条件で絞り込み</h5>' +
                    '<div class="uk-margin">' +
                        '<label class="uk-form-label" for="form{number}-target">対象者</label>' +
                        '<div class="uk-form-controls tm-form-checkboxies">' +
                            targets +
                        '</div>' +
                    '</div>' +
                    makers +
                    '<hr class="uk-margin-medium">' +
                    '<h5>画面表示設定</h5>' +
                    '<div class="uk-margin">' +
                        '<label class="uk-form-label" for="form{number}-radius">サークルの大きさ</label>' +
                        '<div class="uk-form-controls">' +
                            '<select class="uk-select" id="form{number}-radius" name="form{number}-radius">' +
                                '<option value="0">指定なし</option>' +
                                '<option value="500">500m</option>' +
                                '<option value="1000">1km</option>' +
                                '<option value="2000">2km</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            
            // create
            for (let key in map.form.forms) {
                let form = map.form.forms[key];
                $('#form' + form.number).html(source.replace(/{number}/g, form.number));
            }

        },
        getProperty: function() {
            if ($.fn.functions.isSmartDevice()) {
                return map.form.forms.sp;
            } else {
                return map.form.forms.pc;
            }
        },
        getName: function() {
            return 'form' + map.form.getProperty().number;
        },
        getSelector: function() {
            return '#' + map.form.getName();
        }
    },
    canvas: {
        object: null,
        options: {
            center: null,
            zoom: 14,
            mapTypeId: null,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: true,
            zoomControl: true,
            gestureHandling: 'greedy'
        },
        create: function() {
            map.canvas.object = document.getElementById('map-canvas');
            map.canvas.options.center = map.position.default;
            map.canvas.options.mapTypeId = google.maps.MapTypeId.ROADMAP;
            map.object = new google.maps.Map(map.canvas.object, map.canvas.options);
        }
    },
    position: {
        default: {
            lat: 34.694062, 
            lng: 135.502154
        },
        setCurrentPosition: function() {
            if(navigator.geolocation) {
                
                // Geolocation APIに対応している場合
                navigator.geolocation.getCurrentPosition(
                    // [第1引数] 取得に成功した場合の関数
                    function (position) {                        
                        var latitude  = position.coords.latitude; //緯度
                        var longitude = position.coords.longitude; //経度
                        var latlng = new google.maps.LatLng(latitude, longitude);

                        // 移動
                        map.object.panTo(latlng);
                    },
                    // [第2引数] 取得に失敗した場合の関数
                    function(error){
                        // show error dialog
                        $.fn.functions.showErrorDialog(1);
                    },
                    // [第3引数] オプション
                    {
                        "enableHighAccuracy": false,
                        "timeout": 8000,
                        "maximumAge": 2000,
                    }
                );

            } else {
                // Geolocation APIに対応していない場合
                // show error dialog
                $.fn.functions.showErrorDialog(1);
            }
        }
    },
    circle: {
        object: null,
        draw: function(center) {
            
            // 初期化
            if (map.circle.object != null) {map.circle.object.setMap(null);}
            
            // centerの取得
            if (center == null) {
                let latlng = map.object.getCenter();
                center = new google.maps.LatLng(latlng.lat(), latlng.lng());
            }

            // radiusの取得
            let radius = parseInt($(map.form.getSelector() + '-radius').val());
            if (radius == 0) {return;}

            // circleのセット
            map.circle.object = new google.maps.Circle({
                center: center,
                radius: radius,
                strokeWeight: 4,
                strokeColor: "#0e6fd1",
                strokeOpacity: 0.6,
                fillColor: "#0e6fd1",
                fillOpacity: 0.1
            });
            map.circle.object.setMap(map.object);
        }
    },
    marker: {
        objects: [],
        current: null,
        clear: function() {
            if (map.marker.objects.length != 0) {
                for (let i = 0; i < map.marker.objects.length; i++) {
                    map.marker.objects[i].setMap(null);
                }
                map.marker.objects = [];
            }
        },
        drawAll: function() {
            for (let i = 0; i < map.marker.objects.length; i++) {
                map.marker.draw(i);
            }
        },
        draw: function(i) {
            let icon = map.marker.getIcon(i);
            map.marker.objects[i].setOptions({
                icon: icon.icon,
                visible: icon.visible
            });
        },
        getIcon: function(i) {

            // row
            let row = map.data.rows[i];

            // 論理チェック項番1 医療機関名が空白の場合は非表示
            if (row.name == '') {
                return null;
            }
            
            // 論理チェック項番2 住所が空白の場合は非表示
            if (row.address == '') {
                return null;
            }
            
            // 論理チェック項番7 受け入れ対象が全て空白の場合は非表示
            if (row.targets.join('') == '') {
                return null;
            }

            // 論理チェック項番10 経度が空白の場合は非表示
            if (row.position.lng == '') {
                return null;
            }
            
            // 論理チェック項番11 緯度が空白の場合は非表示
            if (row.position.lat == '') {
                return null;
            }

            // form
            let formId = map.form.getSelector();
            let formName = map.form.getName();

            // category
            let category = global.params.marker.prefix;

            // enabled
            let enabled = 'true';

            // maker
            let maker = $(formId + '-maker').val();
            let icon = {
                number: 0,
                getNumber: function(s) {
                    let num = 0;
                    if (s != '') {
                        num = Number(s.slice(0, 2));
                    }
                    return num;
                }
            }

            // icon
            if (maker > -1) {
                icon.number = icon.getNumber(row.makers[maker].status);
            } else {
                for (let i = 0; i < row.makers.length; i++) {
                    let num = icon.getNumber(row.makers[i].status);
                    if (icon.number < num) {
                        icon.number = num;
                    }
                }
            }
            category += '-' + icon.number;

            // enabled
            /*
            let statuses = '';
            for (let j = 0; j < row.makers.length; j++) {
                statuses += row.makers[j].status;
            }
            if (statuses == '') {
                enabled = 'false';
            }
            */
           /*
            if (maker > -1) {
                if (row.makers[maker].enabled == '') {
                    enabled = 'false';
                }
            }
            */
            $('input[name="' + formName + '-target"]:checked').each(function(){
                if (row.targets[$(this).val()] == '') {
                    enabled = 'false';
                }
            });

            // size
            let size = 40;
            if (enabled == 'false') {size = 28;}
            
            // visible
            let visible = true;
            // 2022-01-18 仕様変更 ワクチンが選択されている場合、該当ワクチン以外は非表示
            if (maker > -1) {
                if (row.makers[maker].enabled == '') {
                    visible = false; 
                }
            }
            // 論理チェック項番12 実施機関が全て空白の場合は非表示
            let chkMakersEnabled = '';
            for (let iMakersEnabled = 0; iMakersEnabled < row.makers.length; iMakersEnabled++) {
                chkMakersEnabled += row.makers[iMakersEnabled].enabled;
            }
            if (chkMakersEnabled == '') {
                // return null;
                visible = false; // 2022-01-18 仕様変更
            }
            
            // res
            let res = {
                icon: {
                    url: 'img/pin/' + category + '-' + enabled + '.png?version=0.0.7',
                    scaledSize : new google.maps.Size(size, size)
                },
                visible: visible
            };
            return res;
        },
        create: function() {
            for (let i = 0; i < map.data.rows.length; i++) {
                let row = map.data.rows[i];
                let icon = map.marker.getIcon(i);
                if (icon) {
                    map.marker.objects[i] = new google.maps.Marker({ 
                        position: {lat: row.position.lat, lng: row.position.lng},
                        map: map.object,
                        icon: icon.icon,
                        visible: icon.visible
                    });
                    map.marker.objects[i].addListener('click', function() { 
                        map.infoWindow.close();
                        map.infoWindow.objects[i].open(map.object, map.marker.objects[i]); 
                        map.infoWindow.current = map.infoWindow.objects[i];
                    });
                }
            }
        }
    },
    infoWindow: {
        objects: [],
        current: null,
        close: function(i) {
            if (i == null || i == -1) {
                if (map.marker.current) {map.marker.current.setMap(null); map.marker.current = null;}
                if (map.infoWindow.current) {map.infoWindow.current.close();}
            } else {
                map.infoWindow.objects[i].close();
            }
        },
        clear: function() {
            map.infoWindow.close();
            map.infoWindow.objects = [];
        },
        getContent: function(i) {

            // row
            let row = map.data.rows[i];
            
            // tel
            let tel = '';
            let telDescription = '';
            function convertToAnchorTag(str) {
                if (str != '') {
                    let icon = '<i class="fas fa-phone-alt uk-margin-small-right"></i>';
                    if ($.fn.functions.isSmartDevice()) {

                        // 電話番号だと思われる文字列を抽出
                        var phone_array = str.match( /\+?[0-9]+[\-\x20]?[0-9]+[\-\x20]?[0-9]+[\-\x20]?[0-9]+/g );
                        var cursor = 0;
                        for ( var i = 0; phone_array != null && i < phone_array.length; i++ ) {
        
                            // ハイフンとスペースを削除
                            var tmp = phone_array[i];
                            tmp = tmp.replace( /[\-\x20]/g, '' );
                            if ( tmp.length < 10 ) {
                                // 10桁未満は電話番号とみなさない
                                continue;
                            }
                            
                            // aタグ文字列を生成
                            var tag_a = '<a href="tel:' + tmp + '" class="uk-button uk-button-primary uk-width-1-1 uk-border-rounded tm-button-conversion">' + icon + phone_array[i] + '</a>';
        
                            // 置換する電話番号の出現位置を取得
                            var start = str.indexOf( phone_array[i], cursor );
        
                            // 出現した電話番号を置換
                            str = str.slice( 0, start ) + tag_a + str.slice( start + phone_array[i].length );
                            cursor = start + tag_a.length;
                        }
                    } else {
                        str = '<span class="tm-button-conversion">' + icon + str + '</span>';
                    }
                    str = '<p class="uk-text-default uk-margin-remove-bottom">' + str + '</p>';
                }
                return str;
            }
            tel = convertToAnchorTag(row.tel.number);
            if (row.tel.day + row.tel.time + row.tel.remarks != '') {
                telDescription += '<div class="uk-margin">';
                if (row.tel.day != '') {telDescription += '<p class="uk-text-default uk-margin-remove">' + row.tel.day + '</p>';}
                if (row.tel.time != '') {telDescription += '<p class="uk-text-default uk-margin-remove">' + row.tel.time + '</p>';}
                if (row.tel.remarks != '') {telDescription += '<p class="uk-text-default uk-margin-remove">' + row.tel.remarks + '</p>';}
                telDescription += '</div>';
            }

            // route
            let route = encodeURI(
                'https://www.google.com/maps?q={address}'
                    .replace(/{address}/g, '現在地から' + row.address + 'まで')
            );
            
            // remarks
            let remarks = '';
            if (row.remarks !== '') {
                remarks +=  '<div>' +
                                '<p class="uk-text-default uk-margin-top">' +
                                    '<span class="uk-label uk-label-danger uk-margin-small-right">お知らせ</span>' + row.remarks +
                                '</p>' +
                            '</div>';
            }
            
            // maker
            let maker = '';
            maker += 
                '<div class="uk-flex uk-margin-small-top tm-makers">';
            for (let i = 0; i < row.makers.length; i++) {
                if (row.makers[i].enabled != '') {
                    let num = Number(row.makers[i].status.slice(0, 2));
                    /*
                    maker += 
                        '<div class="uk-width-1-3 uk-text-center tm-maker">' + 
                            '<p class="uk-text-default uk-margin-remove tm-maker-title">' + row.makers[i].name + '</p>' +
                            '<p class="uk-text-lead uk-margin-remove tm-maker-mark">' + global.params.status[num].mark + '</p>' +
                            '<p class="uk-text-default uk-margin-remove tm-maker-label">' + global.params.status[num].title + '</p>' +
                        '</div>';
                    */
                    maker += 
                        '<div class="uk-width-1-3 uk-text-center tm-maker">' + 
                            '<p class="uk-text-default uk-margin-remove tm-maker-title">' + row.makers[i].name + '</p>' +
                            '<img alt="' + global.params.status[num].mark + '" src="' + global.params.status[num].image.true + '" width="40" height="40">' +
                            '<p class="uk-text-default uk-margin-remove tm-maker-label">' + global.params.status[num].title + '</p>' +
                        '</div>';
                }
            }
            maker += 
                '</div>';

            // target
            let target = 
                '<div class="uk-grid uk-grid-small uk-grid-collapse uk-margin-remove-top">' +
                    '<div class="uk-width-auto"><p class="uk-text-default uk-margin-small-right uk-margin-remove-bottom"><i class="fas fa-user"></i>対象</p></div>' + 
                    '<div class="uk-width-expand"><p class="uk-text-default uk-margin-remove">';
            for (let i = 0; i < row.targets.length; i++) {
                if (row.targets[i] != '') {
                    if (global.params.targets[i] == 'こども') {
                        let s = global.params.targets[i];
                        s += '(' + row.targets[i] + ')';
                        target += '<span class="uk-margin-small-right">' + s + '</span>';
                    } else {
                        target += '<span class="uk-margin-small-right">' + global.params.targets[i] + '</span>';
                    }
                }
            }
            target += 
                    '</p></div>' +
                '</div>';

            // website
            let website = '';
            if (row.url !== '') {
                website +=  '<div>' +
                                '<p class="uk-text-default uk-margin-remove-bottom">' +
                                    '<a href="' + row.url + '" target="_blank" class="uk-button uk-button-primary uk-width-1-1 uk-border-rounded tm-button-conversion"><i class="fas fa-globe uk-margin-small-right"></i>ホームページ</a>' +
                                '</p>' +
                            '</div>';
            }

            // tab
            let tab = {
                switcher: '',
                contents: '',
                source: ''
            };
            for (let key in row.reserve) {
                let r = row.reserve[key];
                if (r != '' && r != '0') {
                    if (tab.switcher + tab.contents == '') {
                        tab.switcher += '<ul class="" uk-switcher="animation: uk-animation-fade;" uk-tab>';
                        tab.contents += '<ul class="uk-switcher uk-margin-remove-bottom">';
                    }
                    if (key == 'web') {
                        tab.switcher += '<li><a href="#">Web予約</a></li>';
                        tab.contents += '<li>';
                        tab.contents +=     website
                        tab.contents += '</li>';
                    } else if (key == 'visit') {
                        tab.switcher += '<li><a href="#">来院して予約</a></li>';
                        tab.contents += '<li>';
                        tab.contents +=     '<div>' +
                                                '<p class="uk-text-default uk-margin-remove-bottom">' +
                                                    // '<a href="' + route + '" target="_blank"><i class="fas fa-map-marker-alt uk-margin-small-right"></i>' + row.address + '</a>' +
                                                    '<a href="' + route + '" target="_blank" class="uk-button uk-button-primary uk-width-1-1 uk-border-rounded tm-button-conversion"><i class="fas fa-route uk-margin-small-right"></i>経路検索</a>' +
                                                '</p>' +
                                            '</div>';
                        tab.contents += '</li>';
                    } else if (key == 'tel') {
                        if (tel + telDescription != '') {
                            tab.switcher += '<li><a href="#">電話予約</a></li>';
                            tab.contents += '<li>';
                            tab.contents += 
                                '<div>' +
                                    telDescription +
                                    tel +
                                '</div>';
                            tab.contents += '</li>';
                        }
                    }
                }
            }
            if (tab.switcher + tab.contents != '') {
                tab.switcher += '</ul>';
                tab.contents += '</ul>';
                tab.source = tab.switcher + tab.contents;
            }

            // title
            let title = row.name;
            if (row.url !== '') {
                title = '<a href="' + row.url + '" target="_blank">' + title + '</a>';
            }
            title = '<h4>' + title + '</h4>';
            if (row.address != '') {
                let address = '<a href="' + route + '" target="_blank">' + row.address + '</a>';
                title += '<p class="uk-margin-remove uk-text-meta">' + address + '</p>';
            }
            title = '<div class="tm-infowindow-title">' + title + '</div>';
            
            // content
            let content = 
                '<div class="uk-width-large uk-padding-small" id="infowindowcontent-' + i + '">' + 
                    '<div class="tm-infowindow">' +
                        title +
                        target +
                        maker +
                        remarks +
                        tab.source +
                    '</div>' +
                '</div>';
            
            return content;
        },
        create: function() {
            for (let i = 0; i < map.data.rows.length; i++) {
                let content = map.infoWindow.getContent(i);
                map.infoWindow.objects[i] = new google.maps.InfoWindow({
                    content: content
                }); 
                map.infoWindow.objects[i].addListener("closeclick", function(argument){
                    map.infoWindow.close();
                });
            }
        }
    },
    infoModal: {
        source: {
            header: '<div id="modal-overflow" uk-modal>' +
                        '<div class="uk-modal-dialog">' +
                            '<button class="uk-modal-close-default" type="button" uk-close></button>' +
                            '<div class="uk-modal-header uk-padding">' +
                                '<h2 class="uk-h4">' + document.title + '</h2>' +
                            '</div>' +
                            '<div class="uk-modal-body uk-padding" uk-overflow-auto>',
            body:               '',
            footer:         '</div>' +
                            '<div class="uk-modal-footer uk-text-right">' +
                                '<button class="uk-button uk-button-default uk-modal-close" type="button">閉じる</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
        },
        show: function(url) {
            $.ajax(url, {cache: false})
            .done(function(data) {
                let s = '';
                let rows = data.split('\n');
                s += map.infoModal.source.header;
                for (i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    s += '<p>' + row + '</p>';
                }
                s += map.infoModal.source.footer;
                UIkit.modal(s).show();
            })
            .fail(function() {
                global.params.data.getDataFailed();
            });
        }
    },
    guide: {
        create: function() {
            let li = '';
            for (let i = 0; i < global.params.status.length; i++) {
                let status = global.params.status[i];
                if (status.title != '') {
                    let s = '';
                    s += '<li>';
                    s +=     '<div class="uk-flex uk-flex-middle">';
                    s +=         '<img class="uk-margin-small-right" src="' + status.image.true + '" alt="" width="25" height="25">';
                    s +=         '<p class="uk-margin-remove uk-text-small">' + status.title + '</p>';
                    s +=     '</div>';
                    s += '</li>';
                    li = s + li;
                }
            }
            $('.tm-guide').html(li);
        }
    },
    data: {
        csv: null,
        rows: [],
        clear: function() {
            map.infoWindow.clear();
            map.marker.clear();
            map.data.rows = [];
        },
        read: function() {
            
            // 初期化
            map.data.clear();
            let csv = map.data.csv;

            // header
            let makers = global.params.makers;
            let header = csv.data()[0];
            let columns = {
                enabled: header.length - makers.length * 2,
                status:  header.length - makers.length
            };

            // read
            for (let i = 1; i < csv.length(); i++) {
                
                // record index
                let index = i - 1;

                // レコードの取得
                let row = {
                    position: {
                        lat: parseFloat(csv.text(i, 14)),
                        lng: parseFloat(csv.text(i, 13))
                    },
                    name: csv.text(i, 0),
                    address: csv.text(i, 1),
                    tel: {
                        number: csv.text(i, 2),
                        day: csv.text(i, 6),
                        time: csv.text(i, 7),
                        remarks: csv.text(i, 8)
                    },
                    url: csv.text(i, 15),
                    remarks: csv.text(i, 16),
                    reserve: {
                        web: csv.text(i, 3),
                        visit: csv.text(i, 4),
                        tel: csv.text(i, 5)
                    },
                    targets: [
                        csv.text(i, 9),
                        csv.text(i, 10),
                        csv.text(i, 11),
                        csv.text(i, 12)
                    ],
                    makers: []
                };
                for (let j = 0; j < makers.length; j++) {
                    let m = {
                        name: makers[j],
                        enabled: csv.text(i, columns.enabled + j),
                        status: csv.text(i, columns.status + j)
                    };
                    row.makers.push(m);
                }
                map.data.rows[index] = row;
            }
            // console.log(map.data.rows);
        }
    }
}

function showGoogleMap() {
    let src = "https://maps.googleapis.com/maps/api/js?key={key}&region=JP&language=ja&callback=callbackGoogleMapApi";
    let scr = $('<script><\/script>', { src: src.replace(/{key}/g, map.key) });
    $('body').append(scr);
}

function callbackGoogleMapApi() {
    
    // read data
    map.data.csv = global.data[global.params.data.url.getCurrentFilename()];
    map.data.read();

    // map setting
    map.form.create();
    map.canvas.create();
    map.infoWindow.create();
    map.marker.create();
    map.guide.create();
    map.circle.draw();

    // add events
    google.maps.event.addListener(map.object, 'center_changed', function() {
        map.circle.draw();
    });
    google.maps.event.addListener(map.object, 'click', function(event) {
        map.infoWindow.close();
    });
    $("#form1-radius, #form2-radius").change(function(){
        map.circle.draw();
    });
    $("#form1-maker, #form2-maker").change(function(){
        map.marker.drawAll();
    });
    $('input[name="form1-target"], input[name="form2-target"]').change(function(){
        map.marker.drawAll();
    });
    $('#map-current-position-button').click(function(){
        map.position.setCurrentPosition();
        return false;
    });

    // show info modal
    map.infoModal.show('text/info.txt');

}
