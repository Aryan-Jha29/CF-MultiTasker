async function Fetch(url) {
    return fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        return data;
    }).catch(function (err) {
        console.log('Fetch problem : ' + err.message);
    });
}

function speakText(msg) {
    let speech = new SpeechSynthesisUtterance();
    speech.text = msg;
    speech.lang = "en-US";
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

let msgEle = document.getElementById("msg");
let userEle = document.getElementById("user");
let recInfo = document.getElementById("inf");
let probSet = document.getElementById("prob");
let ratVal = document.getElementById("rat");
let myChart = document.getElementById("myChart");
let countChart = null;

async function getSubmission() {
    msgEle.innerText = "";
    let user = userEle.value;
    userEle.value = '';
    let userInfoApi = `https://codeforces.com/api/user.info?handles=${user}`;
    let userStatusApi = `https://codeforces.com/api/user.status?handle=${user}&from=1&count=1`;

    let data = await Fetch(userInfoApi);
    console.log(data);
    if (data.status === "FAILED") {
        msgEle.innerText = "Invalid Username";
        return;
    }

    if (countChart != null) {
        countChart.destroy();
    }
    let firstName = data.result[0].firstName || "sir";
    let prvSubmissionId = null;
    msgEle.innerHTML = '';
    msgEle.innerHTML = `Waiting for <a href="https://codeforces.com/profile/${user}" target="_blank">your</a> submission ...`;

    let x = await Fetch(userStatusApi);
    console.log(x);

    setInterval(async () => {
        let data = await Fetch(userStatusApi);
        if (data.status == "OK") {
            data = data.result[0];
            if (data.verdict == "TESTING") return;
            if (data.id != prvSubmissionId) {
                if (prvSubmissionId) {
                    if (data.verdict == "OK") {
                        speakText(`well done ${firstName}, AC on problem ${data.problem.index}`);
                    }
                    else {
                        speakText(`hey ${firstName}, ${data.verdict.split("_").join(" ")} on test ${data.passedTestCount + 1}, problem ${data.problem.index}`);
                    }
                }
                prvSubmissionId = data.id;
            }
        }
    }, 15000);
}

async function getContestDetails() {
    let y = await Fetch(`https://codeforces.com/api/contest.list`);
    console.log(y);
    let cnt = 0;
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    msg.innerHTML = '';
    if (countChart != null) {
        countChart.destroy();
    }
    let table = document.createElement('table')
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    table.appendChild(thead);
    table.appendChild(tbody);
    msgEle.appendChild(table);
    let heading1 = document.createElement('th')
    let heading2 = document.createElement('th')
    let row = document.createElement('tr')

    for (var i = 8; i >= 0; i--) {
        let str = y.result[i].name;
        //pre-check
        if (str.indexOf("#TBA") != -1 || y.result[i].phase == "FINISHED") continue;
        //include only contests that have not yet happened
        cnt++;

        if (cnt == 1) {
            speakText(`Some Upcoming contests are`);

            heading1.innerText = "Contest Name"
            heading2.innerText = "Date"
            heading1.style.paddingBottom = 0;
            heading2.style.paddingBottom = 0;
            row.appendChild(heading1)
            row.appendChild(heading2)
            thead.appendChild(row)

        }
        var timestamp = y.result[i].startTimeSeconds;
        var d = new Date(timestamp * 1000);
        let name = month[d.getMonth()];
        let date = d.getDate();
        let year = d.getFullYear();
        var div = document.createElement("div");

        let a_row = document.createElement('tr')
        let data1 = document.createElement('td')
        let data2 = document.createElement('td')

        data1.style.paddingTop = 1;
        data1.style.paddingBottom = 0;
        data2.style.paddingTop = 1;
        data2.style.paddingBottom = 0;
        a_row.appendChild(data1)
        a_row.appendChild(data2)
        tbody.appendChild(a_row)


        data1.innerHTML = `<a href="https://codeforces.com/contests">${y.result[i].name}</a>`;
        data2.innerHTML = date + ' ' + name + ' ' + year;
        table.classList.add("table");
    }
    if (cnt == 0) {
        var div = document.createElement("div");
        div.innerHTML = 'No Upcoming Contests As Of Now .... ';
        msgEle.appendChild(div);
    }
}
async function getInfo() {
    let rec = recInfo.value;
    recInfo.value = '';
    console.log(rec);
    let userInfoApi = `https://codeforces.com/api/user.info?handles=${rec}`;

    let data = await Fetch(userInfoApi);
    console.log(data);
    if (data.status === "FAILED") {
        msgEle.innerText = "Invalid Username";
        return;
    }
    msgEle.innerText = "";
    if (countChart != null) {
        countChart.destroy();
    }
    let str = data.result[0].firstName + ' ' + data.result[0].lastName;
    var name = str;
    var country = data.result[0].country;
    var handle = data.result[0].handle;
    var currRating = data.result[0].rating;
    var maxRating = data.result[0].maxRating;
    var currRank = data.result[0].rank;
    var maxRank = data.result[0].maxRank;
    var lastOnline = data.result[0].lastOnlineTimeSeconds;
    var d = new Date(lastOnline * 1000);
    d = d.toLocaleString();

    const key = ["Name:", "Country:", "Handle:", "CurrRating:", "MaxRating:", "CurrRank:", "MaxRank:", "LastOnline:"];
    const val = [name, country, handle, currRating, maxRating, currRank, maxRank, d];
    speakText(`The Details Of User Are `);

    let table = document.createElement('table')
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    table.appendChild(thead);
    table.appendChild(tbody);
    msgEle.appendChild(table);
    let row = document.createElement('tr')
    let heading1 = document.createElement('th')
    let heading2 = document.createElement('th')
    row.appendChild(heading1)
    row.appendChild(heading2)
    thead.appendChild(row)
    heading1.innerText = "Paramter"
    heading2.innerText = "Value"
    heading1.style.paddingBottom = 0;
    heading2.style.paddingBottom = 0;

    for (var i = 0; i < 8; i++) {

        let a_row = document.createElement('tr')
        let data1 = document.createElement('td')
        let data2 = document.createElement('td')

        data1.style.paddingTop = 1;
        data1.style.paddingBottom = 0;
        data2.style.paddingTop = 1;
        data2.style.paddingBottom = 0;
        a_row.appendChild(data1)
        a_row.appendChild(data2)
        tbody.appendChild(a_row)

        data1.innerHTML = key[i];
        data2.innerHTML = val[i];
        table.classList.add("table");
    }
}
function HashCheck(x) {
    min = Math.ceil(1);
    max = Math.floor(10);
    var store = Math.floor(Math.random() * (max - min + 1) + min);
    return x % store == 0;
}
async function getProblems() {
    let probs = probSet.value;
    let value = ratVal.value;
    probSet.value = ratVal.value = '';
    let total = String(probs);
    let res = '';
    for (var i = 0; i < total.length; i++) {
        if (total[i] == ',') {
            res += ';';
        }
        else if (total[i] == ' ') res += '%20'
        else res += total[i];
    }
    msgEle.innerHTML = '';
    if (countChart != null) {
        countChart.destroy();
    }
    let url = `https://codeforces.com/api/problemset.problems?tags=${res}`;
    let data = await Fetch(url);
    console.log(data);
    if (data.status === "FAILED") {
        msgEle.innerText = "Check Details Once";
        return;
    }
    let store = {}; //creating object to store key-value pairs
    let contestNo = [], Id = [];
    let cnt = 1;
    for (var i = 0; i < 10000 && i < Object.keys(data.result.problems).length; i++) {
        if (Object.keys(store).length == 10) break;
        if (data.result.problems[i].rating == value && HashCheck(value)) {
            store[cnt++] = data.result.problems[i].name;
            contestNo.push(data.result.problems[i].contestId);
            Id.push(data.result.problems[i].index);
        }
    }
    if (Object.keys(store).length == 0) {
        msgEle.innerHTML = "Check Details Once";
        return;
    }

    cnt = 0;

    let table = document.createElement('table')
    let thead = document.createElement('thead')
    let tbody = document.createElement('tbody')
    table.appendChild(thead);
    table.appendChild(tbody);
    msgEle.appendChild(table);
    let heading1 = document.createElement('th')
    let heading2 = document.createElement('th')
    let row = document.createElement('tr')
    row.appendChild(heading1)
    row.appendChild(heading2)
    thead.appendChild(row)
    heading1.innerText = "Sl No"
    heading2.innerText = "Problem Name"
    heading1.style.paddingBottom = 0;
    heading2.style.paddingBottom = 0;

    speakText(`Here are some of the selected problems`);
    for (var key of Object.keys(store)) {
        var div = document.createElement("div");
        var num1 = contestNo[cnt];
        var num2 = Id[cnt];
        cnt++;

        let a_row = document.createElement('tr')
        let data1 = document.createElement('td')
        let data2 = document.createElement('td')

        data1.style.paddingTop = 1;
        data1.style.paddingBottom = 0;
        data2.style.paddingTop = 1;
        data2.style.paddingBottom = 0;
        a_row.appendChild(data1)
        a_row.appendChild(data2)
        tbody.appendChild(a_row)


        var link = `https://codeforces.com/problemset/problem/${num1}/${num2}`;

        data1.innerHTML = `${key}`;
        data2.innerHTML = `<a href="${link}">${store[key]}</a>`;
        table.classList.add("table");
    }
}
async function getAnalytics() {
    let rec = recInfo.value;
    recInfo.value = '';
    let userSubmissions = `https://codeforces.com/api/user.status?handle=${rec}`;

    let data = await Fetch(userSubmissions);
    if (data.status === "FAILED") {
        msgEle.innerText = "Invalid Username";
        return;
    }

    const key = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400];
    const val = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const count = [];

    let store = new Map; //creating object to store key-value pairs
    let map = new Map();
    for (var i = 800; i <= 2400; i += 100) {
        store.set(i, 0);
    }
    for (var i = 0; i < Object.keys(data.result).length; i++) {
        var k1 = data.result[i].problem.contestId;
        var k2 = data.result[i].problem.index;
        var check = `${k1}${k2}`;
        if (data.result[i].problem.rating != '' && data.result[i].verdict == "OK" && !map.has(check)) {
            var x = store.get(data.result[i].problem.rating);
            store.set(data.result[i].problem.rating, x + 1);
            map.set(check, 1);
        }
    }
    store.delete(undefined);
    for (var values of store.values()) {
        count.push(values);
    }

    //chart js part
    msgEle.innerHTML = '';
    if (countChart != null) {
        countChart.destroy();
    }
    let mc = myChart.getContext('2d');
    countChart = new Chart(mc,
        {
            type: 'bar',
            data: {
                labels: ['800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400'],
                datasets: [{
                    label: 'Problem Rating Count',
                    data: [
                        count[0],
                        count[1],
                        count[2],
                        count[3],
                        count[4],
                        count[5],
                        count[6],
                        count[7],
                        count[8],
                        count[9],
                        count[10],
                        count[11],
                        count[12],
                        count[13],
                        count[14],
                        count[15],
                        count[16]
                    ],
                    //backgroundColor setting 
                    backgroundColor: [
                        'rgba(255,99,132,0.6)',
                        'rgba(54,162,235,0.6)',
                        'rgba(255,206,86,0.6)',
                        'rgba(75,192,192,0.6)',
                        'rgba(153,102,255,0.6)',
                        'rgba(255,159,64,0.6)',
                        'rgba(255,99,132,0.6)',
                        'rgba(255,99,132,0.6)',
                        'rgba(54,162,235,0.6)',
                        'rgba(255,206,86,0.6)',
                        'rgba(75,192,192,0.6)',
                        'rgba(153,102,255,0.6)',
                        'rgba(255,159,64,0.6)',
                        'rgba(255,99,132,0.6)',
                        'rgba(153,102,255,0.6)',
                        'rgba(255,159,64,0.6)'
                    ],
                    borderWidth: 1,
                    borderColor: '#777',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#000'
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Rating Distribution for User: ${rec}`,
                        font: {
                            size: 30
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Problem Ratings',
                            font: {
                                size: 15
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Count of Problems',
                            font: {
                                size: 15
                            }
                        }
                    }
                }
            }
        });
}