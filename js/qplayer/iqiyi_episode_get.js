//20211107
var getEpisodeInfoTimerCount = 0;

function sendToAndroid(state, videoName, videoDescription, videoImageUrl, result) {
    console.log("send decode data to android," +
        ", state=" + state +
        ", videoName=" + videoName +
        ", videoDescription=" + videoDescription +
        ", result=" + result);
    window.quejing.videoEpisodeInfo(state, videoName, videoDescription, videoImageUrl, result);
}

function aSingleItemInfo(episodeNum, episodeName, episodeUrl, isSelect) {
    return "" + episodeNum + "quejing" + episodeName + "quejing" + episodeUrl + "quejing" + isSelect;
}

/**
*  解析电视剧集数信息
*/
function getEpisodeInfo1(playTopElement, currentCount) {
    selectItems = playTopElement.querySelector('.qy-episode-num');
    if (selectItems == null) {
        selectItems = playTopElement.querySelector('.qy-episode-txt');
    }
    if (selectItems == null) {
        console.log('1 selectItems is ' + selectItems);
        return null;
    } else {
        a = selectItems.querySelector('a');
        if (a && a.href.indexOf('javascript:void(0)') == -1) { // 有有效地址
            console.log(currentCount + ': 1 valide ' + a.href);
            console.log('1 OK');
            // 读取信息
            result = "";
            selectItems.getElementsByClassName('select-item').forEach(item => {
                a = item.querySelector('a');
                selectPre = item.querySelector('.select-pre');
                episodeNum = a.text;
                episodeName = selectPre != null ? selectPre.innerText : a.title;
                if (selectPre != null) {
                    episodeNum = episodeName + " " + episodeNum;
                    episodeName = episodeNum;
                }

                episodeUrl = a.href;
                isSelect = item.className.indexOf("selected") == -1 ? 0 : 1;
                result = result + aSingleItemInfo(episodeNum + " ", episodeName + " ", episodeUrl, isSelect) + "quejingquejing";
//                console.log(result);
            });
            return result;
        } else { // 没有有效地址
            console.log('1 FAILED');
            return "";
        }
    }
}

/**
*  解析综艺集数信息
*/
function getEpisodeInfo2(playTopElement, currentCount) {
    selectItems = playTopElement.querySelector('.side-content').querySelector('.qy-play-list');
    if (selectItems == null) {
        console.log('2 selectItems is ' + selectItems);
        return null;
    } else {
        a = selectItems.querySelector('.main-title').querySelector('a');
        if (a && a.href.indexOf('javascript:void(0)') == -1) { // 有有效地址
            console.log(currentCount + ': 2 valide ' + a.href);
            console.log('2 OK');
            // 读取信息
            result = "";
            selectItems.getElementsByClassName('play-list-item').forEach(item => {
                a = item.querySelector('.main-title').querySelector('a');
                isSelect = item.className.indexOf("selected") == -1 ? 0 : 1;
                result = result + aSingleItemInfo(a.text, a.title, a.href, isSelect) + "quejingquejing";
            });

            return result;
        } else { // 没有有效地址
            console.log('2 FAILED');
            return null;
        }
    }
}

function getVideoInfo(playTopElement) {
    videoNameElement = playTopElement.querySelector('.player-title').querySelector('a');
    if (videoNameElement != null)
        videoName = videoNameElement.textContent;
    else
        videoName = ""

    videoDescriptionElement = playTopElement.querySelector('.content-paragraph');
    if (videoDescriptionElement != null)
        videoDescription = videoDescriptionElement.textContent;
    else
        videoDescription = "";

    videoImageElement = playTopElement.querySelector('.intro-left').querySelector(".intro-img-link").querySelector(".intro-img");
    if (videoImageElement != null)
        videoImageUrl = videoImageElement.src;
    else
        videoImageUrl = "";

    console.log('videoName is ' + videoName + ", videoDescription is " + videoDescription + ", videoImageUrl is " + videoImageUrl);
    return [videoName, videoDescription, videoImageUrl];
}

function getEpisodeInfoTimer() {
    getEpisodeInfoTimerCount++;
    playTopElements = document.getElementsByClassName('play-top-flash');
    if (playTopElements.length == 0) {
        console.log('the web has no resource');
        sendToAndroid(false, null);
    } else {
        console.log('playTopElements length is ' + playTopElements.length);
        playTopElement = playTopElements[0];

        result = null;
        result = getEpisodeInfo1(playTopElement, getEpisodeInfoTimerCount);
        if (result == null) {
            result = getEpisodeInfo2(playTopElement, getEpisodeInfoTimerCount);
        }

        videoInfo = getVideoInfo(playTopElement);

        if (result == null || result == "") {
            if (getEpisodeInfoTimerCount <= 10) {
                console.log('decode again after 1000ms');
                setTimeout(getEpisodeInfoTimer, 1000);
            } else {
                console.log('decode touch max time, stop decode...');
                sendToAndroid(true, null);
                getEpisodeInfoTimerCount = 0;
            }
        } else {
            sendToAndroid(true, videoInfo[0], videoInfo[1], videoInfo[2], result);
        }
    }
}
