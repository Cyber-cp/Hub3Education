var searchBtn = document.getElementById('search_colleges');
var locationEnabled = document.getElementById('college_location_enabled');
var degreeEnabled = document.getElementById('degree_level_enabled');
var collegeDistance = document.getElementById('college_distance');
var schoolSort = document.getElementById('school_sort');

var degreeIDs = ["certificate", "associate", "bachelor", "master", "doctoral", "professional"];

function makeSchoolCard(name, city, state, url, programs, cost, gradRate, schoolSize, predominantDegree) {
    let div = document.getElementById("college_list");
    gradRate = gradRate * 100;
    // make sure gradRate is a number
    gradRate = gradRate.toFixed(2);

    if (cost == null) {
        cost = "Cost N/A";
    } else {
        cost = "$" + cost.toLocaleString();
    }

    // get the predominant degree
    let degree = "";
    if (predominantDegree === 1) {
        degree = "Certificate";
    } else if (predominantDegree === 2) {
        degree = "Associate";
    } else if (predominantDegree === 3) {
        degree = "Bachelor's";
    } else if (predominantDegree === 4) {
        degree = "Master's";
    } else if (predominantDegree === 5) {
        degree = "Doctoral";
    } else if (predominantDegree === 6) {
        degree = "Professional";
    }

    let programsStr = ""
    for (let i = 0; i < programs.length; i++) {
        programsStr += (i + 1) + ". " + programs[i]["title"] + "<br>";
    }

    let card = `
        <div class="card-body" style="float: left;">
            <h5 class="card-title">${name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${city}, ${state}</h6>
            <div>
            <div>
                <div class="card-body" style="background-color: #bcaadd; width: 46%; margin-left: 0px; height: 55%; float: left">
                    <p class="card-text">Graduation Rate: ${gradRate}%</p>
                    <p class="card-text">School Size: ${schoolSize}</p>
                    <p class="card-text">Cost: ${cost}</p>
                    <p class="card-text">Predominant Degree: ${degree}</p>
                </div>
                <div class="card-body" style="background-color: #bcaadd; width: 46%; margin-left: 0px; height: 55%; float: left; overflow: scroll">
                    <p class="card-text">Programs:</p>
                    <p class="card-text">${programsStr}</p>
                </div>
            </div>
            <a href="${url}" class="card-link">More Info</a>
            </div>
            
        </div>
    `

    div.innerHTML += card;
}

searchBtn.addEventListener('click', function() {

    var collegList = document.getElementById('college_list');
    collegList.innerHTML = "";

    var zip = "";
    var distance = "";
    if (locationEnabled.checked) {
        zip = "&zip=" + currentZip;
        distance = "&distance=" + collegeDistance.value;
    }

    var degree = "";
    if (degreeEnabled.checked) {
        for (var i = 0; i < degreeIDs.length; i++) {
            var element = document.getElementById(degreeIDs[i]);
            if (element.checked) {
                if (degree === "") {
                    degree = "&school.degrees_awarded.predominant=" + element.value;
                } else {
                    degree += "," + element.value;
                }
            }
        }
    }

    var sort = "";
    if (schoolSort.value !== "") {
        sort = "&sort=" + schoolSort.value;
    }

    var fields = "latest.completion.rate_suppressed.overall,id,school.name,school.city,school.state,latest.student.size,school.branches,school.locale,school.ownership,school.degrees_awarded.predominant,latest.academics.program_reporter.programs_offered,latest.cost.avg_net_price.overall,latest.completion.consumer_rate,latest.earnings.10_yrs_after_entry.median,latest.earnings.6_yrs_after_entry.percent_greater_than_25000,school.under_investigation,latest.completion.outcome_percentage_suppressed.all_students.8yr.award_pooled,latest.completion.rate_suppressed.four_year_200percent,latest.completion.rate_suppressed.lt_four_year,latest.programs.cip_4_digit,school.school_url"

    var url = "https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=aYA8iifMRswwZnjrWlUhsv69Cn1UppOc4h4yF4dN" + zip + distance + degree + sort + "&fields=" + fields;
    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)

            // check if it's an error
            if (data["errors"] != null) {
                console.log("error")
                alert("Error: " + data["errors"]["message"]);
                return;
            }
            // loop data.results
            let schools = data.results;

            for (let i = 0; i < schools.length; i++) {
                let school = schools[i];
                let programs = school["latest.programs.cip_4_digit"];
                // remove items with duplicate ids
                let uniquePrograms = [];
                let ids = [];
                for (let j = 0; j < programs.length; j++) {
                    let program = programs[j];
                    // TODO: while checking id, check if program is in user selected filter of wanted programs
                    if (!ids.includes(program["code"])) {
                        ids.push(program["code"]);
                        uniquePrograms.push(program);
                    }
                }

                let url = school["school.school_url"];
                // add https:// if not present
                if (!url.startsWith("https://")) {
                    url = "https://" + url;
                }
                // remove trailing slash
                if (url.endsWith("/")) {
                    url = url.substring(0, url.length - 1);
                }
                // round school["latest.completion.rate_suppressed.overall"] to 4 decimal places
                let gradRate = school["latest.completion.rate_suppressed.overall"];
                gradRate = Math.round(gradRate * 10000) / 10000;

                makeSchoolCard(school["school.name"], school["school.city"], school["school.state"], url, uniquePrograms, school["latest.cost.avg_net_price.overall"], gradRate, school["latest.student.size"], school["school.degrees_awarded.predominant"]);
            }
            console.log(data)
        })
});

function scrollGradient(event) {
    const gradient = document.body.style.backgroundImage;
    const speed = 10; // Adjust scrolling speed as needed
    let position = parseInt(gradient.match(/(\d+)/)[0]);
    if (event.deltaY > 0) {
        position += speed;
    } else {
        position -= speed;
    }
    document.body.style.backgroundPosition = `0% ${position}%`;
    event.preventDefault();
}

// attach scrollGradient to the body
document.body.onscroll = scrollGradient;

// add onclick for additional_res
document.getElementById('additional_res').onclick = function() {
    // gray out main_div
    document.getElementById('main_div').style.opacity = 0.25
    document.getElementById('additional_info').hidden = false
}

// add on click for job_rqs_btn
document.getElementById('job_reqs_btn').onclick = function() {
    document.getElementById('main_div').style.opacity = 0.25
    document.getElementById('job_reqs').hidden = false
}

document.getElementById('close').onclick = function() {
    // ungray main_div
    document.getElementById('main_div').style.opacity = 1
    document.getElementById('additional_info').hidden = true
}

document.getElementById('close2').onclick = function() {
    // ungray main_div
    document.getElementById('main_div').style.opacity = 1
    document.getElementById('job_reqs').hidden = true
}


// load jobreqs.csv
$.ajax({
    url: 'res/jobreqs.csv', // Replace 'example.csv' with your CSV file path
    dataType: 'text',
    success: function(data) {
        var csvData = $.csv.toArrays(data);
        console.log(csvData);
        for (let i = 0; i < csvData.length; i++) {
            let job = csvData[i];
            let title = job[0];
            let education = job[2];
            let experience = job[3];
            let training = job[4];

            function makeJobCard(title, education, experience, training) {
                let jobCard = document.createElement("div");
                jobCard.className = "job_card";
                jobCard.innerHTML = "<h3>" + title + "</h3><p>Education: " + education + "</p><p>Experience: " + experience + "</p><p>Training: " + training + "</p>";
                document.getElementById('job_suggestions').appendChild(jobCard);
            }
            makeJobCard(title, education, experience, training);
        }
    }
});

// when job_input changes, filter job_suggestions to the closest matches
document.getElementById('job_input').oninput = function() {
    let input = document.getElementById('job_input').value;
    let jobCards = document.getElementsByClassName('job_card');
    for (let i = 0; i < jobCards.length; i++) {
        let card = jobCards[i];
        let title = card.getElementsByTagName('h3')[0].innerHTML;
        if (title.toLowerCase().includes(input.toLowerCase())) {
            card.hidden = false;
        } else {
            card.hidden = true;
        }
    }
}