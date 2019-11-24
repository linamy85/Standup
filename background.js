var timer_id = -1;
var work_interval = 60;
var rest_period = 10;

const kMsPerMinute = 1000 * 60;
const kMsPerHour = kMsPerMinute * 60;

const TimeToRest = function() {
    alert('Time to rest!');
    timer_id = window.setTimeout(TimeToWork, rest_period * kMsPerMinute);
};

const TimeToWork = function() {
    alert('Time to work!');
    timer_id = window.setTimeout(TimeToRest, (work_interval - rest_period) * kMsPerMinute);
};

const ClearOldTimer = function() {
    if (timer_id >= 0) {
        console.log('Canceling old timer:', timer_id);
        window.clearTimeout(timer_id);
    }
};

const SetNewTimer = function(request) {
    // Clear old timer before setting a new one.
    ClearOldTimer();

    if (request.work_interval === undefined || request.rest_period === undefined) {
        console.log('No existing data in storage!');
        return;
    }

    work_interval = request.work_interval;
    rest_period = request.rest_period;

    var ms_till_next_rest = (work_interval - rest_period) * kMsPerMinute;
    if (request.start_on_the_hour) {
        var ms_till_next_hour = kMsPerHour - (new Date().getTime() % kMsPerHour);
        // Set a timer for the closest rest time within the hour if possible
        if (ms_till_next_hour > rest_period * kMsPerMinute) {
            ms_till_next_rest = ms_till_next_hour - (rest_period * kMsPerMinute);
        }
    }
    timer_id = window.setTimeout(TimeToRest, ms_till_next_rest);
    console.log('TimeToRest will be triggered in', ms_till_next_rest / 1000, 'seconds');
};

chrome.runtime.onInstalled.addListener(function() {
    console.log('Runtime installed');
    const items = ['work_interval', 'rest_period', 'start_on_the_hour'];
    chrome.storage.sync.get(items, function(result) {
        console.log('Get result from last storage:', result);
        SetNewTimer(result);
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendRespose) {
    console.log('sender:', sender);
    console.log('request:', request);

    if (request.event === 'update-setting') {
        // Set new timer
        SetNewTimer(request);

        // Send response back to popup.js
        sendRespose({
            from: 'background.js'
        })
    } else if (request.event === 'stop-timer') {
        ClearOldTimer();
    } else {
        console.error('Event not recognized.');
    }
});