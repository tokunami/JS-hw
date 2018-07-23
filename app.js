// DOM defenition
var $table = document.querySelector("#ufoTable");
var $pagination = document.querySelector(".pagination");
var $tbody = document.getElementsByTagName("tbody")[0];
var $dateSearch = document.querySelector("#dateSearch");
var $resultsNum = document.querySelector("#resultsNum");
var $filterBtn = document.querySelector("#filter");

// Add EventListener
$pagination.addEventListener("click", changePage);
$filterBtn.addEventListener("click", filterData);

// data definition
var data = {
  dataSet: dataSet,
  filtered: dataSet,
  updateFilter: function() {
    var dateQuery = $dateSearch.value.trim();
    this.filtered = this.dataSet.filter(function(ufoRecord) {
        if (!filterSearch(dateQuery, ufoRecord['datetime'])) {
          return false;
        }
      return true;
    });
  }
};

function filterSearch(search, result) {
  var slicedResult = result.slice(0, search.length);
  if (search === slicedResult) {
    return true;
  }
  return false;
}

// page settings
var page = {
  currentPage: 1,
  numPages: function() {
    return Math.ceil(data.filtered.length / this.resultsPerPage());
  },
  resultsPerPage: function() {
    return $resultsNum.value.trim();
  },
  getPageSubset: function() {
    var counter;
    // If the current page is less than 11, start the counter at 1 as we are on the first page
    if (this.currentPage < 11) {
      counter = 1;
    }
    // If the current page is evenly divisible by 10, start the counter at itself minus 9 (e.g. pagination rows go 11 - 20, 21 - 30 ,etc)
    else if (this.currentPage % 10 === 0) {
      counter = this.currentPage - 9;
    }
    else {
      // Otherwise divide the current page by 10, round down (e.g. 26 becomes 2), then multiply by 10 (becomes 20) and add 1 (starts at 21)
      counter = Math.floor(this.currentPage / 10) * 10 + 1;
    }
    // Create an array to contain the pages numbers to return
    var pageNumbers = [counter];
    counter++;
    // While the current page number is less than the total number of pages and we have less than 10 pages in this set of pageNumbers...
    while (pageNumbers[pageNumbers.length - 1] < this.numPages() && pageNumbers.length < 10) {
      pageNumbers.push(counter);
      counter++;
    }
    // Return the pageNumbers array when complete
    return pageNumbers;
  },
  // paginate returns an array containing only section of the filtered data which should show up on the current page
  paginate: function(array, pageSize, pageNumber) {
    pageNumber--;
    return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
  }
};

function filterData() {
  data.updateFilter();
  loadTable();
  appendPagination();
}

function changePage(event) {
  event.preventDefault();
  var paginationBtn = event.target;
  var newPageNumber = parseInt(paginationBtn.getAttribute("href"));
  if (newPageNumber < 1 || newPageNumber > page.numPages()) {
    return false;
  }

  page.currentPage = newPageNumber;

  if (paginationBtn.getAttribute("class") === "page-link") {
    appendPagination();
  }
  else {
    setActivePage();
  }
  return loadTable();
}


function setActivePage() {
  for (var i = 0; i < $pagination.children.length; i++) {
    var li = $pagination.children[i];
    if (parseInt(li.children[0].getAttribute("href")) === page.currentPage) {
      li.classList.add("active");
    }
    else {
      li.classList.remove("active");
    }
  }
}


function appendPagination() {
  $pagination.innerHTML = "";
  var fragment = document.createDocumentFragment();
  var pageSubset = page.getPageSubset();
  var backButton = document.createElement("li");
  backButton.classList = "page-item";
  backButton.innerHTML = "<a class='page-link' href='" + (pageSubset[0] - 1) + "'>&laquo;</a>";
  fragment.appendChild(backButton);

  // For every page number in the pageSubset, create an li tag containing an anchor tag with an href attribute of the page number the pagination button should take the user to when clicked
  var listItem;
  for (var i = 0; i < pageSubset.length; i++) {
    listItem = document.createElement("li");
    listItem.classList.add('page-item')
    listItem.innerHTML = "<a class='page-link' ' href='" + pageSubset[i] + "'>" + pageSubset[i] + "</a>";

    if (pageSubset[i] === page.currentPage) listItem.classList.add("active");

    fragment.appendChild(listItem);
  }

  // Add forward button
  var forwardButton = document.createElement("li");
  forwardButton.classList = "page-item";
  forwardButton.innerHTML = "<a class='page-link' href='" + (pageSubset[0] + pageSubset.length) + "'>&raquo;</a>";
  fragment.appendChild(forwardButton);
  $pagination.appendChild(fragment);

}

function loadTable() {
  $tbody.innerHTML = "";
  var fragment = document.createDocumentFragment();
  
  var resultsThisPage = page.paginate(
    data.filtered,
    page.resultsPerPage(),
    page.currentPage
  );

  for (var i = 0; i < resultsThisPage.length; i++) {
    var ufoObject = resultsThisPage[i];
    var ufoKeys = Object.keys(ufoObject);
    var $row = document.createElement("tr");
    $row.className = "table-row";

    for (var j = 0; j < ufoKeys.length; j++) {
      if (j ==5){
        continue;
      } else if (j ==6){
        var currentKey = ufoKeys[j];  
        var $cell = $row.insertCell(j-1);
        $cell.innerHTML = ufoObject[currentKey];
        $cell.setAttribute("data-th", currentKey);
        
      } else {

        var currentKey = ufoKeys[j];  
        var $cell = $row.insertCell(j);
        $cell.innerHTML = ufoObject[currentKey];
        $cell.className = "text-center";
        $cell.setAttribute("data-th", currentKey);

      }
      
    }

    fragment.appendChild($row);
  }

  $tbody.appendChild(fragment);
}

loadTable();
appendPagination();
