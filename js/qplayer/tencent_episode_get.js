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
    return "" + episodeNum.trim() + "quejing" + episodeName.trim() + "quejing" + episodeUrl.trim() + "quejing" + isSelect;
}


function getVideoInfo(playTopElement) {
        try {
        videoNameElement = document.querySelector('._main_title');
        if (videoNameElement != null)
            videoName = videoNameElement.textContent;
        else
            videoName = ""

        videoDescriptionElement = document.querySelector('.video_summary').querySelector('.summary');
        if (videoDescriptionElement != null)
            videoDescription = videoDescriptionElement.textContent;
        else
            videoDescription = "";

    //    videoImageElement = playTopElement.querySelector('.intro-left').querySelector(".intro-img-link").querySelector(".intro-img");
    //    if (videoImageElement != null)
    //        videoImageUrl = videoImageElement.src;
    //    else
    //        videoImageUrl = "";
        videoImageUrl = "";
        console.log('videoName is ' + videoName + ", videoDescription is " + videoDescription + ", videoImageUrl is " + videoImageUrl);
        return [videoName, videoDescription, videoImageUrl];
     } catch (e) {
        console.error("exception info : " +  e);
    }
    return ["", "", ""];
}

/**
*  解析电视剧集数信息
*/
function getEpisodeInfo1(playTopElement, currentCount) {
    try {
        selectItems = playTopElement.querySelector('.mod_player_side').querySelector('.mod_episode');
        if (selectItems == null) {
            console.log('1 selectItems is ' + selectItems);
            return null;
        } else {

            a = selectItems.querySelector('span').querySelector('a');
            if (a && a.href.indexOf('javascript:void(0)') == -1) { // 有有效地址
                console.log(currentCount + ': 1 valide ' + a.href);
                console.log('1 OK');
                // 读取信息
                result = "";
                Array.from(selectItems.getElementsByClassName('item')).forEach(item => {
                    a = item.querySelector('a');
                    isSelect = item.className.indexOf("current") == -1 ? 0 : 1;
                    result = result + aSingleItemInfo(a.text, "?", a.href, isSelect) + "quejingquejing";
    //                console.log(result);
                });
                return result;
            } else { // 没有有效地址
                console.log('1 FAILED');
                return "";
            }

        }
    } catch (e) {
        console.error("exception 1 : " +  e);
    }
    return "";
}


/**
*  解析综艺信息
*/
function getEpisodeInfo2(playTopElement, currentCount) {
    try {
        selectItems = playTopElement.querySelector('.mod_column').querySelector('.mod_figure');
        if (selectItems == null) {
            console.log('2 selectItems is ' + selectItems);
            return null;
        } else {
            a = selectItems.querySelector('a');
            if (a && a.href.indexOf('javascript:void(0)') == -1) { // 有有效地址
                console.log(currentCount + ': 1 valide ' + a.href);
                console.log('2 OK');
                // 读取信息
                result = "";
                Array.from(selectItems.getElementsByClassName('list_item')).forEach(item => {
                    a = item.querySelector('a');
                    isSelect = item.className.indexOf("current") == -1 ? 0 : 1;
                    result = result + aSingleItemInfo(a.text, a.title, a.href, isSelect) + "quejingquejing";
    //                console.log(result);
                });
                return result;
            } else { // 没有有效地址
                console.log('2 FAILED');
                return "";
            }
        }
    } catch (e) {
      console.error("exception 2 : " +  e);
    }
    return "";
}



function getEpisodeInfoTimer() {
    getEpisodeInfoTimerCount++;
    console.log('start get episode');
    playTopElements = document.getElementsByClassName('player_container');
    if (playTopElements.length == 0) {
        console.log('the web has no resource');
        sendToAndroid(false, null);
    } else {
        console.log('playTopElements length is ' + playTopElements.length);
        playTopElement = playTopElements[0];

        result = null;
        result = getEpisodeInfo1(playTopElement, getEpisodeInfoTimerCount);
        if (result == null || result == "") {
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
