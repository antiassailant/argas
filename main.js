function calculateLevenshteinDistance(rstr1, rstr2, biasWeight=1) {
    var str1 = rstr1.toLowerCase();
    var str2 = rstr2.toLowerCase();
    const len1 = str1.length + 1;
    const len2 = str2.length + 1;

    const dp = [];
    for (let i = 0; i < len1; i++) {
        dp.push([i]);
    }
    for (let j = 1; j < len2; j++) {
        dp[0].push(j);
    }

    let matchingCount = 0;
    for (let i = 1; i < len1; i++) {
        for (let j = 1; j < len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
            
            // Count matching letters
            if (cost === 0) {
                matchingCount++;
            }
        }
    }

    const maxLen = Math.max(str1.length, str2.length);
    const similarity = 1 - dp[len1 - 1][len2 - 1] / maxLen;

    // Calculate matching percentage
    const matchingPercentage = matchingCount / maxLen;

    console.log(matchingPercentage, similarity);
    
    // Apply bias based on matching percentage
    const biasedSimilarity = (100 * similarity + 100 * biasWeight * matchingPercentage / 2) / (biasWeight + 1); 

    return biasedSimilarity; // return biased similarity percentage
}

var jsonPool = {};
fetch("https://raw.githubusercontent.com/antiassailant/argas/main/pool.json")
    .then(function (response) {
        return response.json(); // Parse the JSON-formatted response
    })
    .then(function (data) {
        jsonPool = data;
    })
    .catch(function (error) {
        console.error("Error:", error); // Handle errors here
    });

function getperc(str1) {
    var ldPercentages = [];
    for (var i = 0; i < jsonPool["article"].length; i++) {
        var str2 = jsonPool["article"][i]["name"];
        ldPercentages.push(calculateLevenshteinDistance(str1, str2));
    }

    return ldPercentages;
}

function search(str1, bias=1.2) {
    var originalArray = getperc(str1);
    var avgThreshold = 0;
    const indexedArray = originalArray.map((value, index) => ({ value, index }));
    indexedArray.sort((a, b) => b.value - a.value);
    const indexChanges = indexedArray.map((item, index) => {
        avgThreshold += item.value;
        return {
            originalIndex: item.index,
            sortedIndex: index,
            value: item.value
        };
    });
    var topArr = [];
    avgThreshold = (avgThreshold * bias) / indexChanges.length;
    for (var i = 0; i < indexChanges.length; i++) {
        if (indexChanges[i].value < avgThreshold) {
            break;
        }
        topArr.push(jsonPool["article"][indexChanges[i]["originalIndex"]]);
    }
    return topArr;
}

function createDoc(qActer) {
    var name = qActer["name"];
    var href = qActer["href"];
    var author = qActer["author"];
    var hrefElement = document.createElement("a");
    var headerElement = document.createElement("h1");
    var authorElement = document.createElement("div");
    authorElement.classList = "ismall";
    authorElement.innerHTML = author;
    headerElement.appendChild(hrefElement);
    hrefElement.onclick = function(){window.open(href)};
    hrefElement.innerHTML = name;
    var searchResult = document.createElement("div");
    searchResult.classList = "searchresult";
    searchResult.appendChild(headerElement);
    searchResult.appendChild(authorElement);
    return searchResult;
}

function onSearch() {
    var topArr = search(document.getElementById("search").value);
    var searchResultsElement = document.getElementById("searchresults");
    searchResultsElement.replaceChildren();
    for (var i = 0; i < topArr.length; i++) {
        searchResultsElement.appendChild(createDoc(topArr[i]));
    }
}
