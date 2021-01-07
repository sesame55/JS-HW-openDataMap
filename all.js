let map; //紀錄地圖資訊
let data = []; //紀錄抓取的資料
let markers = []; //紀錄目前載入的marker
let currentInfoWindow = ''; //紀錄當前點擊的google window
let url = 'https://od-oas.kcg.gov.tw/api/service/Get/b4dd9c40-9027-4125-8666-06bef1756092'; //要抓取的JSON
let url2 = 'data.json';


let mapSite = document.querySelector('#map'); //地圖位置
let areaSelect = document.querySelector('.areaSelect'); //下拉選單位置
// let iconList = document.querySelector('#mapIcon'); //標記說明位置
let menuArea = document.querySelector('.menuArea'); //下拉選單及標題區塊

//載入地圖資訊
function initMap() {
    map = new google.maps.Map(mapSite, {
        zoom: 14,
        center: { lat: 22.6048695, lng: 120.298119 },
    });

    // 標記顏色說明文字 - 無法直接定位到 map上，必須使用Api提供的方法
    // map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(iconList);
    //已修改HTML

    //下拉選單及標題區塊也定位到 map上
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(menuArea);

    //取得遠端資料並渲染
    getData();
}

//抓取遠端資料
let getData = () => {
    axios
        .get(url2)
        .then(res => {
            data = res.data.data.retVal;
            // console.log(data);

            //下拉選單
            changeArea(data);

            // 起始畫面
            data.forEach(item => {
                render(item);
            });
        })
        .catch(err => {
            console.log(err);
        });
};
// getData(); //測試用

//下拉選單的地區選項
let changeArea = data => {
    let selectList = []; //篩選資料的容器
    let str = ` <option value="請選擇行政區">--請選擇行政區--</option>`;
    data.forEach(item => {
        selectList.push(item.sarea);
    });
    // console.log(selectList);//確認所存入的資料
    selectList = [...new Set(selectList)]; //篩選資料後放回原本容器
    // console.log(selectList); //確認篩選後的資料
    selectList.forEach(item => {
        str += ` <option value="${item}">${item}</option>`;
    });
    areaSelect.innerHTML = str;
};

// 跟隨選單切換顯示內容
let changeMarkers = e => {
    //清除資料
    markers.forEach(item => {
        item.setMap(null);
    });
    markers = [];
    infowindow = [];

    //抓取目前所點擊的選項的值
    let selectValue = e.target.value;
    //console.log(selectValue); //確認所抓取的值
    data.forEach(item => {
        if (item.sarea == selectValue) {
            render(item);
        }
    });
};
areaSelect.addEventListener('change', changeMarkers); //監聽下拉選單內容切換

//畫面
let render = item => {
    let time = item.mday;
    let year = time.slice(0, 4);
    // console.log(year);
    let month = time.slice(4, 6);
    let day = time.slice(6, 8);
    let hour = time.slice(8, 10);
    let min = time.slice(10, 12);
    let sec = time.slice(12, 14);
    loadData(
        item.lat,
        item.lng,
        `站點：${item.sna}<br>
        地址：${item.ar}<br>
        可借車輛：${item.sbi}<br>
        可停空位：${item.bemp}<br>
        更新時間：${year}-${month}-${day} ${hour}:${min}:${sec}`,
        filterColor(Number(item.sbi), Number(item.bemp))
    );
};

// 標記顏色篩選
let filterColor = (sbi, bemp) => {
    if (sbi !== 0 && bemp !== 0) {
        return 'green'; //可借車、可停車
    } else if (sbi !== 0 && bemp == 0) {
        return 'yellow'; //可借車、不可停車
    } else if (sbi == 0 && bemp !== 0) {
        return 'blue'; //不可借車、可停車
    } else {
        return 'red'; //不太可能有第4種狀況，除非維修？
    }
};

//點擊後的訊息顯示
function loadData(lat, lng, text, markerColor) {
    //經緯度和要點擊顯示的內容
    //建立訊息顯示區塊
    let infowindow = new google.maps.InfoWindow({
        content: text, //顯示內容
    });

    // 標記顏色
    let iconUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    iconUrl += markerColor + '-dot.png';

    let marker = new google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        title: text,
        map: map,
        icon: {
            url: iconUrl,
        },
    });
    marker.addListener('click', () => {
        if (currentInfoWindow != '') {
            currentInfoWindow.close(); //關閉由open()打開的視窗
            currentInfoWindow = ''; //清空內容
        }
        infowindow.open(map, marker); //在(地圖，標記)位置開啟訊息區塊
        currentInfoWindow = infowindow;
    });
    markers.push(marker);
}
