var index_page = "index.html"
var about_page = "about.html"
var projects_page = "projects.html"

var htmlLinks = [
    { link: "casestudy1.html", description: "Creating Consistency: Designing a Unified Web Experience for Cookd Users" },
    { link: "casestudy1 copy.html", description: "From Gaps to Greatness: A UX Transformation of Vajro’s Digital Experience" },
    { link: "casestudy2.html", description: "2 During the time period before 2015, Zoho CRM offered only some restricted list of APIs in a non-standard way (i.e. no standard API URI structure, different type of responses" },
    { link: "casestudy2 copy.html", description: "[COPY] 2 casestudy2 copy.html" },
    { link: "casestudy3.html", description: "3 During the time period before 2015, Zoho CRM offered only some restricted list of APIs in a non-standard way (i.e. no standard API URI structure, different type of responses" },
    { link: "casestudy3 copy.html", description: "[COPY] 3 During the time period before 2015, Zoho CRM offered only some restricted list of APIs in a non-standard way (i.e. no standard API URI structure, different type of responses" },
];

var password_form_content = `
<div class="password-holder">
	<div><img src="./svg/lock.svg" /></div>

	<div class="content-prohibit">
		This content is prohibited
	</div>
	<div class="content-prohibit-2">
		To view this case study, please enter the password
	</div>

	<div class="password-form">
		<input type="password" class="passcode" name="passcode" autofocus onfocus="formFocus()" placeholder="Enter password" />
		<button name="form-submit" onclick="formValidate()" ">
			<div class="submit-btn-text">Submit</div>
		</button>
	</div>
</div>`

function isIndexPage(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	return html_name == index_page || html_name=="";
}
function isAboutPage(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	return html_name == about_page;
}
function isProjectsPage(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	return html_name == projects_page;
}
function isOtherProjectsPage(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	html_name = html_name.split("?")[0]
	return new RegExp('^op[a-zA-Z0-9]{0,9}.html').test(html_name)
}
function isCaseStudyPage(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	html_name = html_name.split("?")[0]
	return new RegExp('^case[a-zA-Z0-9% ]{0,30}.html').test(html_name)
}

function trackVisitedPages() {
    var currentPage = window.location.href.split("/").pop();
    var visitCounts = JSON.parse(sessionStorage.getItem("visitCounts")) || {};

    // Increment visit count for the current page
    visitCounts[currentPage] = (visitCounts[currentPage] || 0) + 1;
    sessionStorage.setItem("visitCounts", JSON.stringify(visitCounts));
}

function proposeLinks() {
    var visitCounts = JSON.parse(sessionStorage.getItem("visitCounts")) || {};
    var currentPage = window.location.href.split("/").pop();

    // Normalize currentPage to ensure it matches the format in htmlLinks
    currentPage = decodeURIComponent(currentPage);

    // Filter out the current page from the unvisited and least visited pages
    var unvisitedPages = htmlLinks.filter(linkObj => {
        var normalizedLink = decodeURIComponent(linkObj.link); // Normalize link for comparison
        return !(normalizedLink in visitCounts) && normalizedLink !== currentPage;
    });

    if (unvisitedPages.length >= 2) {
        return unvisitedPages.slice(0, 2); // Propose the first two unvisited pages
    } else if (unvisitedPages.length === 1) {
        return [unvisitedPages[0], getLeastVisitedPage(visitCounts, currentPage)]; // Propose one unvisited and one least visited page
    } else {
        // All pages visited, propose the two least visited pages excluding the current page
        return getLeastVisitedPages(visitCounts, 2, currentPage);
    }
}

// Helper function to get the least visited page excluding the current page
function getLeastVisitedPage(visitCounts, currentPage) {
    var leastVisitedLink = Object.keys(visitCounts)
        .filter(link => link !== currentPage) // Exclude the current page
        .reduce((a, b) => visitCounts[a] < visitCounts[b] ? a : b, null);
    return htmlLinks.find(linkObj => linkObj.link === leastVisitedLink);
}

// Helper function to get the least visited pages excluding the current page
function getLeastVisitedPages(visitCounts, count, currentPage) {
    return Object.entries(visitCounts)
        .filter(entry => entry[0] !== currentPage) // Exclude the current page
        .sort((a, b) => a[1] - b[1]) // Sort by visit count (ascending)
        .slice(0, count) // Take the first 'count' entries
        .map(entry => htmlLinks.find(linkObj => linkObj.link === entry[0])); // Map to link objects
}

function setProjectLinks() {
    var proposedLinks = proposeLinks(); // Get the proposed links
    var projectLinksDiv = document.querySelector(".project-links");

    // Clear existing content
    projectLinksDiv.innerHTML = "";

    // Dynamically create project cards for proposed links
    proposedLinks.forEach((linkObj, index) => {
        var projectCard = document.createElement("div");
        projectCard.className = "project-card";

        if (index === 0) {
            // Left project card
            projectCard.innerHTML = `
                <div class="project-card-left-arrow">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 12L18 24L30 36" stroke="#333333" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="project-card-title project-card-title-left" title="${linkObj.description}">
                    ${linkObj.description}
                </div>
            `;
        } else if (index === 1) {
            // Right project card
            projectCard.innerHTML = `
                <div class="project-card-title project-card-title-right" title="${linkObj.description}">
                    ${linkObj.description}
                </div>
                <div class="project-card-right-arrow">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 36L30 24L18 12" stroke="#333333" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;
        }

        // Add click event listener to navigate to the link
        projectCard.addEventListener("click", function () {
            window.location.href = linkObj.link; // Navigate to the corresponding link
        });

        // Append the project card to the project links div
        projectLinksDiv.appendChild(projectCard);
    });
}

function toggle_menu(){
	
	var burger_svg = $(".burger-svg").css('display')
	var cross_svg = $(".cross-svg").css('display')
	var bcss = burger_svg == 'block' ? "none" : "block"
	var ccss = cross_svg == 'block' ? "none" : "block"
	$(".burger-svg").css('display', bcss)
	$(".cross-svg").css('display', ccss)

	if(ccss == 'block')
		$(".floatmenu").css('display', 'block')
	else
		$(".floatmenu").css('display', 'none')
} 

function preloadStuffs(){

	if(!(isIndexPage() || isAboutPage())){
		window.addEventListener("scroll", function(){
			var top_y = window.scrollY
			if (top_y > 0){
				$(".header").addClass("header_shadow");
			}
			else if (top_y == 0){
				$(".header").removeClass("header_shadow");
			}
		})
	}

	if(isOtherProjectsPage()){
		$('.b2home').css("display","none")
		$(".b2projects").css("display","block")
	}else if(isCaseStudyPage()){
		//$('.b2home').css("display","block")
		$(".b2projects").css("display","none")
	}

	if(isCaseStudyPage()){
		trackVisitedPages();
		var proposedLinks = proposeLinks();
		console.log("Proposed Links:", proposedLinks);

		proposedLinks.forEach(linkObj => {
			console.log(`Suggested Link: ${linkObj.link} (${linkObj.description})`);
		});

		setProjectLinks();
	}

	$('img').each(function(){
		var img1 = $(this).attr('src')
		var img2 = $(this).attr('data-hover')
		var elt = document.createElement('img')
		if(img1 != undefined)
			elt['src'] = img1
		if(img2 != undefined)
			elt['src'] = img2
		
	}).promise().done(function(){
		setTimeout(function(){
			$(".svg-change").hover(function(){
				var ele=this
				var swap1 = $(ele).attr('src')
				var swap2 = $(ele).attr('data-hover')
				$(ele).attr('src',swap2)
				$(ele).attr('data-hover',swap1)
			}, function(){
				var ele = this
				var swap1 = $(ele).attr('src')
				var swap2 = $(ele).attr('data-hover')
				$(ele).attr('src',swap2)
				$(ele).attr('data-hover',swap1)
			});

			if(isIndexPage()){
				$(".menuitem:nth-child(1)").addClass("selected")
				$(".floatmenuitem:nth-child(1) a").addClass("selected")
			}else if(isProjectsPage()){
				$(".menuitem:nth-child(3)").addClass("selected")
				$(".floatmenuitem:nth-child(3) a").addClass("selected")
			}else if(isAboutPage()){
				$(".menuitem:nth-child(2)").addClass("selected")
				$(".floatmenuitem:nth-child(2) a").addClass("selected")
			}


			$(".loading_holder").css("display", "none")
			$('body').css('background-color', 'white') 
			$('.body').css('display', 'block') 
			
			imageLoad()

		},250);
	})
}

function imageLoad(){
	var html = '<div class="imgloading-icon">'+
							    '<div class="rect rect1"></div>'+
							    '<div class="rect rect2"></div>'+
							    '<div class="rect rect3"></div>'+
							'</div>';
	$(".lzload").each(function(){
		$(this).prepend(html)
	})

	$(".lzload").each(function(){
		if($(this).hasClass('imgcontainer')){
			$(this).css('min-height','100px')
		}
		var src = $(this).attr('src-ll')
		this.getElementsByClassName("imgloading-icon")[0].style.display = 'none'
		var imggg = this.getElementsByTagName("img")[0]
		var im = imggg.getAttribute('src-ll')
		this.getElementsByTagName("img")[0].setAttribute('src', im)
	})
}

function bodyLoad(){
	//debugger
    console.log("Body Load 1")

	var count = 0
	$.ajax({
		url: "./header.html",
		success: function (resp) {
			$('.body').prepend(resp)
			count += 1
			if (count == 2){
				preloadStuffs()
			}
		}
	});

	console.log('Footer loading 1')
	$(".footer").load("./footer.html", function(){
		count += 1
		console.log('footer loaded 1')
		if (count == 2){
			preloadStuffs()
		}
	})
}

function goToHome(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	var newUrl = ""
	for(var i=0; i<parts.length-1; i++){
		newUrl += parts[i]+"/"
	}newUrl += index_page
	window.location = newUrl
}


function goToProjects(){
	var parts = window.location.href.split("/")
	var html_name = parts[parts.length-1]
	var newUrl = ""
	for(var i=0; i<parts.length-1; i++){
		newUrl += parts[i]+"/"
	}newUrl += "projects.html"
	window.location = newUrl
}

function formValidate(){
	$(".password-form input").removeClass("focus")
	$(".password-form button").removeClass("focus")
	$(".password-form input").attr("disabled", true)
	$(".password-form button").attr("disabled", true)
	var passcode = $(".passcode").val()
	var htmlfile = location.href.split("/").slice(-1)[0]

	$.ajax({
		url: "https://resumedataprotect-715143879.development.catalystserverless.com/server/PasswordProtect/?passcode="+passcode+"&filename="+htmlfile, // Replace with the URL of the API you want to access
		type: "POST",
		crossDomain: true, // Set to true to enable CORS
		xhrFields: {
		  withCredentials: true,
		},
		success: function (data) {
			$(".password-holder").css("display", "none")
			$(".header").addClass("header_shadow");
			$(".body").append(data)
			$(".footer").load("./footer.html", function(){
				$(".footer").css("display", "block")
			});
			
			imageLoad();
		},
		error: function (xhr, textStatus, error) {
		  $(".passcode").addClass("invalid")
		  $(".password-form input").attr("disabled", false)
		  $(".password-form button").attr("disabled", false)
		},
	  });
	
}

function formFocus(){
	$(".passcode").removeClass("invalid")
	$(".password-form input").addClass("focus")
	$(".password-form button").addClass("focus")
}

function validateKey(event){
	console.log(event)
}