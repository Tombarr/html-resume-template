var data = {
    "about_me": {
        "name": "Viktor Titov",
        "birth_date": "11-12-1994",
        "position": "Python / Golang developer",
        "location": "Georgia, Batumi",
        "summary": "Backend developer with data engineer and QA background.",
        "languages": [
            "Russian, Native",
            "English, B2"
        ],
        "contacts": {
            "phone": "+995 599 10 85 96",
            "telegram": "duch94",
            "email": "vtduch@gmail.com",
            "github": "github.com/duch94",
            "linkedin": "https://www.linkedin.com/in/viktor-titov-73246aab/"
        }
    },
    "education": [{
        "organization": "ITMO University",
        "time": "September 2012 - June 2016",
        "title": "Bachelor of Photonics and optoinformatics. Specialization - Computer photonics."
    }],
    "skills": [
        "Python 3.9",
        "Fastapi",
        "PostgreSQL",
        "Prometheus + Grafana",
        "Kubernetes",
        "Golang",
        "Pytest",
        "Apache Airflow",
        "Ansible",
        "Jenkins"
    ],
    "work": [
        {
            "organization": "JettyCloud",
            "time_range": "June 2022 - Present",
            "position": "Python / Golang developer",
            "summary": [
                "Involved in test framework maintanance like bug fixing or adding new functionality",
                "Helped to add new functionality to test stubs of specific services",
                "Participated in development of distributed test platform"
            ]
        }
    ]
}

document.getElementById("about_me.location").innerHTML = data.about_me.location;
document.getElementById("about_me.contacts.phone").innerHTML = data.about_me.contacts.phone;
document.getElementById("about_me.contacts.phone").href = "tel:" + data.about_me.contacts.phone;
document.getElementById("about_me.contacts.email").innerHTML = data.about_me.contacts.email;
document.getElementById("about_me.contacts.email").href = "mailto:" + data.about_me.contacts.email;
document.getElementById("about_me.contacts.linkedin").innerHTML = "Linkedin";
document.getElementById("about_me.contacts.linkedin").href = data.about_me.contacts.linkedin;
document.getElementById("about_me.contacts.github").innerHTML = data.about_me.contacts.github;
document.getElementById("about_me.contacts.github").href = "https://" + data.about_me.contacts.github;

data.skills.forEach(function(item) {
    var ul = document.getElementById("skills");
    var li = document.createElement("li");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(item));
    li.appendChild(span);
    ul.appendChild(li);
});
data.about_me.languages.forEach(function(item) {
    var ul = document.getElementById("languages");
    var li = document.createElement("li");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(item));
    li.appendChild(span);
    ul.appendChild(li);
});

document.getElementById("about_me.contacts.name").innerHTML = data.about_me.name;
document.getElementById("about_me.position").innerHTML = data.about_me.position;
document.getElementById("about_me.summary").innerHTML = data.about_me.summary;

data.work.forEach(function(work_item) {
    var li = document.createElement("li");
    var header = document.createElement("header");

    var p = document.createElement("p");
    p.setAttribute("class", "sanserif");
    p.setAttribute("id", "work.position");
    p.innerHTML = work_item.position;
    header.appendChild(p);

    var time = document.createElement("time");
    time.innerHTML = work_item.time_range;
    header.appendChild(time);
    li.appendChild(header);

    var span = document.createElement("span")
    span.innerHTML = work_item.organization;
    li.appendChild(span);

    var ul = document.createElement("ul");
    ul.id = "work.summary";
    
    document.getElementById("work").appendChild(li);
    work_item.summary.forEach(function(summary_item) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(summary_item));
        ul.appendChild(li);
    });
    li.appendChild(ul);
});

data.education.forEach(function(edu_item) {
    var ol = document.getElementById("education");
    var li = document.createElement("li");
    var div_title = document.createElement("div");

    var p = document.createElement("p");
    p.setAttribute("class", "sanserif");
    p.innerHTML = edu_item.title;
    div_title.appendChild(p);

    var time = document.createElement("time");
    time.innerHTML = edu_item.time;
    div_title.appendChild(time);
    li.appendChild(div_title);

    var div_org = document.createElement("div");
    var span1 = document.createElement("span");
    span1.innerHTML = edu_item.organization;
    var span2 = document.createElement("span");
    div_org.appendChild(span1);
    div_org.appendChild(span2);
    li.appendChild(div_org);

    ol.appendChild(li);
});
