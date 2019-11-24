const Submit = function() {
    const work_interval = document.getElementById('work_interval').value;
    const rest_period = document.getElementById('rest_period').value;
    const start_on_the_hour = document.getElementById('start_on_the_hour').checked;
    console.log(work_interval, rest_period, start_on_the_hour);

    if (rest_period > work_interval / 2) {
        console.log('Rest over 50% of work interval...');
        alert('I am not sure resting more than working is a good idea...');
        return;
    }

    chrome.storage.sync.set({
    	work_interval: work_interval,
    	rest_period: rest_period,
    	start_on_the_hour: start_on_the_hour,
    }, function() {
        console.log("Storage updated");
    });

    chrome.runtime.sendMessage({
            event: 'update-setting',
            work_interval: work_interval,
            rest_period: rest_period,
            start_on_the_hour: start_on_the_hour,
        },
        function(response) {
            console.log('Update setting request resolved:', response);
            window.close();
        });

};

const StopTimer = function() {
	chrome.runtime.sendMessage({event: 'stop-timer'}, function(response) {
		console.log('Stop timer request resolved:', response);
		window.close();
	})
};

const ToggleOnHourCheckbox = function() {
	const start_on_the_hour = document.getElementById('start_on_the_hour').checked;
	if (start_on_the_hour) {
		document.getElementById('work_interval').value = '60';
	}
};

document.getElementById("submit").addEventListener("click", Submit);
document.getElementById("stop").addEventListener("click", StopTimer);
document.getElementById("start_on_the_hour").addEventListener("change", ToggleOnHourCheckbox);

window.onload = function() {
	console.log('Window onload');
	const items = ['work_interval', 'rest_period', 'start_on_the_hour'];
	chrome.storage.sync.get(items, function(result) {
		for (var item of ['work_interval', 'rest_period']) {
			document.getElementById(item).value = result[item];
		}
        document.getElementById('start_on_the_hour').checked = result['start_on_the_hour'];
	});
};