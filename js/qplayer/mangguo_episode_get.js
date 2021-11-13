//20211107
var getEpisodeInfoTimerCount = 0;

var videoUrlPre = window.location.href.replace(/\d+\.html.*/, "");

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
        introduceElement = playTopElement.querySelector('.icon-wrap.introduce').querySelector('.m-collection-wrap.clearfix');
        if (introduceElement == null)
            return ["", "", ""];

        videoNameElement = introduceElement.querySelector('.content').querySelector('.name').querySelector('a');
        if (videoNameElement != null)
            videoName = videoNameElement.textContent;
        else
            videoName = "";

        videoDescriptionElement = introduceElement.querySelector('.content').querySelector('.introduce').querySelector('.e-txthide2');
        if (videoDescriptionElement != null)
            videoDescription = videoDescriptionElement.textContent;
        else
            videoDescription = "";

        videoImageElement = introduceElement.querySelector('.img').querySelector("a").querySelector("img");
        if (videoImageElement != null)
            videoImageUrl = videoImageElement.src;
        else
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
        selectItems = playTopElement.querySelector('.m-tv-aside').querySelector('.episode-items');
        if (selectItems == null) {
            console.log('1 selectItems is ' + selectItems);
            return null;
        } else {
            console.log('1 OK');
            // 读取信息
            result = "";
            Array.from(selectItems.getElementsByClassName('episode-item')).forEach(item => {
                video_id = item.dataset.vid;
                isSelect = item.className.indexOf("focus") == -1 ? 0 : 1;
                result = result + aSingleItemInfo(item.textContent, "?", videoUrlPre + video_id + ".html", isSelect) + "quejingquejing";
//                console.log(result);
            });
            return result;
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
        selectItems = playTopElement.querySelector('.m-show-aside').querySelector('.aside-videolist');
        if (selectItems == null) {
            console.log('2 selectItems is ' + selectItems);
            return null;
        } else {

            console.log('2 OK');
            // 读取信息
            result = "";
            Array.from(selectItems.getElementsByClassName('variety-column-series')).forEach(item => {
                video_id = item.dataset.vid;
                isSelect = item.className.indexOf("playing") == -1 ? 0 : 1;
                videoName = item.querySelector('.litxt').querySelector('.name').innerText
                result = result + aSingleItemInfo(videoName, videoName, videoUrlPre + video_id + ".html", isSelect) + "quejingquejing";
                console.log(result);
            });
            return result;
        }
    } catch (e) {
      console.error("exception 2 : " +  e);
    }
    return "";
}



function getEpisodeInfoTimer() {
    getEpisodeInfoTimerCount++;
    console.log('start get episode');
    playTopElements = document.getElementsByClassName('m-player');
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
