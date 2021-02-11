const recordButton = document.getElementById('record')
const playButton = document.getElementById('play')
const pads = document.querySelectorAll('.pad') // storing all the pads
const stopButton = document.getElementById('stop')
const sessionButton = document.getElementById('session')
var isPlay = false
var isStop = false
var countON = 0 // number of pads in on state
var recordingStartTime
var recordingEndTime = 0
var recordingList = []
var isRecording = false
var isSession = false
var countPlay = 0
var playList = []
var sessionStart
var initListener = false


pads.forEach(pad => {
    pad.addEventListener('click', () => clickOnPad(pad))
})

function addListener() {
    pads.forEach(pad => {
        document.getElementById(pad.dataset.note).addEventListener('ended', () => end(pad))
    })
    initListener = true
}

function removeListener() {
    pads.forEach(pad => {
        document.getElementById(pad.dataset.note).removeEventListener('ended', () => end(pad))
    })
    initListener = false
}

function clickOnPad(pad) {
    if (pad.innerText === 'OFF') {
        pad.innerText = "ON"
        pad.style.backgroundColor = "red"
        addToPlayList(pad)
        countON++
    }
    else {
        pad.innerText = "OFF"
        pad.style.backgroundColor = "dodgerblue"
        removeFromPlayList(pad)
        countON--
        if (document.getElementById(pad.dataset.note).currentTime > 0) {
            stop(pad)
        }
    }
}

function addToPlayList(pad) {
    playList.push(pad)
}

playButton.addEventListener('click', playAudios)

function playAudios() {
    if (!initListener) {
        addListener()
    }
    if (countON === 0)
        alert("Please select at least one audio")
    
    else if (!isPlay) {
        if (countPlay < 0)
            countPlay = 0
        isPlay = true
        isStop = false
        sessionStart = Date.now()
        playList.forEach(pad => {
            play(pad)
        })
    } else
        alert("Already playing")
}

function play(pad) {
    const audio = document.getElementById(pad.dataset.note)
    audio.currentTime = 0
    countPlay++
    if (isRecording)
        addAudioToRecord(pad, Date.now())
    audio.play()
}

function removeFromPlayList(pad) {
    playList = playList.filter(function (play) {
        return play.id !== pad.id
    })
}

function end(pad) {
    countPlay--
    if (isRecording) {
        end1 = Date.now()
        addEndTime(pad, end1)
    }


    if (countPlay === 0) {
        isPlay = false
        if (!isStop && playList.length > 0)
            playAudios()
    }


}

function addEndTime(pad, end1) {

    var index = findLastIndex(recordingList, pad)
    if (index !== -1) {
        recordingList[index].audioEndTime = end1
    }
}

stopButton.addEventListener('click', stopAudio)

function stopAudio() {
    isStop = true
    if (isPlay) {
        playList.forEach(play => {
            clickOnPad(play)
        })
        isPlay = false

    } else {
        alert("Nothing is playing right now")
    }

}

function stop(pad) {
    end(pad)
    var audio = document.getElementById(pad.dataset.note)
    audio.pause()
    audio.currentTime = 0
}

function findLastIndex(array, searchKey) {
    var index = array.slice().reverse().findIndex(x => x.key === searchKey);
    var count = array.length - 1
    var finalIndex = index >= 0 ? count - index : index;
    return finalIndex;
}

recordButton.addEventListener('click', onRecording)

function onRecording() {
    if (!isRecording) {
        recordingStart()
    } else {
        stopRecording()
    }
    recordingText()
}

function recordingText() {
    var text = document.getElementById('text')
    if (isRecording) {
        text.innerHTML = "Recording..."
    } else {
        text.innerHTML = "Recording stopped"
        setTimeout(() => {
            text.innerHTML = ""
        }, 1500);
    }
}

function recordingStart() {
    recordingStartTime = Date.now()
    removeOldRecord()
    addRecordingAudio()
    isRecording = true
}

function removeOldRecord() {
    recordingList = []
}

function addAudioToRecord(pad, time) {
    var waitingTime = isRecording ? Date.now() - recordingStartTime : 0
    recordingList.push({
        key: pad,
        audioBeginTime: time, // for calculate duration and audio current time
        audioCurrentTime: sessionStart,
        audioEndTime: 0,
        waitingTime: waitingTime
    })
}

function addRecordingAudio() {
    if (isPlay) {
        playList.forEach(pad => {
            if (document.getElementById(pad.dataset.note).currentTime > 0) {
                start = Date.now()
                addAudioToRecord(pad, start)
            }
        })
    }
}

function stopRecording() {
    isRecording = false
    isSession = true
    recordingEndTime = Date.now()
    playList.forEach(play => {
        if (document.getElementById(play.dataset.note).currentTime > 0) {
            addEndTime(play, recordingEndTime)
        }
    })
}

sessionButton.addEventListener('click', playSession)

function playSession() {
    if (!isSession) {
        alert("Please record the session first")
    }
    else if (isRecording) {
        alert("Still recording")
    }
    else if (isPlay) {
        alert("Can not play session and play simultaneously")
    }
    else {
        recordingList.forEach(record => {
            if (record.audioBeginTime < recordingEndTime) {
                setTimeout(() => {
                    setTimeout(() => {
                        audio.pause()
                        audio.currentTime = 0
                    }, record.audioEndTime - record.audioBeginTime - 100);
                    var audio = document.getElementById(record.key.dataset.note)
                    var currentTime = (recordingStartTime - record.audioCurrentTime) % audio.duration - 3
                    audio.currentTime = record.audioCurrentTime < recordingStartTime ? currentTime : 0
                    audio.play()
                }, record.waitingTime);
            }
        })
    }
}

