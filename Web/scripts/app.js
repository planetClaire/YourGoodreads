$(document).foundation();

$(function () {

    var renderResults = function (results, goodreadsId) {
        $("#results").empty();
        $(results).each(function () {
            var img = document.createElement("img");
            img.setAttribute("src", this.book_large_image_url);
            img.setAttribute("alt", this.title);
            var li = document.createElement("li");
            li.setAttribute("class", "book");
            li.setAttribute("data-open", "reveal-" + this.book_id);
            li.setAttribute("title", "Click me!");
            var span = document.createElement("span");
            span.setAttribute("class", "img-helper");
            $(li).append(span).append(img);
            $("#results").append(li);

            var hidden = document.createElement("div");
            hidden.setAttribute("class", "reveal");
            hidden.setAttribute("data-reveal", "");
            hidden.setAttribute("id", "reveal-" + this.book_id);
            hidden.setAttribute("data-animation-in", "fade-in");
            hidden.setAttribute("data-animation-out", "fade-out");

            var title = document.createElement("h2");
            $(title).html("<a href='https://www.goodreads.com/book/show/" + this.book_id + "' target='_blank'>" + this.title + "</a>");

            var bookImage = document.createElement("img");
            bookImage.setAttribute("src", this.book_large_image_url);
            bookImage.setAttribute("alt", this.title);
            bookImage.setAttribute("class", "book-image float-right");
            bookImage.setAttribute("width", "160");

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
            for (var j = 0; j < 5; j++) {
                if (averageStars > j) {
                    $(averageRating).append("&#9733;");
                } else {
                    $(averageRating).append("&#9734;");
                }
            }

            var description = document.createElement("p");
            description.setAttribute("class", "description");
            $(description).html(this.book_description);

            var close = document.createElement("button");
            close.setAttribute("class", "close-button");
            close.setAttribute("data-close", "");
            close.setAttribute("aria-label", "Close modal");
            close.setAttribute("type", "button");
            var buttonSpan = document.createElement("span");
            buttonSpan.setAttribute("aria-hidden", "true");
            $(buttonSpan).html("&times;");
            $(close).append(buttonSpan);

            $(hidden).append(title).append(bookImage).append(author).append(published).append(read).append(rating).append(averageRating).append(description).append(close);
            $("#results").append(hidden);
            new Foundation.Reveal($(hidden));
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
                        var currentlyReadingResults = currentlyReadingData.query.results;
                        if (currentlyReadingResults) {
                            results = currentlyReadingResults.item.book_id
                                ? [currentlyReadingResults.item].concat(results)
                                : currentlyReadingResults.item.concat(results);
                        }
                        var goodreadsPref = localStorage.getItem("goodreadsPref");
                        if (goodreadsPref === "ThisYear") {
                            var thisYear = new Date().getFullYear();
                            results = $.grep(results, function (b) {
                                return (b.user_shelves && (b.user_shelves === "currently-reading" || b.user_shelves.contains("currently-reading"))) || (b.user_read_at && b.user_read_at.indexOf(thisYear) > -1);
                            });
                        }
                        localStorage.setItem("goodreadsRead" + goodreadsId, JSON.stringify(results));
                        renderResults(results, goodreadsId);
                        $("#overlay").hide();
                    });
                } else {
                    $("#overlay").hide();
                    $("#nothing-found").show();
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
            $("#enter-id").show();
            $("#txtId").focus();
        };
    };

    $("#frmRead").submit(function (event) {
        $(".hidden").hide();
        if (typeof (Storage) !== "undefined") {
            var goodreadsId = $("#txtId").val();
            localStorage.setItem("goodreadsId", goodreadsId);
            localStorage.removeItem("goodreadsRead" + goodreadsId);
            getBooks(goodreadsId);
        } else {
            $("#no-local").show();
        }
        event.preventDefault();
    });

    $("#aAll").click(function () {
        $(".hidden").hide();
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
        $(".hidden").hide();
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

    init();
});