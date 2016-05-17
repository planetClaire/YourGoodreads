//$(document).foundation();

$(function () {

    var initTooltips = function () {
        $('#results').imagesLoaded(function () {
            $('.hasTooltip').each(function () {
                $(this).qtip({
                    content: {
                        text: $(this).next('div'),
                        button: true
                    },
                    position: {
                        my: 'top left',
                        at: 'center center'
                    },
                    show: 'click',
                    hide: 'click',
                    style: {
                        classes: 'qtip-gr'
                    }
                });
            });
        });
    };

    var renderResults = function (results, goodreadsId) {
        initTooltips();
        $("#results").empty();
        $(results).each(function () {
            var img = document.createElement("img");
            img.setAttribute("src", this.book_large_image_url);
            img.setAttribute("alt", this.title);
            var li = document.createElement("li");
            li.setAttribute("class", "book hasTooltip");
            var span = document.createElement("span");
            span.setAttribute("class", "img-helper");
            $(li).append(span).append(img);
            $("#results").append(li);
            var hidden = document.createElement("div");
            hidden.setAttribute("class", "hidden");
            var title = document.createElement("h2");
            $(title).html("<a href='https://www.goodreads.com/book/show/" + this.book_id + "' target='_blank'>" + this.title + "</a>");
            var author = document.createElement("h3");
            $(author).html("by " + this.author_name);
            var published = document.createElement("h4");
            $(published).html(this.book.num_pages + " pages | Published " + this.book_published);
            var read = document.createElement("h5");
            var readDate = Date.parse(this.user_read_at);
            if (readDate) {
                $(read).html("<a href='https://www.goodreads.com/review/list/" + goodreadsId + "?shelf=read' + target='_blank'>Finished " + new Date(this.user_read_at).toDateString() + "</a>");
            } else {
                $(read).html("<a href='https://www.goodreads.com/review/list/" + goodreadsId + "?shelf=currently-reading' + target='_blank'>Currently reading</a>");
            }
            var rating = document.createElement("span");
            rating.setAttribute("class", "rating");
            rating.setAttribute("title", "Your rating");
            var userStars = this.user_rating;
            for (var i = 0; i < 5; i++) {
                if (userStars > i) {
                    $(rating).append("&#9733;");
                } else {
                    $(rating).append("&#9734;");
                }
            }
            var averageRating = document.createElement("span");
            averageRating.setAttribute("class", "averageRating");
            averageRating.setAttribute("title", "Average rating " + this.average_rating);
            var averageStars = Math.round(this.average_rating);
            for (var i = 0; i < 5; i++) {
                if (averageStars > i) {
                    $(averageRating).append("&#9733;");
                } else {
                    $(averageRating).append("&#9734;");
                }
            }
            var description = document.createElement("p");
            description.setAttribute("class", "description");
            $(description).html(this.book_description);
            $(hidden).append(title).append(author).append(published).append(read).append(rating).append(averageRating).append(description);
            $("#results").append(hidden);
            //initTooltips();
        });
    }

    var getBooks = function (goodreadsId, refresh) {
        var goodreadsRead = refresh ? null : JSON.parse(localStorage.getItem("goodreadsRead" + goodreadsId));
        if (goodreadsRead) {
            renderResults(goodreadsRead, goodreadsId);
        }
        else {
            var readRss = "https://www.goodreads.com/review/list_rss/" + goodreadsId + "?shelf=read";
            var readUrl = 'https://query.yahooapis.com/v1/public/yql?q=select * from rss where url=\"' + encodeURIComponent(readRss) + '\"&format=json';
            $("#overlay").show();
            $.get(readUrl, function (readData) {
                if (readData.query.results) {
                    var results = readData.query.results.item;
                    var currentlyReadingRss = "https://www.goodreads.com/review/list_rss/" + goodreadsId + "?shelf=currently-reading";
                    var currentlyReadingUrl = 'https://query.yahooapis.com/v1/public/yql?q=select * from rss where url=\"' + encodeURIComponent(currentlyReadingRss) + '\"&format=json';
                    $.get(currentlyReadingUrl, function (currentlyReadingData) {
                        if (currentlyReadingData.query.results) {
                            results = currentlyReadingData.query.results.item.concat(results);
                        }
                        var goodreadsPref = localStorage.getItem("goodreadsPref");
                        if (goodreadsPref === "ThisYear") {
                            var thisYear = new Date().getFullYear();
                            results = $.grep(results, function(b) {
                                return (b.user_shelves && b.user_shelves.contains("currently-reading")) || (b.user_read_at && b.user_read_at.contains(thisYear));
                            });
                        }
                        localStorage.setItem("goodreadsRead" + goodreadsId, JSON.stringify(results));
                        renderResults(results, goodreadsId);
                        $("#overlay").hide();
                    });
                } else {
                    alert("Sorry, couldn't find anything. Check your goodreads Id");
                }
            });
        }
    }

    var init = function (refresh) {
        var goodreadsId = localStorage.getItem("goodreadsId");
        if (goodreadsId) {
            $("#txtId").val(goodreadsId);
            $("#btnSubmit").text("Refresh");
            getBooks(goodreadsId, refresh);
        } else {
            $("#btnSubmit").text("Go");
            alert("Enter your Goodreads Id");
            $("#txtId").focus();
        };
    };

    $("#frmRead").submit(function(event) {
        $('.qtip:visible').qtip("hide");
        if (typeof (Storage) !== "undefined") {
            var goodreadsId = $("#txtId").val();
            localStorage.setItem("goodreadsId", goodreadsId);
            localStorage.removeItem("goodreadsRead" + goodreadsId);
            getBooks(goodreadsId);
        } else {
            alert("Sorry, your browser doesn't support local storage and therefore we can't help you.");
        }
        event.preventDefault();
    });

    $("#aAll").click(function () {
        $('.qtip:visible').qtip("hide");
        var goodreadsPref = localStorage.getItem("goodreadsPref");
        if (goodreadsPref && goodreadsPref !== "All") {
            localStorage.setItem("goodreadsPref", "All");
            $("#aAll").addClass("active");
            $("#aThisYear").removeClass("active");
            init(true);
        }
        return false;
    });

    $("#aThisYear").click(function () {
        $('.qtip:visible').qtip("hide");
        var goodreadsPref = localStorage.getItem("goodreadsPref");
        if (goodreadsPref && goodreadsPref !== "ThisYear") {
            localStorage.setItem("goodreadsPref", "ThisYear");
            $("#aThisYear").addClass("active");
            $("#aAll").removeClass("active");
            init(true);
        }
        return false;
    });


    var goodreadsPref = localStorage.getItem("goodreadsPref");
    if (!goodreadsPref) {
        goodreadsPref = "All";
        localStorage.setItem("goodreadsPref", goodreadsPref);
    }
    if (goodreadsPref === "All") {
        $("#aAll").addClass("active");
    }
    else if (goodreadsPref === "ThisYear") {
        $("#aThisYear").addClass("active");
    }

    initTooltips();
    init();
});