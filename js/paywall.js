function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var config = {
	packages: ["29826"],
	service_url: "https://services.inplayer.com",
};

$(function () {

	function createItemElement(assetId, assetPhoto, assetTitle, assetDesc) {
		if (assetDesc) {
			var output = `<div class="package-item"><div class="content" style="background-image:url(${assetPhoto})"><a href="./item.html?id=${assetId}" class="overlay-link"></a></div><div class="item-label"><div class="name"><h3>${assetTitle}</h3>${assetDesc}</div></div></div>`;
		} else {
			var output = `<div class="package-item"><div class="content" style="background-image:url(${assetPhoto})"><a href="./item.html?id=${assetId}" class="overlay-link"></a></div><div class="item-label"><div class="name"><h3>${assetTitle}</h3></div></div></div>`;
		}

		return output;
	}

	var paywall = new InplayerPaywall("4d23789a-8021-47c2-8f1d-d4efe11dd892", []);
	setTimeout(function () {
		if (getParameterByName("id")) {
			$("#preview-item").html(
				'<div id="inplayer-' +
					getParameterByName("id") +
				'" class="inplayer-paywall"></div>'
			);
			
			var paywall = new InplayerPaywall("4d23789a-8021-47c2-8f1d-d4efe11dd892", [
				{
					id: getParameterByName("id"),
				},
			]);
		}
	 }, 500);

	$(".inplayer-paywall-login").click(function () {
		paywall.showPaywall({
			asset: {}
		});
	});

	$(".inplayer-paywall-logout").parent().hide();

	paywall.on("authenticated", () => {
		$(".inplayer-paywall-logout").parent().show();
		$(".inplayer-paywall-login").parent().hide();
		$(".text").show();
	});
	paywall.on("logout", function () {
		location.reload();
	});
	// $("#asset-btn").click(function () {
	// 	paywall.showPaywall({
	// 		asset: {
	// 			assetId: 29826,
	// 			preselectedFeeId: 178886
	// 		}
	// 	});
	// });
	paywall.on('inject', function () {
		  $('#preview-item').find('iframe').parent().addClass('video-wrapper');
		});

		config.packages.forEach((package) => {
			const pageSize = 100; // Adjust the page size as needed
			let currentPage = 1;
			let output = "";
		  
			function fetchAssets() {
			  $.get(
				config.service_url + `/items/packages/${package}/items?limit=${pageSize}&page=${currentPage}`,
				(response) => {
				  if (response.collection.length > 0) {
					// If there are assets in the response, add them to the output
					let sortedAssets = [];
		  
					for (let asset of response.collection) {
					  let assetId = asset.id,
						assetPhoto = asset.metahash.paywall_cover_photo,
						assetTitle = asset.metahash.preview_title,
						assetDate = asset.metahash.asset_date;
		  
					  // Create a Date object from the assetDate
					  let fullDate = assetDate ? new Date(assetDate) : new Date();
		  
					  // Add the asset to the sortedAssets array with the full_date
					  sortedAssets.push({ assetId, assetPhoto, assetTitle, fullDate });
					}
		  
					// Sort the assets by date (fullDate)
					sortedAssets.sort((a, b) => b.fullDate - a.fullDate);
		  
					// Add the sorted assets to the output
					for (let asset of sortedAssets) {
					  output += createItemElement(asset.assetId, asset.assetPhoto, asset.assetTitle);
					}
		  
					// Continue fetching the next page
					currentPage++;
					fetchAssets();
				  } else {
					// No more assets to fetch for this package
					if (document.getElementById("package-items-" + package)) {
					  document.getElementById("package-items-" + package).innerHTML = output;
					}
				  }
				}
			  );
			}
		  
			fetchAssets();
		  });

});