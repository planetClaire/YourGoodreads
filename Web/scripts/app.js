"use strict";

$(function () {

    var renderResults = function (results) {
        console.log(results);
        $(results.item).each(function (index) {
            var img = document.createElement("img");
            img.setAttribute("src", this.book_large_image_url);
            img.setAttribute("alt", this.title);
            var a = document.createElement("a");
            a.setAttribute("href", "https://www.goodreads.com/book/show/" + this.book_id);
            a.setAttribute("target", "_blank");
            a.setAttribute("title", "Go to this book on Goodreads");
            $(a).append(img)
            $("#results").append(a);
        });
    }

    var getBooks = function (goodreadsId) {
        var goodreadsRead = JSON.parse(localStorage.getItem("goodreadsRead" + goodreadsId));
        if (goodreadsRead) {
            renderResults(goodreadsRead);
        }
        else {
            var readRSS = "https://www.goodreads.com/review/list_rss/" + goodreadsId + "?shelf=read";
            var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from rss where url=\"' + encodeURIComponent(readRSS) + '\"&format=json';
            $.get(url, function (data) {
                if (data.query.results) {
                    var results = data.query.results;
                    localStorage.setItem("goodreadsRead" + goodreadsId, JSON.stringify(results));
                    renderResults(results);
                } else {
                    alert("Sorry, couldn't find anything.  Check your goodreads Id")
                }
            });
        }
    }

    $("#frmRead").submit(function (event) {
        if (typeof (Storage) !== "undefined") {
            var goodreadsId = $("#txtId").val();
            localStorage.setItem("goodreadsId", goodreadsId);
            localStorage.removeItem("goodreadsRead" + goodreadsId);
            getBooks(goodreadsId);
        }
        else {
            alert("Sorry, your browser doesn't support local storage and therefore we can't help you.")
        }
        event.preventDefault();
    })

    var goodreadsId = localStorage.getItem("goodreadsId");
    if (goodreadsId) {
        $("#txtId").val(goodreadsId);
        getBooks(goodreadsId);
    }
    else {
        alert("Enter your Goodreads Id");
        $("#txtId").focus();
    };

});