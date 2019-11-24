var timer_id = -1;
var work_interval = 60;
var rest_period = 10;

const kMsPerMinute = 1000 * 60;
const kMsPerHour = kMsPerMinute * 60;

chrome.runtime.onInstalled.addListener(function() {
	console.log('Runtime installed');
});

const TimeToRest = function() {
    alert('Time to rest!');
    timer_id = window.setTimeout(TimeToWork, rest_period * kMsPerMinute);
};

const TimeToWork = function() {
    alert('Time to work!');
    timer_id = window.setTimeout(TimeToRest, (work_interval - rest_period) * kMsPerMinute);
}

const ClearOldTimer = function() {
    if (timer_id >= 0) {
        console.log('Canceling old timer:', timer_id);
        window.clearTimeout(timer_id);
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendRespose) {
    console.log('sender:', sender);
    console.log('request:', request);

    if (request.event === 'update-setting') {
        ClearOldTimer();

        work_interval = request.work_interval;
        rest_period = request.rest_period;

        // Set new timers
        var ms_till_next_rest = (work_interval - rest_period) * kMsPerMinute;
        if (request.start_on_the_hour) {
        	ms_till_next_rest += kMsPerHour - (new Date().getTime() % kMsPerHour);
        }
        timer_id = window.setTimeout(TimeToRest, ms_till_next_rest);
        console.log('TimeToRest will be triggered in', ms_till_next_rest / 1000, 'seconds');

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